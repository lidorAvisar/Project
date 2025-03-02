import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { getArchiveAccounts } from '../../firebase/firebase_config';
import Archives from '../archive/Archives';
import { useNavigate } from 'react-router-dom';

const ArchiveByCycle = () => {
    const [filteredDataByCycle, setFilteredDataByCycle] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState(null);
    const [studentSearch, setStudentSearch] = useState('');
    const [openModalArchive, setOpenModalArchive] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['student_archive'],
        queryFn: async () => await getArchiveAccounts(),
    });

    const navigate = useNavigate();

    // Get unique cycles from the students' data
    const cycles = data ? Array.from(new Set(data.map(student => student.cycle))) : [];

    // Filter students by the selected cycle
    useEffect(() => {
        if (selectedCycle) {
            const filteredStudents = data?.filter(student => student.cycle === selectedCycle);
            setFilteredDataByCycle(filteredStudents || []);
        }
    }, [selectedCycle, data]);

    // Handle search change
    const handleSearchChange = (e) => {
        setStudentSearch(e.target.value);
    };

    // Filter cycles by search input
    const filteredCycles = cycles.filter(cycle =>
        cycle.toLowerCase().includes(studentSearch.toLowerCase())
    );

    if (isLoading) {
        return <div className="text-center text-2xl ">...טוען נתונים</div>;
    }

    return (
        <div className='flex justify-center pt-5'>
            <div className='w-[98%] max-w-[1400px] bg-slate-100 p-4 py-5 mb-10 rounded-lg h-[90%] overflow-y-auto'>
                {(selectedCycle && openModalArchive) && (
                    <Archives
                        selectedCycle={selectedCycle}
                        setOpenModalArchive={setOpenModalArchive}
                        filteredDataByCycle={filteredDataByCycle}
                    />
                )}
                <p className='text-2xl font-bold text-center'>ארכיון תלמידים לפי מחזור</p>
                <div className='flex items-center justify-between w-full py-2'>
                    <input
                        dir='rtl'
                        onChange={handleSearchChange}
                        value={studentSearch}
                        className="ps-2 pe-2 block w-[50%] max-w-[320px] rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder='חפש מחזור . . .'
                        type="search"
                    />
                    <p dir='rtl' className='text-lg font-bold'>
                        סה"כ מחזורים בארכיון: {filteredCycles.length || 0}
                    </p>
                </div>

                {/* List of filtered cycles */}
                <div className="mt-4">
                    {filteredCycles.length > 0 ? (
                        <ul className="space-y-2">
                            {filteredCycles.map((cycle, index) => (
                                <li
                                    key={index}
                                    onClick={() => { setSelectedCycle(cycle), setOpenModalArchive(true) }}
                                    className='bg-gray-200 hover:bg-gray-300 cursor-pointer text-center p-2 rounded-md text-lg'
                                >
                                    {cycle} מחזור
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center">לא נמצאו מחזורים</p>
                    )}
                </div>

                <div className='flex justify-center pt-7'>
                    <button
                        onClick={() => navigate(-1)}
                        className=' bg-red-500 px-9 text-white rounded-md p-1 font-bold'
                    >
                        סגור
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArchiveByCycle;
