import React, { useState, useEffect, useMemo } from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { signOut } from 'firebase/auth';
import { auth, getAccounts } from '../firebase/firebase_config';
import { useCurrentUser } from '../firebase/useCurerntUser';
import { Loading } from '../components/other/Loading';
import Greeting from '../components/other/Greeting';
import TeacherUserData from '../components/teacher/TeacherUserData';

const DrivingTeacher = () => {
    const today = new Date().toISOString().split('T')[0];
    const [openModal, setOpenModal] = useState(false);
    const [currentUser, _, loading] = useCurrentUser();
    const [todayClasses, setTodayClasses] = useState([]);
    const [studentUid, setStudentUid] = useState();
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentShift, setStudentShift] = useState(null);

    useEffect(() => {
        const savedDate = localStorage.getItem('lastDate');
        if (savedDate !== today) {
            const initialShiftData = {
                'משמרת בוקר': { totalMinutes: 0, students: {} },
                'משמרת צהריים': { totalMinutes: 0, students: {} },
                'משמרת ערב': { totalMinutes: 0, students: {} }
            };
            localStorage.setItem('totalShiftMinutes', JSON.stringify(initialShiftData));
            localStorage.setItem('lastDate', today);
        }
    }, []);

    const { data: allUsers, isLoading: studentLoading, refetch: usersRefetch } = useQuery({
        queryKey: ['users'],
        queryFn: getAccounts,
    });

    const day = new Date(today).toLocaleDateString('he-IL', { weekday: 'long' });

    const filteredTeachers = useMemo(() => {
        return allUsers
            ?.filter(account => account.user === "מורה נהיגה")
            .sort((a, b) => a.displayName.localeCompare(b.displayName, 'he'));
    }, [allUsers]);

    useEffect(() => {
        if (allUsers && currentUser) {
            // Filter only students
            const students = allUsers.filter(account => account.user === 'תלמידים');

            // Get lessons for the current teacher and today's date
            const filteredClasses = students.flatMap(student =>
                (student.practicalDriving || []).filter(
                    lesson =>
                        lesson.teacherUid === currentUser.uid &&
                        lesson.date === today
                )
            );

            // Categorize lessons by shift
            const categorizeByShift = (classes) => {
                const shifts = {
                    morning: [],
                    noon: [],
                    evening: []
                };

                classes.forEach((item) => {
                    if (item.shift === "משמרת בוקר") {
                        shifts.morning.push(item);
                    } else if (item.shift === "משמרת צהריים") {
                        shifts.noon.push(item);
                    } else {
                        shifts.evening.push(item);
                    }
                });

                return shifts;
            };

            const categorizedClasses = categorizeByShift(filteredClasses);

            // Update state with categorized lessons
            setTodayClasses({
                morning: categorizedClasses.morning,
                noon: categorizedClasses.noon,
                evening: categorizedClasses.evening
            });
        }
    }, [allUsers, currentUser, today]);


    useEffect(() => {
        if (allUsers && studentUid) {
            const student = allUsers.find(student => student.uid === studentUid);
            setSelectedStudent(student);
        }
    }, [allUsers, studentUid]);


    if (loading || studentLoading) {
        return <Loading />;
    }

    return (
        <div className='flex flex-col justify-center items-center gap-5 mb-12'>
            <div dir='rtl' className="w-full max-w-[1000px] px-2 mt-5 space-y-5">
                <div className='flex items-center justify-between px-5'>
                    <div className='flex flex-col justify-center items-center'>
                        <h2 className="text-lg sm:text-xl font-bold  text-center sm:flex"><Greeting /> {currentUser?.displayName}</h2>
                        <h2 className="text-lg sm:text-xl text-center sm:flex gap-1"><span>בית ספר: </span>  <span className='font-bold'> {currentUser?.school}</span></h2>
                    </div>
                    <button onClick={() => {
                        if (window.confirm("האם אתה בטוח שברצונך להתנתק?")) {
                            try {
                                signOut(auth);
                                window.location.replace('/');
                            } catch (error) {
                                alert("שגיאה")
                            }
                        }
                    }} className='text-xl flex items-center gap-2 text-red-600'>
                        <FaSignOutAlt /><span className='text-lg'>התנתק</span>
                    </button>
                </div>
                <div className="bg-gray-200 p-4 rounded-lg">
                    <div className="text-gray-700">
                        <div className='flex flex-col gap-2 sm:flex-row justify-between items-center'>
                            <p className="font-bold text-lg">התלמידים שלך להיום:</p>
                            <div className='flex gap-5'>
                                <p className='font-bold text-blue-600'>{day}</p>
                                <p className='font-bold text-blue-600'>{today}</p>
                            </div>
                        </div>
                        <div className='space-y-4 pt-4'>
                            {['morning', 'noon', 'evening'].map(shift => (
                                <div key={shift}>
                                    <p className="font-bold text-lg capitalize text-blue-600">{shift === 'morning' ? 'משמרת בוקר' : shift === 'noon' ? 'משמרת צהריים' : 'משמרת ערב'}:</p>
                                    <ul className="space-y-2">
                                        {todayClasses[shift]?.length > 0 ? (
                                            todayClasses[shift].map((item, index) => (
                                                <li
                                                    onClick={() => {
                                                        setStudentShift(shift);
                                                        setStudentUid(item.studentUid);
                                                        setOpenModal(true);
                                                    }}
                                                    className='bg-gray-300 rounded-md text-lg p-1 ps-2 cursor-pointer hover:bg-gray-400 duration-150'
                                                    key={index}
                                                >
                                                    {item.student}
                                                </li>
                                            ))
                                        ) : (
                                            <li>אין תלמידים בשעות {shift === 'morning' ? 'בוקר' : shift === 'noon' ? 'צהריים' : 'ערב'}</li>
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <hr className='w-[90%]  border-black' />
            {openModal && <div className='px-2 w-full max-w-[1000px]'>
                <TeacherUserData studentDetails={selectedStudent} studentUid={studentUid} setOpenModalStudentData={setOpenModal} studentShift={studentShift} usersRefetch={usersRefetch} filteredTeachers={filteredTeachers} />
            </div>}
        </div>
    );
};

export default DrivingTeacher;
