// server.js
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

const onlineUsers = new Map();

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("conacascsds2!");
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});
const io = socketIo(server, {
  path: "/socket.io",
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:8000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Function to update lastActive in database
async function updateLastActive(userId, lastActive, token) {
  try {
    await axios.post(
      "http://127.0.0.1:8000/api/user/update-last-active",
      {
        user_id: userId,
        last_active: lastActive,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  } catch (error) {
    console.error("Error updating lastActive:", error.message);
  }
}

function broadcastAndLogOnlineUsers() {
  const list = Array.from(onlineUsers.values());
  io.emit("online_users_list", list);
  console.log("=== Online Users List ===");
  list.forEach((user) => {
    console.log(`- ${user.username} (ID: ${user.id})`);
  });
  console.log("=========================");
}

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Unauthorized - No token"));
  }
  try {
    console.log("Verifying token...");
    const resp = await axios.get("http://127.0.0.1:8000/api/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    socket.user = resp.data;
    return next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return next(new Error("Unauthorized - Invalid token"));
  }
});

function joinConversationRoom(socket, conversationId) {
  const room = `conversation:${conversationId}`;
  socket.join(room);
  console.log(`User ${socket.user.username} joined conversation room: ${room}`);
  return room;
}


// Khi có kết nối client
io.on("connection", (socket) => {
  const userId = socket.user.id;
  const username = socket.user.username || "Anonymous";
  const now = new Date();
  const token = socket.handshake.auth.token;

  // Update lastActive when user connects
  updateLastActive(userId, now, token);

  onlineUsers.set(userId, {
    id: userId,
    username: username,
    socketId: socket.id,
    lastActive: now,
  });
  io.emit("user_status_changed", {
    userId,
    username,
    status: "online",
  });
  broadcastAndLogOnlineUsers();

  socket.emit("online_users_list", Array.from(onlineUsers.values()));

  socket.on("get_online_users", () => {
    broadcastAndLogOnlineUsers();
  });

    socket.on("join_chat", (data) => {
    if (data.conversation_id) {
      joinConversationRoom(socket, data.conversation_id);
    }
  });

  socket.on("leave_chat", (data) => {
    if (data.conversation_id) {
      const room = `conversation:${data.conversation_id}`;
      socket.leave(room);
      console.log(`User ${username} left conversation room: ${room}`);
    }
  });

  socket.on("send_message", async (data) => {
    try {
      // Save message to database via API
      const messageResponse = await axios.post(
        "http://127.0.0.1:8000/api/messages/send",
        {
          receiver_id: data.receiver_id,
          conversation_id: data.conversation_id,
          content: data.content,
          type: data.type || "text",
          file_paths: data.file_paths,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const message = messageResponse.data;

      const room = `conversation:${data.conversation_id}`;

      io.to(room).emit("new_message", {
        ...message,
        sender: {
          id: userId,
          username: username,
        },
      });

      if (data.receiver_id) {
        const receiver = onlineUsers.get(data.receiver_id);
        if (receiver) {
          io.to(receiver.socketId).emit("new_message", {
            ...message,
            sender: {
              id: userId,
              username: username,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error.message);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${username} (ID: ${userId})`);
    const now = new Date();

    if (onlineUsers.has(userId)) {
      const userData = onlineUsers.get(userId);
      // updateLastActive(userId, now, token);

      // Remove user from onlineUsers
      onlineUsers.delete(userId);

      // Broadcast changes
      broadcastAndLogOnlineUsers();
      io.emit("user_status_changed", {
        userId,
        username: userData.username,
        status: "offline",
      });
    }
  });

  socket.on("heartbeat", () => {
    if (onlineUsers.has(userId)) {
      const now = new Date();
      const userData = onlineUsers.get(userId);
      userData.lastActive = now;
      onlineUsers.set(userId, userData);

      // Update lastActive in database on heartbeat
      // updateLastActive(userId, now, token);
    }
  });
  // Ví dụ: lắng nghe message

   socket.on("join_all_conversations", async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/conversations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      const conversations = response.data;
      conversations.forEach(conversation => {
        joinConversationRoom(socket, conversation.id);
      });
      
      console.log(`User ${username} joined all their conversation rooms`);
    } catch (error) {
      console.error("Error joining conversations:", error.message);
    }
  });
  
  
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
// // Xử lý người dùng không hoạt động trong 5 phút
// setInterval(() => {
//   const now = new Date();
//   for (const [userId, userData] of onlineUsers.entries()) {
//     // Nếu người dùng không hoạt động trong 5 phút
//     if (now - userData.lastActive > 5 * 60 * 1000) {
//       console.log(`User timeout: ${userData.username} (ID: ${userId})`);

//       // Update lastActive when user times out
//       updateLastActive(userId, now);

//       // Xóa khỏi danh sách online
//       onlineUsers.delete(userId);

//       // Thông báo cho tất cả người dùng khác
//       io.emit("user_status_changed", {
//         userId,
//         username: userData.username,
//         status: "offline",
//       });

//       // Ngắt kết nối socket nếu còn tồn tại
//       const socketId = userData.socketId;
//       const socket = io.sockets.sockets.get(socketId);
//       if (socket) {
//         socket.disconnect(true);
//       }
//     }
//   }
// }, 60 * 1000);
// Lắng nghe cổng 3001 (có thể tuỳ chỉnh)
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
