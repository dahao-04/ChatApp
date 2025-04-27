const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let users = new Map();
io.on('connection', (socket) => {

  console.log(`User connected: ${socket.id}`);

  socket.on('register', (userId) => {
    users.set(userId, socket.id);
  })

  socket.on('add-to-group', ({userList, groupId}) => {
    if(userList.length > 0) {
      userList.forEach((user) => {
        const socketId = users.get(user);
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
        const socketId = users.get(user);
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

  socket.on('send_message', ({type, from, to, groupId, content, createAt}) => {
    const message = { type, from, to, groupId, content, createAt };

    if(type === 'direct') {
      const receiverSocketId = users.get(to._id);
      if(receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", message);
      }
    } else if (type === 'group') {
      socket.to(groupId._id).emit('receive_message', message);
    }
  });
  

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log('chat-server running on http://localhost:3001');
});
