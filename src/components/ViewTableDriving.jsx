import React, { useEffect, useState } from 'react';

const ViewTableDriving = ({ studentDetails, drivingLessons }) => {

    const filteredLessons = drivingLessons.filter(lesson => lesson.studentUid === studentDetails.uid);
    const totalDriving = studentDetails?.totalDrivingMinutes ? studentDetails.totalDrivingMinutes : 0;
    const [completeMinutes, setCompleteMinutes] = useState(null);


    useEffect(() => {
        if (studentDetails?.previousLicense && studentDetails.previousLicense !== "no") {
            setCompleteMinutes(800);
        }
        else {
            setCompleteMinutes(1280);
        }
    }, [studentDetails]);

    return (
        <div className='bg-white w-full p-2 rounded-md shadow-lg'>
            <div className='flex justify-around items-center'>
                <p className='text-center font-bold text-sm underline py-6 text-blue-600'>
                    {studentDetails?.previousLicense === 'B'
                        ? 'B רשיון על'
                        : studentDetails?.previousLicense === 'motorcycle'
                            ? 'רשיון על אופנוע'
                            : 'אין רשיון קודם'}
                </p>
                <p className='text-center font-bold text-lg sm:text-xl py-6'>
                    נהיגה מעשית - {studentDetails?.displayName}
                </p>
            </div>

            {/* Responsive table or tabs for mobile */}
            <div dir='rtl' className='hidden sm:block overflow-x-auto'>
                <table className='w-full table-auto text-right'>
                    <thead>
                        <tr className='bg-gray-100'>
                            <th className='p-2 text-center'>#</th>
                            <th className='p-2 text-center'>תאריך</th>
                            <th className='p-2 text-center'>משמרת</th>
                            <th className='p-2 text-center'>ד'ק נהיגה</th>
                            <th className='p-2 text-center'>שם מורה</th>
                            <th className='p-2 text-center'>אחר</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLessons.map((lesson, index) => (
                            <tr key={lesson.id} className='border-b'>
                                <td className='p-2 text-center'>{index + 1}</td>
                                <td className='p-2 text-center'>{lesson.date}</td>
                                <td className='p-2 text-center'>{lesson.shift}</td>
                                <td className="p-2 text-center">{lesson.drivingMinutes}</td>
                                <td className='p-2 text-center'>{lesson.teacher}</td>
                                <td className='p-2 text-center'>{lesson.other}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Tabs for mobile */}
            <div dir='rtl' className='block sm:hidden'>
                {filteredLessons.map((lesson, index) => (
                    <div key={lesson.id} className='mb-4 p-4 border rounded-md shadow-md space-y-2'>
                        <p className='font-bold text-center underline'>שיעור {index + 1}</p>
                        <p><span className='font-bold'>תאריך:</span> {lesson.date}</p>
                        <p><span className='font-bold'>משמרת:</span> {lesson.shift}</p>
                        <p><span className='font-bold'>ד'ק נהיגה:</span> {lesson.drivingMinutes}</p>
                        <p><span className='font-bold'>שם מורה:</span> {lesson.teacher}</p>
                        <p><span className='font-bold'>אחר:</span> {lesson.other}</p>
                    </div>
                ))}
            </div>
            <div className='p-2'>
                <p className={`${totalDriving >= completeMinutes ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} w-fit text-lg font-bold p-1 rounded-md underline`}>
                    {studentDetails?.totalDrivingMinutes ? studentDetails.totalDrivingMinutes : 0}<span> :סה"כ דקות נהיגה</span></p>
            </div>
        </div>
    );
};

export default ViewTableDriving;
