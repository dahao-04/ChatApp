const express = require('express');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const SECRET_KEY = process.env.SECRET_KEY;

let onlineUsers = new Map();

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if(!token) return (new Error("No token."));
    const decode = jwt.verify(token, SECRET_KEY);
    next();
  } catch (error) {
    return (new Error("Authentication Error."));
  }
})

io.on('connection', (socket) => {

  console.log(`User connected: ${socket.id}`);

  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('presence:update', Array.from(onlineUsers.keys()));
  })

  socket.on('add-to-group', ({userList, groupId}) => {
    if(userList.length > 0) {
      userList.forEach((user) => {
        const socketId = onlineUsers.get(user);
        if(socketId) {
          io.in(socketId).socketsJoin(groupId)
          console.log(`User ${socketId} joined group ${groupId}.`);
        }
      })
    }
  })

  socket.on('delete-from-group', ({userList, groupId}) => {
    if(userList.length > 0) {
      userList.forEach((user) => {
        const socketId = onlineUsers.get(user);
        if(socketId) {
          io.in(socketId).socketsLeave(groupId)
          console.log(`User ${socketId} leave group ${groupId}.`);
        }
      })
    }
  })

  socket.on('join-group', ({groupList}) => {
    if(groupList.length > 0) {
      groupList.forEach((groupId) => {
        socket.join(groupId);
        console.log(`User ${socket.id} joined group ${groupId}.`);
      })
    }
  })

  socket.on('leave-group', ({groupList}) => {
    if(groupList.length > 0) {
      groupList.forEach((groupId) => {
        socket.leave(groupId);
        console.log(`User ${socket.id} leave group ${groupId}.`);
      })
    }
  })

  socket.on('send_message', ({type, from, to, groupId, content, imageUrl, createAt}) => {
    const message = {type, from, to, groupId, content, imageUrl, createAt };

    if(type === 'direct') {
      const receiverSocketId = onlineUsers.get(to._id);
      if(receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", message);
      }
    } else if (type === 'group') {
      socket.to(groupId._id).emit('receive_message', message);
    }
  });

  socket.on('typing', ({userId, partnerId}) => {
    const receiverSocketId = onlineUsers.get(partnerId);
    io.to(receiverSocketId).emit('is_typing', userId);
  })

  socket.on('stop_typing', ({userId, partnerId}) => {
    const receiverSocketId = onlineUsers.get(partnerId);
    io.to(receiverSocketId).emit('is_stop_typing', userId);
  })
  

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        break;
      }
    }
    io.emit('presence:update', Array.from(onlineUsers.keys()));
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log('chat-server running on http://localhost:3001');
});
