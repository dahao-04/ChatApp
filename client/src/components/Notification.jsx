import { useEffect } from 'react'

const Notification = ({notifi, setNotifi}) => {
    useEffect(() => {
        if (notifi.show) {
            const timer = setTimeout(() => {
                setNotifi({ show: false, status: false, message:"" });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [notifi.show, setNotifi]);
    return (
        <div className={`fixed top-4 ${notifi.show ? 'right-4' : '-right-96'} 
            ${notifi.status ? 'bg-green-100' : 'bg-red-100'}
            w-fit p-4 border border-gray-300 rounded-2xl bg-white 
            z-50 flex items-center shadow-md transition-all duration-300 ease-in-out`}>
            {notifi.status
                ? (<i className="fas fa-check-circle text-green-600 bg-white rounded-full"></i>) 
                : (<i className="fas fa-times-circle text-red-600 bg-white rounded-full"></i>)
            }
            <span className="ms-2 font-medium">{notifi.message}</span>
        </div>
    )
}

export default Notification