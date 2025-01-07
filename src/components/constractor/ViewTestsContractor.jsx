import React, { useEffect, useState } from 'react'

const ViewTestsContractor = ({ studentDetails }) => {
    const tests = studentDetails?.tests?.length > 0 ? studentDetails.tests : [];
    const [completeMinutes, setCompleteMinutes] = useState(null);
    const [totalDrivingMinutes, setTotalDrivingMinutes] = useState(0);
    const [nightDriving, setNightDriving] = useState(0);

    useEffect(() => {
        if (studentDetails) {
            const practicalDriving = Array.isArray(studentDetails.practicalDriving)
                ? studentDetails.practicalDriving
                : [];

            const nightLessons = practicalDriving.filter(
                lesson => lesson.shift === 'משמרת ערב'
            );

            const totalMinutes = practicalDriving.reduce((sum, lesson) => {
                return sum + (parseInt(lesson.drivingMinutes, 10) || 0);
            }, 0)

            const totalNightDrivingMinutes = nightLessons.reduce((sum, lesson) => {
                return sum + (parseInt(lesson.drivingMinutes, 10) || 0);
            }, 0);

            setTotalDrivingMinutes(totalMinutes);
            setNightDriving(totalNightDrivingMinutes);
        }
    }, [studentDetails]);

    useEffect(() => {
        if (studentDetails?.previousLicense !== "no") {
            setCompleteMinutes(800);
        }
        else {
            setCompleteMinutes(1280);
        }
    }, [studentDetails]);

    console.log(tests);
    
    return (
        <div className="bg-slate-200 w-full p-6 rounded-md shadow-lg">
            <p className="text-center font-bold text-2xl py-6 underline">טסטים</p>
            {tests.length > 0 && totalDrivingMinutes >= completeMinutes && nightDriving >= 40 ? (
                <div>
                    <table dir='rtl' className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
                        <thead>
                            <tr className="hidden sm:table-row">
                                <th className="py-2 border-b-2 border-gray-300 bg-gray-100 text-center">#</th>
                                <th className="px-4 py-2 border-b-2 border-gray-300 bg-gray-100 text-right">תאריך</th>
                                <th className="px-4 py-2 border-b-2 border-gray-300 bg-gray-100 text-right">סטטוס</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tests.map((test, index) => (
                                <tr key={index} className={`${test.status === 'Pass' ? 'bg-green-500' : test.status === 'Fail' ? 'bg-red-500' : ''} sm:table-row`}>
                                    <td className="text-white block sm:table-cell py-2 border-b border-gray-200 text-center font-bold">{index + 1}.</td>
                                    <td className="text-white block sm:table-cell px-4 py-2 border-b border-gray-200 text-right">{test.date}</td>
                                    <td className="text-white block sm:table-cell px-4 py-2 border-b border-gray-200 text-right">{test.status === 'Pass' ? 'עבר' : test.status === 'Fail' ? 'נכשל' : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className='font-bold text-xl text-center text-red-500'> 😌עדיין אינו/ה מוכנ/ה לטסט</p>)}
        </div>
    );
}

export default ViewTestsContractor