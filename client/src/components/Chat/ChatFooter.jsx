import { useState } from 'react'

const ChatFooter = ({ sendMess }) => {
    const [mess, setMess] = useState("");
    const handleInput = (e) => {
        setMess(e.target.value);
    }
    const handleSend = () => {
        if (mess.trim() !== "") { 
            sendMess(mess);
            setMess(""); 
        }
    };
    return (
        <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center">
                <input 
                className="w-full p-2 border border-gray-300 rounded" 
                placeholder="Type a message..."
                value={mess} 
                type="text"
                onChange={handleInput}/>
                    <button className="ml-2 p-2 bg-blue-500 text-white rounded" onClick={handleSend}>
                        <i className="fas fa-paper-plane"></i>
                    </button>
            </div>
        </div>
    );
}

export default ChatFooter;