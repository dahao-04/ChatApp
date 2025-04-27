import { useContext, useMemo, useCallback } from 'react';
import axios from 'axios';

import ChatHeader from "./ChatHeader";
import ChatFooter from "./ChatFooter";
import ReceiveMess from "./ReceiveMess";
import SendMess from "./SendMess";
import ChatContext from '../../context/chatContext';

const ChatWindow = ({ socket }) => {
    const {
    user,
    sendList,
    setSendList,
    receiveList,
    currentSender,
    conversationList,
    setConversationList
    } = useContext(ChatContext);

    // 1. Tạo chatLog từ sendList & receiveList
    const chatLog = useMemo(() => {
    return [...sendList, ...receiveList]
        .filter(item => {
        if (currentSender.type === 'direct') {
            return (
            item.type === 'direct' &&
            (item.to._id === currentSender.id || item.from._id === currentSender.id)
            );
        } else {
            return (
            item.type !== 'direct' &&
            item.groupId?._id === currentSender.id
            );
        }
        })
        .sort((a, b) => new Date(a.createAt) - new Date(b.createAt));
    }, [sendList, receiveList, currentSender]);
    // 2. Hàm gửi tin nhắn
    const handleSend = useCallback(async (text) => {
    const timestamp = new Date().toISOString();
    // Chuẩn bị message
    const message = {
        type: currentSender.type,
        from: {_id: user.id, user_name: user.name, avatar_url: user.url},
        to: currentSender.type === 'direct' ? {_id: currentSender.id, user_name: currentSender.name, avatar_url: currentSender.url} : null,
        groupId: currentSender.type === 'direct'
        ? null
        : { _id: currentSender.id, group_name: currentSender.name, avatar_url: currentSender.url },
        content: text,
        createAt: timestamp
    };
    // Dữ liệu để update conversation
    const lastMessage = { from: user.id, content: text, createAt: timestamp };

    // 2.1. Gửi lên socket
    socket?.emit('send_message', message);

    try {
        // 2.2. Lưu message vào DB
        await axios.post('http://localhost:3000/mess', message);

        // 2.3. Tạo key conversationId cho direct
        const convKey = currentSender.type === 'direct'
        ? [user.id, currentSender.id].sort().join('_')
        : null;

        // 2.4. Kiểm tra conversation đã tồn tại?
        const idx = conversationList.findIndex(item =>
        currentSender.type === 'direct'
            ? item.conversationId === convKey
            : item.groupId?._id === currentSender.id
        );

        if (idx >= 0) {
        // 2.5. Cập nhật conversation hiện có
        await axios.put('http://localhost:3000/conversation', {
            conversationId: convKey,
            groupId: currentSender.type === 'direct' ? null : currentSender.id,
            lastMessage
        });
        // Cập nhật state
        setConversationList(prev => {
            const updated = [...prev];
            updated[idx].lastMessage = lastMessage;
            return updated;
        });
        } else {
        // 2.6. Tạo mới conversation
        await axios.post('http://localhost:3000/conversation', {
            type: currentSender.type,
            participant: currentSender.type === 'direct'
            ? [ user.id, currentSender.id ]
            : null,
            groupId: currentSender.type === 'direct' ? null : currentSender.id,
            lastMessage
        });
        // Cập nhật state
        setConversationList(prev => [
            ...prev,
            {
            type: currentSender.type,
            conversationId: convKey,
            participant: currentSender.type === 'direct'
                ? [
                    { _id: user.id, user_name: user.name, avatar_url: user.url },
                    { _id: currentSender.id, user_name: currentSender.name, avatar_url: currentSender.url }
                ]
                : [],
            groupId: currentSender.type === 'direct'
                ? null
                : { _id: currentSender.id, group_name: currentSender.name, avatar_url: currentSender.url },
            lastMessage
            }
        ]);
        }

        // 2.7. Đưa message vào sendList để hiển thị ngay
        setSendList(prev => [...prev, message]);
    } catch (error) {
        console.error('Lỗi khi gửi hoặc lưu tin nhắn:', error);
    }
    }, [currentSender.type, currentSender.id, currentSender.name, currentSender.url, user.id, user.name, user.url, socket, conversationList, setSendList, setConversationList]);

    return (
        <div className="flex-1 flex flex-col shadow">
            <ChatHeader socket={socket}/>

            <div className="flex-1 overflow-y-auto p-4">
                {chatLog.map((msg, idx) =>
                    msg.from._id === user.id
                    ? <SendMess key={idx} mess={msg} user={user} />
                    : <ReceiveMess key={idx} mess={msg} />
                )}
            </div>

            <ChatFooter sendMess={handleSend} />
        </div>
    );

};

export default ChatWindow;
