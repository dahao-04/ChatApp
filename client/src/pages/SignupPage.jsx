import Form from '../components/Form';
import axios from 'axios';

const SignupPage = () => {
    const type = "sign up";
    const fields = ["email", "name", "password", "Re-enter Password"];
    const func = async (formData) => {
        console.log("form from sign up", formData)
        const response = await axios.post('http://localhost:3000/auth/signup', {
            user_email: formData.email,
            user_name: formData.name,
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

export default SignupPage;