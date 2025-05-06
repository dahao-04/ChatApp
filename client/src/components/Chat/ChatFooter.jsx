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
        <footer className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
                <input 
                className="w-full p-2 border border-gray-300 rounded" 
                placeholder="Type a message..."
                value={mess} 
                type="text"
                onChange={handleInput}/>
                    <button className="w-10 ml-2 p-2 text-white rounded group" onClick={handleSend}>
                        <i className="fas fa-paper-plane group-hover:translate-x-1 
                        group-hover:-translate-y-1 group-hover:scale-105 duration-200"></i>
                    </button>
            </div>
        </footer>
    );
}

export default ChatFooter;