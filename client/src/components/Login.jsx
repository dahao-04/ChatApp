import {Link} from 'react-router-dom';
import {useState, useContext} from 'react';

import {ChatContext} from '../context/chatContext';
import Notification from './Notification';

const Login = ({type, fields, func}) => {
    const { notifi, setNotifi } = useContext(ChatContext);

    const capital = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
      };
    const initForm = {};
    fields.forEach((field) => {
        if(field === "remember_me"){
            initForm[field] = false;
        } else {
            initForm[field] = ""
        }
    })
    const [formData, setFormData] = useState(initForm);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        func(formData);
    }
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-8 bg-response space-y-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">
                    {capital(type)} to TekTi
                    </h2>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {fields.map((field, index) => (
                        <div key={index}>
                            <label className="block text-sm font-medium text-gray-700" htmlFor={field}>
                                {capital(field)}
                            </label>
                            <div className="mt-1">
                                <input 
                                className="w-full p-2 border border-gray-300 rounded" 
                                id={field} 
                                name={field} 
                                type={field === "repassword" ? "password" : field}
                                required
                                onChange={handleChange}/>
                            </div>
                        </div>
                    ))}
                    <div>
                        <button 
                        className="w-full p-2 text-white rounded" 
                        type="submit"
                        >
                            {capital(type)}
                        </button>
                    </div>
                </form>
                {type === "login" ?
                    (
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                            Don't have an account?
                                <Link className="font-medium  ms-1" to="/signup">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    ) :
                    (
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                            Already have account?
                                <Link className="font-medium  ms-1" to="/login">
                                    Login
                                </Link>
                            </p>
                        </div>
                    )
                }
            </div>
            <Notification notifi = {notifi} setNotifi = {setNotifi}/>
        </div>
    );
}

export default Login;