const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white p-4 mt-12 rounded-b-lg">
            <div className="mx-auto text-center">
            <p>
            © 2023 Chat App. All rights reserved.
            </p>
            <div className="flex justify-center space-x-4 mt-4">
            <a className="hover:text-gray-400" href="#">
            <i className="fab fa-facebook-f">
            </i>
            </a>
            <a className="hover:text-gray-400" href="#">
            <i className="fab fa-twitter">
            </i>
            </a>
            <a className="hover:text-gray-400" href="#">
            <i className="fab fa-instagram">
            </i>
            </a>
            <a className="hover:text-gray-400" href="#">
            <i className="fab fa-linkedin-in">
            </i>
            </a>
            </div>
            </div>
       </footer>
    )
}

export default Footer;