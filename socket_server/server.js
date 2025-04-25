// server.js
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

const onlineUsers = new Map();
// Tạo HTTP server (chỉ để upgrade WebSocket)
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    // Khi truy cập vào root, sẽ trả về thông tin "Socket.io server is up"
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("conacascsds2!");
  } else {
    // Các route khác
    res.writeHead(404);
    res.end("Not Found");
  }
});
// Khởi tạo Socket.io
const io = socketIo(server, {
  path: "/socket.io",
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:8000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
function broadcastAndLogOnlineUsers() {
  const list = Array.from(onlineUsers.values());
  // Gửi danh sách mới đến mọi client
  io.emit("online_users_list", list);
  // In ra console server
  console.log("=== Online Users List ===");
  list.forEach(user => {
    console.log(`- ${user.username} (ID: ${user.id})`);
  });
  console.log("=========================");
}
// Xác thực JWT nếu cần
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("Auth token received:", token ? "yes" : "no");
  if (!token) {
    console.log("No token provided");
    return next(new Error("Unauthorized - No token"));
  }
  try {
    console.log("Verifying token...");
    const resp = await axios.get("http://127.0.0.1:8000/api/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("API response:", resp.data);
    socket.user = resp.data;
    return next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return next(new Error("Unauthorized - Invalid token"));
  }
});

// Khi có kết nối client
io.on("connection", (socket) => {
    console.log("New socket connection, id:", socket.id);
  console.log("New socket connection, id:", socket.id);
  const userId = socket.user.id;
  const username = socket.user.username || "Anonymous";

  onlineUsers.set(userId, {
    id: userId,
    username: username,
    socketId: socket.id,
    lastActive: new Date(),
  });
  io.emit("user_status_changed", {
    userId,
    username,
    status: "online",
  });
  broadcastAndLogOnlineUsers();

  const onlineUsersList = Array.from(onlineUsers.values());
  socket.emit("online_users_list", onlineUsersList);

  socket.on("get_online_users", () => {
    broadcastAndLogOnlineUsers();
  });
  

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${username} (ID: ${userId})`);

    // Xóa khỏi danh sách online
    onlineUsers.delete(userId);
    broadcastAndLogOnlineUsers();
    // Thông báo cho tất cả người dùng khác
    io.emit("user_status_changed", {
      userId,
      username,
      status: "offline",
    });
  });

  socket.on('heartbeat', () => {
    if (onlineUsers.has(userId)) {
      const userData = onlineUsers.get(userId);
      userData.lastActive = new Date();
      onlineUsers.set(userId, userData);
    }
  });
  // Ví dụ: lắng nghe message
  socket.on("message", (data) => {
    // broadcast đến room chat
    io.to(data.room).emit("message", {
      user: socket.user,
      text: data.text,
      time: new Date(),
    });
  });

  // Join room
  socket.on("join", (room) => {
    socket.join(room);
  });
});
// Xử lý người dùng không hoạt động trong 5 phút
setInterval(() => {
    const now = new Date();
    for (const [userId, userData] of onlineUsers.entries()) {
      // Nếu người dùng không hoạt động trong 5 phút
      if ((now - userData.lastActive) > 5 * 60 * 1000) {
        console.log(`User timeout: ${userData.username} (ID: ${userId})`);
        
        // Xóa khỏi danh sách online
        onlineUsers.delete(userId);
        
        // Thông báo cho tất cả người dùng khác
        io.emit('user_status_changed', { 
          userId, 
          username: userData.username, 
          status: 'offline' 
        });
        
        // Ngắt kết nối socket nếu còn tồn tại
        const socketId = userData.socketId;
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
      }
    }
  }, 60 * 1000);
// Lắng nghe cổng 3001 (có thể tuỳ chỉnh)
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
