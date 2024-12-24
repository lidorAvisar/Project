import React, { useState } from 'react';
import { updateAccount } from '../../firebase/firebase_config';


const StatusBar = ({ studentId, usersRefetch, studentDetails }) => {
    // Status options
    const statuses = ["active", "finished successfully", "expelled"];

    // Local state to store the selected status
    const [selectedStatus, setSelectedStatus] = useState(studentDetails.newStatus ? studentDetails.newStatus : 'active');

    // Function to handle status change
    const handleStatusChange = async (newStatus) => {
        setSelectedStatus(newStatus);
        await updateAccount(studentId, { newStatus });
        await usersRefetch();
    };

    return (
        <div dir="rtl" className="flex justify-center items-center space-x-4 space-x-reverse mt-6">
            {statuses.map((status, index) => (
                <div onClick={() => handleStatusChange(status)} key={index} className="text-center cursor-pointer">
                    {/* Circle indicator */}
                    <div
                        className={`w-4 h-4 mx-auto mb-1 rounded-full transition-all duration-300 
                        ${selectedStatus === status ?
                                status === "active" ? 'bg-blue-500' :
                                    status === "finished successfully" ? 'bg-green-500' :
                                        'bg-red-500'
                                : 'bg-gray-300'}`}
                    ></div>
                    {/* Status option text */}
                    <button
                        className={`text-sm font-semibold capitalize py-1 px-3 
                        ${selectedStatus === status ?
                                status === "active" ? 'text-blue-500' :
                                    status === "finished successfully" ? 'text-green-500' :
                                        'text-red-500'
                                : 'text-gray-500'}`}
                    >
                        {status === "active" ? "פעיל" :
                            status === "finished successfully" ? "סיים בהצלחה" :
                                "הורחק"}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default StatusBar;
