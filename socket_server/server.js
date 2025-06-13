// server.js
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const express = require("express");

const PORT = 3001;
const app = express();

app.use(express.json());

const onlineUsers = new Map();
const userSocketMap = new Map();

// Tạo server trước
const server = http.createServer(app);

// Tạo io instance
const io = socketIo(server, {
  path: "/socket.io",
  cors: {
    // origin: [
    //   "http://localhost:3000",
    //   "http://127.0.0.1:8000",
    //   "https://www.sep21th03.tech/",
    //   "https://s21.codetifytech.io.vn/",
    //   "https://socket-s21.codetifytech.io.vn",
    //   "http://socket-s21.codetifytech.io.vn"
    // ],
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  maxHttpBufferSize: 20e6,
  // Thêm config cho Cloudflare
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware để log requests
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}`
  );
  next();
});

// Routes cơ bản
app.get("/", (req, res) => {
  res.send("Socket.io server running on port " + PORT);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    port: PORT,
    timestamp: new Date().toISOString(),
    onlineUsers: onlineUsers.size,
  });
});

// Routes s dụng io (đã được đnh nghĩa)
app.post("/notification", (req, res) => {
  console.log("Notification received:", req.body);
  const { userId, ...notificationData } = req.body;

  const targetSocketId = userSocketMap.get(userId);

  if (targetSocketId) {
    io.to(targetSocketId).emit("notification", notificationData);
  }

  res.json({ message: "Notification sent" });
});

app.post("/notification-message", (req, res) => {
  const { event, data } = req.body;

  if (event === "new-message") {
    const { message, receiver_id } = data;

    const targetSocketId = userSocketMap.get(receiver_id);
    if (targetSocketId) {
      io.to(targetSocketId).emit("unread_message_update", message);
    }
  }

  res.sendStatus(200);
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Helper functions
async function updateLastActive(userId, lastActive, token) {
  try {
    const res = await axios.post(
      "http://127.0.0.1:8000/api/user/update-last-active",
      {
        user_id: userId,
        last_active: lastActive,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.status === 200) {
      console.log(`Last active updated for user ${userId}`);
    } else {
      console.error(
        `Failed to update last active for user ${userId}: ${res.statusText}`
      );
    }
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

function joinConversationRoom(socket, conversationId) {
  const room = `conversation:${conversationId}`;
  socket.join(room);
  console.log(`User ${socket.user.username} joined conversation room: ${room}`);
  return room;
}

function logSocketRooms(socket) {
  const rooms = Array.from(socket.rooms);
  console.log(
    `Socket ${socket.id} (User: ${socket.user.username}) is in rooms:`,
    rooms
  );
}

async function uploadToCloudinary(base64Image, fileName) {
  try {
    console.log("Uploading image to Cloudinary...");

    const formData = new FormData();
    formData.append("file", base64Image);
    formData.append("upload_preset", "upload_preset");
    formData.append("folder", "message/image");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dyksxiq0e/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (data.secure_url) {
      console.log("Image uploaded successfully to Cloudinary");
      return data.secure_url;
    } else {
      console.error("Cloudinary upload failed:", data);
      throw new Error("Image upload failed");
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

// Socket.io authentication middleware
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

// Socket.io connection handling
io.on("connection", (socket) => {
  const userId = socket.user.id;
  const username = socket.user.username || "Anonymous";
  const now = new Date();
  const token = socket.handshake.auth.token;
  userSocketMap.set(userId, socket.id);
  console.log(token);

  function formatDateToMySQL(datetime) {
    const date = new Date(datetime);
    date.setHours(date.getHours() + 7);
    return date.toISOString().slice(0, 19).replace("T", " ");
  }

  updateLastActive(userId, formatDateToMySQL(now), token);

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
      logSocketRooms(socket);
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
      if (!data.content || (!data.receiver_id && !data.conversation_id)) {
        console.error("Missing required message data");
        socket.emit("message_error", {
          error: "Missing required message data",
        });
        return;
      }

      if (data.type === "image" && data.content) {
        try {
          const imageUrl = await uploadToCloudinary(
            `data:${data.file_type};base64,${data.content}`,
            data.file_name
          );

          data.content = imageUrl;

          socket.emit("image_upload_status", {
            status: "success",
            message: "Image uploaded successfully",
            url: imageUrl,
          });
        } catch (error) {
          console.error("Error uploading image:", error);
          socket.emit("image_upload_status", {
            status: "error",
            message: "Failed to upload image",
          });
          socket.emit("message_error", { error: "Failed to upload image" });
          return;
        }
      }

      console.log("Sending message:", {
        content: data.content,
        receiver_id: data.receiver_id,
        conversation_id: data.conversation_id,
        type: data.type || "text",
        file_paths: data.file_paths,
        client_temp_id: data.client_temp_id || null,
      });

      const messagePayload = {
        content: data.content,
        type: data.type || "text",
      };

      if (data.metadata) {
        messagePayload.metadata = data.metadata;
      }

      if (data.conversation_id) {
        messagePayload.conversation_id = data.conversation_id;
      }

      if (data.receiver_id) {
        messagePayload.receiver_id = data.receiver_id;
      }

      if (data.user_ids && Array.isArray(data.user_ids)) {
        messagePayload.user_ids = data.user_ids;
        if (data.group_name) {
          messagePayload.group_name = data.group_name;
        }
        if (data.group_avatar) {
          messagePayload.group_avatar = data.group_avatar;
        }
      }
      const messageResponse = await axios.post(
        "http://127.0.0.1:8000/api/messages/send",
        messagePayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const message = messageResponse.data;
      const conversationId = data.conversation_id || message.conversation_id;
      const room = `conversation:${conversationId}`;

      const enrichedMessage = {
        ...message,
        sender: {
          id: userId,
          username: username,
          first_name: socket.user.first_name || "",
          last_name: socket.user.last_name || "",
          last_active: now.toISOString(),
        },
        client_temp_id: data.client_temp_id || null,
      };

      // broadcast
      io.to(room).emit("new_message", enrichedMessage);

      try {
        const conversationResponse = await axios.get(
          `http://127.0.0.1:8000/api/conversations/${conversationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const conversation = conversationResponse.data;

        if (conversation.type === "group" && conversation.members) {
          conversation.members.forEach((member) => {
            if (member.id !== userId) {
              const onlineMember = onlineUsers.get(member.id);
              if (onlineMember) {
                io.to(onlineMember.socketId).emit(
                  "unread_message_update",
                  enrichedMessage
                );
              }
            }
          });
        } else if (conversation.type === "private" && conversation.other_user) {
          const otherUser = onlineUsers.get(conversation.other_user.id);
          if (otherUser) {
            io.to(otherUser.socketId).emit(
              "unread_message_update",
              enrichedMessage
            );
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin conversation:", error.message);
      }

      socket.emit("message_sent", {
        success: true,
        message: enrichedMessage,
        client_temp_id: data.client_temp_id,
      });
    } catch (error) {
      console.error(
        "Error sending message:",
        error.response?.data || error.message
      );
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  socket.on("mark_as_read", async (data) => {
    try {
      if (!data.conversation_id) {
        console.error("Missing conversation_id in mark_as_read");
        return;
      }

      await axios.post(
        "http://127.0.0.1:8000/api/messages/mark-as-read",
        {
          conversation_id: data.conversation_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(
        `Messages marked as read in conversation: ${data.conversation_id}`
      );

      const room = `conversation:${data.conversation_id}`;
      socket.to(room).emit("messages_read", {
        conversation_id: data.conversation_id,
        user_id: userId,
      });
    } catch (error) {
      console.error("Error marking messages as read:", error.message);
    }
  });

  socket.on("disconnect", () => {
    const now = new Date();
    userSocketMap.delete(userId);
    if (onlineUsers.has(userId)) {
      const userData = onlineUsers.get(userId);

      onlineUsers.delete(userId);

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
    }
  });

  socket.on("join_all_conversations", async () => {
    try {
      console.log(`Joining all conversations for ${username}`);
      const response = await axios.get(
        "http://127.0.0.1:8000/api/conversations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const conversations = response.data;
      console.log(`Found ${conversations.length} conversations to join`);

      conversations.forEach((conversation) => {
        joinConversationRoom(socket, conversation.id);
      });

      logSocketRooms(socket);

      console.log(`User ${username} joined all their conversation rooms`);
    } catch (error) {
      console.error("Error joining conversations:", error.message);
    }
  });
});

// Error handler cho server
server.on("error", (err) => {
  console.error("Server error:", err);
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Listen vi debug info
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket.io server running on port ${PORT}`);
  console.log(`Server accessible at:`);
  console.log(`- http://localhost:${PORT}`);
  console.log(`- http://127.0.0.1:${PORT}`);
  console.log(`- http://0.0.0.0:${PORT}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Online users: ${onlineUsers.size}`);
});
