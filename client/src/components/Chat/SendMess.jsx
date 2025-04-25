import formatTime from '../../helpers/formatTime';

const SendMess = ({ mess }) => {
    const time = formatTime(mess.createAt);
    return (
    <div className="flex items-start mb-4 flex-row-reverse">
        <img alt="Current user avatar" className="w-10 h-10 rounded-full" height="40" src="https://storage.googleapis.com/a1aa/image/rXfp-q2R3YYz6sT5PcHxtwTYxxESLsKr7WeU-u5BklE.jpg" width="40"/>
        <div className="mr-3">
            <div className="bg-[#59C1BD] text-white p-3 rounded-lg shadow">
                <p>
                    {mess.content}
                </p>
            </div>
            <span className="text-xs text-gray-500">
                {time}
            </span>
        </div>
    </div>
    );
}

export default SendMess;