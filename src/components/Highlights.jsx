import React from 'react';
import { FaChalkboardTeacher, FaCrown } from 'react-icons/fa';

const Highlights = ({ teacherMinutesReport, bestCycle }) => {

    // Function to get the teacher with the most hours
    const getTopTeacher = (teacherMinutesReport) => {
        let topTeacher = { name: "", hours: 0 };

        // Loop through each school and each teacher to find the top teacher
        teacherMinutesReport.forEach(schoolData => {
            schoolData.teachers.forEach(teacher => {
                const teacherHours = Number(teacher.totalHours);
                
                if (teacherHours > topTeacher.hours) {
                    topTeacher = { name: teacher.displayName, hours: teacherHours };
                }
            });
        });

        return topTeacher;
    };

    const topTeacher = getTopTeacher(teacherMinutesReport);

    return (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 p-4">
            {/* Top Teacher Card */}
            <div dir='rtl' className="bg-blue-500 text-white flex flex-col sm:flex-row items-center sm:items-start justify-between p-4 rounded-lg shadow-lg w-full sm:w-1/2 transition-transform duration-300 hover:scale-105">
                <div className="flex items-center mb-4 sm:mb-0">
                    <FaChalkboardTeacher className="text-4xl ml-4" />
                    <div>
                        <h3 className="text-lg font-semibold">מורה עם הכי הרבה שעות</h3>
                        <p className="text-lg">{topTeacher.name}</p>
                    </div>
                </div>
                <div>
                    <p className="text-3xl font-bold">{topTeacher.hours} שעות</p>
                </div>
            </div>

            {/* Best Cycle Card */}
            <div dir='rtl' className="bg-green-500 text-white flex flex-col sm:flex-row items-center sm:items-start justify-between p-4 rounded-lg shadow-lg w-full sm:w-1/2 transition-transform duration-300 hover:scale-105">
                <div className="flex items-center mb-4 sm:mb-0">
                    <FaCrown className="text-4xl ml-4" />
                    <div>
                        <h3 className="text-xl font-semibold">מחזור הכי טוב</h3>
                        <p className="text-lg">{bestCycle.name}</p>
                    </div>
                </div>
                <div>
                    <p className="text-3xl font-bold">{bestCycle.performance} ציון</p>
                </div>
            </div>
        </div>
    );
};

export default Highlights;
