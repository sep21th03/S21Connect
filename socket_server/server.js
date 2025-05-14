// server.js
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

const onlineUsers = new Map();

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Socket.io server is running!");
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
  maxHttpBufferSize: 20e6,
});

async function updateLastActive(userId, lastActive, token) {
  console.log(lastActive);
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

    formData.append("upload_preset", "message_image");
    formData.append("folder", "message/image");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dxzwfef7y/image/upload",
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

const activeCallOffers = new Map();
const activeCalls = new Map();

function setupCallHandlers(socket, io) {
  const userId = socket.user.id;
  const username = socket.user.username;

  socket.on("call_offer", (data) => {
    try {
      const { receiver_id, offer, call_type } = data;
      
      console.log(`User ${username} (${userId}) is calling user ${receiver_id} with ${call_type} call`);
      
      activeCallOffers.set(userId, { offer, call_type });
      
      const receiverSocketId = [...io.sockets.sockets.values()]
        .find(s => s.user && s.user.id === receiver_id)?.id;
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("incoming_call", {
          caller_id: userId,
          caller_name: username,
          call_type,
        });
      } else {
        socket.emit("call_rejected", {
          reason: "user_offline",
          user_id: receiver_id,
        });
      }
    } catch (error) {
      console.error("Error processing call offer:", error);
      socket.emit("call_error", { message: "Failed to process call offer" });
    }
  });

  socket.on("get_call_offer", (data) => {
    try {
      const { caller_id } = data;
      const callOffer = activeCallOffers.get(caller_id);
      
      if (callOffer) {
        socket.emit("call_offer_details", {
          offer: callOffer.offer,
          call_type: callOffer.call_type,
        });
      } else {
        socket.emit("call_error", { message: "Call offer not found" });
      }
    } catch (error) {
      console.error("Error retrieving call offer:", error);
      socket.emit("call_error", { message: "Failed to retrieve call offer" });
    }
  });

  socket.on("call_answer", (data) => {
    try {
      const { receiver_id, answer } = data;
      console.log(`User ${username} answered call from ${receiver_id}`);
      
      const callerSocketId = [...io.sockets.sockets.values()]
        .find(s => s.user && s.user.id === receiver_id)?.id;
      
      if (callerSocketId) {
        io.to(callerSocketId).emit("call_answer", { answer });
        
        activeCalls.set(`${userId}_${receiver_id}`, {
          participants: [userId, receiver_id],
          startTime: new Date(),
        });
      }
    } catch (error) {
      console.error("Error processing call answer:", error);
    }
  });

  socket.on("call_reject", (data) => {
    try {
      const { caller_id } = data;
      console.log(`User ${username} rejected call from ${caller_id}`);
      
      const callerSocketId = [...io.sockets.sockets.values()]
        .find(s => s.user && s.user.id === caller_id)?.id;
      
      if (callerSocketId) {
        io.to(callerSocketId).emit("call_rejected", {
          reason: "user_rejected",
          user_id: userId,
        });
      }
      
      activeCallOffers.delete(caller_id);
    } catch (error) {
      console.error("Error processing call rejection:", error);
    }
  });

  socket.on("call_ice_candidate", (data) => {
    try {
      const { receiver_id, candidate } = data;
      
      const receiverSocketId = [...io.sockets.sockets.values()]
        .find(s => s.user && s.user.id === receiver_id)?.id;
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call_ice_candidate", { candidate });
      }
    } catch (error) {
      console.error("Error sending ICE candidate:", error);
    }
  });

  socket.on("call_end", (data) => {
    try {
      const { receiver_id } = data;
      console.log(`Call between ${userId} and ${receiver_id} ended by ${username}`);
      
      const receiverSocketId = [...io.sockets.sockets.values()]
        .find(s => s.user && s.user.id === receiver_id)?.id;
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call_end");
      }
      
      const callKey1 = `${userId}_${receiver_id}`;
      const callKey2 = `${receiver_id}_${userId}`;
      
      activeCalls.delete(callKey1);
      activeCalls.delete(callKey2);
      activeCallOffers.delete(userId);
      activeCallOffers.delete(receiver_id);
    } catch (error) {
      console.error("Error ending call:", error);
    }
  });

}

io.on("connection", (socket) => {
  const userId = socket.user.id;
  const username = socket.user.username || "Anonymous";
  const now = new Date();
  const token = socket.handshake.auth.token;
  function formatDateToMySQL(datetime) {
    const date = new Date(datetime);
    date.setHours(date.getHours() + 7);
    return date.toISOString().slice(0, 19).replace("T", " ");
  }

  updateLastActive(userId, formatDateToMySQL(now), token);

  setupCallHandlers(socket);

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
      logSocketRooms(socket); // Debug
    }
  });

  socket.on("leave_chat", (data) => {
    if (data.conversation_id) {
      const room = `conversation:${data.conversation_id}`;
      socket.leave(room);
      console.log(`User ${username} left conversation room: ${room}`);
    }
  });

  // Fix 2: Improved send_message handler
  socket.on("send_message", async (data) => {
    try {
      if (!data.content || !data.receiver_id || !data.conversation_id) {
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
      });
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

      const enrichedMessage = {
        ...message,
        sender: {
          id: userId,
          username: username,
          first_name: socket.user.first_name || "",
          last_name: socket.user.last_name || "",
          last_active: now.toISOString(),
        },
      };

      const allRooms = io.sockets.adapter.rooms;
      // console.log("Available rooms:", Array.from(allRooms.keys()));

      // Broadcast to conversation room
      io.to(room).emit("new_message", enrichedMessage);

      if (data.receiver_id) {
        const receiver = onlineUsers.get(data.receiver_id);
        if (receiver) {
          io.to(receiver.socketId).emit("new_message", enrichedMessage);
        }
      }
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
    }
  });

  // Fix 7: Improved join_all_conversations
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

      // Debug: Log all rooms after joining
      logSocketRooms(socket);

      console.log(`User ${username} joined all their conversation rooms`);
    } catch (error) {
      console.error("Error joining conversations:", error.message);
    }
  });
});

// Listen on port 3001 (can be customized)
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
