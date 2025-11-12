import { useContext, useState } from 'react'
import {ChatContext} from '../../context/chatContext' 
import Canvas from '../Canvas'

const ChatHeader = ({socket}) => {
    const { currentSender } = useContext(ChatContext);
    const [showCanvas, setShowCanvas] = useState(false);
    const apiUrl = import.meta.env.VITE_API_URL;

    return (
        <header className="flex items-center justify-between p-4 border-b bg-[#3F72AF] rounded-t-lg">
            <div className="flex items-center bg-[#3F72AF]">
                <div className='relative'>
                    <img
                        alt="Current chat user avatar"
                        className="w-[6vh] h-[6vh] rounded-full"
                        src={`${apiUrl}${currentSender.url}`}
                    />
                    <span className={`absolute rounded-full w-[2vh] h-[2vh] right-0 bottom-0
                        ${currentSender.type === 'direct' ? currentSender.persence === 'online' ? 'bg-green-500' : 'bg-gray-400' : 'hidden'}`}></span>
                </div>
                <div className="ml-3 bg-[#3F72AF]">
                    <p className="font-medium">
                        {currentSender.name}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    className="focus:outline-none"
                    onClick={() => setShowCanvas(true)}
                >
                    <i className="fas fa-ellipsis-v"></i>
                </button>
            </div>
            <Canvas 
            title={currentSender.name} 
            show={showCanvas} 
            onClose={() => setShowCanvas(false)}
            socket={socket}/>
        </header>
    );
}

export default ChatHeader;