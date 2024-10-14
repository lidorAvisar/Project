import React, { useState } from 'react';
import { BiEditAlt } from "react-icons/bi";
import { FaSignOutAlt } from "react-icons/fa";
import { useQuery } from 'react-query';
import { getAccounts, auth } from '../firebase/firebase_config';
import { EditUserModal } from '../components/EditUserModal';
import { Loading } from '../components/Loading';
import { useCurrentUser } from '../firebase/useCurerntUser';
import { signOut } from 'firebase/auth';
import StatusTable from '../components/StatusTable';
import Greeting from '../components/Greeting';
import ConstractorUserData from '../components/ConstractorUserData';
import DailyDrivingStatus from '../components/DailyDrivingStatus';
import { IoArrowDown } from 'react-icons/io5';



const Contractor = () => {
    const schools = ["שרייבר", "יובלי", "צבאי"]

    const [expandedSchool, setExpandedSchool] = useState(null);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openModalStudentData, setOpenModalStudentData] = useState(false);
    const [openModalStudentsTable, setOpenModalStudentsTable] = useState(false);
    const [openModalDailyDrivingStatus, setOpenModalDailyDrivingStatus] = useState(false);
    const [userData, setUserData] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [user] = useCurrentUser();


    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => await getAccounts(),
    });

    const handleSearchChange = (e) => {
        setStudentSearch(e.target.value);
    };

    const handleToggleSchool = (school) => {
        setExpandedSchool(expandedSchool === school ? null : school);
    };

    const getTeachersCount = (school) => {
        return filteredTeachers?.filter(account => account.school === school).length || 0;
    };

    if (isLoading) return <Loading />;

    if (isError) {
        return <div>{error}</div>;
    }

    const filteredMM = data?.filter(account =>
        account.user === 'מ"מ').sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    const filteredTeachers = data?.filter(account =>
        account.user === "מורה נהיגה").sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    const filteredStudents = data.filter(account =>
        account.user === 'תלמידים').filter(student =>
            student.displayName.includes(studentSearch)
        );


    return (
        <div className="overflow-x-auto flex flex-col items-center md:px-16">
            {openEditModal && <EditUserModal user={user} setOpenEditModal={setOpenEditModal} refetch={refetch} />}
            {openModalStudentData && <ConstractorUserData setOpenModalStudentData={setOpenModalStudentData} studentDetails={userData} refetch={refetch} />}
            {openModalStudentsTable && <StatusTable setOpenModalStudentsTable={setOpenModalStudentsTable} />}
            {openModalDailyDrivingStatus && <DailyDrivingStatus setOpenModalDailyDrivingStatus={setOpenModalDailyDrivingStatus} />}
            <div className="flex justify-around items-center w-full pt-3">
                <div className='flex items-center gap-3'>
                    <button onClick={() => { setOpenEditModal(true) }} className='bg-blue-500 rounded-lg p-1.5 px-3 sm:p-2 sm:px-4 text-white font-bold flex items-center w-fit gap-2 shadow-lg'>
                        <BiEditAlt className='text-2xl' /><span className='hidden sm:flex'>עריכה</span>
                    </button>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <p className="text-lg sm:text-xl font-bold text-gray-800"> {user?.displayName} </p> <span className="hidden sm:block text-gray-500 pt-1 font-bold"><Greeting /></span>
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
                    }} className='text-lg sm:text-xl sm:pt-1 text-red-600'> <FaSignOutAlt />
                    </button>
                </div>
            </div>

            <p className='text-center font-bold text-xl py-6'>רשימת מ"מ</p>
            <table dir='rtl' className="table-auto w-[98%] sm:w-[95%] max-w-[1500px] divide-gray-200 shadow-md ">
                <thead className="bg-gray-50">
                    <tr>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">שם</th>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">מחלקה</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMM.map(account => (
                        <tr key={account.uid}>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.displayName}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.departments}</td>
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
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTeachers?.filter(account => account.school === school).map(account => (
                                        <tr key={account.uid}>
                                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.displayName}</td>
                                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.userId}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
            <div className='w-full flex items-center justify-around gap-3'>
                <div className='flex gap-3'>
                    <button onClick={() => setOpenModalStudentsTable(true)} className='bg-slate-300 p-1 px-2 rounded-md font-bold'>סטטוס תלמידים</button>
                    <button onClick={() => setOpenModalDailyDrivingStatus(true)} className='bg-slate-300 p-1 px-2 rounded-md font-bold'>סטטוס שיעורי נהיגה</button>
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
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">מחלקה</th>
                        <th className=" text-center py-3  text-[15px] font-medium text-gray-500 uppercase tracking-wider">ת.ז</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map(account => (
                        <tr onClick={() => { setOpenModalStudentData(true), setUserData(account) }} className={`cursor-pointer ${account.newStatus && account.newStatus === "expelled" ? 'bg-red-300' : account.newStatus === "finished successfully" ? 'bg-green-300' : 'hover:bg-gray-200'}`} key={account.uid}>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.displayName}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.departments}</td>
                            <td className="text-center text-[14px] py-4 whitespace-nowrap">{account.userId}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Contractor;
