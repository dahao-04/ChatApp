import { useState } from 'react'
import capitalLetters from '../helpers/capitalLetters'

const FormModal = ({title, closeModal, fieldList, func}) => {
    const [formData, setformData] = useState(Object.fromEntries(fieldList.map(field => [field, ""])));
    const handleChange = (e) => {
        const {name, value} = e.target;
        setformData(prev => ({...prev, [name]: value}))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        func(formData);
    }

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl transform transition-all w-full max-w-md mx-4">
                <div className="px-6 py-5">
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-4" id="modal-title">
                    {title}
                </h3>
                <form id="dataForm" className="space-y-4">
                    {fieldList.map((field, key) => {
                        return (
                            <div key={key}>
                                <label htmlFor={field} className="block text-sm font-medium text-gray-700">{capitalLetters(field)}</label>
                                <input
                                    type= "text"
                                    id={field}
                                    name={field}
                                    value={formData[field]}
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                                    onChange={handleChange}
                                />
                            </div>
                        )
                    })}
                </form>
                </div>
                <div className="bg-gray-50 rounded-2xl px-6 py-4 flex justify-end gap-3">
                <button
                    id="closeModalBtn"
                    className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-sm 
                    font-medium text-gray-700 hover:bg-gray-100"
                    onClick= {() => closeModal(false)}
                >
                    Cancel
                </button>
                <button
                    id="submitBtn"
                    type="submit"
                    className="inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium 
                    text-white"
                    onClick={handleSubmit}
                >
                    Done
                </button>
                </div>
            </div>
        </div>

    )
}

export default FormModal;