import formatTime from '../../helpers/formatTime';

const ReceiveMess = ({ mess }) => {
    const time = formatTime(mess.createAt);
    return (
        <div className="flex items-start mb-4">
            <img alt="User avatar" className="w-10 h-10 rounded-full" height="40" src={`http://localhost:3000${mess.from.avatar_url}`} width="40"/>
            <div className="ml-3">
                <div className="bg-white p-3 rounded-lg shadow ">
                    <div className="flex flex-col text-gray-700 text-start">
                        {mess?.content}
                        {mess.imageUrl && (
                            <img className= "max-w-60" src={`http://localhost:3000${mess.imageUrl}`}/>
                        )}
                        <span className="text-xs text-gray-500">
                            {time}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReceiveMess;