import React from 'react';

const shiftMap = {
    'משמרת בוקר': 'morning',
    'משמרת צהריים': 'noon',
    'משמרת ערב': 'evening'
};

const DailyDrivingStatus = ({ setOpenModalDailyDrivingStatus, filteredStudents }) => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayLessons = filteredStudents?.flatMap(student =>
        Array.isArray(student.practicalDriving)
            ? student.practicalDriving.filter(lesson => lesson.date === today)
            : []
    );

    // Group lessons by teacher and shift
    const groupedLessons = todayLessons?.reduce((acc, lesson) => {
        const { teacher, shift, student, drivingMinutes } = lesson || {};

        if (!teacher || !shift || !student) return acc;

        const mappedShift = shiftMap[shift];

        if (!acc[teacher]) {
            acc[teacher] = { morning: [], noon: [], evening: [] };
        }

        if (mappedShift) {
            acc[teacher][mappedShift].push(
                `${student} - (${drivingMinutes ? drivingMinutes : 0} דקות)`
            );
        } else {
            console.warn(`Unknown shift value: ${shift}`);
        }

        return acc;
    }, {});

    return (
        <div className="fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md">
            <div className="w-[100%] max-w-[1400px] bg-slate-100 p-4 mb-5 rounded-lg h-[92%] py-10 overflow-y-auto">
                <div className="flex items-center justify-between py-3">
                    <button
                        onClick={() => setOpenModalDailyDrivingStatus(false)}
                        className="bg-red-500 text-white p-0.5 sm:p-1 rounded-md px-5 sm:px-8 font-bold"
                    >
                        סגור
                    </button>
                    <h2 className="text-center text-xl sm:text-2xl font-bold">
                        סטטוס שיעורי נהיגה היום - {today}
                    </h2>
                    <h2></h2>
                </div>
                {Object.entries(groupedLessons).length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse border border-gray-400 text-right" dir="rtl">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-400 px-4 py-2">מורה</th>
                                    <th className="border border-gray-400 px-4 py-2">בוקר</th>
                                    <th className="border border-gray-400 px-4 py-2">צהריים</th>
                                    <th className="border border-gray-400 px-4 py-2">ערב</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(groupedLessons).map(([teacher, shifts]) => (
                                    <tr key={teacher}>
                                        <td className="border border-gray-400 px-4 py-2 text-right">
                                            {teacher}
                                        </td>
                                        <td className="border border-gray-400 px-4 py-2">
                                            <ul className="list-disc list-inside">
                                                {shifts.morning.length ? (
                                                    shifts.morning.map(student => (
                                                        <li key={student} className="py-2 sm:py-1">{student}</li>
                                                    ))
                                                ) : (
                                                    <span className="text-xl">_</span>
                                                )}
                                            </ul>
                                        </td>
                                        <td className="border border-gray-400 px-4 py-2">
                                            <ul className="list-disc list-inside">
                                                {shifts.noon.length ? (
                                                    shifts.noon.map(student => (
                                                        <li key={student} className="py-2 sm:py-1">{student}</li>
                                                    ))
                                                ) : (
                                                    <span className="text-xl">_</span>
                                                )}
                                            </ul>
                                        </td>
                                        <td className="border border-gray-400 px-4 py-2">
                                            <ul className="list-disc list-inside">
                                                {shifts.evening.length ? (
                                                    shifts.evening.map(student => (
                                                        <li key={student} className="py-2 sm:py-1">{student}</li>
                                                    ))
                                                ) : (
                                                    <span className="text-xl">_</span>
                                                )}
                                            </ul>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center pt-16 text-3xl text-red-400">אין שיעורים להיום</p>
                )}
            </div>
        </div>
    );
};

export default DailyDrivingStatus;
