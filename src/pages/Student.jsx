import React, { useEffect, useState } from 'react';
import { useCurrentUser } from '../firebase/useCurerntUser';
import { Loading } from '../components/Loading';
import { useQuery } from 'react-query';
import { auth, getPracticalDriving } from '../firebase/firebase_config';
import { signOut } from 'firebase/auth';
import { FaSignOutAlt } from 'react-icons/fa';
import Greeting from '../components/Greeting';


const Student = () => {
    const [currentUser, _, loading] = useCurrentUser();
    const [drivingMinutes, setDrivingMinutes] = useState(0);
    const [totalRequiredMinutes, setTotalRequiredMinutes] = useState(1280); // Default to 1280 minutes
    const [filteredLessons, setFilteredLessons] = useState([]);
    const [theoryTestPassed, setTheoryTestPassed] = useState(false);
    const [finalTestPassed, setFinalTestPassed] = useState(false);

    const { data, isLoading, isError, error, refetch, status } = useQuery({
        queryKey: ['practical_driving'],
        queryFn: getPracticalDriving,
    });

    useEffect(() => {
        if (data && currentUser) {
            // Filter lessons based on currentUser.lessons array
            const lessonsFiltered = data.filter(lesson => currentUser.lessons.includes(lesson.uid));
            setFilteredLessons(lessonsFiltered);

            // Calculate total driving minutes for the filtered lessons
            const totalMinutes = lessonsFiltered.reduce((acc, lesson) => acc + (lesson.drivingMinutes || 0), 0);
            setDrivingMinutes(totalMinutes);

            // Determine the total required minutes based on the student's license status
            if (currentUser.previousLicense) {
                setTotalRequiredMinutes(800);
            } else {
                setTotalRequiredMinutes(1280);
            }

            // Check if theory tests were passed (less than or equal to 4 mistakes)
            const passedTheoryTests = currentUser.detailsTheoryTest?.some(test => test.mistakes <= 4);
            setTheoryTestPassed(passedTheoryTests);

            // Check if final test was passed (score equals 100)
            const passedFinalTest = currentUser.tests?.map(test => test === 'Pass');
            setFinalTestPassed(passedFinalTest);
        }
    }, [data, currentUser]);

    if (loading || isLoading) {
        return <Loading />;
    }

    if (isError) {
        return (
            <div className='flex flex-col gap-5'>
                <p>{error.message}</p>
            </div>
        );
    }

    // Calculate progress percentage
    const calculateProgress = () => {
        let progress = 0;
        if (drivingMinutes >= totalRequiredMinutes) {
            progress += 25; // Driving minutes completed
        } else {
            progress += (drivingMinutes / totalRequiredMinutes) * 25;
        }

        if (theoryTestPassed) {
            progress += 25; // Theory tests passed
        }

        if (finalTestPassed) {
            progress += 50; // Final test passed
        }

        return progress;
    };

    // Determine pass/fail status based on progress
    const getPassFailStatus = () => {
        if (drivingMinutes >= totalRequiredMinutes && theoryTestPassed && finalTestPassed === "Pass") {
            return 'עבר';
        } else {
            return 'נכשל';
        }
    };

    return (
        <div className="p-6 bg-gray-100 w-full min-h-screen">
            <div dir='rtl' className=' flex items-center justify-around  p-1 py-3'>
                <h1 className="text-lg font-bold"><Greeting /> {currentUser?.displayName}</h1>
                <button onClick={() => {
                    if (window.confirm("האם אתה בטוח")) {
                        try {
                            signOut(auth);
                            window.location.replace('/');
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }} className='sm:text-lg flex items-center gap-2  text-red-600'><FaSignOutAlt /><span className='text-lg'>התנתק</span>
                </button>
            </div>

            <div dir='rtl' className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-5">
                {/* Progress Bar */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-2">ההתקדמות שלך</h2>
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <div className="text-right">
                                <span className="text-xs font-semibold inline-block text-green-600">
                                    התקדמות
                                </span>
                            </div>
                            <div>
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                                    {Math.round(calculateProgress())}%
                                </span>
                            </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                            <div style={{ width: `${calculateProgress()}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                        </div>
                    </div>
                </div>

                {/* Completed Tasks */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4 text-center">משימות שהושלמו</h2>
                    <div className="space-y-4">
                        {/* Theory Sessions */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 underline">מפגשי תיאוריה</h3>
                            <ul className="list-inside space-y-2">
                                <li className="p-3 bg-gray-100 rounded-lg shadow-sm"> <span className='font-bold'>מספר מפגשי תאוריה: </span>{currentUser?.theorySessionsQuantity}</li>
                            </ul>
                        </div>

                        {/* Theory Tests */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 underline">מבחני תיאוריה</h3>
                            <ul className="list-disc list-inside space-y-5">
                                {currentUser?.detailsTheoryTest?.map((test, index) => (
                                    test.date ? (
                                        <li key={index} className="p-3 flex flex-col items-center gap-2 sm:flex-row bg-gray-100 rounded-lg shadow-sm">
                                            <span className='font-bold'>{index + 1}. תאריך מבחן:</span> {test.date}, <span className='font-bold'>מספר טעויות:</span> {test.mistakes}
                                        </li>
                                    ) : null
                                ))}
                            </ul>
                        </div>


                        {/* Practical Driving Lessons */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 underline">נהיגה מעשית</h3>
                            <ul className="list-inside list-decimal space-y-5">
                                {filteredLessons.map((lesson, index) => (
                                    <li key={index} className="p-3 bg-gray-100 rounded-lg shadow-sm">
                                        <span className='font-bold'> תאריך:</span> {lesson.date}, <span className='font-bold'>דקות נהיגה:</span> {lesson.drivingMinutes}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Final Test */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 underline">מבחן נהיגה סופי</h3>
                            <ul className="list-inside list-decimal space-y-5">
                                {finalTestPassed ? (
                                    <li className="p-3 bg-gray-100 rounded-lg shadow-sm">
                                        <span className='font-bold'> התבצע בהצלחה! </span>
                                    </li>
                                ) : (
                                    <li className="p-3 bg-gray-100 rounded-lg shadow-sm">
                                        <span className='font-bold'> לא התבצע </span>
                                    </li>
                                )}
                            </ul>
                            {finalTestPassed && <div className="text-lg font-semibold mb-2">
                                הציון הסופי:
                                <span className={`ml-2 ${getPassFailStatus() === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                                    {getPassFailStatus()}
                                </span>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Student;
