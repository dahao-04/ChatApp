const Notification = ({show, status, message}) => {
    return (
        <div className={`absolute right-2 top-2 size-fit p-4 border border-gray-300 
        rounded-2xl bg-white ${show ? "" : "translate-x-full"}`}>
            {status
                ? (<i className="fas fa-check-circle text-green-600"></i>) 
                : (<i className="fas fa-times-circle text-red-600"></i>)
            }
            <span className="ms-2">{message}</span>
        </div>
    )
}

export default Notification