import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { getAccounts } from '../firebase/firebase_config';
import { useCurrentUser } from '../firebase/useCurerntUser';

const StatusTable = ({ setOpenModalStudentsTable }) => {
    const [currentUser] = useCurrentUser();
    const [selectedDepartment, setSelectedDepartment] = useState(['everything']);
    const [selectedCycle, setSelectedCycle] = useState('everything');

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => await getAccounts(),
    });

    useEffect(() => {
        if (currentUser.user === 'מ"מ' && currentUser.departments) {
            setSelectedDepartment([currentUser.departments]);
        } else {
            setSelectedDepartment(['everything']);
        }
    }, [currentUser]);

    const compareHebrew = (a, b) => {
        return a.localeCompare(b, 'he', { sensitivity: 'base' });
    };

    const handleFilterChange = (event) => {
        const value = Array.from(
            event.target.selectedOptions,
            (option) => option.value
        );
        setSelectedDepartment(value);
    };

    const handleFilterChangeCycle = (event) => {
        setSelectedCycle(event.target.value);
    };

    const uniqueCycles = [...new Set(data.filter(student => student.user === "תלמידים").map(student => student.cycle))].sort(compareHebrew);

    const filteredList = data.filter(student =>
        student.user === "תלמידים" &&
        (selectedDepartment.includes('everything') || selectedDepartment.includes(student.departments)) &&
        (selectedCycle === 'everything' || student.cycle === selectedCycle)
    );

    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='w-[100%] max-w-[1200px] bg-slate-100 p-4 mb-5 rounded-lg h-[92%] py-10 overflow-y-auto'>
                <div className='flex items-center justify-between py-3'>
                    <button onClick={() => setOpenModalStudentsTable(false)} className='bg-red-500 text-white p-0.5 sm:p-1 rounded-md px-5 sm:px-8 font-bold'>סגור</button>
                    <h2 className="text-center text-xl sm:text-2xl font-bold"> {filteredList?.length} - סטטוס תלמידים</h2>
                    <h2></h2>
                </div>
                {currentUser.user !== 'מ"מ' && (
                    <div dir='rtl' className='w-full flex flex-col sm:flex-row items-center justify-between gap-5'>
                        {/* Department Filter */}
                        <div className='w-full flex flex-col items-center justify-center'>
                            <label htmlFor="departmentFilter" className="font-bold text-sm mb-1 sm:mb-2 text-gray-700">סנן לפי מחלקה:</label>
                            <select
                                id="departmentFilter"
                                multiple
                                value={selectedDepartment}
                                onChange={handleFilterChange}
                                className="rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 w-[75%] sm:w-64"
                            >
                                <option value="everything">הכל</option>
                                {[...Array(12).keys()].map(num => (
                                    <option key={num + 1} value={num + 1}>{`מחלקה ${num + 1}`}</option>
                                ))}
                            </select>
                        </div>

                        <div className='w-full flex flex-col items-center justify-center'>
                            <label htmlFor="cycleFilter" className="font-bold text-sm mb-1 sm:mb-2 text-gray-700">סנן לפי מחזור:</label>
                            <select
                                id="cycleFilter"
                                value={selectedCycle}
                                onChange={handleFilterChangeCycle}
                                className="rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 w-[75%] sm:w-64"
                            >
                                <option value="everything">הכל</option>
                                {uniqueCycles.map((cycle, i) => (
                                    <option key={i} value={cycle}>{`מחזור ${cycle}`}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
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
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">סה"כ דקות שבוצעו</th>
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
                                            <td className={`py-3 px-4 text-white ${student.totalDrivingMinutes &&
                                                    student.nightDriving &&
                                                    student.tests &&
                                                    student.tests.length > 0 &&
                                                    student.tests.slice(-1)[0].status === "Pass" &&
                                                    student.nightDriving >= 40
                                                    ? student.previousLicense === "no"
                                                        ? student.totalDrivingMinutes >= 1280
                                                            ? 'bg-green-500'
                                                            : 'bg-orange-500'
                                                        : student.totalDrivingMinutes >= 800
                                                            ? 'bg-green-500'
                                                            : 'bg-orange-500'
                                                    : 'bg-orange-500'
                                                }`}>
                                                {student.totalDrivingMinutes ? student.totalDrivingMinutes : 'טרם'}
                                            </td>
                                            <td className="py-3 px-4">
                                                {student.tests && student.tests.length > 0 ? (student.tests.slice(-1)[0].status === "Pass" ?
                                                    `עבר/${student.tests.slice(-1)[0].id}` :
                                                    `נכשל/${student.tests.slice(-1)[0].id}`
                                                ) : 'טרם'}
                                            </td>
                                            <td className="py-3 px-4">{student.carType ? student.carType : 'טרם'}</td>
                                            <td className="py-3 px-4">
                                                {student.detailsTheoryTest && student.detailsTheoryTest.length > 0 ? (student.detailsTheoryTest.slice(-1)[0].mistakes <= 4 ?
                                                    `עבר/${student.detailsTheoryTest.slice(-1)[0].testNumber}` :
                                                    `נכשל/${student.detailsTheoryTest.slice(-1)[0].testNumber}`
                                                ) : 'טרם'}
                                            </td>
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
                <div className='flex justify-center'>
                    <button onClick={() => setOpenModalStudentsTable(false)} className='w-[50%] max-w-96 bg-red-500 text-white p-0.5 sm:p-1 rounded-md px-5 sm:px-8 font-bold'>סגור</button>
                </div>
            </div>
        </div>
    );
};

export default StatusTable;
