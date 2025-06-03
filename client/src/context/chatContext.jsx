import { createContext, useEffect, useState } from 'react';
import axios from '../api/axios';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';

const ChatContext = createContext();

export const ChatProvider = ({children}) => {
    const [socket, setSocket] = useState(null);
    const [sendList, setSendList] = useState([]);
    const [receiveList, setReceiveList] = useState([]);
    const [currentSender, setCurrentSender] = useState({});
    const [user, setUser] = useState({});
    const [conversationList, setConversationList] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [notifi, setNotifi] = useState({show: false, status: false, message: ""});
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [userLoaded, setUserLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingCount, setLoadingCount] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const token = localStorage.getItem('auth-token');

    useEffect( () => {
        if(!token) {
            setIsLoading(true);
            return;
        }
        axios.get(`/user/${jwtDecode(token).id}`)
        .then(res => {
            setLoadingCount(prev => prev + 1);
            setUser({id: res.data.data._id, name: res.data.data.user_name, url: res.data.data.avatar_url})
            setUserLoaded(true);
        })
        .catch(err => console.log("Error: ", err));
    },[token])
    
    useEffect( () => {
        if(!userLoaded) return;
        // axios.get(`/mess/log/${user.id}?page=1&limit=10`)
        // .then(res => {
        //     setLoadingCount(prev => prev + 1);
        //     setSendList(res.data.data.sendList);
        //     setReceiveList(res.data.data.receiveList)})
        // .catch(err => console.log("Error: ", err));
        axios.get(`/conversation/${user.id}`)
        .then(res => {
            setLoadingCount(prev => prev + 1);
            setConversationList(res.data.data);
        })
        .catch(err => console.log("Error: ", err));

        axios.get(`/group/user/${user.id}`)
        .then(res => {
            setLoadingCount(prev => prev + 1);
            setGroupList(res.data.data);
        })
        .catch(err => console.log("Error: ", err))
    },[user.id, userLoaded])

    useEffect(() => {
        if(loadingCount === 3) {
            setIsLoading(false);
            setLoadingCount(0);
        }
    }, [loadingCount])

    // 1. initialize socket only once per user change
    useEffect(() => {
        const sock = io('http://localhost:3001', {
            auth: {
                token: token
            }
        });
        setSocket(sock);
        return () => { sock.disconnect(); };
    }, [token, user.id]);

    // 2. register & join rooms
    useEffect(() => {
        if (!socket) return;
        socket.emit('register', user.id);
        socket.on('presence:update', (list) => {
            setOnlineUsers(list);
        })

        const groupIds = groupList.map(g => g._id);
        socket.emit('join-group', { groupList: groupIds });
        
    }, [socket, user.id, groupList, setOnlineUsers]);

    return (
        <ChatContext.Provider value={{
            socket,
            sendList,
            setSendList,
            receiveList,
            setReceiveList,
            currentSender, 
            setCurrentSender, 
            user,
            setUser,
            conversationList,
            setConversationList,
            groupList,
            setGroupList,
            notifi, 
            setNotifi,
            onlineUsers,
            setOnlineUsers,
            isLoading,
            isTyping,
            setIsTyping
        }}>
            {children}
        </ChatContext.Provider>
    )
}

export {ChatContext};