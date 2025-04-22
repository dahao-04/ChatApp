const ChatHeader = ({userInfo}) => {
    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center">
                <img alt="Current chat user avatar" className="w-10 h-10 rounded-full" height="40" src="https://storage.googleapis.com/a1aa/image/JsyYMyW1C6DvgqnvQTaoINc60_4YRDs66Pqp7hUC38Y.jpg" width="40"/>
                <div className="ml-3">
                    <p className="font-medium">
                        {userInfo}
                    </p>
                    <p className="text-sm text-gray-500">
                    Online
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <i className="fas fa-phone text-gray-500">
                </i>
                <i className="fas fa-video text-gray-500">
                </i>
                <i className="fas fa-ellipsis-v text-gray-500">
                </i>
            </div>
        </div>
    );
}

export default ChatHeader;