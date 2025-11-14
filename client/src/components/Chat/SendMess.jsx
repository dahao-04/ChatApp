import formatTime from '../../helpers/formatTime';

const imageSrvUrl = import.meta.env.VITE_IMAGE_SRV_URL;
const SendMess = ({ mess, user }) => {
    const time = formatTime(mess.createAt);
    return (
    <div className="flex items-start mb-4 flex-row-reverse">
        <img alt="Current user avatar" className="w-10 h-10 rounded-full" height="40" src={`${imageSrvUrl}${user.url}`} width="40"/>
        <div className="mr-3">
            <div className="flex flex-col  text-start bg-[#59C1BD] text-white p-3 rounded-lg shadow">
                    {mess?.content}
                    {mess.imageUrl && (
                        <img className= "max-w-60" src={`${imageSrvUrl}${mess.imageUrl}`}/>
                    )}
                    <span className="text-xs text-gray-500">
                        {time}
                    </span>
            </div>
        </div>
    </div>
    );
}

export default SendMess;