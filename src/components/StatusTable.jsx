import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { getAccounts } from '../firebase/firebase_config';
import { useCurrentUser } from '../firebase/useCurerntUser';

const StatusTable = ({ setOpenModalStudentsTable }) => {
    const [currentUser] = useCurrentUser();
    const [selectedDepartment, setSelectedDepartment] = useState('everything');
    const [selectedCycle, setSelectedCycle] = useState('everything');

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => await getAccounts(),
    });

    useEffect(() => {
        if (currentUser.user === 'מ"מ' && currentUser.departments) {
            setSelectedDepartment(currentUser.departments);
        } else {
            setSelectedDepartment('everything');
        }
    }, [currentUser]);

    const compareHebrew = (a, b) => {
        return a.localeCompare(b, 'he', { sensitivity: 'base' });
    };

    const handleFilterChange = (event) => {
        setSelectedDepartment(event.target.value);
    };

    const handleFilterChangeCycle = (event) => {
        setSelectedCycle(event.target.value);
    };

    const uniqueCycles = [...new Set(data.filter(student => student.user === "תלמידים").map(student => student.cycle))].sort(compareHebrew);

    const filteredList = data.filter(student =>
        student.user === "תלמידים" &&
        (selectedDepartment === 'everything' || student.departments === selectedDepartment) &&
        (selectedCycle === 'everything' || student.cycle === selectedCycle)
    );

    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='w-[100%] max-w-[1200px] bg-slate-100 p-4 mb-5 rounded-lg h-[92%] overflow-y-auto'>
                <div className='flex items-center gap-3 py-4 justify-around'>
                    <button onClick={() => setOpenModalStudentsTable(false)} className='bg-red-500 text-white p-1 rounded-md px-8 font-bold'>סגור</button>
                    <h2 className="text-center text-xl sm:text-2xl font-bold">סטטוס תלמידים</h2>
                    {currentUser.user !== 'מ"מ' && (
                        <div className='sm:flex gap-5'>
                            <div dir='rtl' className='flex flex-col justify-center'>
                                <label htmlFor="departmentFilter" className="font-bold mr-2">סנן לפי מחלקה:</label>
                                <select
                                    id="departmentFilter"
                                    value={selectedDepartment}
                                    onChange={handleFilterChange}
                                    className="p-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                >
                                    <option value="everything">הכל</option>
                                    {[...Array(12).keys()].map(num => (
                                        <option key={num + 1} value={num + 1}>{num + 1}</option>
                                    ))}
                                </select>
                            </div>
                            <div dir='rtl' className='flex flex-col justify-center'>
                                <label htmlFor="cycleFilter" className="font-bold mr-2">סנן לפי מחזור:</label>
                                <select
                                    id="cycleFilter"
                                    value={selectedCycle}
                                    onChange={handleFilterChangeCycle}
                                    className="p-2 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                >
                                    <option value="everything">הכל</option>
                                    {uniqueCycles.map((cycle, i) => (
                                        <option key={i} value={cycle}>{cycle}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
                {filteredList.length > 0 ? (
                    <div className="overflow-x-auto py-5 ">
                        <table dir='rtl' className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                            <thead>
                                <tr className="bg-gray-800 text-white text-right">
                                    <th className="w-10 py-3 ps-3 px-4 uppercase font-semibold text-sm">#</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">שם</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">מחזור</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">מחלקה</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">מספר זהות</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">סה"כ דקות</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">טסט</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">ביצוע היתר נהיגה</th>
                                    <th className="w-1/12 py-3 px-4 uppercase font-semibold text-sm">מבחן תאוריה</th>
                                    <th className="w-1/12 py-3 px-4 uppercase font-semibold text-sm">רשיון נהיגה</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">שיעורי חובה</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {filteredList.sort((a, b) => compareHebrew(a.displayName, b.displayName))
                                    .map((student, index) => (
                                        <tr key={index} className="bg-gray-100 text-right border-b">
                                            <td className="py-3 ps-3 px-4">{index + 1}</td>
                                            <td className="py-3 px-4">{student.displayName}</td>
                                            <td className="py-3 px-4">{student.cycle}</td>
                                            <td className="py-3 px-4">{student.departments}</td>
                                            <td className="py-3 px-4">{student.userId}</td>
                                            <td className={`py-3 px-4 text-white ${student.totalDrivingMinutes >= student.completeMinutes ? 'bg-green-500' : 'bg-orange-500'}`}>{student.totalDrivingMinutes ? student.totalDrivingMinutes : 'טרם'}</td>
                                            <td className="py-3 px-4">{student.tests ? student.tests.map(test => test.status === "Pass" ? 'עבר' : 'נכשל') : 'טרם'}</td>
                                            <td className="py-3 px-4">{student.carType ? student.carType : 'טרם'}</td>
                                            <td className="py-3 px-4">{student.detailsTheoryTest ? student.detailsTheoryTest.map(test => test.mistakes <= 4 ? 'עבר' : 'נכשל') : 'טרם'}</td>
                                            <td className="py-3 px-4">{student.previousLicense ? student.previousLicense : 'טרם'}</td>
                                            <td className="py-3 px-4">{student.mandatoryLessons ? student.mandatoryLessons : 'טרם'}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className='font-bold text-center text-2xl pt-10'>אין תוצאות</p>
                )}
            </div>
        </div>
    );
};

export default StatusTable;
