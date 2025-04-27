import { useContext, useState } from 'react'
import chatContext from '../../context/chatContext' 
import Canvas from '../Canvas'

const ChatHeader = ({socket}) => {
    const { currentSender } = useContext(chatContext);
    const [showCanvas, setShowCanvas] = useState(false);

    return (
        <header className="flex items-center justify-between p-4 border-b bg-[#3F72AF] rounded-t-lg">
            <div className="flex items-center bg-[#3F72AF]">
                <img 
                    alt="Current chat user avatar" 
                    className="w-10 h-10 rounded-full" 
                    height="40" 
                    src={`http://localhost:3000${currentSender.url}`}
                    width="40"
                />
                <div className="ml-3 bg-[#3F72AF]">
                    <p className="font-medium">
                        {currentSender.name}
                    </p>
                    <p className="text-sm">
                        Online
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    className="rounded-none focus:outline-none"
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