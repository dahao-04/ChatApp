import { useContext, useState, useCallback ,useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Inbox from "./Inbox";
import Modal from "../Modal";
import ChatContext from "../../context/chatContext";

const Sidebar = ({ socket }) => {
  const navigate = useNavigate();
  const {
    user,
    conversationList,
    setCurrentSender,
    setConversationList,
    setGroupList
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
          `http://localhost:3000/user/email?user_email=${formData.email}`,
          { headers: token }
        );
        const other = response.data.data;
        if (other._id !== user.id) {
          setCurrentSender({
            id: other._id,
            type: "direct",
            name: other.user_name
          });
        }
      } catch (error) {
        console.error("User not found:", error);
      } finally {
        setCreateChatModal(false);
      }
    },
    [user.id, setCurrentSender, token]
  );

  // 2. Tạo group chat
  const handleCreateGroupChat = useCallback(
    async (formData) => {
      try {
        const findUser = await axios.get(
          `http://localhost:3000/user/email?user_email=${formData.email}`,
          { headers: token }
        );
        const other = findUser.data.data;
        if (other._id === user.id) return;

        const groupPayload = {
          group_name: formData.group_name,
          host_id: user.id,
          members_id: [user.id, other._id]
        };

        const groupCreateRes = await axios.post(
          "http://localhost:3000/group/",
          groupPayload,
          { headers: token }
        );

        const newGroup = groupCreateRes.data.data;
        setCurrentSender({
          id: newGroup._id,
          type: "group",
          name: newGroup.group_name
        });
        setGroupList(prev => [...prev, newGroup]);

        const conversation = {
          type: "group",
          groupId: {
            _id: newGroup._id,
            group_name: newGroup.group_name
          },
          lastMessage: {
            content: `Group created by ${user.name}`,
            createAt: new Date().toISOString()
          }
        };

        await axios.post(
          "http://localhost:3000/conversation",
          conversation,
          { headers: token }
        );

        setConversationList(prev => [...prev, conversation]);

        socket.emit("create-group", {
          userList: groupPayload.members_id.filter(u => u !== user.id),
          groupId: newGroup._id
        });
      } catch (error) {
        console.error("Lỗi khi tạo group:", error);
      } finally {
        setCreateGroupChatModal(false);
      }
    },
    [user.id, user.name, setCurrentSender, setGroupList, setConversationList, socket, token]
  );

  // 3. Sign out
  const handleSignOut = useCallback(() => {
    localStorage.removeItem("auth-token");
    navigate("/");
  }, [navigate]);

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
    <div className="w-1/4 bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">
          Chat App
        </h1>
      </div>
      <div className="p-4 flex">
        <input 
            className="w-full p-2 border border-gray-300 rounded me-2 focus:outline-none focus:ring-2 focus:ring-blue-600" 
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search..."
        />
        <div className="relative">
          <button 
            onClick={() => setToggleBtn(state => !state)}
            className="border border-gray-300 hover:text-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <i className="fas fa-caret-down"></i>
          </button>
          {toggleBtn && (
            <ul className="absolute right-0 mt-2 w-48 bg-white rounded-xl p-4 shadow-lg z-10 space-y-2">
              <li className="text-gray-700 hover:text-blue-600 transition">
                <button className="w-full text-left" onClick={() => {setCreateChatModal(true); setToggleBtn(false)}}>
                  <i className="fas fa-user-friends"></i> Add chat
                </button>
              </li>
              <li className="text-gray-700 hover:text-blue-600 transition">
                <button className="w-full text-left" onClick={() => {setCreateGroupChatModal(true); setToggleBtn(false)}}>
                  <i className="fas fa-users"></i> Add group
                </button>
              </li>
              <li className="text-gray-700 hover:text-blue-600 transition">
                <button className="w-full text-left" onClick={handleSignOut}>
                  <i className="fas fa-sign-out-alt"></i> Log out
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
      <div className="h-5/6">
        {filteredList.map((item, idx) => (
            <Inbox
                key={idx}
                user={user}
                mess={item}
                onClick={() => {
                if (item.type === "direct") {
                    const other = item.participant.find(p => p._id !== user.id);
                    setCurrentSender({
                    id: other._id,
                    type: "direct",
                    name: other.user_name
                    });
                } else {
                    setCurrentSender({
                    id: item.groupId._id,
                    type: "group",
                    name: item.groupId.group_name
                    });
                }
                }}
            />
            ))}
      </div>
      {createChatModal && (
        <Modal closeModal={setCreateChatModal} fieldList={chatFieldList} func={handleCreateChat}/>
      )}
      {createGroupChatModal && (
        <Modal closeModal={setCreateGroupChatModal} fieldList={groupChatFieldList} func={handleCreateGroupChat}/>
      )}
    </div>
  );
};

export default Sidebar;
