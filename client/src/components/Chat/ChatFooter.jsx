import { useState, useRef, useContext, useEffect } from 'react'
import axios from '../../api/axios';
import { ChatContext } from '../../context/chatContext';

export default function ChatFooter({ sendMess }) {
  const { socket, currentSender, user } = useContext(ChatContext);
  const [mess, setMess] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Emit typing events with debounce
  useEffect(() => {
    if (isTyping) {
      socket.emit('typing', { userId: user.id, partnerId: currentSender.id });
    } else {
      socket.emit('stop_typing', { userId: user.id, partnerId: currentSender.id });
    }
  }, [isTyping, socket, user.id, currentSender.id]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMess(value);

    // Debounce typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSend = () => {
    if (mess.trim() === '' && !imageUrl) return;
    sendMess(mess, imageUrl);
    setMess('');
    setImageUrl('');
    setIsTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('/upload/image', formData);
      const url = res.data.imageUrl;
      setImageUrl(url);
      sendMess(mess, url);
      setMess('');
      setIsTyping(false);
    } catch (err) {
      console.error('Upload image failed', err);
    }
  };

  return (
    <footer className="p-4 border border-gray-200 rounded-b-lg">
      <div className="flex items-center">
        <input
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="Type a message..."
          value={mess}
          type="text"
          onChange={handleInputChange}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />

        <button
          className="w-10 ml-2 p-2 text-white rounded group"
          onClick={() => fileInputRef.current.click()}
        >
          <i className="far fa-image group-hover:scale-110 duration-200"></i>
        </button>

        <button
          className="w-10 ml-2 p-2 text-white rounded group"
          onClick={handleSend}
        >
          <i className="fas fa-paper-plane group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-105 duration-200"></i>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleSendImage}
        accept="image/*"
        className="hidden"
      />
    </footer>
  );
}
