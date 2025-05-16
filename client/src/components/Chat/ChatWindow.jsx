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
    setReceiveList,
    currentSender,
    conversationList,
    setConversationList,
    isTyping
    } = useContext(ChatContext);

    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const [initialScroll, setInitialScroll] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState({send:1,receive:1});
    const containerRef = useRef(null);
    const bottomRef = useRef(null);
    const loadMore = useRef(null);

    // Tạo chatLog từ sendList & receiveList
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

    const scrollToBottom = () => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Hàm gửi tin nhắn
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
        const checkTypeMessage = (url) => {
            if (url.includes("/uploads/messages/")) return "[Image]";
            if (url.includes("/uploads/stickers/")) return "[Sticker]";
            return "[Unknown]";
        };
        // Dữ liệu để update conversation
        const lastMessage = { 
            from: user.id, 
            content: imageUrl ? checkTypeMessage(imageUrl) : text,
            createAt: timestamp 
        };

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
            scrollToBottom();
        } 
        catch (error) {
            console.error('Lỗi khi gửi hoặc lưu tin nhắn:', error);
        }
    }, [currentSender.type, currentSender.id, currentSender.name, currentSender.url, user.id, user.name, user.url, socket, conversationList, setSendList, setConversationList]);

    const formatDate = isoString => {
        const d = new Date(isoString);
        return d.toLocaleDateString('vi-VN');
    };

    const handleScroll = () => {
        const el = containerRef.current;
        if (!el) return;
        //tính xem người dùng có đang ở dưới không
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
        setShowScrollBtn(!atBottom);
    };

    useEffect(() => {
        const options = {root: containerRef.current, rootMargin: '0px', threshold: 1.0};
        const target = loadMore.current;
        const observer = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting) {
                setPage(prev => prev + 1);
            }
        }, options);
        if(target) observer.observe(target);
        return () => {
            if(target) observer.unobserve(target);
        }
    },[])

    useEffect(() => {
        if(chatLog.length > 0 && initialScroll) {
            scrollToBottom();
            setInitialScroll(false);
        }
    }, [chatLog.length, initialScroll])

    useEffect(() => {
        if(page > totalPage.send && page > totalPage.receive) return;
        const type = currentSender.type === 'direct' ? 'direct' : 'group';

        axios.get(`/mess/log/${user.id}?page=${page}&limit=10&type=${type}`)
        .then(response => {
            const sendPages = response.data.pagination.sendList.totalPages;
            const receivePages = response.data.pagination.receiveList.totalPages;

            setTotalPage({
                send: sendPages,
                receive: receivePages
            });
            if (page <= sendPages) {
                setSendList(prev => [...prev, ...response.data.data.sendList]);
            }

            if (page <= receivePages) {
                setReceiveList(prev => [...prev, ...response.data.data.receiveList]);
            }
 
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[page, setReceiveList, setSendList, user.id])

    useEffect(()=> {
        setSendList([]);
        setReceiveList([]);
        setInitialScroll(true);
        setPage(1);
    },[currentSender, setReceiveList, setSendList])

    return (
        <div className="flex-1 flex flex-col flex-[1_auto_1] shadow rounded-lg">
            <ChatHeader socket={socket}/>

            <div 
                ref= {containerRef} 
                className="h-[80vh] overflow-y-auto p-4 border-blue-500 -z-4"
                onScroll={handleScroll}
            >   

                <div ref={loadMore}></div>

                {chatLog.reduce((arr, msg, idx) => {
                    const thisDate = formatDate(msg.createAt);
                    const prevDate = idx > 0 ? formatDate(chatLog[idx - 1].createAt) : null;

                    if ((idx === 0 || thisDate !== prevDate)) {
                        arr.push(
                            <DateDivider key={`div-${idx}`} date={thisDate} />
                        );
                    }

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

            <ChatFooter sendMess={handleSend} showScrollBtn={showScrollBtn} scrollToBottom={scrollToBottom}/>
        </div>
    );

};

export default ChatWindow;
