import { useContext, useRef, useState } from 'react';
import axios from '../../api/axios';
import {ChatContext} from '../../context/chatContext';
import FormModal from '../FormModal';

const SidebarFooter = () => {
    const { user, setUser, setNotifi } = useContext(ChatContext);
    const [toggleBtn, setToggleBtn] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', fieldList: [], func: () => {} });
    const fileInputRef = useRef(null);
    const defaultAvatar = "https://res.cloudinary.com/drqkpxzov/image/upload/v1763128872/default_sxbr11_zkgy7d.png";
    const imageSrvUrl = import.meta.env.VITE_IMAGE_SRV_URL;
    const userAvatarUrl = user.url ? `${imageSrvUrl}${user.url}` : defaultAvatar;
    
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await axios.post('/upload/avatar', formData);
            const avatarUrl = res.data.avatarUrl;
            const updateUser = await axios.put(
                `/user/${user.id}`, 
                {
                    avatar_url: avatarUrl
                }
            );
            if(updateUser) {
                setNotifi({show: true, status: true, message: "Cool avatar updated."})
                setOpenModal(false);
                setUser(prev => ({ ...prev, url: avatarUrl }));
            }
        } catch (err) {
            setNotifi({show: true, status: false, message: err.response.data.message})
            console.error("Upload failed:", err);
        }
    };

    const openChangeNameModal = () => {
        setModalConfig({
            title: "Change Name",
            fieldList: ['name'],
            func: async (formData) => {
                try {
                    if(!formData.name) {
                        setNotifi({ show: true, status: false, message: "Enter your new name."})
                    } else {
                        const updateUser = await axios.put(
                            `/user/${user.id}`, 
                            {
                                user_name: formData.name
                            }
                        );
                        if(updateUser) {
                            setNotifi({ show: true, status: true, message: "It's a beautiful name!"})
                            setOpenModal(false);
                            setUser(prev => ({ ...prev, name: formData.name }));
                        }
                    }
                } catch (err) {
                    setNotifi({show: true, message: err.response.data.message})
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
                    if(formData.current === formData.new) {
                        setNotifi({show: true, status: false, message: "It's look similar..."})
                    } else {
                        await axios.post(`/auth/changePass/${user.id}`,
                            {
                                current_password: formData.current,
                                new_password: formData.new
                            }
                        );
                        setNotifi({show: true, status: true, message:"Your security upgraded!"})
                        setOpenModal(false);
                    }

                } catch (error) {
                    setNotifi({show: true, status: false, message: error.response.data.message})
                    console.error("Update password failed: ", error)
                }
            }
        });
        setOpenModal(true);
    };

    return (
        <div className="relative border h-[10vh] flex items-center justify-between rounded-lg relative bg-gradient-to-r from-[#112D4E] to-white-500">
            <img src={"https://res.cloudinary.com/drqkpxzov/image/upload/v1763129405/fun_2_edeqcx.gif"} alt="" className='w-[9vh] rounded-[4vh]' />
            <div className='flex items-center justify-end p-4 h-[10vh] w-[40vh]'>
                <span className="me-2 font-normal italic">Welcome <strong>{user.name}</strong>!</span>
                <img
                    alt="User avatar"
                    onClick={() => setToggleBtn(state => !state)}
                    className="w-[13vh] h-[5vh] rounded-full object-cover shrink-0 hover:scale-105 duration-200 hover:ring-2 cursor-pointer"
                    src={`${userAvatarUrl}`}
                />
            </div>

            <ul className={`absolute size-fit right-2 bottom-20 mt-2 rounded-xl p-4 shadow-lg z-10 space-y-2 transition-all 
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
