import React, { useState, useEffect } from 'react';
import PieChartComponent from './PieChartComponent';
import BarChartActiveStudents from './BarChartActiveStudents';
import Highlights from './Highlights';
import TeachersTableReport from './TeachersTableReport';
import { useQuery } from 'react-query';
import { getPracticalDriving } from '../firebase/firebase_config';

const Dashboard = ({ setOpenModalDashboard, filteredStudents, filteredTeachers }) => {
    const schools = ["שרייבר", "יובלי", "צבאי"];
    const uniqueCycles = [...new Set(filteredStudents.map(student => student.cycle))];
    const [testByCycle, setTestByCycle] = useState('everything');
    const [theoriesByCycle, setTheoriesByCycle] = useState('everything');

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['practical_driving'],
        queryFn: getPracticalDriving,
    });

    const [testData, setTestData] = useState([
        { name: 'טסט-1', value: 0, color: '#00C49F' },
        { name: 'טסט-2', value: 0, color: '#0088FE' },
        { name: 'טסט-3', value: 0, color: '#FFBB28' },
        { name: 'טסט-4', value: 0, color: '#FF8042' },
        { name: 'טסט-5', value: 0, color: '#AF19FF' },
        { name: 'טסט-6', value: 0, color: '#FF5733' },
        { name: 'טסט-7', value: 0, color: '#900C3F' },
        { name: 'טסט-8', value: 0, color: '#C70039' },
    ]);

    const [theoriesData, setTheoriesData] = useState([
        { name: 'תאוריה-1', value: 0, color: '#00C49F' },
        { name: 'תאוריה-2', value: 0, color: '#0088FE' },
        { name: 'תאוריה-3', value: 0, color: '#FFBB28' },
        { name: 'תאוריה-4', value: 0, color: '#FF8042' },
        { name: 'תאוריה-5', value: 0, color: '#AF19FF' },
        { name: 'תאוריה-6', value: 0, color: '#FF5733' },
        { name: 'תאוריה-7', value: 0, color: '#900C3F' },
        { name: 'תאוריה-8', value: 0, color: '#C70039' },
    ]);

    const [activeStudentData, setActiveStudentData] = useState(
        Array.from({ length: 12 }, (_, index) => ({ name: `${index + 1}`, value: 0 }))
    );

    const [teacherMinutesReport, setTeacherMinutesReport] = useState([]);


    const handleChangeTestByCycle = (event) => {
        setTestByCycle(event.target.value);
    };

    const handleChangeTheoriesByCycle = (event) => {
        setTheoriesByCycle(event.target.value);
    };

    // Function to filter students by cycle and update test data
    const updateTestDataByCycle = () => {
        const filteredTests = filteredStudents.filter(student =>
            testByCycle === 'everything' || student.cycle === testByCycle
        );

        const testCounts = Array(8).fill(0);
        filteredTests.forEach(student => {
            student.tests?.forEach(test => {
                if (test.status === 'Pass' && test.id >= 1 && test.id <= 8) {
                    testCounts[test.id - 1] += 1;
                }
            });
        });

        setTestData(prevData => prevData.map((test, index) => ({
            ...test,
            value: testCounts[index],
        })));

    };

    // Function to filter students by cycle and update theories data
    const updateTheoriesDataByCycle = () => {
        const filteredTheories = filteredStudents.filter(student =>
            theoriesByCycle === 'everything' || student.cycle === theoriesByCycle
        );

        const theoryCounts = Array(8).fill(0); // Array to store counts for theory tests 1 to 8
        filteredTheories.forEach(student => {
            student.detailsTheoryTest?.forEach(theory => {
                if (theory.testNumber >= 1 && theory.testNumber <= 8) {
                    theoryCounts[theory.testNumber - 1] += 1;
                }
            });
        });

        setTheoriesData(prevData => prevData.map((theory, index) => ({
            ...theory,
            value: theoryCounts[index],
        })));
    };

    // Function to generate activeStudentData dynamically
    const generateActiveStudentData = () => {
        const studentCounts = Array(12).fill(0);

        filteredStudents.forEach(student => {
            if (student.newStatus === "active" || !student.hasOwnProperty("newStatus")) {
                const studentNumber = parseInt(student.departments);
                if (studentNumber >= 1 && studentNumber <= 12) {
                    studentCounts[studentNumber - 1] += 1;
                }
            }
        });
        setActiveStudentData(activeStudentData.map((student, index) => ({
            ...student,
            value: studentCounts[index],
        })));
    };

    // function to calculate total driving minutes for each teacher
    const calculateTotalMinutesForTeachers = () => {
        const teacherMinutesBySchool = schools.map(school => {
            const teachersInSchool = filteredTeachers.filter(teacher => teacher.school === school);

            // For each teacher in this school, calculate the total driving minutes
            const teacherData = teachersInSchool.map(teacher => {
                // Find all lessons where the teacher's uid matches
                const totalMinutes = data?.reduce((sum, lesson) => {
                    if (lesson.teacherUid === teacher.uid) {
                        // Convert drivingMinutes to a number if it's not already
                        const minutes = Number(lesson.drivingMinutes) || 0;
                        return sum + minutes;
                    }
                    return sum;
                }, 0);

                // Convert total minutes to hours (e.g., 90 minutes becomes "1.5 hours")
                const totalHours = (totalMinutes / 60).toFixed(0);

                return { displayName: teacher.displayName, totalHours }; // Attach displayName and totalHours
            });

            // Sort teachers in the current school by their total driving minutes (highest to lowest)
            teacherData.sort((a, b) => b.totalHours - a.totalHours);

            return { school, teachers: teacherData }; // Return the school and its sorted teacher data
        });

        return teacherMinutesBySchool;
    };

    // Update test and theories data when the cycle selection changes
    useEffect(() => {
        updateTestDataByCycle();
    }, [testByCycle, filteredStudents]);

    useEffect(() => {
        updateTheoriesDataByCycle();
    }, [theoriesByCycle, filteredStudents]);

    useEffect(() => {
        generateActiveStudentData();
    }, [filteredStudents]);

    useEffect(() => {
        setTeacherMinutesReport(calculateTotalMinutesForTeachers());
    }, [filteredTeachers, data]);

    if (isLoading) return <div className='text-center animate-bounce'>Loading . . .</div>

    const topTeacher = { name: "משה כהן", hours: 120 };
    const bestCycle = { name: "מחזור זאב מחלקה 2", performance: 100 };

    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='w-[100%] bg-slate-100 p-4 py-5 mb-3 rounded-lg h-full overflow-y-auto'>
                <div className='flex items-center justify-between w-full'>
                    <button onClick={() => setOpenModalDashboard(false)} className='bg-red-500 text-white p-1 px-10 rounded-md font-bold'>סגור</button>
                    <p className='text-center underline font-bold text-2xl'>תמונת מצב</p>
                    <p></p>
                </div>
                <div className='w-full flex flex-col items-center md:flex-row justify-around py-5'>
                    <div className='flex flex-col  justify-center items-center space-y-2'>
                        <p className='font-bold text-xl'>תאוריות</p>
                        <select
                            value={theoriesByCycle}
                            onChange={handleChangeTheoriesByCycle}
                            className="rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 w-[75%] sm:w-64"
                        >
                            <option value="everything">הכל</option>
                            {uniqueCycles.map((cycle, i) => (
                                <option key={i} value={cycle}>{`מחזור ${cycle}`}</option>
                            ))}
                        </select>
                        <PieChartComponent data={theoriesData} />
                    </div>
                    <div className='flex flex-col justify-center items-center space-y-2'>
                        <p className='font-bold text-xl'>טסטים</p>
                        <select
                            value={testByCycle}
                            onChange={handleChangeTestByCycle}
                            className="rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 w-[75%] sm:w-64"
                        >
                            <option value="everything">הכל</option>
                            {uniqueCycles.map((cycle, i) => (
                                <option key={i} value={cycle}>{`מחזור ${cycle}`}</option>
                            ))}
                        </select>
                        <PieChartComponent data={testData} />
                    </div>
                </div>
                <div>
                    <BarChartActiveStudents data={activeStudentData} size={600} />
                </div>
                <div className='p-4'>
                    <p className='font-bold text-xl text-center p-1'>טבלת מורים</p>
                    <TeachersTableReport teacherMinutesReport={teacherMinutesReport} />
                </div>
                <div>
                    <Highlights teacherMinutesReport={teacherMinutesReport} bestCycle={bestCycle} />
                </div>
                <div className='flex justify-center py-8'>
                    <button onClick={() => setOpenModalDashboard(false)} className='w-[50%] max-w-96 bg-red-500 text-white p-0.5 sm:p-1 rounded-md px-5 sm:px-8 font-bold'>סגור</button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
