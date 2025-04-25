import {Link} from 'react-router-dom';
import {useState} from 'react';

const Form = ({type, fields, func}) => {
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
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">
                    {capital(type)} to ChatApp
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
                                required
                                onChange={handleChange}/>
                            </div>
                        </div>
                    ))}

                    {(type==="login") && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input className="h-4 w-4 text-blue-600 border-gray-300 rounded" id="remember_me" name="remember_me" type="checkbox"/>
                                <label className="ml-2 block text-sm text-gray-900" htmlFor="remember_me">
                                Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <a className="font-medium" href="#">
                                Forgot your password?
                                </a>
                            </div>
                        </div>
                    )}
                    <div>
                        <button 
                        className="w-full p-2 text-white rounded" 
                        type="submit"
                        >
                            {capital(type)}
                        </button>
                    </div>
                </form>
                {type === "login" && (
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                        Don't have an account?
                            <Link className="font-medium  ms-1" to="/signup">
                                Sign up
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Form;