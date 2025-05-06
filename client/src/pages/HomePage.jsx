import Header from '../components/Home/Header'
import Footer from '../components/Home/Footer'
import Feature from '../components/Home/Feature';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const features = [
        {
            name: "Real-time Messaging", 
            desc: "Experience seamless real-time messaging with our app.",
            url: "https://plus.unsplash.com/premium_photo-1718560021366-2f50cf0fdc76?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            name: "Video Calls",
            desc: "Make high-quality video calls with your loved ones.",
            url: "https://plus.unsplash.com/premium_vector-1724612296526-6a857fd0e98d?q=80&w=2360&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            name: "Group Chats", 
            desc: "Create group chats and stay connected with your groups.",
            url: "https://plus.unsplash.com/premium_photo-1681487683141-e72c5ccd94e6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            name: "Secure", 
            desc: "Your conversations are secure with end-to-end encryption.",
            url: "https://plus.unsplash.com/premium_photo-1700766408949-02f75b80f1b5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        {
            name: "Customizable", 
            desc: "Customize your chat experience with various themes and settings.",
            url: "https://plus.unsplash.com/premium_vector-1730640947712-44cd8d2a7269?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y3VzdG9taXplfGVufDB8fDB8fHww"
        },
        {
            name: "Mobile Friendly", 
            desc: "Stay connected on the go with our mobile-friendly app.",
            url: "https://plus.unsplash.com/premium_vector-1731557977440-5df59744dac3?q=80&w=2044&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
              <button className="px-6 py-2 rounded-full">
               <Link to="/login" className='text-white hover:text-white'>Login</Link>
              </button>
              <p className="mt-4 text-gray-700">
               Don't have an account? 
               <Link className="hover:underline hover:text-black ms-1 text-gray-700" to="/signup">
                    Sign Up
               </Link>
              </p>
             </section>
             <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <Feature key= {index} name = {feature.name} desc = {feature.desc} url={feature.url}/>
                ))

                }
             </section>
            </main>
            <Footer/>
        </div>
    );
}

export default HomePage;