const Feature = ({name, desc, url}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <img alt="Illustration of a chat interface with multiple users" className="w-full h-40 object-cover rounded-t-lg mb-4" height="400" src={url} width="600"/>
            <h3 className="text-2xl font-bold mb-2">
            {name}
            </h3>
            <p className="text-gray-700">
            {desc}
            </p>
       </div>
    );
}

export default Feature;