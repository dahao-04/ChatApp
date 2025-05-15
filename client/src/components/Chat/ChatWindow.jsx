import React, { useContext, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import axios from '../../api/axios';

import ChatHeader from "./ChatHeader";
import ChatFooter from "./ChatFooter";
import ReceiveMess from "./ReceiveMess";
import SendMess from "./SendMess";
import DateDivider from '../DateDevider';
import {ChatContext} from '../../context/chatContext';

const ChatWindow = () => {
    const {
    user,
    socket,
    sendList,
    setSendList,
    receiveList,
    currentSender,
    conversationList,
    setConversationList,
    isTyping
    } = useContext(ChatContext);

    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const containerRef = useRef(null);
    const bottomRef = useRef(null);
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
                        item.type === 'group' &&
                        (item.groupId._id === currentSender.id)
                    );
                }
            })
            .sort((a, b) => new Date(a.createAt) - new Date(b.createAt));
    }, [sendList, receiveList, currentSender]);

    // 2. Hàm gửi tin nhắn
    const handleSend = useCallback(async (text, imageUrl) => {
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
        imageUrl: imageUrl,
        createAt: timestamp
    };
    // Dữ liệu để update conversation
    const lastMessage = { 
        from: user.id, 
        content: imageUrl ? "[Image]" : text,
        createAt: timestamp };

    try {
        // 2.2. Lưu message vào DB
        await axios.post('/mess', message);

        // 2.1. Gửi lên socket
        socket?.emit('send_message', message);


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
        await axios.put('/conversation', {
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
        await axios.post(
            '/conversation',
            {
                type: currentSender.type,
                participant: currentSender.type === 'direct'
                ? [ user.id, currentSender.id ]
                : null,
                groupId: currentSender.type === 'direct' ? null : currentSender.id,
                lastMessage
            }
        );
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

    const formatDate = isoString => {
        const d = new Date(isoString);
        return d.toLocaleDateString('vi-VN');
      };
      
    const scrollToBottom = () => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    useEffect(() => {
        scrollToBottom();
    }, [chatLog]);

    const handleScroll = () => {
        const el = containerRef.current;
        if (!el) return;
        // Thêm khoảng dư 20px để khỏi giật
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
        setShowScrollBtn(!atBottom);
    };

    return (
        <div className="relative flex-1 flex flex-col shadow rounded-lg">
            <ChatHeader socket={socket}/>
        {showScrollBtn && (
            <div
                onClick={scrollToBottom}
                className="absolute bottom-24 right-6 bg-gray-300 hover:bg-gray-400
                        text-gray-500 px-3 py-1 rounded-full shadow-lg cursor-pointer font-medium"
            >
            <i class="fas fa-angle-down"></i>
            </div>
        )}
            <div 
                ref= {containerRef} 
                className="flex-1 overflow-y-auto p-4"
                onScroll={handleScroll}
            >
                {chatLog.reduce((arr, msg, idx) => {
                    const thisDate = formatDate(msg.createAt);
                    const prevDate = idx > 0 ? formatDate(chatLog[idx - 1].createAt) : null;

                    // Nếu là tin nhắn đầu hoặc khác ngày với tin trước, chèn divider
                    if ((idx === 0 || thisDate !== prevDate)) {
                        arr.push(
                            <DateDivider key={`div-${idx}`} date={thisDate} />
                        );
                    }

                    // Rồi mới render tin nhắn
                    arr.push(
                    msg.from._id === user.id
                        ? <SendMess key={`msg-${idx}`} mess={msg} user={user} />
                        : <ReceiveMess key={`msg-${idx}`} mess={msg} />
                    );

                    return arr;
                }, [])}
                <div ref={bottomRef}></div>
            </div>

            {isTyping && (
                <span className='flex items-center w-9 h-4 rounded-t-lg bg-gray-200'>
                    <img className='h-4 w-14' src="/typing.gif"/> 
                    <p className='text-gray-400 ms-2 text-xs font-medium'>typing</p>
                </span>
            )}
            <ChatFooter sendMess={handleSend} />
        </div>
    );

};

export default ChatWindow;
