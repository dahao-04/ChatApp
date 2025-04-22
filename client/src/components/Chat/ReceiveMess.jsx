import formatTime from '../../helpers/formatTime';

const ReceiveMess = ({ mess }) => {
    const time = formatTime(mess.createAt);
    return (
        <div className="flex items-start mb-4">
            <img alt="User avatar" className="w-10 h-10 rounded-full" height="40" src="https://storage.googleapis.com/a1aa/image/TmPMwC91QCAWv_YdRgZC5bYM4HRnUu40yFAgKL_0r3s.jpg" width="40"/>
            <div className="ml-3">
                <div className="bg-white p-3 rounded-lg shadow">
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

export default ReceiveMess;