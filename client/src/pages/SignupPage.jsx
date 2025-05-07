import axios from '../api/axios';

import { useContext } from 'react';
import {ChatContext} from '../context/chatContext';
import Login from '../components/Login';

const SignupPage = () => {
    const { setNotifi } = useContext(ChatContext);
    const type = "sign up";
    const fields = ["email", "name", "password", "repassword"];
    const func = async (formData) => {
        try {
            if(formData.repassword !== formData.password) {
                setNotifi({show: true, status: false, message: "Not match with password."})
            } else {
                const response = await axios.post('/auth/signup', {
                    user_email: formData.email,
                    user_name: formData.name,
                    user_password: formData.password
                });
                if(response.data){
                    localStorage.setItem('auth-token', response.data.token);
                    setTimeout(window.location.href= ("/chat"), 200);
                }
            }
        } catch (error) {
            setNotifi({show: true, status: false, message: error.response.data.message})
        }
    }
    return (
        <Login type={type} fields={fields} func={func}/>
    );
}

export default SignupPage;