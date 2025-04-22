import Form from '../components/Form';
import axios from 'axios';

const LoginPage = () => {
    const type = "login";
    const fields = ["email", "password"];
    const func = async (formData) => {
        const response = await axios.post('http://localhost:3000/auth/login', {
            user_email: formData.email,
            user_password: formData.password
        });
        if(response.data){
            localStorage.setItem('auth-token', response.data.token);
            setTimeout(window.location.href= ("/chat"), 1000);
        }
    }
    return (
        <Form type={type} fields={fields} func={func}/>
    );
}

export default LoginPage;