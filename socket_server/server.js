const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const express = require("express");

const PORT = 3001;
const app = express();

app.use(express.json());

const onlineUsers = new Map();
const userSocketMap = new Map();
const activeRooms = new Map(); // Lưu trữ thông tin phòng gọi
const callSessions = new Map(); // Lưu trữ session gọi điện

// Tạo server trước
const server = http.createServer(app);

// Tạo io instance
const io = socketIo(server, {
  path: "/socket.io",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  maxHttpBufferSize: 20e6,
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}`
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Socket.io server running on port " + PORT);
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    port: PORT,
    timestamp: new Date().toISOString(),
    onlineUsers: onlineUsers.size,
    activeCalls: callSessions.size,
  });
});

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

app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({ error: "Internal server error" });
});

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

function generateCallId() {
  return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createCallSession(callerId, receiverId, callType) {
  const callId = generateCallId();
  const session = {
    id: callId,
    caller_id: callerId,
    receiver_id: receiverId,
    call_type: callType,
    status: "ringing",
    created_at: new Date(),
    offer: null,
    answer: null,
    ice_candidates: {
      [callerId]: [],
      [receiverId]: [],
    },
  };

  callSessions.set(callId, session);
  return session;
}

function getCallSession(callId) {
  return callSessions.get(callId);
}

function updateCallSession(callId, updates) {
  const session = callSessions.get(callId);
  if (session) {
    Object.assign(session, updates);
    callSessions.set(callId, session);
  }
  return session;
}

function endCallSession(callId) {
  const session = callSessions.get(callId);
  if (session) {
    callSessions.delete(callId);
    return session;
  }
  return null;
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

io.on("connection", (socket) => {
  const userId = socket.user.id;
  const username = socket.user.username || "Anonymous";
  const now = new Date();
  const token = socket.handshake.auth.token;
  userSocketMap.set(userId, socket.id);
  console.log(`User ${username} connected with socket ${socket.id}`);

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

  // ============= MESSAGING HANDLERS =============
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

  // ============= CALL HANDLERS =============

  socket.on("call_offer", (data) => {
    const { receiver_id, offer, call_type } = data;
    console.log(
      `Call offer from ${userId} to ${receiver_id}, type: ${call_type}`
    );

    const receiverSocket = userSocketMap.get(receiver_id);
    if (!receiverSocket) {
      socket.emit("call_error", {
        message: "User is not online",
        code: "USER_OFFLINE",
      });
      return;
    }

    for (const session of callSessions.values()) {
      if (
        (session.caller_id === receiver_id ||
          session.receiver_id === receiver_id) &&
        session.status === "ringing"
      ) {
        socket.emit("call_error", {
          message: "User is busy in another call",
          code: "USER_BUSY",
        });
        return;
      }
    }

    const callSession = createCallSession(userId, receiver_id, call_type);
    updateCallSession(callSession.id, { offer });

    const callerInfo = onlineUsers.get(userId);

    io.to(receiverSocket).emit("incoming_call", {
      call_id: callSession.id,
      caller_id: userId,
      caller_name: callerInfo?.username || "Unknown",
      call_type,
      offer,
    });

    socket.emit("call_ringing", {
      call_id: callSession.id,
      receiver_id,
      call_type,
    });

    setTimeout(() => {
      const session = getCallSession(callSession.id);
      if (session && session.status === "ringing") {
        // Notify caller
        const callerSocket = userSocketMap.get(callSession.caller_id);
        if (callerSocket) {
          io.to(callerSocket).emit("call_ended", {
            call_id: callSession.id,
            ended_by: receiver_id,
            reason: "No answer",
          });
        }
        if (receiverSocket) {
          io.to(receiverSocket).emit("call_ended", {
            call_id: callSession.id,
            ended_by: receiver_id,
            reason: "No answer",
          });
        }
        endCallSession(callSession.id);
      }
    }, 30000);

    socket.callId = callSession.id;

    console.log(`Call session created: ${callSession.id}`);
  });

  socket.on("call_answer", (data) => {
    const { call_id, answer } = data;
    console.log(`Call answered: ${call_id}`);

    const callSession = getCallSession(call_id);
    if (!callSession) {
      socket.emit("call_error", {
        message: "Call session not found",
        code: "CALL_NOT_FOUND",
      });
      return;
    }

    // Update call session with answer
    updateCallSession(call_id, {
      answer,
      status: "connected",
      connected_at: new Date(),
    });

    const callerSocket = userSocketMap.get(callSession.caller_id);
    if (callerSocket) {
      io.to(callerSocket).emit("call_answered", {
        call_id,
        answer,
        receiver_id: userId,
      });
    }

    // Store call session reference in socket
    socket.callId = call_id;
  });

  // Reject a call
  socket.on("call_reject", (data) => {
    const { call_id, reason = "Call rejected" } = data;
    console.log(`Call rejected: ${call_id}`);

    const callSession = getCallSession(call_id);
    if (!callSession) {
      return;
    }

    const callerSocket = userSocketMap.get(callSession.caller_id);
    if (callerSocket) {
      io.to(callerSocket).emit("call_rejected", {
        call_id,
        reason,
        receiver_id: userId,
      });
    }

    // End call session
    endCallSession(call_id);
  });

  // Handle ICE candidates
  socket.on("call_ice_candidate", (data) => {
    const { call_id, candidate } = data;

    const callSession = getCallSession(call_id);
    if (!callSession) {
      return;
    }

    // Store ICE candidate
    if (callSession.ice_candidates[userId]) {
      callSession.ice_candidates[userId].push(candidate);
    }

    // Forward to the other peer
    const otherUserId =
      callSession.caller_id === userId
        ? callSession.receiver_id
        : callSession.caller_id;

    const otherSocket = userSocketMap.get(otherUserId);
    if (otherSocket) {
      io.to(otherSocket).emit("call_ice_candidate", {
        call_id,
        candidate,
        from_user_id: userId,
      });
    }
  });

  // End a call
  socket.on("call_end", (data) => {
    const { call_id } = data;
    console.log(`Call ended: ${call_id}`);

    const callSession = getCallSession(call_id);
    if (!callSession) {
      return;
    }

    // Notify the other peer
    const otherUserId =
      callSession.caller_id === userId
        ? callSession.receiver_id
        : callSession.caller_id;

    const otherSocket = userSocketMap.get(otherUserId);
    if (otherSocket) {
      io.to(otherSocket).emit("call_ended", {
        call_id,
        ended_by: userId,
      });
    }

    // Clean up call session
    endCallSession(call_id);

    // Remove call reference from sockets
    if (socket.callId === call_id) {
      delete socket.callId;
    }
  });

  // Get call offer details (for retrieving stored offer)
  socket.on("get_call_offer", (data) => {
    const { call_id } = data;

    const callSession = getCallSession(call_id);
    if (!callSession) {
      socket.emit("call_error", {
        message: "Call session not found",
        code: "CALL_NOT_FOUND",
      });
      return;
    }

    socket.emit("call_offer_details", {
      call_id,
      offer: callSession.offer,
      call_type: callSession.call_type,
      caller_id: callSession.caller_id,
    });
  });

  // ============= GENERAL HANDLERS =============

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

  socket.on("heartbeat", () => {
    if (onlineUsers.has(userId)) {
      const now = new Date();
      const userData = onlineUsers.get(userId);
      userData.lastActive = now;
      onlineUsers.set(userId, userData);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User ${username} disconnected`);

    // Clean up user data
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

    // Clean up any active calls
    if (socket.callId) {
      const callSession = getCallSession(socket.callId);
      if (callSession) {
        const otherUserId =
          callSession.caller_id === userId
            ? callSession.receiver_id
            : callSession.caller_id;

        const otherSocket = userSocketMap.get(otherUserId);
        if (otherSocket) {
          io.to(otherSocket).emit("call_ended", {
            call_id: socket.callId,
            ended_by: userId,
            reason: "User disconnected",
          });
        }

        endCallSession(socket.callId);
      }
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

// Listen với debug info
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Socket.io server running on port ${PORT}`);
  console.log(`Server accessible at:`);
  console.log(`- http://localhost:${PORT}`);
  console.log(`- http://127.0.0.1:${PORT}`);
  console.log(`- http://0.0.0.0:${PORT}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Online users: ${onlineUsers.size}`);
  console.log(`Active calls: ${callSessions.size}`);
});

// Cleanup old call sessions periodically (optional)
setInterval(() => {
  const now = new Date();
  const CALL_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  for (const [callId, session] of callSessions.entries()) {
    if (
      now - session.created_at > CALL_TIMEOUT &&
      session.status === "ringing"
    ) {
      console.log(`Cleaning up expired call session: ${callId}`);
      endCallSession(callId);
    }
  }
}, 60000); // Check every minute
