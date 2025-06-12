import axios from '../api/axios';
import { useContext } from 'react';
import {ChatContext} from '../context/chatContext';
import Login from '../components/Login';

const LoginPage = () => {
    const { setNotifi } = useContext(ChatContext);
    const type = "login";
    const fields = ["email", "password"];
    const func = async (formData) => {
        try {
            const response = await axios.post('/auth/login', {
                user_email: formData.email,
                user_password: formData.password
            });
            if(response.data){
                const token = response.data.token;
                localStorage.setItem('auth-token', token);
                setTimeout(() => {window.location.href= ("/chat")}, 200);
            }
        } catch (error) {
            console.log(error)
            setNotifi({show: true, status: false, message: error.response.data.message})
        }
    }
    return (
        <div>
            <Login type={type} fields={fields} func={func}/>
        </div>
    );
}

export default LoginPage;