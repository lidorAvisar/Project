import React, { useEffect, useState } from 'react';
import { useCurrentUser } from '../firebase/useCurerntUser';
import { Loading } from '../components/Loading';
import { useQuery } from 'react-query';
import { auth, getAccounts, getStudentsTests, updateAccount } from '../firebase/firebase_config';
import { signOut } from 'firebase/auth';
import { FaBars, FaSignOutAlt, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Greeting from '../components/Greeting';
import { IoArrowUndoOutline } from 'react-icons/io5';
import StudentExam from '../components/StudentExam';


const Student = () => {
    const [currentUser, _, loading] = useCurrentUser();
    const [drivingMinutes, setDrivingMinutes] = useState(0);
    const [totalRequiredMinutes, setTotalRequiredMinutes] = useState(1280);
    const [filteredLessons, setFilteredLessons] = useState([]);
    const [theoryTestPassed, setTheoryTestPassed] = useState(false);
    const [finalTestPassed, setFinalTestPassed] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTestListOpen, setIsTestListOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [filteredTests, setFilteredTests] = useState([]);
    const [openTestModal, setOpenTestModal] = useState(false);
    const [testName, setTestName] = useState("");



    // const { data, isLoading, isError, error, refetch, status } = useQuery({
    //     queryKey: ['practical_driving'],
    //     queryFn: getPracticalDriving,
    // });

    const { data: allUsers } = useQuery({
        queryKey: ['users'],
        queryFn: async () => await getAccounts(),
        onError() {
            alert("שגיאה בעת משיכת הנתונים העדכניים")
        }
    });

    const { data: tests, isLoading: loadingTest } = useQuery('studentsTests', async () => {
        const fetchedTests = await getStudentsTests();
        // Sort by Hebrew alphabet
        return fetchedTests.sort((a, b) => a.testName.localeCompare(b.testName, 'he'));
    });

    const testsByDriverType = {
        'נהג בט"ש B': ["hazardousMaterialsScore", "davidCarScore", "jeepCarScore"],
        'נהג בט"ש C1': [
            "hazardousMaterialsScore",
            "cargoSecuringScore",
            "davidCarScore",
            "jeepCarScore",
            "hummerProtectedCarScore",
            "tigerCarScore",
            "saunaCarScore",
        ],
        "נהג ליין משא": [
            "hazardousMaterialsScore",
            "cargoSecuringScore",
            "hummerCarScore",
        ],
        'נהג משא יח"ש': ["hazardousMaterialsScore", "cargoSecuringScore"],
    };

    useEffect(() => {
        if (!tests || !currentUser.lineTraining) return;

        const allowedVehicleTypes = testsByDriverType[currentUser.lineTraining];

        if (allowedVehicleTypes) {
            const filtered = tests.filter(test =>
                allowedVehicleTypes.includes(test.vehicleType)
            );
            setFilteredTests(filtered);
        }
    }, [tests, currentUser.lineTraining]);

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

            // Check if final test was passed
            const passedFinalTest = currentUser.tests?.map(test => test === 'Pass');
            setFinalTestPassed(passedFinalTest);
        }
    }, [data, currentUser]);

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

    const handleSignOut = () => {
        if (window.confirm("האם אתה בטוח שברצונך להתנתק?")) {
            try {
                signOut(auth);
                window.location.replace('/');
            } catch (error) {
                alert("שגיאה");
            }
        }
    };

    // Toggle button handler
    const toggleShowAll = () => {
        setShowAll((prevShowAll) => !prevShowAll);
    };

    // Determine the lessons to display
    const displayedLessons = showAll ? filteredLessons : filteredLessons.slice(0, 4);


    // useEffect(() => {
    //     if (data) {
    //         const filteredUsers = data.filter(users => users.uid === user.uid);
    //         const filterCurrentUser = filteredUsers.length > 0 ? filteredUsers[0] : null;
    //         setFilteredCurrentUser(filterCurrentUser);
    //     }
    // }, [data, openEditModal]);

    const assignPracticalDriving = async () => {
        try {
            // Iterate over all users to assign their practical driving lessons
            for (const user of allUsers) {
                // Filter driving lessons matching the user's UID
                const practicalDrivingLessons = data.filter(
                    lesson => lesson.studentUid === user.uid
                );

                // Prepare the data to update
                const updateData = {
                    practicalDriving: practicalDrivingLessons
                };

                // Call updateAccount to update the user in Firestore
                await updateAccount(user.uid, updateData);

                console.log(`Updated user: ${user.uid} with practicalDriving`, updateData);
            }

            console.log("All users updated successfully.");
        } catch (error) {
            console.error("Error updating users:", error);
        }
    };

    useEffect(() => {
        // assignPracticalDriving();
    }, [data, allUsers]);


    if (loading || isLoading || loadingTest) {
        return <Loading />;
    }

    if (isError) {
        return (
            <div className='flex flex-col gap-5'>
                <p>{error.message}</p>
            </div>
        );
    }

    console.log(data);
    console.log(allUsers);
    console.log(currentUser);

    return (
        <div>
            {openTestModal && <StudentExam testName={testName} filteredTests={filteredTests} setOpenTestModal={setOpenTestModal} uid={currentUser.uid} />}
            <div className="p-3 sm:p-6 bg-gray-100 w-full min-h-screen">
                <div dir='rtl' className="w-full sm:flex justify-between">
                    {/* Greeting Section */}
                    <div dir="rtl" className="flex items-center justify-between p-3">
                        <h1 className="sm:text-lg sm:flex sm:gap-1 font-bold">
                            <Greeting /> {currentUser?.displayName}
                        </h1>
                        {/* Hamburger Button for Mobile */}
                        <button
                            className="sm:hidden text-gray-700 text-xl"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div dir="rtl" className="sm:hidden bg-white p-3 space-y-4 rounded-md flex flex-col items-center">
                            <a
                                href="https://mador-till-prod.github.io/lomda-cards-theory/src/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <button
                                    className="flex items-center gap-3 bg-blue-500 p-1 rounded-md text-white font-bold"
                                >
                                    לימודי תאוריה
                                    <IoArrowUndoOutline className="mx-auto h-5 w-auto" />
                                </button>
                            </a>
                            <div className='flex flex-col justify-center gap-3'>
                                {Array.from(new Set(filteredTests.map(test => test.testName))).map((uniqueTestName, i) => (
                                    <button
                                        onClick={() => {
                                            setTestName(uniqueTestName);
                                            setOpenTestModal(true);
                                        }}
                                        key={i}
                                        className='bg-gray-200 p-1 px-12 rounded-md font-bold'
                                    >
                                        מבחן {uniqueTestName}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleSignOut}
                                className="flex items-center rounded-md px-7 text-white font-bold p-1 gap-3 bg-red-500"
                            >
                                <FaSignOutAlt />
                                <span>התנתק</span>
                            </button>
                        </div>
                    )}

                    {/* Navbar for Tablets and Larger Screens */}
                    <div className='hidden sm:flex items-center justify-between p-3 gap-6'>
                        <div className="flex flex-col justify-center items-center relative">
                            <p
                                onClick={() => setIsTestListOpen(!isTestListOpen)}
                                className="font-bold text-gray-500 cursor-pointer hover:underline text-center"
                            >
                                מבחנים
                            </p>
                            {isTestListOpen && (
                                <div
                                    className="absolute top-full flex flex-col gap-2 bg-white shadow-md p-2 rounded-md"
                                    style={{ zIndex: 10 }}
                                >
                                    {Array.from(new Set(filteredTests.map(test => test.testName))).map((uniqueTestName, i) => (
                                        <button
                                            onClick={() => {
                                                setTestName(uniqueTestName);
                                                setOpenTestModal(true);
                                                setIsTestListOpen(!isTestListOpen);
                                            }}
                                            key={i}
                                            className="p-1 px-12 rounded-md font-bold bg-gray-200 hover:bg-gray-300"
                                        >
                                            {uniqueTestName}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Theory Study Link */}
                        <div className="flex items-center gap-4">
                            <a
                                href="https://mador-till-prod.github.io/lomda-cards-theory/src/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 font-bold hover:underline"
                            >
                                לימודי תאוריה
                            </a>
                        </div>

                        {/* Sign Out Button */}
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-1 text-red-600 text-lg"
                        >
                            <FaSignOutAlt />
                            <span>התנתק</span>
                        </button>
                    </div>
                </div>

                <div dir='rtl' className="w-full sm:max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-10 my-4">
                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className='flex flex-col gap-2 sm:flex-row justify-between items-center pt-3'>
                            <h2 className="text-lg sm:text-xl font-semibold text-center">ההתקדמות שלך</h2>
                        </div>
                        <div className=" pt-10">
                            <div className="overflow-hidden h-3.5 mb-4 text-xs flex rounded-xl bg-green-200">
                                <div style={{ width: `${calculateProgress()}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500">
                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full">
                                        {Math.round(calculateProgress())}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completed Tasks */}
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-4 text-center underline">משימות שהושלמו</h2>
                        <div className="space-y-6">

                            <div>
                                <h3 className="text-lg font-semibold mb-2 underline">בוחן</h3>
                                <ul className="list-inside space-y-2">
                                    <li className="p-3 bg-gray-100 rounded-lg shadow-sm"> <span className='font-bold'>בוחן ב:</span></li>
                                </ul>
                            </div>
                            {/* Theory Sessions */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2 underline">תאוריה</h3>
                                <ul className="list-inside space-y-2">
                                    <li className="p-3 bg-gray-100 rounded-lg shadow-sm"> <span className='font-bold'>מספר תאוריה: </span>{currentUser?.theorySessionsQuantity}</li>
                                </ul>
                            </div>

                            {/* Theory Tests */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2 underline">מבחני תאוריה</h3>
                                <ul className="list-disc list-inside space-y-5">
                                    {currentUser?.detailsTheoryTest?.map((test, index) => (
                                        test.date ? (
                                            <li key={index} className="p-3 flex flex-col items-center gap-2 sm:flex-row bg-gray-100 rounded-lg shadow-sm">
                                                <span className='font-bold'>{index + 1}. תאריך מבחן:</span> {test.date}, <span className='font-bold'>מספר טעויות: {test.mistakes}</span>
                                            </li>
                                        ) : null
                                    ))}
                                </ul>
                            </div>

                            {/* Practical Driving Lessons */}
                            <div className="">
                                <h3 className="text-lg font-semibold mb-4 underline text-center">נהיגה מעשית</h3>
                                <ul className="list-inside list-decimal space-y-5 relative">
                                    {displayedLessons.map((lesson, index) => (
                                        <li
                                            key={index}
                                            className="p-3 bg-gray-100 rounded-lg shadow-sm transition-opacity duration-300"
                                            style={{ opacity: showAll || index < 4 ? 1 : 0.5 }}
                                        >
                                            <span className="font-bold"> תאריך:</span> {lesson.date},
                                            <span className="font-bold"> דקות נהיגה:</span> {lesson.drivingMinutes}
                                        </li>
                                    ))}
                                    {/* Button to toggle visibility */}
                                    {filteredLessons.length > 4 && (
                                        <button
                                            onClick={toggleShowAll}
                                            className="w-full text-blue-500 hover:text-blue-700 flex justify-center items-center space-x-2"
                                        >
                                            {showAll ? (
                                                <>
                                                    <FaChevronUp size={18} />
                                                    <span>הצג פחות</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaChevronDown size={18} />
                                                    <span>הצג עוד</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </ul>
                            </div>
                            {/* Final Test */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2 underline">טסטים</h3>
                                <ul className="list-inside list-decimal space-y-5">
                                    {currentUser?.tests?.map(test =>
                                        <li className='p-3 bg-gray-100 rounded-lg shadow-sm font-bold'>תאריך: {test.date} , {test.status === 'Pass' ? <span className='text-green-500'>עבר !</span> : <span className='text-red-500'>נכשל</span>}</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default Student;