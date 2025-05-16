import { useContext, useState, useCallback ,useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";

import Inbox from "./Inbox";
import FormModal from "../FormModal";
import SidebarFooter from "./SidebarFooter";
import {ChatContext} from "../../context/chatContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const {
    user,
    socket,
    onlineUsers,
    conversationList,
    setCurrentSender,
    setConversationList,
    setGroupList,
    setNotifi,
    isLoading
  } = useContext(ChatContext);

  const [createChatModal, setCreateChatModal] = useState(false);
  const [createGroupChatModal, setCreateGroupChatModal] = useState(false);
  const [toggleBtn, setToggleBtn] = useState(false);
  const [searchText, setSearchText] = useState("");

  const chatFieldList = ["email"];
  const groupChatFieldList = ["group_name", "email"];

  // Lấy token và cấu hình chung cho axios
  const token = localStorage.getItem("auth-token");
  // 1. Tạo chat 1-1
  const handleCreateChat = useCallback(
    async (formData) => {
      try {
        const response = await axios.get(
          `/user/email?user_email=${formData.email}`
        );
        const other = response.data.data;
        if (other._id !== user.id) {
          setCurrentSender({
            id: other._id,
            type: "direct",
            name: other.user_name,
            persence: "offline",
            url: other.avatar_url
          });
        }
      } catch (error) {
        setNotifi({ show: true, status: false, message: error.response.data.message })
        console.error("User not found:", error);
      } finally {
        setCreateChatModal(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user.id, setCurrentSender, token]
  );

  // 2. Tạo group chat
  const handleCreateGroupChat = useCallback(
    async (formData) => {
      try {
        const findUser = await axios.get(
          `/user/email?user_email=${formData.email}`
        );
        const other = findUser.data.data;
        if (other._id === user.id) return;

        const groupPayload = {
          group_name: formData.group_name,
          host_id: user.id,
          members_id: [user.id, other._id]
        };

        const groupCreateRes = await axios.post(
          "/group/",
          groupPayload
        );

        const newGroup = groupCreateRes.data.data;
        setCurrentSender({
          id: newGroup._id,
          type: "group",
          persence: "",
          name: newGroup.group_name,
          url: newGroup.avatar_url
        });
        setGroupList(prev => [...prev, newGroup]);

        const conversation = {
          type: "group",
          groupId: {
            _id: newGroup._id,
            group_name: newGroup.group_name,
            avatar_url: newGroup.avatar_url
          },
          lastMessage: {
            content: `Group created by ${user.name}`,
            createAt: new Date().toISOString()
          }
        };

        await axios.post(
          "/conversation",
          conversation
        );

        setConversationList(prev => [...prev, conversation]);

        socket.emit("add-to-group", {
          userList: groupPayload.members_id.filter(u => u !== user.id),
          groupId: newGroup._id
        });

      } catch (error) {
        setNotifi({show: true, status: false, message: error.response.data.message})
      } finally {
        setCreateGroupChatModal(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user.id, user.name, setCurrentSender, setGroupList, setConversationList, socket, token]
  );

  // 3. Sign out
  const handleSignOut = async () => {
    const response = await axios.post('/auth/logout');
    if(response) {
      localStorage.removeItem("auth-token"); 
      navigate("/");
    }
  };

  const filteredList = useMemo(() => {
    if (!searchText) return conversationList;
    const q = searchText.toLowerCase();
    return conversationList.filter(item => {
      if (item.type === "direct") {
        // tìm theo tên người đối diện
        const other = item.participant.find(p => p._id !== user.id);
        return other.user_name.toLowerCase().includes(q);
      } else {
        // tìm theo tên group
        return item.groupId.group_name.toLowerCase().includes(q);
      }
    });
  }, [searchText, conversationList, user.id]);

  return (
    <aside className="w-1/4 flex flex-col flex-[1_auto_1] me-3 h-screen">
        <div className="title h-[7vh] p-4 border border-gray-200 rounded-t-lg flex items-center">
          <h1 className="text-xl font-bold text-white">
            TekTi
          </h1>
        </div>
        <div className="p-4 h-[10vh] flex shadow">
          <input 
              className="w-full h-full p-2 border border-gray-200 rounded me-2" 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Search..."
          />
        <div className="relative">
          <button 
          onClick={() => setToggleBtn(state => !state)}
          className='transition h-full flex items-center justify-center'
          >
            <i className={`fas fa-caret-right transition-transform duration-300 ${toggleBtn ? "rotate-90" : ""}`}></i>
          </button>
          <ul className={`absolute right-0 mt-2 w-[25vh] rounded-xl p-4 shadow-lg z-10 space-y-2 transition-all 
            duration-300 transform origin-top-right 
            ${toggleBtn ? "scale-100 opacity-100 visible" : "scale-95 opacity-0 invisible"}`}>
              <li className="transition-transform duration-200 hover:scale-105">
                <button 
                className="w-full text-left flex items-center gap-2" 
                onClick={() => {setCreateChatModal(true); setToggleBtn(false)}}
                >
                  <i className="fas fa-user-friends transition-transform duration-200 hover:scale-110"></i>
                  <span className="font-medium">Add chat</span>
                </button>
              </li>
              <li className="transition-transform duration-200 hover:scale-105">
                <button 
                className="w-full text-left flex items-center gap-2" 
                onClick={() => {setCreateGroupChatModal(true); setToggleBtn(false)}}
                >
                  <i className="fas fa-users"></i>
                  <span className="font-medium">Add group</span>
                </button>
              </li>
              <li className="transition-transform duration-200 hover:scale-105">
                <button 
                className="w-full text-left flex items-center gap-2" 
                onClick={handleSignOut}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span className="font-medium">Log out</span>
                </button>
              </li>
          </ul>
        </div>

        </div>
        {isLoading ? (
          <div className="h-[81vh] flex items-center justify-center">
            <img src="/loading.gif" alt="Loading..." />
          </div>
        ) : (
          <>
            <div className="p-4 h-[72vh] mb-2 rounded-b-lg shadow">
            {filteredList.map((item, idx) =>
              (<Inbox
                    key={idx}
                    user={user}
                    mess={item}
                    presence={item.type === 'direct' ? onlineUsers.includes(item.participant.find(p => p._id !== user.id)._id) ? 'online' : 'offline' : ''}
                    onClick={() => {
                    if (item.type === "direct") {
                        const other = item.participant.find(p => p._id !== user.id);
                        setCurrentSender({
                          id: other._id,
                          type: "direct",
                          persence: onlineUsers.includes(other._id) ? 'online' : 'offline',
                          name: other.user_name,
                          url: other.avatar_url
                        });
                    } else {
                        setCurrentSender({
                          id: item.groupId._id,
                          type: "group",
                          name: item.groupId.group_name,
                          url: item.groupId.avatar_url
                        });
                    }
                    }}
                />))}
            </div>
            <SidebarFooter/>
          </>
        )}

        {createChatModal && (
          <FormModal 
          title={"Create new chat"}
          closeModal={setCreateChatModal} 
          fieldList={chatFieldList} 
          func={handleCreateChat}/>
        )}
        {createGroupChatModal && (
          <FormModal 
          title={"Create new chat"}
          closeModal={setCreateGroupChatModal} 
          fieldList={groupChatFieldList} 
          func={handleCreateGroupChat}/>
        )}
    </aside>
  );
};

export default Sidebar;
