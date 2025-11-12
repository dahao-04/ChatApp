import { useState, useRef, useContext, useEffect } from 'react'
import axios from '../../api/axios';
import { ChatContext } from '../../context/chatContext';

export default function ChatFooter({ sendMess, showScrollBtn, scrollToBottom }) {
  const { socket, currentSender, user, setNotifi } = useContext(ChatContext);
  const [mess, setMess] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [stickerSetList, setStickerSetList] = useState([]);
  const [openSticker, setOpenSticker] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Emit typing events with debounce
  useEffect(() => {
    if(socket) {
      if (isTyping) {
        socket.emit('typing', { userId: user.id, partnerId: currentSender.id });
      } else {
        socket.emit('stop_typing', { userId: user.id, partnerId: currentSender.id });
      }
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
      setImageUrl('');
      setIsTyping(false);
    } catch (err) {
      setNotifi({show: true, status: false, message: err.response.data.message })
    }
  };

  const handleLoadSticker = async () => {
    try {
      const res = await axios.get('/sticker');
      setStickerSetList(res.data.data);
    } catch (err) {
      console.log(err)
    }
  }

  const handleSendSticker = async (url) => {
    try {
      sendMess("", url);
    } catch (err) {
      setNotifi({show: true, status: false, message: err.response.data.message })
    }
  }

  return (
    <footer className="relative p-4 border border-gray-200 rounded-b-lg">
      <div className="flex items-center">
        <input
          className="w-full h-[5vh] p-2 border border-gray-300 rounded"
          placeholder="Type a message..."
          value={mess}
          type="text"
          onChange={handleInputChange}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button
          className="ml-2 p-2 text-white rounded group w-[5vh] h-[5vh] flex items-center justify-center"
          onClick={() => fileInputRef.current.click()}
        >
          <i className="far fa-image group-hover:scale-110 duration-200"></i>
        </button>
        <button
          onClick={() => {
            setOpenSticker(!openSticker);
            if (!stickerSetList.length) handleLoadSticker();
          }}
          className='ml-2 p-2 text-white rounded group w-[5vh] h-[5vh] flex items-center justify-center'>
          <i className="fas fa-icons group-hover:scale-110 duration-200"></i>
        </button>
        <button
          className="ml-2 p-2 text-white rounded group w-[5vh] h-[5vh] flex items-center justify-center"
          onClick={handleSend}
        >
          <i className="fas fa-paper-plane group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-105 duration-200"></i>
        </button>
      </div>
      {openSticker && (
        <div className="h-[15rem] max-w-screen pt-4 grid grid-rows-auto gap-2 overflow-y-auto">
          {stickerSetList.map((stickerSet) => (
            <div key={stickerSet.name}>
              <p className="col-span-full text-gray-500 font-semibold text-sm mb-3">{stickerSet.name}</p>
              <div className='grid grid-cols-6 gap-4 justify-items-center'>
                {stickerSet.stickers.map((stickerUrl, index) => (
                  <img
                    key={index}
                    src={`${apiUrl}${stickerUrl}`}
                    alt="sticker"
                    className="w-12 h-12 cursor-pointer hover:scale-110 duration-200"
                    onClick={()=> handleSendSticker(stickerUrl)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {showScrollBtn && (
          <div
              onClick={scrollToBottom}
              className="absolute -top-14 right-5 bg-gray-300 hover:bg-gray-400
                      text-gray-500 px-3 py-1 rounded-full shadow-lg cursor-pointer font-medium"
          >
          <i className="fas fa-angle-down"></i>
          </div>
      )}
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
