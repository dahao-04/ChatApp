import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import HomePage from './pages/HomePage'
import ChatPage from './pages/ChatPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { ChatProvider } from './context/chatContext'

function App() {

  return (
    <BrowserRouter>
      <ChatProvider>
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/chat" element={<ChatPage/>}/>
          <Route path="/signup" element={<SignupPage/>}/>
        </Routes>
      </ChatProvider>
    </BrowserRouter>
  );
}
export default App
