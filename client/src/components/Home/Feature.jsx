const Feature = ({name, desc}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <img alt="Illustration of a chat interface with multiple users" className="w-full h-40 object-cover rounded-t-lg mb-4" height="400" src="https://storage.googleapis.com/a1aa/image/ARF2DXckZfeAvAk3LDuLZQBg_TvL5iAnDsXOX5qesSg.jpg" width="600"/>
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