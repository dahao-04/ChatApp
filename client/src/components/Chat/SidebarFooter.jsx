import { useContext, useRef, useState } from 'react';
import axios from 'axios';
import chatContext from '../../context/chatContext';
import FormModal from '../FormModal';

const SidebarFooter = () => {
    const { user, setUser } = useContext(chatContext);
    const [toggleBtn, setToggleBtn] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', fieldList: [], func: () => {} });
    const fileInputRef = useRef(null);

    const token = localStorage.getItem('auth-token');
    
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await axios.post('http://localhost:3000/upload/avatar', formData);
            const avatarUrl = res.data.avatarUrl;
            const updateUser = await axios.put(
                `http://localhost:3000/user/${user.id}`, 
                {
                    avatar_url: avatarUrl
                },
                {
                    headers: {
                        'auth-token': token
                    }
                } 
            );
            if(updateUser) {
                setOpenModal(false);
                setUser(prev => ({ ...prev, url: avatarUrl }));
            }
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    const openChangeNameModal = () => {
        setModalConfig({
            title: "Change Name",
            fieldList: ['name'],
            func: async (formData) => {
                try {
                    const updateUser = await axios.put(
                        `http://localhost:3000/user/${user.id}`, 
                        {
                            user_name: formData.name
                        },
                        {
                            headers: {
                                'auth-token': token
                            }
                        }
                    );
                    if(updateUser) {
                        setOpenModal(false);
                        setUser(prev => ({ ...prev, name: formData.name }));
                    }
                } catch (err) {
                    console.error("Upload failed:", err);
                }
            }
        });
        setOpenModal(true);
    };

    const openChangePasswordModal = () => {
        setModalConfig({
            title: "Change Password",
            fieldList: ['current', 'new'],
            func: async (formData) => {
                try {
                    const response = await axios.get(`http://localhost:3000/user/${user.id}`);
                    if(formData.current === response.data.data.user_password) {
                        const updateUser = await axios.put(`http://localhost:3000/user/${user.id}`,
                            { user_password: formData.new },
                            { headers: {
                                "auth-token": token
                            } }
                        )
                        if(updateUser) {
                            setOpenModal(false);
                        }
                    }else {
                        alert("Wrong password.")
                    }
                } catch (error) {
                    console.error("Update password failed: ", error)
                }
            }
        });
        setOpenModal(true);
    };

    return (
        <div className="border h-[9vh] flex items-center justify-end p-4 bg-white rounded-lg relative">
            <span className="me-2 font-normal italic">Welcome back <strong>{user.name}</strong>!</span>

            <img 
                alt="User avatar"
                onClick={() => setToggleBtn(state => !state)}
                className="w-10 h-10 rounded-full object-cover shrink-0 hover:scale-105 duration-200 hover:ring-2 cursor-pointer"
                src={`http://localhost:3000${user.url}`}
            />

            <ul className={`absolute left-50 bottom-20 mt-2 rounded-xl p-4 shadow-lg z-10 space-y-2 transition-all 
                duration-300 transform origin-top-right 
                ${toggleBtn ? "scale-100 opacity-100 visible" : "scale-95 opacity-0 invisible"}`}>
                <li className="transition-transform duration-200 hover:scale-105">
                    <button 
                        className="w-full text-left flex items-center gap-2" 
                        onClick={() => { openChangeNameModal(); setToggleBtn(false); }}
                    >
                        <i className="fas fa-user-edit"></i>
                        <span className="font-medium">Change name</span>
                    </button>
                </li>
                <li className="transition-transform duration-200 hover:scale-105">
                    <button 
                        className="w-full text-left flex items-center gap-2" 
                        onClick={() => { openChangePasswordModal(); setToggleBtn(false) }}
                    >
                        <i className="fas fa-key"></i>
                        <span className="font-medium">Change password</span>
                    </button>
                </li>
                <li className="transition-transform duration-200 hover:scale-105">
                    <button 
                        className="w-full text-left flex items-center gap-2" 
                        onClick={() => { fileInputRef.current.click(); setToggleBtn(false); }}
                    >
                        <i className="fas fa-images"></i>
                        <span className="font-medium">Change avatar</span>
                    </button>
                </li>
            </ul>

            {/* Hidden file input */}
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
            />

            {openModal && (
                <FormModal 
                    title={modalConfig.title}
                    closeModal={setOpenModal}
                    fieldList={modalConfig.fieldList}
                    func={modalConfig.func}
                />
            )}
        </div>
    );
};

export default SidebarFooter;
