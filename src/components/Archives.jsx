import React, { useState } from 'react';
import StudentDataArchive from './StudentDataArchive';

const Archives = ({ setOpenModalArchive,filteredDataByCycle,selectedCycle }) => {
    // State for search input
    const [studentSearch, setStudentSearch] = useState('');
    const [openModalStudentData, setOpenModalStudentData] = useState(false);
    const [userData, setUserData] = useState(false);


    // Handle search input change
    const handleSearchChange = (e) => {
        setStudentSearch(e.target.value);
    };

    // Filtered data based on search input
    const filteredData = filteredDataByCycle?.filter((account) =>
        account.displayName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        account.userId.includes(studentSearch)
    );

    return (
        <div className='z-20 fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='relative w-[98%] max-w-[1100px] bg-slate-100 p-4 py-5 mb-10 rounded-lg h-[90%] overflow-y-auto'>
                {openModalStudentData && <StudentDataArchive setOpenModalStudentData={setOpenModalStudentData} userData={userData} />}
                <p className='text-2xl font-bold text-center'>ארכיון תלמידים מחזור {selectedCycle}</p>
                <div className='flex items-center justify-between w-full py-2'>
                    <input
                        dir='rtl'
                        onChange={handleSearchChange}
                        value={studentSearch}
                        className="ps-2 pe-2 block w-[50%] max-w-[320px] rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder='חפש תלמיד . . .'
                        type="search"
                    />
                    <p dir='rtl' className='text-lg font-bold'>סה"כ תלמידים: {filteredData?.length || 0}</p>
                </div>
                <table dir='rtl' className="table-auto w-[98%] sm:w-[100%] max-w-[1500px] divide-y divide-gray-200 shadow-md mb-20">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className=" text-center py-3 text-[15px] font-medium text-gray-500 uppercase tracking-wider">שם</th>
                            <th className=" text-center py-3 text-[15px] font-medium text-gray-500 uppercase tracking-wider">ת.ז</th>
                            <th className=" text-center py-3 text-[15px] font-medium text-gray-500 uppercase tracking-wider">מחלקה</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData?.map((account) => (
                            <tr
                                onClick={() => {
                                    setOpenModalStudentData(true);
                                    setUserData(account);
                                }}
                                className='hover:bg-gray-200 cursor-pointer'
                                key={account.uid}
                            >
                                <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.displayName}</td>
                                <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.userId}</td>
                                <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.departments}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className='flex justify-center'>
                    <button
                        onClick={() => setOpenModalArchive(false)}
                        className='absolute bottom-2 bg-red-500 px-9 text-white rounded-md p-1 font-bold'
                    >
                        סגור
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Archives;
