import React, { useEffect, useState } from 'react';
import { BiEditAlt } from "react-icons/bi";
import { BsTrash } from "react-icons/bs";
import { FaSignOutAlt } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa6";
import RegisterModal from '../components/RegisterModal';
import { useMutation, useQuery } from 'react-query';
import { getAccounts, deleteAccount, auth, deleteLessons } from '../firebase/firebase_config';
import { EditUserModal } from '../components/EditUserModal';
import { Loading } from '../components/Loading';
import { useCurrentUser } from '../firebase/useCurerntUser';
import { signOut } from 'firebase/auth';
import StudentData from '../components/StudentData';
import StatusTable from '../components/StatusTable';
import Greeting from '../components/Greeting';
import { MdOutlineAddToPhotos } from 'react-icons/md';
import AddLessonModal from '../components/AddLessonModal';
import DailyDrivingStatus from '../components/DailyDrivingStatus';
import { GiArchiveRegister } from 'react-icons/gi';
import ArchiveByCycle from '../components/ArchiveByCycle';
import MoveToArchive from '../components/MoveToArchive';
import { IoArrowDown } from "react-icons/io5";




const SuperSuperAdmin = () => {
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
    const [openModalArchiveByCycle, setOpenModalArchiveByCycle] = useState(false);
    const [filteredCurrentUser, setFilteredCurrentUser] = useState('')
    const [openModalMoveToArchive, setOpenModalMoveToArchive] = useState(false);
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
    })

    const handleToggleSchool = (school) => {
        setExpandedSchool(expandedSchool === school ? null : school);
    };

    const getTeachersCount = (school) => {
        return filteredTeachers?.filter(account => account.school === school).length || 0;
    };

    const handleSearchChange = (e) => {
        setStudentSearch(e.target.value);
    };

    const filteredStudents = data?.filter(account =>
        account.user === "תלמידים" &&
        account.displayName.toLowerCase().includes(studentSearch.toLowerCase())
    ).sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    const filteredTeachers = data
        ?.filter(account => account.user === "מורה נהיגה")
        .sort((a, b) => a.displayName.localeCompare(b.displayName, 'he'));


    useEffect(() => {
        if (data) {
            const filteredUsers = data.filter(users => users.uid === user.uid);
            const filterCurrentUser = filteredUsers.length > 0 ? filteredUsers[0] : null;
            setFilteredCurrentUser(filterCurrentUser);
        }
    }, [data, openEditModal]);


    if (isLoading) return <Loading />

    if (isError) {
        return <div>{error}</div>
    }

    const sortedData = data?.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log(filteredTeachers);
    
    return (
        <div className="overflow-x-auto flex flex-col items-center md:px-16">
            {openRegisterModal && <RegisterModal setOpenRegisterModal={setOpenRegisterModal} />}
            {openEditModal && <EditUserModal user={currentEditUser} setOpenEditModal={setOpenEditModal} refetch={refetch} />}
            {openModalStudentData && <StudentData setOpenModalStudentData={setOpenModalStudentData} studentDetails={userData} usersRefetch={refetch} filteredTeachers={filteredTeachers} />}
            {openModalStudentsTable && <StatusTable setOpenModalStudentsTable={setOpenModalStudentsTable} />}
            {openModalDailyDrivingStatus && <DailyDrivingStatus setOpenModalDailyDrivingStatus={setOpenModalDailyDrivingStatus} />}
            {openModalAddLesson && <AddLessonModal setOpenModalAddLesson={setOpenModalAddLesson} studentDetails={userData} filteredTeachers={filteredTeachers} refetch={refetch} setOpenModalStudentData={setOpenModalStudentData} />}
            {openModalArchiveByCycle && <ArchiveByCycle setOpenModalArchiveByCycle={setOpenModalArchiveByCycle} />}
            {openModalMoveToArchive && <MoveToArchive setOpenModalMoveToArchive={setOpenModalMoveToArchive} />}
            <div dir='rtl' className="container flex flex-col gap-3 justify-around items-center pt-3">
                <div className='w-full px-5 flex items-center justify-between'>
                    <p dir='ltr' className="flex items-center gap-1 sm:text-xl font-bold text-gray-800"> {filteredCurrentUser?.displayName}  <span className=" text-gray-500 font-bold"><Greeting /></span> </p>
                    <div className='flex flex-col items-center'>
                        <div dir='ltr' className="flex flex-col sm:flex-row items-center ">
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
                            }} className='flex items-center gap-2 sm:text-lg  text-red-500'><FaSignOutAlt className='mt-1' /><p className='font-bold'>התנתק</p>
                            </button>
                            <button dir='ltr' onClick={() => { setCurrentEditUser(filteredCurrentUser), setOpenEditModal(true) }} className=' rounded-lg p-1.5 px-3 sm:p-2 sm:px-4 text-blue-500 font-bold flex items-center w-fit gap-2'>
                                <BiEditAlt className='text-2xl' /><span>עריכה</span>
                            </button>
                        </div>
                        <div>
                            <button onClick={() => setOpenModalArchiveByCycle(true)} className='rounded-lg w-fit p-1 px-2 sm:px-3 text-gray-500 font-bold flex items-center gap-2'>
                                <span>ארכיון</span> <GiArchiveRegister className='text-xl' />
                            </button>
                        </div>
                    </div>
                </div>
                <button onClick={() => setOpenRegisterModal(true)} className="flex items-center gap-2 text-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 font-bold text-white shadow-md hover:shadow-lg transition-shadow duration-300" > <FaUserPlus className=" text-lg" /> <span className="hidden sm:inline">הוסף משתמש</span></button>
            </div>

            <p className='text-center font-bold text-xl py-6'>רשימת מ"פ</p>
            <table dir='rtl' className="table-auto w-[98%] sm:w-[95%] max-w-[1500px] divide-gray-200 shadow-md ">
                <thead className="bg-gray-50">
                    <tr>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">שם</th>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">ת.ז</th>
                        <th className=" text-center py-3 pe-2 text-[15px] font-medium text-gray-500 uppercase tracking-wider">עריכה/מחיקה</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData?.filter(account => account.user === 'מ"פ').map(account => (
                        <tr key={account.uid}>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.displayName}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.userId}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap flex justify-center text-xl gap-3 "><BiEditAlt onClick={() => {
                                setCurrentEditUser(account)
                                setOpenEditModal(true)
                            }} className='text-blue-400 cursor-pointer' /> <BsTrash onClick={() => window.confirm("האם אתה בטוח?") && deleteAdmin(account.uid)} className='text-red-500 cursor-pointer' />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className='text-center font-bold text-xl py-6'>רשימת קבלנים</p>
            <table dir='rtl' className="table-auto w-[98%] sm:w-[95%] max-w-[1500px] divide-gray-200 shadow-md ">
                <thead className="bg-gray-50">
                    <tr>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">שם</th>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">ת.ז</th>
                        <th className=" text-center py-3 pe-2 text-[15px] font-medium text-gray-500 uppercase tracking-wider">עריכה/מחיקה</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData?.filter(account => account.user === 'קבלן').map(account => (
                        <tr key={account.uid}>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.displayName}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.userId}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap flex justify-center text-xl gap-3 "><BiEditAlt onClick={() => {
                                setCurrentEditUser(account)
                                setOpenEditModal(true)
                            }} className='text-blue-400 cursor-pointer' /> <BsTrash onClick={() => window.confirm("האם אתה בטוח?") && deleteAdmin(account.uid)} className='text-red-500 cursor-pointer' />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
                    {sortedData?.filter(account => account.user === 'מ"מ').map(account => (
                        <tr key={account.uid}>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.displayName}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.departments}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap flex justify-center text-xl gap-3 "><BiEditAlt onClick={() => {
                                setCurrentEditUser(account)
                                setOpenEditModal(true)
                            }} className='text-blue-400 cursor-pointer' /> <BsTrash onClick={() => window.confirm("האם אתה בטוח?") && deleteAdmin(account.uid)} className='text-red-500 cursor-pointer' />
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
            <div className='w-full flex items-center justify-around gap-3 py-5'>
                <div className='flex flex-col gap-3'>
                    <div className='flex gap-3'>
                        <button onClick={() => setOpenModalStudentsTable(true)} className='bg-slate-300 p-1 px-2 rounded-md font-bold'>סטטוס תלמידים</button>
                        <button onClick={() => setOpenModalDailyDrivingStatus(true)} className='bg-slate-300 p-1 px-2 rounded-md font-bold'>סטטוס שיעורי נהיגה</button>
                    </div>
                    <div className='flex justify-center'>
                        <button onClick={() => setOpenModalMoveToArchive(true)} className='bg-slate-300 rounded-lg w-fit p-1 px-2 sm:px-3 font-bold flex items-center gap-2'>
                            <GiArchiveRegister className='text-xl' /> <span>העבר לארכיון</span>
                        </button>
                    </div>
                </div>
                <p className='text-center font-bold text-xl py-5'>רשימת תלמידים</p>
            </div>
            <div className='flex items-center justify-around w-full py-2'>
                <input dir='rtl'
                    onChange={handleSearchChange}
                    value={studentSearch}
                    className="ps-2 pe-2 block w-[50%] max-w-[320px] rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder='חפש תלמיד . . .'
                    type="search"
                />
                <p className='text-lg font-bold'>סה"כ תלמידים: {filteredStudents?.length || 0}</p>
            </div>
            <table dir='rtl' className="table-auto w-[98%] sm:w-[95%] max-w-[1500px] divide-y divide-gray-200 shadow-md mb-20">
                <thead className="bg-gray-50">
                    <tr>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">שם</th>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">ת.ז</th>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">מחלקה</th>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">קבע שיעור</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents?.map(account => (
                        <tr onClick={() => { setOpenModalStudentData(true), setUserData(account) }} className={`cursor-pointer ${account.newStatus && account.newStatus === "expelled" ? 'bg-red-300' : account.newStatus === "finished successfully" ? 'bg-green-300' : 'hover:bg-gray-200'}`} key={account.uid}>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.displayName}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.userId}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.departments}</td>
                            <td className="text-center text-xl py-4 whitespace-nowrap"><MdOutlineAddToPhotos onClick={() => { setOpenModalAddLesson(true), setUserData(account); }} className='text-green-500 cursor-pointer inline-block' /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default SuperSuperAdmin