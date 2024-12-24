import React, { useEffect, useState } from 'react'
import { getDownloadURL, listAll, ref } from 'firebase/storage';
import { storage } from '../../firebase/firebase_config';

const ViewFilesForContractor = ({ studentDetails }) => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchUploadedFiles();
    }, []);

    const fetchUploadedFiles = async () => {
        const listRef = ref(storage, `students/${studentDetails?.uid}`);
        try {
            const res = await listAll(listRef);
            const urls = await Promise.all(res.items.map(item => getDownloadURL(item)));
            setUploadedFiles(urls);
        } catch (error) {
            alert("שגיאה")
        }
    };

    const openFileModal = (fileUrl) => {

        setSelectedFile(fileUrl);
    };

    const closeModal = () => {
        setSelectedFile(null);
    };


    const renderFilePreview = (fileUrl) => {
        const url = decodeURIComponent(fileUrl.split('?')[0].split('%2F').pop())
        if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png')) {
            return <img src={fileUrl} alt="file" className="w-10 h-10 sm:w-20 sm:h-20 object-cover rounded" />;
        }
        else if (url.endsWith('.pdf') || url.endsWith('.xls') || url.endsWith('.docx')) {
            return (
                <object className="w-10 h-10 sm:w-20 sm:h-20 overflow-y-hidden" data={fileUrl}></object>
            );
        }
        else {
            return (
                <div className="w-10 h-10 sm:w-20 sm:h-20 bg-gray-200 flex items-center justify-center">
                    <span>אין תצוגה</span>
                </div>
            );
        }
    };

    const renderFilePreviewForModal = (fileUrl) => {
        const url = decodeURIComponent(fileUrl.split('?')[0].split('%2F').pop())
        if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png')) {
            return <img src={fileUrl} alt="file" className="w-full h-auto max-h-96" />;
        }
        else if (url.endsWith('.pdf') || url.endsWith(".xls") || url.endsWith('.docx')) {
            return (
                <object className="w-full h-[50vh] max-h-96" data={fileUrl}></object>
            );
        }
        else {
            return (
                <div className="w-10 h-10 sm:w-20 sm:h-20 bg-gray-200 flex items-center justify-center">
                    <span>אין תצוגה</span>
                </div>
            );
        }
    };


    return (
        <div className="mb-6 w-full flex justify-center">
            <div dir='rtl' className="w-full bg-white rounded-lg overflow-hidden shadow-lg p-2 sm:p-6 mb-20 my-5 space-y-5 max-w-[1100px]">
                <p className='text-center font-bold text-lg underline'>קבצים</p>
                <div className="mt-4">
                    <ul className="list-disc list-inside space-y-3">
                        {uploadedFiles.length > 0 ? (
                            uploadedFiles.map((url, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between pe-5 w-full cursor-pointer space-x-2 text-sm bg-slate-200 rounded"
                                    onClick={() => openFileModal(url)}
                                >
                                    <div className='flex items-center gap-3'>
                                        {renderFilePreview(url)}
                                        <span>{decodeURIComponent(url.split('?')[0].split('%2F').pop())}</span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-sm text-center text-gray-500">אין קבצים כרגע!</p>
                        )}
                    </ul>
                </div>
            </div>
            {selectedFile && (
                <div className="w-full fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-75">
                    <div className="w-[40%] max-w-[450px] bg-white rounded-lg p-3 space-y-4 mx-1">
                        <div dir='rtl' className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">{decodeURIComponent(selectedFile.split('?')[0].split('%2F').pop())}</h3>
                            <button onClick={closeModal} className="text-red-500 font-bold text-3xl hover:text-red-700">
                                &times;
                            </button>
                        </div>
                        {renderFilePreviewForModal(selectedFile)}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ViewFilesForContractor