import formatTime from '../../helpers/formatTime';

const Inbox = ({user, mess, onClick}) => {
    const time = formatTime(mess.lastMessage.createAt);

    return (
        <div className="p-4 border-b border-gray-200" onClick={onClick}>
            <div className="flex items-center w-full">
                <img
                    alt="User avatar"
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                    src="https://storage.googleapis.com/a1aa/image/TmPMwC91QCAWv_YdRgZC5bYM4HRnUu40yFAgKL_0r3s.jpg"
                />
                <div className="flex flex-col ml-3 w-full overflow-hidden">
                    <div className="font-medium truncate">{
                        mess.type === 'direct'
                        ? user.id === mess.participant[0]._id ? mess.participant[1].user_name : mess.participant[0].user_name
                        : mess.groupId.group_name
                        }</div>
                    <div className="flex flex-row w-full overflow-hidden">
                        <div className="text-sm text-gray-500 truncate pe-3 w-3/6 overflow-hidden">
                                { mess.lastMessage.from === user.id ? `You: ${mess.lastMessage.content}` : mess.lastMessage.content }
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
