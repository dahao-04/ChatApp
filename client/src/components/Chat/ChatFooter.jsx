import { useState, useRef } from 'react'
import axios from '../../api/axios';

const ChatFooter = ({ sendMess }) => {
    const [mess, setMess] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const fileInputRef = useRef(null);

    const handleInput = (e) => {
        setMess(e.target.value);
    }
    
    const handleSend = () => {
        if (mess.trim() !== "") { 
            sendMess(mess, imageUrl);
            setMess(""); 
        }
    };

    const handleSendImage = async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const formData = new FormData();
        formData.append('image', file);
        const res = await axios.post("/upload/image", formData);
        console.log(res.data.imageUrl)
        setImageUrl(res.data.imageUrl);
        sendMess(mess, res.data.imageUrl);

    }

    return (
        <footer className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
                <input 
                className="w-full p-2 border border-gray-300 rounded" 
                placeholder="Type a message..."
                value={mess} 
                type="text"
                onChange={handleInput}/>
                <button 
                className="w-10 ml-2 p-2 text-white rounded group"
                onClick={() => fileInputRef.current.click()}>
                    <i className='far fa-image group-hover:scale-110 duration-200'></i>
                </button>
                <button className="w-10 ml-2 p-2 text-white rounded group" onClick={handleSend}>
                    <i className="fas fa-paper-plane group-hover:translate-x-1 
                    group-hover:-translate-y-1 group-hover:scale-105 duration-200"></i>
                </button>
            </div>

            <input
                type= 'file'
                ref= {fileInputRef}
                onChange= {handleSendImage}
                accept='image/*'
                className='hidden'
            />
        </footer>
    );
}

export default ChatFooter;