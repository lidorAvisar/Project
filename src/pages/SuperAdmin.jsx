import React, { useEffect, useState } from 'react';
import { BiEditAlt } from "react-icons/bi";
import { BsTrash } from "react-icons/bs";
import { FaSignOutAlt } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa6";
import { useMutation, useQuery } from 'react-query';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import { IoArrowDown } from 'react-icons/io5';
import { signOut } from 'firebase/auth';
import { getAccounts, deleteAccount, auth } from '../firebase/firebase_config';
import { useCurrentUser } from '../firebase/useCurerntUser';
import RegisterModal from '../components/registration/RegisterModal';
import { EditUserModal } from '../components/other/EditUserModal';
import { Loading } from '../components/other/Loading';
import StudentData from '../components/student/StudentData';
import StatusTable from '../components/statuses/StatusTable';
import Greeting from '../components/other/Greeting';
import AddLessonModal from '../components/student/AddLessonModal';
import DailyDrivingStatus from '../components/statuses/DailyDrivingStatus';
import Dashboard from '../components/dashboard/Dashboard';
import { RxDashboard } from 'react-icons/rx';


const SuperAdmin = () => {
    const schools = ["שרייבר", "יובלי", "צבאי"]

    const [expandedSchool, setExpandedSchool] = useState(null);
    const [openRegisterModal, setOpenRegisterModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openModalStudentData, setOpenModalStudentData] = useState(false);
    const [openModalStudentsTable, setOpenModalStudentsTable] = useState(false);
    const [openModalDailyDrivingStatus, setOpenModalDailyDrivingStatus] = useState(false);
    const [currentEditUser, setCurrentEditUser] = useState(null);
    const [userData, setUserData] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [openModalAddLesson, setOpenModalAddLesson] = useState(false);
    const [filteredCurrentUser, setFilteredCurrentUser] = useState('')
    const [openModalDashboard, setOpenModalDashboard] = useState(false);
    const [user] = useCurrentUser();


    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => await getAccounts(),
    });


    const { mutate: deleteAdmin } = useMutation({
        mutationKey: ['users'],
        mutationFn: async (id) => {
            await deleteAccount(id)
        },
        onSuccess: () => refetch(),
    });

    const handleToggleSchool = (school) => {
        setExpandedSchool(expandedSchool === school ? null : school);
    };

    const getTeachersCount = (school) => {
        return filteredTeachers?.filter(account => account.school === school).length || 0;
    };

    const handleSearchChange = (e) => {
        setStudentSearch(e.target.value);
    };

    useEffect(() => {
        if (data) {
            const filteredUsers = data.filter(users => users.uid === user.uid);
            const filterCurrentUser = filteredUsers.length > 0 ? filteredUsers[0] : null;
            setFilteredCurrentUser(filterCurrentUser);
        }
    }, [data, openEditModal]);


    if (isLoading) return <Loading />;

    if (isError) {
        return <div>{error}</div>;
    }


    const filteredMM = data.filter(account =>
        account.user === 'מ"מ' && user?.departments?.includes(account.departments)
    );

    const filteredTeachers = data?.filter(account =>
        account.user === "מורה נהיגה").sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    const filteredStudents = data.filter(account =>
        account.user === 'תלמידים' && user?.departments?.includes(account.departments)
    );

    const filteredStudentsForDashboard = data.filter(account =>
        account.user === 'תלמידים'
    );

    return (
        <div className="overflow-x-auto flex flex-col items-center md:px-16">
            {openRegisterModal && <RegisterModal setOpenRegisterModal={setOpenRegisterModal} />}
            {openEditModal && <EditUserModal user={currentEditUser} setOpenEditModal={setOpenEditModal} refetch={refetch} />}
            {openModalStudentData && <StudentData setOpenModalStudentData={setOpenModalStudentData} studentDetails={userData} usersRefetch={refetch} />}
            {openModalStudentsTable && <StatusTable setOpenModalStudentsTable={setOpenModalStudentsTable} />}
            {openModalDailyDrivingStatus && <DailyDrivingStatus setOpenModalDailyDrivingStatus={setOpenModalDailyDrivingStatus} filteredStudents={filteredStudents} />}
            {openModalAddLesson && <AddLessonModal setOpenModalAddLesson={setOpenModalAddLesson} studentDetails={userData} filteredTeachers={filteredTeachers} refetch={refetch} setOpenModalStudentData={setOpenModalStudentData} filteredStudents={filteredStudents} />}
            {openModalDashboard && <Dashboard setOpenModalDashboard={setOpenModalDashboard} filteredStudents={filteredStudentsForDashboard} filteredTeachers={filteredTeachers} user={user} />}
            <div className="flex justify-around items-center gap-4 w-full pt-3">
                <div className='flex sm:flex-col lg:flex-row items-center gap-3'>
                    <button onClick={() => { setCurrentEditUser(filteredCurrentUser), setOpenEditModal(true) }} className='bg-blue-500 rounded-lg p-1.5 px-3 sm:p-2 sm:px-11 text-white font-bold flex items-center w-fit gap-2 shadow-lg'>
                        <BiEditAlt className='text-xl' /><span className='hidden sm:flex'>עריכה</span>
                    </button>
                    <button onClick={() => setOpenRegisterModal(true)} className="flex items-center gap-2  text-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 font-bold text-white shadow-md hover:shadow-lg transition-shadow duration-300" >
                        <FaUserPlus className=" text-lg" /> <span className="hidden sm:inline">הוסף משתמש</span>
                    </button>
                    <button onClick={() => setOpenModalDashboard(true)} className='bg-green-500 rounded-lg p-1.5 px-3 sm:p-2 sm:px-9 text-white font-bold flex items-center w-fit gap-2 shadow-lg'>
                        <span className="hidden sm:inline">דאשבורד</span> <RxDashboard className='text-xl' />
                    </button>
                </div>
                <div className="flex items-center gap-5 sm:gap-3">
                    <p className="flex items-center gap-2 sm:text-lg font-bold text-gray-800"> {filteredCurrentUser?.displayName }  <span className="hidden sm:flex text-gray-500 font-bold"> , <Greeting /></span></p>
                    <button onClick={async () => {
                        if (window.confirm("האם אתה בטוח שברצונך להתנתק?")) {
                            try {
                                await signOut(auth);
                                window.location.replace('/')
                            }
                            catch (error) {
                                alert("שגיאה")
                            }
                        }
                    }} className='text-lg sm:text-xl  text-red-600'> <FaSignOutAlt />
                    </button>
                </div>
            </div>

            <p className='text-center font-bold text-xl py-6'>רשימת מ"מ</p>
            <table dir='rtl' className="table-auto w-[98%] sm:w-[95%] max-w-[1500px] divide-gray-200 shadow-md ">
                <thead className="bg-gray-50">
                    <tr>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">שם</th>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">מחלקה</th>
                        <th className=" text-center py-3 pe-2 text-[15px] font-medium text-gray-500 uppercase tracking-wider">עריכה/מחיקה</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMM.map(account => (
                        <tr key={account.uid}>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.displayName}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.departments}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap flex justify-center text-xl gap-3 ">
                                <BiEditAlt onClick={() => {
                                    setCurrentEditUser(account)
                                    setOpenEditModal(true)
                                }} className='text-blue-400 cursor-pointer' />
                                <BsTrash onClick={() => window.confirm("האם אתה בטוח?") && deleteAdmin(account.uid)} className='text-red-500 cursor-pointer' />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className='text-center font-bold text-xl py-5'>רשימת בתי ספר</p>
            {schools.map((school, index) => (
                <div key={index} className='mb-5 w-[95%] max-w-[1000px]'>
                    {/* School Row */}
                    <div
                        className='flex flex-col justify-center gap-2 items-center w-full cursor-pointer bg-gray-200 p-3 rounded-md shadow-md'
                        onClick={() => handleToggleSchool(school)}
                    >
                        <span className='text-lg font-bold'>{school} {getTeachersCount(school)}</span>
                        <span className='text-lg font-bold'><IoArrowDown /></span>
                    </div>

                    {/* Teachers Table - Expand/Collapse */}
                    {expandedSchool === school && (
                        <div className='overflow-hidden transition-all ease-in-out duration-500'>
                            <table dir='rtl' className="table-auto w-[98%] sm:w-[95%] max-w-[1500px] divide-y divide-gray-200 shadow-md mt-3">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-center py-3 text-[15px] font-medium text-gray-500 uppercase tracking-wider">שם</th>
                                        <th className="text-center py-3 text-[15px] font-medium text-gray-500 uppercase tracking-wider">ת.ז</th>
                                        <th className="text-center py-3 text-[15px] font-medium text-gray-500 uppercase tracking-wider">עריכה\מחיקה</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTeachers?.filter(account => account.school === school).map(account => (
                                        <tr key={account.uid}>
                                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.displayName}</td>
                                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.userId}</td>
                                            <td className="text-center text-[14px] py-4 whitespace-nowrap flex justify-center text-xl gap-3 ">
                                                <BiEditAlt onClick={() => {
                                                    setCurrentEditUser(account);
                                                    setOpenEditModal(true);
                                                }} className='text-blue-400 cursor-pointer' />
                                                <BsTrash onClick={async () => {
                                                    window.confirm("האם אתה בטוח?") && deleteAdmin(account.uid);
                                                }} className='text-red-500 cursor-pointer' />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
            <div className='w-full space-y-3'>
                <div className='w-full flex flex-col items-center justify-around gap-3'>
                    <p className='text-center font-bold text-xl py-4'>רשימת תלמידים</p>
                    <div className="flex flex-col sm:flex-row gap-8">
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
                    </div>
                </div>
                <div className='flex flex-col sm:flex-row items-center justify-around w-full py-2 gap-4'>
                    <p className='text-lg font-bold'>סה"כ תלמידים: {filteredStudents?.length || 0}</p>
                    <input dir='rtl'
                        onChange={handleSearchChange}
                        value={studentSearch}
                        className="ps-2 pe-2 block w-[50%] max-w-[320px] rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        placeholder='חפש תלמיד . . .'
                        type="search"
                    />
                </div>
            </div>
            <table dir='rtl' className="table-auto w-[98%] sm:w-[95%] max-w-[1500px] divide-y divide-gray-200 shadow-md mb-20">
                <thead className="bg-gray-50">
                    <tr>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">שם</th>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">מחלקה</th>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">ת.ז</th>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">קבע שיעור</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map(account => (
                        <tr onClick={() => { setOpenModalStudentData(true), setUserData(account) }} className={`cursor-pointer ${account.newStatus && account.newStatus === "expelled" ? 'bg-red-300' : account.newStatus === "finished successfully" ? 'bg-green-300' : 'hover:bg-gray-200'}`} key={account.uid}>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.displayName}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.departments}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.userId}</td>
                            <td className="text-center text-xl py-4 whitespace-nowrap"><MdOutlineAddToPhotos onClick={() => { setOpenModalAddLesson(true), setUserData(account); }} className='text-green-500 cursor-pointer inline-block' /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default SuperAdmin;
