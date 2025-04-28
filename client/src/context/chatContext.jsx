import { createContext, useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ChatContext = createContext();

export const ChatProvider = ({children}) => {
    const [sendList, setSendList] = useState([]);
    const [receiveList, setReceiveList] = useState([]);
    const [currentSender, setCurrentSender] = useState({});
    const [user, setUser] = useState({});
    const [conversationList, setConversationList] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [notifi, setNotifi] = useState({show: false, status: false, message: ""});

    useEffect( () => {
        const token = localStorage.getItem('auth-token');
        // Sửa cái này lại lấy thông tin từ database
        if(token) {
            axios.get(`http://localhost:3000/user/${jwtDecode(token).id}`)
            .then(res => {
                setUser({id: res.data.data._id, name: res.data.data.user_name, url: res.data.data.avatar_url})
            })
            .catch(err => console.log("Error: ", err));
        }
        axios.get(`http://localhost:3000/mess/log/${user.id}`,{
            headers: {"auth-token": token}
        })
        .then(res => {
            setSendList(res.data.data.sendList);
            setReceiveList(res.data.data.receiveList)})
        .catch(err => console.log("Error: ", err));

        axios.get(`http://localhost:3000/conversation/${user.id}`, {
            headers: {'auth-token': token}
        })
        .then(res => setConversationList(res.data.data))
        .catch(err => console.log("Error: ", err));

        axios.get(`http://localhost:3000/group/user/${user.id}`)
        .then(res => setGroupList(res.data.data))
        .catch(err => console.log("Error: ", err))
    },[user.id])

    return (
        <ChatContext.Provider value={{
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
            setNotifi
        }}>
            {children}
        </ChatContext.Provider>
    )
}

export default ChatContext;