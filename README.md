# 🌟 Chat App Project 🌟

This repository contains a real-time chat application built with Node.js, Express, Socket.IO, React, and MongoDB. The project is split into three main components:

1. **api-server**: RESTful API for user authentication and data management 🔒
2. **chat-server**: WebSocket server handling real-time messaging 💬
3. **client**: React front-end for user interaction 🎨

---

## 🗂️ Table of Contents

- [🚀 Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [⚙️ Prerequisites](#️-prerequisites)
- [🚧 Setup & Installation](#️-setup--installation)
- [🔧 Configuration](#️-configuration)
- [▶️ Running the Services](#️-running-the-services)
- [📁 Project Structure](#️-project-structure)
- [🔗 API Endpoints](#️-api-endpoints)
- [🔌 WebSocket Events](#️-websocket-events)
- [📫 Contact](#️-contact)

---

## 🚀 Features

- User registration & login with JWT-based authentication (access token & refresh token) 🔑
- Real-time one-to-one and group messaging 💬
- Message history stored in MongoDB 🗄️
- Responsive UI with React 📱
- Upload user, group avatar
- Change user name, group name, password
---

## 🛠️ Tech Stack

- **Backend (API Server)**: Node.js, Express, Mongoose
- **WebSocket (Chat Server)**: Node.js, Socket.IO
- **Frontend (Client)**: React, Socket.IO-client
- **Database**: MongoDB
- **Authentication**: JWT
- **Environment Management**: dotenv

---

## 🏗️ Architecture

```plaintext
+-------------+     HTTP REST      +-------------+
|   Client    | <---------------▶ |  API Server |
| (React App) |                    | (Express)   |
+-------------+                    +-------------+
       │                                │
       │ WebSocket                      │ MongoDB
       └──────────▶ +-------------+ ◀──┘
                  | Chat Server  |
                  | (Socket.IO)  |
                  +-------------+
``` 

---

## ⚙️ Prerequisites

- Node.js v14 or above
- npm or yarn
- MongoDB instance (local or Atlas)

---

## 🚧 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dahao-04/ChatApp.git
   cd ChatApp
   ```

2. **Install dependencies** in each component:
   ```bash
   # In api-server
   cd ../api-server && npm install

   # In chat-server
   cd ../chat-server && npm install

   # In client
   cd ../client && npm install
   ```

---

## 🔧 Configuration

Create a `.env` file in `api-server` directories based on the provided `.env.example` files.

```ini
# .env example for api-server
MONGODB_URI=mongodb://localhost:27017/chat-app
SECRET_KEY=your_jwt_secret

```

---

## ▶️ Running the Services

**In separate terminals**:

1. **API Server**
   ```bash
   cd api-server
   npm start
   ```

2. **Chat Server**
   ```bash
   cd chat-server
   npm start
   ```

3. **Client**
   ```bash
   cd client
   npm run dev
   ```

The client will be available at `http://localhost:5173` by default.

---

## 📁 Project Structure

```
chat-app/
├─ api-server/       # REST API service 🔒
│  ├─ config/        # App configuration ⚙️
│  ├─ middleware/    # Auth & error handlers 🧱
│  ├─ model/         # Mongoose models 📦
│  ├─ routes/        # API routes 🔁
│  └─ index.js       # Main entry point 🏁
│
├─ chat-server/      # WebSocket service 💬
│  └─ index.js       # Chat server entry point 🧠
│
└─ client/           # React front-end 🎨
   ├─ public/        # Public files
   └─ src/ 
      ├ assets/         # Static files (images, icons, etc.) 🖼️
      ├─ components/    # Reusable UI components 🧩
      ├─ context/       # React context providers 🧠
      ├─ helpers/       # Utility functions 🛠️
      ├─ pages/         # Page-level components 📄
      └─ App.jsx        # Main app component 🚀
```

---

## 🔗 API Endpoints

### Auth

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| POST   | `/auth/signup`          | Register a new user      |
| POST   | `/auth/login`           | Authenticate and get JWT |
| POST   | `/auth/refresh`         | Use to refresh token     |
| POST   | `/auth/changePass/:id`  | Change user password     |

### Conversation

| Method | Endpoint            | Description                    |
| ------ | --------------------| ------------------------------ |
| GET    | `/conversation/`    | Get all conversation           |
| GET    | `/conversation/:id` | Get conversation have user ID  |
| POST   | `/conversation/`    | Create new conversation        |
| PUT    | `/conversation/`    | Update base on ID (group, conv)|
| DELETE | `/conversation/:id` | Delete conversation            |

### Group

| Method | Endpoint          | Description                    |
| ------ | ----------------- | ------------------------------ |
| GET    | `/group/`         | Get all group                  |
| GET    | `/group/user/:id` | Get group base on members_id   |
| GET    | `/group/:id`      | Get group base on it's ID      |
| POST   | `/group/`         | Create new group               |
| PUT    | `/group/`         | Update group                   |
| DELETE | `/group/:id`      | Delete group                   |

### Users

| Method | Endpoint      | Description       |
| ------ | ------------- | ----------------- |
| GET    | `/user/`      | Get all user      |
| GET    | `/user/email` | Get user by email |
| GET    | `/user/:id`   | Get user by ID    |
| POST   | `/user/`      | Create new user   |
| PUT    | `/user/:id`   | Update user by ID |
| DELETE | `/user/:id`   | Delete user by ID |


### Messages

| Method | Endpoint           | Description                              |
| ------ | ------------------ | ---------------------------------------- |
| GET    | `/message/log/:id` | Get message have user id (receive, send) |
| GET    | `/message/:id`     | Get message base on it's ID              |
| POST   | `/message/`        | Create new message                       |
| DELETE | `/message/:id`     | Delete message                           |

### Upload

| Method | Endpoint           | Description              |
| ------ | ------------------ | ------------------------ |
| POST   | `/upload/avatar`   | Upload user/group avatar |
| POST   | `/upload/image`    | Upload message image     |

---

## 🔌 WebSocket Events

### Client → Server

| Event        | Payload                                          | Description              |
| ------------ | ------------------------------------------------ | ------------------------ |
| `register`   | `{ userId }`                                     | Register to server       |
| `createGroup`| `{ userList, groupId }`                          | Add users online to room |
| `join-group` | `{ groupList }`                                  | Join chat room           |
| `leave-group`| `{ groupList }`                                  | Leave chat room          |
| `sendMessage`| `{ type, from, to, groupId, content, createAt }` | Send a message           |

### Server → Client

| Event           | Payload                                          | Description     |
| --------------- | ------------------------------------------------ | --------------- |
| `receiveMessage`| `{ type, from, to, groupId, content, createAt }` | Receive message |

---

## 📫 Contact

Anh Hao – [anhhao22082004@gmail.com].

Project Link: https://github.com/dahao-04/ChatApp
