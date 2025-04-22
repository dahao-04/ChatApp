import Header from '../components/Home/Header'
import Footer from '../components/Home/Footer'
import Feature from '../components/Home/Feature';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const features = [
        {
            name: "Real-time Messaging", 
            desc: "Experience seamless real-time messaging with our app."
        },
        {
            name: "Video Calls",
            desc: "Make high-quality video calls with your loved ones."
        },
        {
            name: "Group Chats", 
            desc: "Create group chats and stay connected with your groups."
        },
        {
            name: "Secure", 
            desc: "Your conversations are secure with end-to-end encryption."
        },
        {
            name: "Customizable", 
            desc: "Customize your chat experience with various themes and settings."
        },
        {
            name: "Mobile Friendly", 
            desc: "Stay connected on the go with our mobile-friendly app."
        } 
    ];
    return (
        <div>
            <Header/>
            <main className="mx-auto mt-8 p-4">
             <section className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
               Welcome to Chat App
              </h2>
              <p className="text-lg text-gray-700 mb-6">
               Connect with your friends and family instantly.
              </p>
              <button className="bg-blue-600 px-6 py-2 rounded-full hover:bg-blue-700">
               <Link to="/login" className='text-white'>Login</Link>
              </button>
              <p className="mt-4">
               Don't have an account? 
               <Link className="text-blue-600 hover:underline ms-1" to="/signup">
                    Sign Up
               </Link>
              </p>
             </section>
             <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <Feature key= {index} name = {feature.name} desc = {feature.desc} />
                ))

                }
             </section>
            </main>
            <Footer/>
        </div>
    );
}

export default HomePage;