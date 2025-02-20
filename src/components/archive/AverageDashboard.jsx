import React, { useEffect, useState } from 'react';
import { TiArrowBack } from 'react-icons/ti';
import PieChartArchive from './PieChartArchive';

const AverageDashboard = ({ setOpenModalDashboard, studentsData, cycle }) => {

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

    const [otherDataTheories, setOtherDataTheories] = useState({
        failed: 0,
        noTheories: 0
    });

    const [otherDataTests, setOtherDataTests] = useState({
        failed: 0,
        noTheories: 0
    });

    // Function to format number with ,
    const formatNumber = (num) => {
        if (!num) return "0"; // Handle empty or invalid cases
        return Number(num).toLocaleString('en-US'); // Adds commas
    };

    // A function that calculates the theoretical quantity and percentages
    const theoreticalCalculates = () => {
        const theoryCounts = Array(8).fill(0); // Array to store the number of students who passed each theory test
        let totalPassers = 0;
        let noPassers = 0;
        let totalStudentsChecked = 0;
        let failedAllTests = 0; // Track students who failed every test

        studentsData.forEach(student => {
            if (student.detailsTheoryTest?.length > 0) { 
                totalStudentsChecked++; // Count students with at least one test

                const sortedTests = student.detailsTheoryTest
                    .filter(theory => theory.mistakes >= 0 && theory.mistakes <= 4) // Passed tests only
                    .sort((a, b) => a.testNumber - b.testNumber); // Sort by test number

                if (sortedTests.length > 0) {
                    const firstPassedTest = sortedTests[0].testNumber; // First test they passed
                    if (firstPassedTest >= 1 && firstPassedTest <= 8) {
                        theoryCounts[firstPassedTest - 1] += 1;
                        totalPassers++; // Count passing students
                    }
                } else {
                    // No passed tests → Check last test's mistakes
                    const lastTest = student.detailsTheoryTest[student.detailsTheoryTest.length - 1];
                    if (lastTest?.mistakes >= 5) {
                        failedAllTests++;
                    }
                }
            } 
            else {
                noPassers++; // Students with no tests at all
            }
        });

        setOtherDataTheories(prevState => ({
            ...prevState,
            failed: failedAllTests,
            noTheories: noPassers
        }));

        // console.log("Theory Counts:", theoryCounts);
        // console.log("Total Passers:", totalPassers);
        // console.log("Failed Every Test:", failedAllTests);
        // console.log("No Theories at All:", noPassers);
        // console.log("Total Students Checked:", totalStudentsChecked);
        // console.log("Expected Total Students:", studentsData.length);

        setTheoriesData(prevData => prevData.map((theory, index) => ({
            ...theory,
            value: theoryCounts[index], // Number of students who passed on this test attempt
            percentage: totalPassers > 0 ? ((theoryCounts[index] / totalPassers) * 100).toFixed(2) : "0", // Percentage of all passers
        })));
    };


    //A function that calculates the tests quantity and percentages
    const testsCalculates = () => {
        const testCounts = Array(8).fill(0); // Array to store the number of students who passed each test 
        let totalPassers = 0;
        let noPassers = 0;
        let totalStudentsChecked = 0;
        let failedAllTests = 0; // Track students who failed every test

        studentsData.forEach(student => {
            if (student.tests?.length > 0) {
                totalStudentsChecked++; // Count students with at least one test

                const sortedTests = student.tests
                    .filter(theory => theory.status != "Fail") // Passed tests only
                    .sort((a, b) => a.testNumber - b.testNumber); // Sort by test number

                if (sortedTests.length > 0) {
                    const firstPassedTest = sortedTests[0].id; // First test they passed
                    if (firstPassedTest >= 1 && firstPassedTest <= 8) {
                        testCounts[firstPassedTest - 1] += 1;
                        totalPassers++; // Count passing students
                    }
                } else {
                    // No passed tests → Check last test's mistakes
                    const lastTest = student.tests[student.tests.length - 1];
                    if (lastTest?.status === "Fail") {
                        failedAllTests++;
                    }
                }
            } else {
                // console.log("no listed:", student);
                noPassers++; // Students with no tests at all
            }
        });
        setOtherDataTests(prevState => ({
            ...prevState,
            failed: failedAllTests,
            noTheories: noPassers
        }));

        // console.log("test Counts:", testCounts);
        // console.log("Total Passers:", totalPassers);
        // console.log("Failed Every Test:", failedAllTests);
        // console.log("No test at All:", noPassers);
        // console.log("Total Students Checked:", totalStudentsChecked);
        // console.log("Expected Total Students:", studentsData.length);

        setTestData(prevData => prevData.map((test, index) => ({
            ...test,
            value: testCounts[index], // Number of students who passed on this test attempt
            percentage: totalPassers > 0 ? ((testCounts[index] / totalPassers) * 100).toFixed(2) : "0", // Percentage of all passers
        })));
    };

    useEffect(() => {
        theoreticalCalculates();
        testsCalculates();
    }, []);


    // Function to calculate average driving minutes and language
    const calculateAverageMinutes = () => {
        let licensedMinutes = 0, licensedCount = 0;
        let unlicensedMinutes = 0, unlicensedCount = 0;

        const languageCounts = {
            Hebrew: 0,
            English: 0,
            Russian: 0,
            French: 0,
            Arabic: 0,
            Other: 0
        };

        studentsData.forEach(student => {
            // Count languages
            const lang = student.language;
            if (lang === 'עברית') languageCounts.Hebrew++;
            else if (lang === 'אנגלית') languageCounts.English++;
            else if (lang === 'רוסית') languageCounts.Russian++;
            else if (lang === 'צרפתית') languageCounts.French++;
            else if (lang === 'ערבית') languageCounts.Arabic++;
            else languageCounts.Other++;

            // Calculate driving minutes
            if (Array.isArray(student.practicalDriving)) { // Ensure it's an array
                const totalMinutes = student.practicalDriving.reduce((sum, session) => {
                    const minutes = Number(session.drivingMinutes); // Convert to number
                    return sum + (isNaN(minutes) ? 0 : minutes); // Ignore NaN (null or invalid values)
                }, 0);

                if (student.previousLicense === 'yes') {
                    licensedMinutes += totalMinutes;
                    licensedCount++;
                } else {
                    unlicensedMinutes += totalMinutes;
                    unlicensedCount++;
                }
            }
        });
        return {
            avgLicensed: licensedCount > 0 ? formatNumber((licensedMinutes / licensedCount).toFixed(0)) : "0",
            avgUnlicensed: unlicensedCount > 0 ? formatNumber((unlicensedMinutes / unlicensedCount).toFixed(1)) : "0",
            languageCounts
        };
    };

    const { avgLicensed, avgUnlicensed, languageCounts } = calculateAverageMinutes();


    return (
        <div className='z-30 fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='relative w-[98%] max-w-[1400px] bg-[#e0ebf3] p-5 sm:p-8 rounded-lg shadow-xl h-[98%] overflow-y-auto'>
                {/* Header */}
                <div className='flex justify-between items-center'>
                    <button
                        onClick={() => setOpenModalDashboard(false)}
                        className='bg-blue-500 rounded-lg p-1 px-4 sm:px-6 text-white font-bold flex items-center shadow-md'>
                        <TiArrowBack className='text-2xl' />
                        <span className='ml-2'>חזור</span>
                    </button>
                    <h2 className='text-xl font-bold text-gray-700'>סטטוס</h2>
                </div>

                <div className='flex gap-3 justify-center items-center py-3 text-lg sm:text-xl font-medium'>
                    <p>סה"כ תלמידים: {studentsData.length}</p>,
                    <p>מחזור: {cycle}</p>
                </div>

                {/* Cards Layout */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <div className='h-[100%] flex flex-col justify-between gap-3'>
                        {/* Average Driving Minutes */}
                        <div className='h-[50%] bg-blue-100 p-6 rounded-lg shadow-md text-center flex flex-col gap-3 '>
                            <h3 className='text-lg font-semibold text-gray-800 pb-4'>ממוצע דקות נהיגה</h3>
                            <p className='text-gray-600'>בעלי רישיון קודם: <span className='font-bold text-blue-600'>{avgLicensed} דקות</span></p>
                            <p className='text-gray-600'>ללא רישיון קודם: <span className='font-bold text-blue-600'>{avgUnlicensed} דקות</span></p>
                        </div>
                        {/* Language Distribution Panel */}
                        <div className='h-[50%] lg:col-span-3 w-full bg-green-100 p-3  rounded-lg shadow-md text-center'>
                            <h3 className='text-lg font-semibold text-gray-800 mb-1 sm:mb-0'>תלמידים לפי שפה</h3>
                            <ul dir='rtl' className='text-gray-600 flex flex-col sm:gap-2'>
                                <li>עברית: <span className='font-bold text-green-600'>{languageCounts.Hebrew}</span></li>
                                <li>אנגלית: <span className='font-bold text-green-600'>{languageCounts.English}</span></li>
                                <li>רוסית: <span className='font-bold text-green-600'>{languageCounts.Russian}</span></li>
                                <li>צרפתית: <span className='font-bold text-green-600'>{languageCounts.French}</span></li>
                                <li>ערבית: <span className='font-bold text-green-600'>{languageCounts.Arabic}</span></li>
                                <li>אחר: <span className='font-bold text-green-600'>{languageCounts.Other}</span></li>
                            </ul>
                        </div>
                    </div>
                    {/* Theory Test Average */}
                    <div className='bg-green-100 p-6 rounded-lg shadow-md text-center'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-2'>מבחני תיאוריה</h3>
                        <div className="flex flex-col items-center  p-1 rounded-lg">
                            <PieChartArchive data={theoriesData} />
                        </div>
                        <div className='flex justify-center gap-4 py-2 text-red-600'>
                            <p className='font-medium'>לא עברו: {otherDataTheories.failed}</p>
                            <p className='font-medium'>לא נרשם אצלם: {otherDataTheories.noTheories}</p>
                        </div>

                    </div>
                    {/* Test Average */}
                    <div className='bg-yellow-100 p-6 rounded-lg shadow-md text-center'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-2'>טסטים</h3>
                        <div className=" flex flex-col items-center p-1 rounded-lg">
                            <PieChartArchive data={testData} />
                        </div>
                        <div className='flex justify-center gap-4 py-2 text-red-600'>
                            <p className='font-medium'>לא עברו: {otherDataTests.failed}</p>
                            <p className='font-medium'>לא נרשם אצלם: {otherDataTests.noTheories}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AverageDashboard;
