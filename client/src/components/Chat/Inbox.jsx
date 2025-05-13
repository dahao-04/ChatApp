import formatTime from '../../helpers/formatTime';

const Inbox = ({user, mess, onClick, presence}) => {
    const time = formatTime(mess.lastMessage.createAt);
    const sender = mess?.participant?.find(p => p._id !== user.id);
    return (
        <div className="py-4 border-b border-gray-300" onClick={onClick}>
            <div className="flex items-center w-full">
                <div className="relative">
                    <img
                        alt="User avatar"
                        className="w-12 h-10 rounded-full object-cover shrink-0 hover:scale-105 duration-200 hover:ring-2 cursor-pointer"
                        src={`http://localhost:3000${mess.groupId?mess.groupId.avatar_url:sender.avatar_url}`}
                    />
                    <span className={`absolute right-0 bottom-0 w-3 h-3 ${mess.type === 'direct' ? presence === 'online' ? 'bg-green-400' : 'bg-gray-400' : 'hidden'} rounded-full`}></span>
                </div>
                <div className="flex flex-col ml-3 w-full overflow-hidden">
                    <div className="font-medium truncate">{
                        mess.type === 'direct'
                        ? user.id === mess.participant[0]._id ? mess.participant[1].user_name : mess.participant[0].user_name
                        : mess.groupId.group_name
                        }</div>
                    <div className="flex flex-row w-full overflow-hidden">
                        <div className="text-sm text-gray-500 truncate pe-3 w-3/6 overflow-hidden">
                                { mess.lastMessage.from === user.id ? `You: ${mess.lastMessage.content}` : (mess.lastMessage.imageUrl ? "[Image]" : mess.lastMessage.content) }
                        </div>
                        <div className="text-sm text-gray-500 w-3/6 text-right truncate">
                            {time}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inbox;
