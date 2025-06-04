// server.js
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const express = require("express");
const app = express();

app.use(express.json());

// ========== CONFIG VARIABLES ==========
const CONFIG = {
  // API_BASE_URL: "http://127.0.0.1:8000",
  // FRONTEND_URLS: ["http://localhost:3000", "http://127.0.0.1:8000"],
  API_BASE_URL: "https://s21.codetifytech.io.vn",
  FRONTEND_URLS: [
    "https://www.sep21th03.tech",
    "https://s21.codetifytech.io.vn",
  ],

  // Cloudinary Config
  CLOUDINARY: {
    BASE_URL: "https://api.cloudinary.com/v1_1/dyksxiq0e",
    UPLOAD_PRESET: "upload_preset",
    FOLDER: "message/image",
  },

  // Server Config
  SERVER_PORT: 3001,
  SOCKET_PATH: "/socket.io",
  MAX_HTTP_BUFFER_SIZE: 20e6,

  // API Endpoints
  API_ENDPOINTS: {
    USER: "/api/user",
    UPDATE_LAST_ACTIVE: "/api/user/update-last-active",
    MESSAGES_SEND: "/api/messages/send",
    MESSAGES_MARK_READ: "/api/messages/mark-as-read",
    CONVERSATIONS: "/api/conversations",
  },
};

// Helper function to build full API URL
const buildApiUrl = (endpoint) => `${CONFIG.API_BASE_URL}${endpoint}`;

// Helper function to build Cloudinary URL
const buildCloudinaryUrl = (action = "image/upload") =>
  `${CONFIG.CLOUDINARY.BASE_URL}/${action}`;

// ========== END CONFIG ==========

const onlineUsers = new Map();
const userSocketMap = new Map();

const server = http.createServer(app);

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

const io = socketIo(server, {
  path: CONFIG.SOCKET_PATH,
  cors: {
    origin: CONFIG.FRONTEND_URLS,
    methods: ["GET", "POST"],
    credentials: true,
  },
  maxHttpBufferSize: CONFIG.MAX_HTTP_BUFFER_SIZE,
});

async function updateLastActive(userId, lastActive, token) {
  try {
    const res = await axios.post(
      buildApiUrl(CONFIG.API_ENDPOINTS.UPDATE_LAST_ACTIVE),
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

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Unauthorized - No token"));
  }
  try {
    console.log("Verifying token...");
    const resp = await axios.get(buildApiUrl(CONFIG.API_ENDPOINTS.USER), {
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

// Fix 1: Adding debug function to inspect which rooms a socket is in
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
    formData.append("upload_preset", CONFIG.CLOUDINARY.UPLOAD_PRESET);
    formData.append("folder", CONFIG.CLOUDINARY.FOLDER);

    const response = await fetch(buildCloudinaryUrl("image/upload"), {
      method: "POST",
      body: formData,
    });

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

io.on("connection", (socket) => {
  const userId = socket.user.id;
  const username = socket.user.username || "Anonymous";
  const now = new Date();
  const token = socket.handshake.auth.token;
  userSocketMap.set(userId, socket.id);

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
      if (!data.content || !data.conversation_id) {
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
        file_paths: data.file_paths,
        metadata: data.metadata,
      };
      if (data.conversation_id) {
        messagePayload.conversation_id = data.conversation_id;
      } else if (data.user_ids && Array.isArray(data.user_ids)) {
        messagePayload.user_ids = data.user_ids;
        messagePayload.group_name = data.group_name;
        messagePayload.group_avatar = data.group_avatar;
      } else if (data.receiver_id) {
        messagePayload.receiver_id = data.receiver_id;
        messagePayload.conversation_id = data.conversation_id;
      }
      const messageResponse = await axios.post(
        buildApiUrl(CONFIG.API_ENDPOINTS.MESSAGES_SEND),
        messagePayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const message = messageResponse.data;

      const room = `conversation:${data.conversation_id}`;

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

      if (data.receiver_id) {
        const receiver = onlineUsers.get(data.receiver_id);
        if (receiver) {
          io.to(receiver.socketId).emit("new_message", enrichedMessage);
        }
      } else if (conversationId) {
        try {
          const conversationResponse = await axios.get(
            buildApiUrl(
              `${CONFIG.API_ENDPOINTS.CONVERSATIONS}/${conversationId}`
            ),
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
          } else if (
            conversation.type === "private" &&
            conversation.other_user
          ) {
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

  // Fix 6: Implement mark_as_read handler
  socket.on("mark_as_read", async (data) => {
    try {
      if (!data.conversation_id) {
        console.error("Missing conversation_id in mark_as_read");
        return;
      }

      await axios.post(
        buildApiUrl(CONFIG.API_ENDPOINTS.MESSAGES_MARK_READ),
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

      // Notify others in the conversation that messages have been read
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
    }
  });

  // Fix 7: Improved join_all_conversations
  socket.on("join_all_conversations", async () => {
    try {
      console.log(`Joining all conversations for ${username}`);
      const response = await axios.get(
        buildApiUrl(CONFIG.API_ENDPOINTS.CONVERSATIONS),
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const conversations = response.data;
      console.log(`Found ${conversations.length} conversations to join`);

      conversations.forEach((conversation) => {
        joinConversationRoom(socket, conversation.id);
      });

      // Debug: Log all rooms after joining
      logSocketRooms(socket);

      console.log(`User ${username} joined all their conversation rooms`);
    } catch (error) {
      console.error("Error joining conversations:", error.message);
    }
  });
});

// Listen on port 3001 (can be customized)
// server.listen(CONFIG.SERVER_PORT, () => {
//   console.log(`Socket.io server running on port ${CONFIG.SERVER_PORT}`);
// });
server.listen(process.env.PORT || 3001, () => {
  console.log(`Socket.io server running on port ${process.env.PORT}`);
});
