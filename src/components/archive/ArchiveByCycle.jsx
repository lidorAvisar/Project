import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { getArchiveAccounts } from '../../firebase/firebase_config';
import Archives from '../archive/Archives';
import { useNavigate } from 'react-router-dom';
import StudentDataArchive from './StudentDataArchive';

const ArchiveByCycle = () => {
    const [filteredDataByCycle, setFilteredDataByCycle] = useState([]);
    const [selectedCycle, setSelectedCycle] = useState(null);
    const [cycleSearch, setCycleSearch] = useState('');
    const [openModalArchive, setOpenModalArchive] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectStudentBySearch, setSelectStudentBySearch] = useState();


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
        setCycleSearch(e.target.value);
    };

    // Filter cycles by search input
    const filteredCycles = cycles.filter(cycle =>
        cycle.toLowerCase().includes(cycleSearch.toLowerCase())
    );

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 1) {
            const filtered = data.filter(student =>
                student.displayName.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents([]);
        }
    };


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
                {selectStudentBySearch && <StudentDataArchive setOpenModalStudentData={setSelectStudentBySearch} userData={selectStudentBySearch} />}
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className=' bg-red-500 px-9 text-white rounded-md p-1 font-bold'
                    >
                        סגור
                    </button>
                    <p className='text-2xl font-bold text-center'>ארכיון תלמידים לפי מחזור</p>
                </div>
                <div className='flex flex-col items-center justify-between w-full py-3 pt-5 '>
                    <p dir='rtl' className='text-lg font-bold'>
                        סה"כ מחזורים בארכיון: {filteredCycles.length || 0}
                    </p>
                    <div className="w-full flex flex-col items-center sm:flex-row sm:items-center justify-center gap-2 py-3">
                        {/* Student Search */}
                        <div className="relative w-full md:w-1/2 max-w-[320px]">
                            <input
                                dir="rtl"
                                onChange={handleSearch}
                                value={searchTerm}
                                className="ps-2 pe-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                                focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="חפש תלמיד . . ."
                                type="search"
                            />
                            {filteredStudents.length > 0 && (
                                <div className="absolute right-0 mt-2 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {filteredStudents.map(student => (
                                        <div
                                            onClick={() => setSelectStudentBySearch(student)}
                                            dir="rtl"
                                            key={student.userId}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        >
                                            {student.displayName} - מחזור{student.cycle}, מח'{student.departments}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Cycle Search */}
                        <div className="w-full md:w-1/2 max-w-[320px]">
                            <input
                                dir="rtl"
                                onChange={handleSearchChange}
                                value={cycleSearch}
                                className="ps-2 pe-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 
                       focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="חפש מחזור . . ."
                                type="search"
                            />
                        </div>
                    </div>
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
