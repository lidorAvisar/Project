import React, { useState, useEffect } from 'react';
import PieChartComponent from './PieChartComponent';
import BarChartActiveStudents from './BarChartActiveStudents';
import Highlights from './Highlights';
import TeachersTableReport from './TeachersTableReport';
import { useQuery } from 'react-query';
import { getPracticalDriving } from '../firebase/firebase_config';
import Greeting from './Greeting';
import '../../public/יוסי.jpg'
import '../../public/מתן.jpg'

const Dashboard = ({ setOpenModalDashboard, filteredStudents, filteredTeachers, user }) => {
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
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center'>
            <div className='w-[100%] bg-[#e0ebf3] p-10 py-5 mb-3 rounded-lg h-full overflow-y-auto'>
                <div className='flex items-center justify-between w-full py-3'>
                    <button onClick={() => setOpenModalDashboard(false)} className='bg-red-500 text-white p-1 px-10 rounded-md font-bold'>סגור</button>
                    <p className='text-center underline font-bold text-2xl '>סטטוס הדרכה בית ספר לנהיגה</p>
                    <p className='flex text-lg font-bold '>{user?.displayName} ,<Greeting /> </p>
                </div>
                <div className="w-full grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in ">
                    {/* Profile Card */}
                    <div className='flex flex-col items-center  gap-10  bg-[#b9e6fe] rounded-lg shadow-lg'>
                        <div className="w-full col-span-1 lg:col-span-1 bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-500 border border-white p-4 rounded-lg flex gap-4 items-center text-white shadow-lg transition-transform duration-300 hover:scale-105">
                            <img className="h-20 w-20 rounded-2xl mb-2" src={user?.displayName==="מנהל מקצועי"?'יוסי.jpg':user?.displayName==="ממ״ג נהיגה"&&'מתן.jpg'} alt="Profile" />
                            <div className="text-center font-bold text-lg">{user?.displayName}</div>
                        </div>
                        {/* Highlights Section */}
                        <div className="col-span-1 sm:col-span-2 lg:col-span-1 p-1 rounded-lg shadow-lg flex flex-col justify-center items-center from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%">
                            <Highlights teacherMinutesReport={teacherMinutesReport} bestCycle={bestCycle} />
                        </div>
                    </div>

                    {/* Theory and Test Selectors with Pie Charts */}
                    <div className="col-span-1 lg:col-span-1 flex flex-col items-center  p-4 rounded-lg shadow-xl bg-[#b9e6fe]">
                        <p className="font-bold text-lg text-gray-800 mb-2">תאוריות</p>
                        <select
                            value={theoriesByCycle}
                            onChange={handleChangeTheoriesByCycle}
                            className="rounded-lg bg-white border border-gray-300 px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full mb-2"
                        >
                            <option value="everything">הכל</option>
                            {uniqueCycles.map((cycle, i) => (
                                <option key={i} value={cycle}>{`מחזור ${cycle}`}</option>
                            ))}
                        </select>
                        <PieChartComponent data={theoriesData} />
                    </div>
                    <div className="col-span-1 lg:col-span-1 flex flex-col items-center p-4 rounded-lg shadow-xl bg-[#b9e6fe]">
                        <p className="font-bold text-lg text-gray-800 mb-2">טסטים</p>
                        <select
                            value={testByCycle}
                            onChange={handleChangeTestByCycle}
                            className="rounded-lg bg-white border border-gray-300 px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full mb-2"
                        >
                            <option value="everything">הכל</option>
                            {uniqueCycles.map((cycle, i) => (
                                <option key={i} value={cycle}>{`מחזור ${cycle}`}</option>
                            ))}
                        </select>
                        <PieChartComponent data={testData} />
                    </div>

                    {/* Bar Chart for Active Students */}
                    <div className="col-span-1 sm:col-span-1 lg:col-span-1 w-full rounded-lg shadow-xl bg-[#b9e6fe]">
                        <BarChartActiveStudents data={activeStudentData} />
                    </div>
                </div>
                <div className='p-4 pt-10'>
                    <p className='font-bold text-xl text-center p-1'>טבלת מורים</p>
                    <TeachersTableReport teacherMinutesReport={teacherMinutesReport} />
                </div>
                <div className='flex justify-center py-8'>
                    <button onClick={() => setOpenModalDashboard(false)} className='w-[50%] max-w-96 bg-red-500 text-white p-0.5 sm:p-1 rounded-md px-5 sm:px-8 font-bold'>סגור</button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;




// import React, { useState, useEffect } from 'react';
// import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// const Dashboard = ({ setOpenModalDashboard, filteredStudents, filteredTeachers, user, practicalDrivingData }) => {
//     const schools = ["שרייבר", "יובלי", "צבאי"];
//     const uniqueCycles = [...new Set(filteredStudents.map(student => student.cycle))];
//     const [testByCycle, setTestByCycle] = useState('everything');
//     const [theoriesByCycle, setTheoriesByCycle] = useState('everything');

//     const [testData, setTestData] = useState([
//         { name: 'טסט-1', value: 0, color: '#00C49F' },
//         { name: 'טסט-2', value: 0, color: '#0088FE' },
//         { name: 'טסט-3', value: 0, color: '#FFBB28' },
//         { name: 'טסט-4', value: 0, color: '#FF8042' }
//     ]);

//     const [theoriesData, setTheoriesData] = useState([
//         { name: 'תאוריה-1', value: 0, color: '#00C49F' },
//         { name: 'תאוריה-2', value: 0, color: '#0088FE' },
//         { name: 'תאוריה-3', value: 0, color: '#FFBB28' },
//         { name: 'תאוריה-4', value: 0, color: '#FF8042' }
//     ]);

//     const [activeStudentData, setActiveStudentData] = useState(
//         Array.from({ length: 12 }, (_, index) => ({ name: `${index + 1}`, value: 0 }))
//     );

//     const [teacherMinutesReport, setTeacherMinutesReport] = useState([]);

//     useEffect(() => {
//         const updateTestData = () => {
//             const filteredTests = filteredStudents.filter(student =>
//                 testByCycle === 'everything' || student.cycle === testByCycle
//             );

//             const testCounts = Array(4).fill(0);
//             filteredTests.forEach(student => {
//                 student.tests?.forEach(test => {
//                     if (test.status === 'Pass' && test.id >= 1 && test.id <= 4) {
//                         testCounts[test.id - 1] += 1;
//                     }
//                 });
//             });

//             setTestData(prevData => prevData.map((test, index) => ({
//                 ...test,
//                 value: testCounts[index],
//             })));
//         };

//         const updateTheoriesData = () => {
//             const filteredTheories = filteredStudents.filter(student =>
//                 theoriesByCycle === 'everything' || student.cycle === theoriesByCycle
//             );

//             const theoryCounts = Array(4).fill(0);
//             filteredTheories.forEach(student => {
//                 student.detailsTheoryTest?.forEach(theory => {
//                     if (theory.testNumber >= 1 && theory.testNumber <= 4) {
//                         theoryCounts[theory.testNumber - 1] += 1;
//                     }
//                 });
//             });

//             setTheoriesData(prevData => prevData.map((theory, index) => ({
//                 ...theory,
//                 value: theoryCounts[index],
//             })));
//         };

//         updateTestData();
//         updateTheoriesData();
//     }, [testByCycle, theoriesByCycle, filteredStudents]);

//     useEffect(() => {
//         const generateActiveStudentData = () => {
//             const studentCounts = Array(12).fill(0);
//             filteredStudents.forEach(student => {
//                 if (student.newStatus === "active" || !student.hasOwnProperty("newStatus")) {
//                     const studentNumber = parseInt(student.departments);
//                     if (studentNumber >= 1 && studentNumber <= 12) {
//                         studentCounts[studentNumber - 1] += 1;
//                     }
//                 }
//             });
//             setActiveStudentData(prevData => prevData.map((item, index) => ({
//                 ...item,
//                 value: studentCounts[index],
//             })));
//         };

//         generateActiveStudentData();
//     }, [filteredStudents]);

//     useEffect(() => {
//         const calculateTotalMinutesForTeachers = () => {
//             return schools.map(school => {
//                 const teachersInSchool = filteredTeachers.filter(teacher => teacher.school === school);
//                 const teacherData = teachersInSchool.map(teacher => {
//                     const totalMinutes = practicalDrivingData?.reduce((sum, lesson) => {
//                         if (lesson.teacherUid === teacher.uid) {
//                             return sum + (Number(lesson.drivingMinutes) || 0);
//                         }
//                         return sum;
//                     }, 0);
//                     const totalHours = (totalMinutes / 60).toFixed(0);
//                     return { displayName: teacher.displayName, totalHours };
//                 });
//                 teacherData.sort((a, b) => b.totalHours - a.totalHours);
//                 return { school, teachers: teacherData };
//             });
//         };

//         setTeacherMinutesReport(calculateTotalMinutesForTeachers());
//     }, [filteredTeachers, practicalDrivingData]);

//     return (
//         <div className="fixed inset-0 h-screen w-full overflow-y-auto bg-gray-100 p-4">
//             <div className="max-w-7xl mx-auto space-y-4">
//                 {/* Header */}
//                 <div className="bg-white rounded-lg p-4 flex items-center justify-between">
//                     <button onClick={() => setOpenModalDashboard(false)} className="bg-red-500 text-white px-4 py-2 rounded">
//                         סגור
//                     </button>
//                     <h1 className="text-xl font-bold">דשבורד בית ספר לנהיגה</h1>
//                     <div className="flex items-center gap-2">
//                         <span className="font-bold">{user?.displayName}</span>
//                         <img src="/api/placeholder/40/40" alt="Profile" className="h-10 w-10 rounded-full" />
//                     </div>
//                 </div>

//                 {/* Main Content Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {/* Charts Section */}
//                     <div className="bg-white rounded-lg p-4">
//                         <h2 className="text-lg font-bold mb-2">תאוריות</h2>
//                         <select
//                             value={theoriesByCycle}
//                             onChange={(e) => setTheoriesByCycle(e.target.value)}
//                             className="w-full mb-2 p-2 rounded border"
//                         >
//                             <option value="everything">הכל</option>
//                             {uniqueCycles.map((cycle, i) => (
//                                 <option key={i} value={cycle}>{`מחזור ${cycle}`}</option>
//                             ))}
//                         </select>
//                         <div className="h-64">
//                             <ResponsiveContainer width="100%" height="100%">
//                                 <PieChart>
//                                     <Pie
//                                         data={theoriesData}
//                                         dataKey="value"
//                                         nameKey="name"
//                                         cx="50%"
//                                         cy="50%"
//                                         outerRadius={80}
//                                         label
//                                     >
//                                         {theoriesData.map((entry, index) => (
//                                             <Cell key={`cell-${index}`} fill={entry.color} />
//                                         ))}
//                                     </Pie>
//                                 </PieChart>
//                             </ResponsiveContainer>
//                         </div>
//                     </div>

//                     <div className="bg-white rounded-lg p-4">
//                         <h2 className="text-lg font-bold mb-2">טסטים</h2>
//                         <select
//                             value={testByCycle}
//                             onChange={(e) => setTestByCycle(e.target.value)}
//                             className="w-full mb-2 p-2 rounded border"
//                         >
//                             <option value="everything">הכל</option>
//                             {uniqueCycles.map((cycle, i) => (
//                                 <option key={i} value={cycle}>{`מחזור ${cycle}`}</option>
//                             ))}
//                         </select>
//                         <div className="h-64">
//                             <ResponsiveContainer width="100%" height="100%">
//                                 <PieChart>
//                                     <Pie
//                                         data={testData}
//                                         dataKey="value"
//                                         nameKey="name"
//                                         cx="50%"
//                                         cy="50%"
//                                         outerRadius={80}
//                                         label
//                                     >
//                                         {testData.map((entry, index) => (
//                                             <Cell key={`cell-${index}`} fill={entry.color} />
//                                         ))}
//                                     </Pie>
//                                 </PieChart>
//                             </ResponsiveContainer>
//                         </div>
//                     </div>

//                     {/* Active Students Bar Chart */}
//                     <div className="bg-white rounded-lg p-4 col-span-1 md:col-span-2 lg:col-span-1">
//                         <h2 className="text-lg font-bold mb-2">תלמידים פעילים לפי מחלקה</h2>
//                         <div className="h-64">
//                             <ResponsiveContainer width="100%" height="100%">
//                                 <BarChart data={activeStudentData}>
//                                     <CartesianGrid strokeDasharray="3 3" />
//                                     <XAxis dataKey="name" />
//                                     <YAxis />
//                                     <Tooltip />
//                                     <Bar dataKey="value" fill="#8884d8" />
//                                 </BarChart>
//                             </ResponsiveContainer>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Teachers Table */}
//                 <div className="bg-white rounded-lg p-4">
//                     <h2 className="text-lg font-bold mb-4">טבלת מורים</h2>
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         {teacherMinutesReport.map((school, index) => (
//                             <div key={index} className="border rounded p-2">
//                                 <h3 className="font-bold mb-2">{school.school}</h3>
//                                 <div className="space-y-2">
//                                     {school.teachers.map((teacher, tIndex) => (
//                                         <div key={tIndex} className="flex justify-between">
//                                             <span>{teacher.displayName}</span>
//                                             <span>{teacher.totalHours} שעות</span>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Dashboard;