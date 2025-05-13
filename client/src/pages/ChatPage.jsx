import { useContext, useCallback, useEffect } from 'react';
import axios from '../api/axios';

import Sidebar from '../components/Chat/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import Notification from '../components/Notification';

import {ChatContext} from '../context/chatContext';

const ChatPage = () => {
  const {
    user,
    socket,
    currentSender,
    notifi,
    setNotifi,
    setReceiveList,
    setConversationList
  } = useContext(ChatContext);

  // handle incoming messages
  const handleReceive = useCallback(async (message) => {
    let senderInfo = currentSender;
    if (message.type === 'direct') {
    const res = await axios.get(`/user/${message.from._id}`);
    senderInfo = {
        id: res.data.data._id,
        type: 'direct',
        name: res.data.data.user_name,
        url: res.data.data.avatar_url
    };
    } else {
    senderInfo = {
        id: message.groupId._id,
        type: 'group',
        name: message.groupId.group_name,
        url: message.groupId.avatar_url
    };
    }

    // build conversation key for direct, or group id for group
    const conversationId = [user.id, senderInfo.id].sort();
    const convKey = senderInfo.type === 'direct'
    ? `${conversationId[0]}_${conversationId[1]}`
    : message.groupId._id;

    // append to the receive list
    setReceiveList(prev => [...prev, message]);

    // update the conversation list
    setConversationList(prev => {
    const idx = prev.findIndex(item =>
        item.type === 'direct'
        ? item.conversationId === convKey
        : item.groupId._id === convKey
    );

    const newEntry = {
        type: senderInfo.type,
        conversationId: senderInfo.type === 'direct' ? convKey : null,
        groupId: senderInfo.type === 'group'
        ? { _id: message.groupId._id, group_name: message.groupId.group_name, avatar_url: message.groupId.avatar_url }
        : null,
        participant: senderInfo.type === 'direct'
        ? [
            { _id: user.id, user_name: user.name, avatar_url: user.url},
            { _id: senderInfo.id, user_name: senderInfo.name, avatar_url: senderInfo.url }
            ]
        : [],
        lastMessage: {
            from: message.from._id,
            content: message.content,
            imageUrl: message.imageUrl,
            createAt: message.createAt
        }
    };

    if (idx >= 0) {
        // update existing
        const updated = [...prev];
        updated[idx] = { ...updated[idx], lastMessage: newEntry.lastMessage };
        return updated;
    } else {
        // add new
        return [...prev, newEntry];
    }
    });
  }, [currentSender, user.id, user.name, user.url, setReceiveList, setConversationList]);

  // attach/detach listener
  useEffect(() => {
      if (!socket) return;
      socket.on('receive_message', handleReceive);
      return () => {
      socket.off('receive_message', handleReceive);
      };
  }, [socket, handleReceive]);
  return (
    <div className="flex h-screen">
        <Sidebar/>
        {currentSender.type 
        ? <ChatWindow/> 
        : <div className="flex-1 flex flex-col justify-center items-center px-6 text-center">
            <div className="mb-8 p-12 border-4 border-dashed border
            bg-opacity-10 rounded-lg max-w-md w-full duration-200 hover:scale-105">
                <i className="fas fa-inbox text-6xl mb-6 opacity-50"></i>
                <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
                    Nothing here...
                </h2>
                <h3 className="text-lg mb-6">
                    Click <i className="fas fa-caret-down"></i> on the left to create one!
                </h3>
            </div>
            </div>
        }
        <Notification notifi = {notifi} setNotifi = {setNotifi}/>
    </div>
  );
};

export default ChatPage;
