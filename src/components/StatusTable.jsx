import React from 'react';

const StatusTable = ({ setOpenModalStudentsTable, filteredStudents }) => {

    const compareHebrew = (a, b) => {
        return a.localeCompare(b, 'he', { sensitivity: 'base' });
    };

    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='w-[100%] max-w-[1200px] bg-slate-100 p-4 mb-5 rounded-lg h-[92%] overflow-y-auto'>
                <div className='flex items-center gap-3 py-4 justify-around'>
                    <button onClick={() => setOpenModalStudentsTable(false)} className='bg-red-500 text-white p-1 rounded-md px-8 font-bold'>סגור</button>
                    <h2 className="text-center text-xl sm:text-2xl font-bold">סטטוס תלמידים</h2>
                </div>
                <div className="overflow-x-auto">
                    <table dir='rtl' className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-gray-800 text-white text-right">
                                <th className="w-10 py-3 ps-3 px-4 uppercase font-semibold text-sm">#</th>
                                <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">שם</th>
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
                            {filteredStudents
                                .sort((a, b) => compareHebrew(a.displayName, b.displayName))
                                .map((student, index) => (
                                    <tr key={index} className="bg-gray-100 text-right border-b">
                                        <td className="py-3 ps-3 px-4">{index + 1}</td>
                                        <td className="py-3 px-4">{student.displayName}</td>
                                        <td className="py-3 px-4">{student.departments}</td>
                                        <td className="py-3 px-4">{student.userId}</td>
                                        <td className="py-3 px-4">{student.totalDrivingMinutes ? student.totalDrivingMinutes : 'טרם'}</td>
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
            </div>
        </div>
    );
};

export default StatusTable;
