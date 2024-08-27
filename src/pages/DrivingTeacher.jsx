import React, { useState, useEffect } from 'react';
import TableDriving from '../components/TableDriving';
import { FaSignOutAlt, FaSyncAlt } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth, getAccounts, getPracticalDriving } from '../firebase/firebase_config';
import { useQuery } from 'react-query';
import { useCurrentUser } from '../firebase/useCurerntUser';
import { Loading } from '../components/Loading';
import Greeting from '../components/Greeting';

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
            const initialShiftMinutes = {
                'משמרת בוקר': 0,
                'משמרת צהריים': 0,
                'משמרת ערב': 0
            };
            localStorage.setItem('totalShiftMinutes', JSON.stringify(initialShiftMinutes));
            localStorage.setItem('lastDate', today);
        }
    }, []);


    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['practical_driving'],
        queryFn: getPracticalDriving,
    });

    const { data: studentData, isLoading: studentLoading, refetch: usersRefetch } = useQuery({
        queryKey: ['users'],
        queryFn: getAccounts,
    });


    const day = new Date(today).toLocaleDateString('he-IL', { weekday: 'long' });

    useEffect(() => {
        if (data && currentUser) {
            const filteredClasses = data.filter(item =>
                item.teacherUid === currentUser.uid && item.date === today
            );

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

            setTodayClasses({
                morning: categorizedClasses.morning,
                noon: categorizedClasses.noon,
                evening: categorizedClasses.evening
            });
        }
    }, [data, currentUser]);

    useEffect(() => {
        if (studentData && studentUid) {
            const student = studentData.find(student => student.uid === studentUid);
            setSelectedStudent(student);
        }
    }, [studentData, studentUid]);


    if (loading || isLoading || studentLoading) {
        return <Loading />;
    }

    return (
        <div className='flex flex-col justify-center items-center gap-5 mb-12'>
            <div dir='rtl' className="w-full max-w-[1000px] px-2 mt-5 space-y-5">
                <div className='flex items-center justify-between px-5'>
                    <div className='flex items-center gap-5'>
                        <h2 className="text-lg sm:text-xl font-bold mb-2 pt-1 text-center sm:flex"><Greeting /> {currentUser?.displayName}</h2>
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
                <TableDriving studentDetails={selectedStudent} studentUid={studentUid} setOpenModalStudentData={setOpenModal} studentShift={studentShift} usersRefetch={usersRefetch} />
            </div>}
        </div>
    );
};

export default DrivingTeacher;
