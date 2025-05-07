import { useState, useContext, useCallback, useEffect } from "react";
import axios from "../api/axios";

import {ChatContext} from "../context/chatContext";
import FormModal from './FormModal';

const Canvas = ({ title, show, onClose, socket }) => {
    const { user, currentSender} = useContext(ChatContext);
    const [openIndex, setOpenIndex] = useState(null);
    const [members, setMembers] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const fieldList = ["email"];
    const setttingList = ["item 1", "item 2", "item 3"];

    useEffect(() => {
        if (!show) return;
        (async () => {
          try {
            const res = await axios.get(`/group/${currentSender.id}`);
            setMembers(res.data.data.members_id);
          } catch (err) {
            console.error("Lỗi khi fetch members:", err);
          }
        })();
      }, [show, currentSender.id]);

    const handleToggle = (index) => {
        setOpenIndex(prev => prev === index ? null : index);
    };

    const addToGroup = useCallback(
        async(formData) => {
            try {
                const findUser = await axios.get(`/user/email?user_email=${formData.email}`
                )
                if(findUser) {
                    const other = findUser.data.data;
                    if (other._id === user.id) return;
                    setMembers(prev => [...prev, other])
                    await axios.post(`/group/members/${currentSender.id}`, 
                        {members_id: other._id}
                    )
                    //chú ý đoạn này xem có chạy được ko
                    socket.emit('add-to-group', {userList: [other._id], groupId: currentSender.id})
                }
            } catch (error) {
                console.error("Lỗi khi add user:", error);
            } finally {
                onClose;
            }
        },
        [currentSender.id, onClose, socket, user.id]
    )

    const deleteUser = useCallback(
        async (userId) => {
            try {
                if(userId === user.id) return;
                setMembers(prev => prev.filter(member => member._id!==userId))
                await axios.delete(`/group/members/${currentSender.id}`, 
                    {data: {members_id: userId}}
                )
                socket.emit('delete-from-group', {userList: [userId], groupId: currentSender.id})
            } catch (error) {
                console.log("Lỗi khi xóa user: ", error);
            }
        }
        ,[currentSender.id, socket, user.id]
    )

        return (
            <>
                {/* Overlay */}
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
                        show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                    onClick={onClose}
                ></div>
                
                {/* Canvas Panel */}
                <aside
                    aria-label="Right side canvas panel"
                    className={`fixed top-3 right-0 h-[750px] w-80 shadow-lg bg-white rounded-lg transform transition-transform duration-300 flex flex-col ${
                        show ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <header className="flex-col justify-items-center p-4 border-b border-gray-300 rounded-t-lg">
                        <img 
                            className="w-20 h-20 rounded-full object-cover shrink-0"
                            src={`http://localhost:3000${currentSender.url}`}
                            alt="" 
                        />
                        <h2 className="text-lg font-semibold text-white">{title}</h2>
                    </header>

                    <div className="p-4 overflow-y-auto flex-1 text-gray-700 space-y-2">
                            {currentSender.type==='group' && (
                                <div>
                                    <button
                                        onClick={() => handleToggle(1)}
                                        className="flex items-center justify-between w-full px-4 py-3 text-left rounded-lg 
                                        border border-gray-100 group"
                                    >
                                        <span className="font-medium">Member list</span>
                                        <i className={`fas fa-angle-right transform transition-transform duration-300 ease-in-out ${openIndex === 1 ? "rotate-90" : ""}`}></i>
                                    </button>
    
                                    {openIndex === 1 && (
                                        <div className="mt-2 ml-4 space-y-1">
                                            {members.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center justify-between w-full text-left px-4 py-2 text-sm"
                                                >
                                                    {/* Hình và tên bên trái */}
                                                    <div className="flex items-center">
                                                        <img 
                                                            className="w-10 h-10 rounded-full object-cover shrink-0 me-2"
                                                            src={`http://localhost:3000${item.avatar_url}`}
                                                            alt="" 
                                                        />
                                                        <h2 className="text-sm font-medium text-gray-900">{item.user_name}</h2>
                                                    </div>
    
                                                    {/* Icon bên phải */}
                                                    <i 
                                                    className="fas fa-user-minus hover:bg-gray-200 rounded-full p-3 text-red-500 cursor-pointer duration-300 transition" 
                                                    onClick={() => deleteUser(item._id)}></i>
                                                </div>
                                            ))}
                                            <div
                                                key={"fn"}
                                                className="flex items-center w-full text-left px-4 py-2 text-sm text-black"
                                                onClick={() => setShowModal(true)}
                                            >
                                                <div className="w-11 h-11 pl-4 pt-3 bg-white hover:bg-gray-200 rounded-full rounded-full object-cover shrink-0 me-2 cursor-pointer duration-300 transition">
                                                    <i className="fas fa-user-plus"></i>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">Add</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div>
                                <button
                                    onClick={() => handleToggle(2)}
                                    className="flex items-center justify-between w-full px-4 py-3 text-left rounded-lg 
                                    border border-gray-100 group"
                                >
                                    <span className="font-medium">Setting</span>
                                    <i className={`fas fa-angle-right transform transition-transform duration-500 ease-in-out ${openIndex === 2 ? "rotate-90" : ""}`}></i>
                                </button>

                                {openIndex === 2 && (
                                    <div className="mt-2 ml-4 space-y-1">
                                        {setttingList.map((item, i) => (
                                            <button
                                                key={i}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-blue-600"
                                            >
                                                <h2 className="text-sm font-medium text-gray-900">{item}</h2>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                    </div>

                    {showModal && (
                        <FormModal 
                        title={"Add user"}
                        closeModal={() => setShowModal(false)} 
                        fieldList = {fieldList}
                        func = {addToGroup}
                    />
                    )}
                </aside>
            </>
        );
};

export default Canvas;
