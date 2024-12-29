import React, { useState } from 'react';
import { GoChecklist } from "react-icons/go";
import { MdOutlineAddToPhotos } from "react-icons/md";
import { IoMdPersonAdd } from "react-icons/io";
import { useQuery } from 'react-query';
import { FaSignOutAlt } from "react-icons/fa";
import { auth, getAccounts } from '../firebase/firebase_config';
import { signOut } from 'firebase/auth';
import { useCurrentUser } from '../firebase/useCurerntUser';
import AddStudentModal from '../components/student/AddStudentModal';
import AddLessonModal from '../components/student/AddLessonModal';
import { Loading } from '../components/other/Loading';
import StudentData from '../components/student/StudentData';
import StatusTable from '../components/statuses/StatusTable';
import Greeting from '../components/other/Greeting';
import DailyDrivingStatus from '../components/statuses/DailyDrivingStatus';
import Dashboard from '../components/dashboard/Dashboard';
import { RxDashboard } from 'react-icons/rx';

const Admin = () => {
    const [currentUser] = useCurrentUser();
    const [openModalAddStudent, setOpenModalAddStudent] = useState(false);
    const [openModalAddLesson, setOpenModalAddLesson] = useState(false);
    const [openModalStudentData, setOpenModalStudentData] = useState(false);
    const [openModalStudentsTable, setOpenModalStudentsTable] = useState(false);
    const [openModalDailyDrivingStatus, setOpenModalDailyDrivingStatus] = useState(false);
    const [studentDetails, setStudentDetails] = useState();
    const [searchTerm, setSearchTerm] = useState('');
    const [openModalDashboard, setOpenModalDashboard] = useState(false);

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: getAccounts,
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredStudents = data?.filter(account =>
        account.user === "תלמידים" &&
        account.displayName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        account.departments === currentUser.departments
    ).sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);


    const filteredTeachers = data?.filter(account =>
        account.user === "מורה נהיגה").sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    const filteredStudentsForDashboard = data?.filter(account =>
        account.user === 'תלמידים'
    );

    if (isLoading) return <Loading />

    if (isError) {
        return <div>{error}</div>
    }

    
    return (
        <div className='space-y-5 mb-16 flex flex-col items-center md:px-16'>
            {openModalAddStudent && <AddStudentModal setOpenModalAddStudent={setOpenModalAddStudent} openModalAddStudent={openModalAddStudent} refetch={refetch} />}
            {openModalAddLesson && <AddLessonModal setOpenModalAddLesson={setOpenModalAddLesson} studentDetails={studentDetails} filteredTeachers={filteredTeachers} refetch={refetch} filteredStudents={filteredStudents} />}
            {openModalStudentData && <StudentData setOpenModalStudentData={setOpenModalStudentData} studentDetails={studentDetails} usersRefetch={refetch} filteredTeachers={filteredTeachers} />}
            {openModalStudentsTable && <StatusTable setOpenModalStudentsTable={setOpenModalStudentsTable} filteredStudents={filteredStudents} />}
            {openModalDailyDrivingStatus && <DailyDrivingStatus setOpenModalDailyDrivingStatus={setOpenModalDailyDrivingStatus} />}
            {openModalDashboard && <Dashboard setOpenModalDashboard={setOpenModalDashboard} filteredStudents={filteredStudentsForDashboard} filteredTeachers={filteredTeachers} user={currentUser} />}

            <div dir='rtl' className='w-full flex flex-col items-center'>
                <div className='w-full flex flex-col space-y-4'>
                    <div className='flex justify-around'>
                        <div className="flex items-center gap-1 font-bold text-lg text-gray-500 py-2">
                            <Greeting /> {currentUser.displayName}
                        </div>
                        <button
                            onClick={() => {
                                if (window.confirm("האם אתה בטוח שברצונך להתנתק?")) {
                                    try {
                                        signOut(auth);
                                        window.location.replace('/');
                                    } catch (error) {
                                        alert("שגיאה");
                                    }
                                }
                            }}
                            className="sm:text-lg text-red-600 sm:flex items-center gap-1"
                        >
                            <FaSignOutAlt className="text-lg sm:text-xl" />
                            <span className="hidden sm:block">להתנתק</span>
                        </button>
                    </div>

                    <div className="w-full flex justify-around sm:justify-center">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setOpenModalAddStudent(true)}
                                className="sm:text-base w-72 flex justify-center font-medium py-2 items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg px-2 sm:px-10 p-1 sm:p-2 cursor-pointer"
                            >
                                <IoMdPersonAdd className="text-white" />
                                הוספת תלמיד
                            </button>
                        </div>
                    </div>
                    <div className="w-full flex items-center justify-center gap-3 pt-3">
                        <div className="flex flex-col sm:flex-row gap-5 bg-slate-100 p-5 rounded-lg px-5">
                            <button
                                onClick={() => setOpenModalStudentsTable(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 w-72 sm:w-auto sm:px-4 rounded-lg font-medium transition-colors"
                            >
                                סטטוס תלמידים
                            </button>
                            <button
                                onClick={() => setOpenModalDailyDrivingStatus(true)}
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 w-72 sm:w-auto sm:px-4 rounded-lg font-medium transition-colors"
                            >
                                סטטוס שיעורי נהיגה
                            </button>
                            <button onClick={() => setOpenModalDashboard(true)} className='bg-green-500 w-72 sm:w-auto rounded-lg p-1.5 py-2 px-3 sm:p-2 sm:px-9 text-white font-bold flex justify-center items-center gap-2 shadow-lg'>
                                <span className="sm:inline">דאשבורד</span> <RxDashboard className='text-xl' />
                            </button>
                        </div>
                    </div>
                </div>

                <p className='font-bold text-xl lg:text-2xl py-5 pt-8 underline'>רשימת תלמידים - מחלקה {currentUser.departments}</p>
                <div className='flex items-center justify-around w-full'>
                    <input
                        onChange={handleSearchChange}
                        value={searchTerm}
                        className="ps-2 pe-2 block w-[50%] max-w-[320px] rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder='חפש תלמיד . . .'
                        type="search"
                    />
                    <p className='text-lg font-bold'>סה"כ תלמידים: {filteredStudents?.length || 0}</p>
                </div>
            </div>

            {/* Table wrapper to limit its height and provide scrolling */}
            <div className='w-full overflow-y-auto max-h-[54vh] shadow-lg '>
                <table dir='rtl' className="table-auto min-w-full divide-y divide-gray-200 shadow-xl py-10">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-center py-3 text-[15px] font-medium text-gray-500 uppercase tracking-wider">שם</th>
                            <th className="text-center py-3 text-[15px] font-medium text-gray-500 uppercase tracking-wider">ת.ז</th>
                            <th className="text-center py-3 text-[15px] font-medium text-gray-500 uppercase tracking-wider">מידע</th>
                            <th className="text-center py-3 text-[15px] font-medium text-gray-500 uppercase tracking-wider">קבע שיעור</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredStudents?.map(account => (
                            <tr className={`cursor-pointer ${account.newStatus && account.newStatus === "expelled" ? 'bg-red-300' : account.newStatus === "finished successfully" ? 'bg-green-300' : 'hover:bg-gray-200'}`} key={account.uid}>
                                <td className="text-center py-4 whitespace-nowrap">{account.displayName}</td>
                                <td className="text-center py-4 whitespace-nowrap">{account.userId}</td>
                                <td className="text-center text-xl py-4 whitespace-nowrap"><GoChecklist onClick={() => { setOpenModalStudentData(true); setStudentDetails(account); }} className='text-gray-500 cursor-pointer inline-block' /></td>
                                <td className="text-center text-xl py-4 whitespace-nowrap"><MdOutlineAddToPhotos onClick={() => { setOpenModalAddLesson(true); setStudentDetails(account); }} className='text-green-500 cursor-pointer inline-block' /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredStudents?.length < 1 && <p className='text-center font-bold text-2xl'>אין תוצאות</p>}
            </div>
        </div>
    );
};

export default Admin;
