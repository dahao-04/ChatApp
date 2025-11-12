import { useState, useContext, useCallback, useEffect, useRef } from "react";
import axios from "../api/axios";

import {ChatContext} from "../context/chatContext";
import FormModal from './FormModal';

const Canvas = ({ title, show, onClose, socket }) => {
    const { user, currentSender, setNotifi, setCurrentSender} = useContext(ChatContext);
    const [openIndex, setOpenIndex] = useState(null);
    const [members, setMembers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', fieldList: [], func: () => {} });

    const fileInputRef = useRef(null);

    const apiUrl = import.meta.env.VITE_API_URL;

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

                    socket.emit('add-to-group', {userList: [other._id], groupId: currentSender.id})
                }
            } catch (error) {
                console.error("Lỗi khi add user:", error);
            } finally {
                setShowModal(false);
                onClose;
            }
        },
        [currentSender.id, onClose, socket, user.id]
    )

    const deleteUser = useCallback(
        async (userId) => {
            try {
                const group = await axios.get(`/group/${currentSender.id}`);
                if(userId === group.data.data.host_id) {
                    setNotifi({ show: true, status: false, message: "You are host." });
                    return;
                }
                setMembers(prev => prev.filter(member => member._id!==userId))
                await axios.delete(`/group/members/${currentSender.id}`, 
                    {data: {members_id: userId}}
                )
                socket.emit('delete-from-group', {userList: [userId], groupId: currentSender.id})
            } catch (error) {
                
                console.log("Lỗi khi xóa user: ", error);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        ,[currentSender.id, socket, user.id]
    )

    const openAddToGroupModal = () => {
        setModalConfig({
            title: "Add user",
            fieldList: ["email"],
            func: addToGroup
        })
        setShowModal(true);
    }

    const openChangeGroupNameModal = () => {
        setModalConfig({
            title: "Change group name",
            fieldList: ["name"],
            func: async (formData) => {
                try {
                    if(!formData.name) {
                        setNotifi({ show: true, status: false, message: "Enter your new name."})
                    } else {
                        const updateGroup = await axios.put(
                            `/group/${currentSender.id}`, 
                            {
                                group_name: formData.name
                            }
                        );
                        if(updateGroup) {
                            setNotifi({ show: true, status: true, message: "It's a beautiful name!"})
                            setShowModal(false);
                            setCurrentSender(prev => ({ ...prev, name: formData.name }));
                        }
                    }
                } catch (err) {
                    setNotifi({show: true, message: err.response.data.message})
                    console.error("Upload failed:", err);
                }
            }
        })
        setShowModal(true);
    }

    const handleGroupAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await axios.post('/upload/avatar', formData);
            const avatarUrl = res.data.avatarUrl;
            const updateUser = await axios.put(
                `/group/${currentSender.id}`, 
                {
                    avatar_url: avatarUrl
                }
            );
            if(updateUser) {
                setNotifi({show: true, status: true, message: "Cool avatar updated."})
                setCurrentSender(prev => ({ ...prev, url: avatarUrl }));
            }
        } catch (err) {
            setNotifi({show: true, status: false, message: err.response.data.message})
            console.error("Upload failed:", err);
        }
    };

    const leaveGroup = useCallback(
        async () => {
            try {
                await axios.delete(`/group/members/${currentSender.id}`, 
                    {data: {members_id: user.id}}
                )
                socket.emit('leave-group', {groupList: [currentSender.id]});
                window.location.href = ("/chat");
            } catch (error) {
                setNotifi({ show: true, status: false, message: error.response.data.message })
                console.log("Lỗi khi xóa user: ", error);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        ,[currentSender.id, socket, user.id]
    )

    const groupSetttingList = [
        {
            name: "Change group avatar",
            icon: "fas fa-images",
            func: () => fileInputRef.current.click()
        },
        {
            name: "Change group name",
            icon: "fas fa-user-edit",
            func: openChangeGroupNameModal
        },
        {
            name: "Leave group",
            icon: "fas fa-door-open",
            func: leaveGroup
        }
    ];
    const userSettingList = [];

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


        return (
            <>
                {/* Overlay */}
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-[60] ${
                        show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                    onClick={onClose}
                ></div>
                
                {/* Canvas Panel */}
                <aside
                    aria-label="Right side canvas panel"
                    className={`fixed top-0 right-0 h-[95vh] mt-4 w-80 shadow-lg bg-white rounded-lg transform transition-transform duration-300 flex flex-col z-[60] ${
                        show ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <header className="flex-col justify-items-center p-4 border-b border-gray-300 rounded-t-lg">
                        <img 
                            className="w-20 h-20 rounded-full object-cover shrink-0"
                            src={`${apiUrl}${currentSender.url}`}
                            alt="" 
                        />
                        <h2 className="text-lg font-semibold text-white">{title}</h2>
                    </header>

                    <div className="p-4 overflow-y-auto flex-1 text-gray-700 space-y-2">
                            {currentSender.type==='group' ? (
                                <>
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
                                                    className="flex items-center justify-between bg-gray-100 rounded-lg w-full text-left px-4 py-2 text-sm"
                                                >
                                                    {/* Hình và tên bên trái */}
                                                    <div className="flex items-center">
                                                        <img 
                                                            className="w-10 h-10 rounded-full object-cover shrink-0 me-2"
                                                            src={`${apiUrl}${item.avatar_url}`}
                                                            alt="" 
                                                        />
                                                        <h2 className="text-sm font-medium text-gray-900">{item.user_name}</h2>
                                                    </div>
    
                                                    {/* Icon bên phải */}
                                                    <i 
                                                    className="fas fa-user-minus hover:bg-gray-300 w-10 h-10 rounded-full p-3 text-red-500 cursor-pointer duration-300 transition" 
                                                    onClick={() => deleteUser(item._id)}></i>
                                                </div>
                                            ))}
                                            <div
                                                key={"fn"}
                                                className="flex items-center w-full text-left px-4 py-2 text-sm text-black"
                                                onClick={openAddToGroupModal}
                                            >
                                                <div className="w-11 h-11 pl-4 pt-3 bg-white hover:bg-gray-200 rounded-full rounded-full object-cover shrink-0 me-2 cursor-pointer duration-300 transition">
                                                    <i className="fas fa-user-plus"></i>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">Add</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                                            {groupSetttingList.map((item, i) => (
                                                <div
                                                    key={i}
                                                    onClick={item.func}
                                                    className="flex justify-between items-center w-full h-14 text-left px-5 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-300"
                                                >
                                                    <h2 className="font-medium ">{item.name}</h2>
                                                    <i className={item.icon}></i>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleGroupAvatarChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                </>
                            ) : (
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
                                            {userSettingList.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="flex justify-between items-center w-full h-14 text-left px-5 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-300"
                                                >
                                                    <h2 className="text-sm font-medium">{item}</h2>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>    
                            )}
                    </div>

                    {showModal && (
                        <FormModal 
                            title= {modalConfig.name}
                            closeModal = {() => setShowModal(false)}
                            fieldList = {modalConfig.fieldList}
                            func = {modalConfig.func}
                        />
                    )}
                </aside>
            </>
        );
};

export default Canvas;
