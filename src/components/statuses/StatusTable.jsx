import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { getAccounts } from '../../firebase/firebase_config';
import { useCurrentUser } from '../../firebase/useCurerntUser';
import { Loading } from '../other/Loading';
import ToggleSwitches from '../other/ToggleSwitches';
import StudentData from '../student/StudentData';

const StatusTable = ({ setOpenModalStudentsTable }) => {
    const [currentUser] = useCurrentUser();
    const [selectedDepartment, setSelectedDepartment] = useState(['everything']);
    const [selectedCycle, setSelectedCycle] = useState('everything');
    const [passedOnly, setPassedOnly] = useState(false);
    const [openModalStudentData, setOpenModalStudentData] = useState(false);
    const [userData, setUserData] = useState();

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => await getAccounts(),
    });

    useEffect(() => {
        if (currentUser.user === 'מ"מ' && currentUser.departments) {
            setSelectedDepartment([currentUser.departments]);
        } else {
            setSelectedDepartment(['everything']);
        }
    }, [currentUser]);

    const compareHebrew = (a, b) => {
        return a.localeCompare(b, 'he', { sensitivity: 'base' });
    };

    const handleFilterChange = (event) => {
        const value = Array.from(
            event.target.selectedOptions,
            (option) => option.value
        );
        setSelectedDepartment(value);
    };

    const handleFilterChangeCycle = (event) => {
        setSelectedCycle(event.target.value);
    };

    const uniqueCycles = [...new Set(data.filter(student => student.user === "תלמידים").map(student => student.cycle))].sort(compareHebrew);

    const calculateTotalDrivingMinutes = (student) => {
        const practicalDriving = Array.isArray(student.practicalDriving)
            ? student.practicalDriving
            : [];

        const totalMinutes = practicalDriving.reduce((sum, lesson) => {
            return sum + (parseInt(lesson.drivingMinutes, 10) || 0);
        }, 0);

        return totalMinutes;
    }

    const calculateIfPassedSuccessfully = (student) => {
        let license = true;
        let theories = false;
        let test = false;

        if (student.previousLicense === "no") {
            license = false;
        }

        const practicalDriving = Array.isArray(student.practicalDriving)
            ? student.practicalDriving
            : [];

        const totalMinutes = practicalDriving.reduce((sum, lesson) => {
            return sum + (parseInt(lesson.drivingMinutes, 10) || 0);
        }, 0);

        const nightLessons = practicalDriving.filter(
            lesson => lesson.shift === 'משמרת ערב'
        );
        const totalNightDrivingMinutes = nightLessons.reduce((sum, lesson) => {
            return sum + (parseInt(lesson.drivingMinutes, 10) || 0);
        }, 0);

        if (student.detailsTheoryTest &&
            student.detailsTheoryTest.length > 0 &&
            student.detailsTheoryTest.slice(-1)[0].mistakes <= 4) {
            theories = true;
        }

        if (student.tests && student.tests.length > 0 && student.tests.slice(-1)[0].status === "Pass") {
            test = true;
        }

        if (license && totalMinutes >= 800 && totalNightDrivingMinutes >= 40 && theories && test) return true;
        else if (!license && totalMinutes >= 1280 && totalNightDrivingMinutes >= 40 && theories && test) return true;
        else return false;
    };

    const filteredList = data.filter(student =>
        student.user === "תלמידים" &&
        (selectedDepartment.includes('everything') || selectedDepartment.includes(student.departments)) &&
        (selectedCycle === 'everything' || student.cycle === selectedCycle)
    );

    const filteredTeachers = data?.filter(account => account.user === "מורה נהיגה")
        .sort((a, b) => a.displayName.localeCompare(b.displayName, 'he'));


    const filteredStudents = passedOnly
        ? filteredList.filter(calculateIfPassedSuccessfully)
        : filteredList;

    const studentAmount = data.filter(student => student.user === "תלמידים");

    if (isLoading) {
        return <Loading />
    }

    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='w-[100%] max-w-[1200px] bg-slate-100 p-4 mb-5 rounded-lg h-[92%] py-10 overflow-y-auto'>
                {openModalStudentData && <StudentData setOpenModalStudentData={setOpenModalStudentData} studentDetails={userData} usersRefetch={refetch} filteredTeachers={filteredTeachers} />}

                <div className='flex items-center justify-between py-3'>
                    <button onClick={() => setOpenModalStudentsTable(false)} className='bg-red-500 text-white p-0.5 sm:p-1 rounded-md px-5 sm:px-8 font-bold'>סגור</button>
                    <h2 className="text-center text-xl sm:text-2xl font-bold"> {filteredStudents?.length} {filteredStudents?.length != studentAmount?.length && <span>/{studentAmount?.length}</span>}  - סטטוס תלמידים</h2>
                    <h2></h2>
                </div>

                {currentUser.user !== 'מ"מ' && (
                    <div dir='rtl' className='w-full flex flex-col sm:flex-row items-center justify-between gap-5'>
                        <div className='w-full flex flex-col items-center justify-center'>
                            <label htmlFor="departmentFilter" className="font-bold text-sm mb-1 sm:mb-2 text-gray-700">סנן לפי מחלקה:</label>
                            <select
                                id="departmentFilter"
                                multiple
                                value={selectedDepartment}
                                onChange={handleFilterChange}
                                className="rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 w-[75%] sm:w-64"
                            >
                                <option value="everything">הכל</option>
                                {[...Array(12).keys()].map(num => (
                                    <option key={num + 1} value={num + 1}>{`מחלקה ${num + 1}`}</option>
                                ))}
                            </select>
                        </div>

                        <div className='w-full flex flex-col items-center justify-center'>
                            <label htmlFor="cycleFilter" className="font-bold text-sm mb-1 sm:mb-2 text-gray-700">סנן לפי מחזור:</label>
                            <select
                                id="cycleFilter"
                                value={selectedCycle}
                                onChange={handleFilterChangeCycle}
                                className="rounded-lg bg-white border border-gray-300 px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 w-[75%] sm:w-64"
                            >
                                <option value="everything">הכל</option>
                                {uniqueCycles.map((cycle, i) => (
                                    <option key={i} value={cycle}>{`מחזור ${cycle}`}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
                <div className='flex justify-center mt-5'>
                    <div className='w-[85%] max-w-[700px] flex justify-center gap-2 sm:gap-5 bg-slate-300 p-1 pt-2 px-2 rounded-md '>
                        <p className='font-medium sm:font-bold'>הכל</p>
                        <ToggleSwitches setPassedOnly={setPassedOnly} passedOnly={passedOnly} />
                        <p className='font-medium sm:font-bold'>תלמידים שעברו</p>
                    </div>
                </div>
                {filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto py-5 ">
                        <table dir='rtl' className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                            <thead className="sticky top-0 bg-gray-800 z-10">
                                <tr className="bg-gray-800 text-white text-right">
                                    <th className="w-10 py-3 ps-3 px-4 uppercase font-semibold text-sm">#</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">שם</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">מחזור</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">מחלקה</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">מספר זהות</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">סה"כ דקות שבוצעו</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">טסט</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">ביצוע היתר נהיגה</th>
                                    <th className="w-1/12 py-3 px-4 uppercase font-semibold text-sm">מבחן תאוריה</th>
                                    <th className="w-1/12 py-3 px-4 uppercase font-semibold text-sm">רשיון נהיגה</th>
                                    <th className="w-2/12 py-3 px-4 uppercase font-semibold text-sm">שיעורי חובה</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700">
                                {filteredStudents.sort((a, b) => compareHebrew(a.displayName, b.displayName))
                                    .map((student, index) => (
                                        <tr onClick={() => { setUserData(student), setOpenModalStudentData(true) }} key={index} className={`${calculateIfPassedSuccessfully(student) ? 'bg-green-500 text-white' : 'bg-gray-100'} ${student.newStatus && student.newStatus === "expelled" ? 'bg-red-400 text-white' : ''} text-right border-b cursor-pointer`}>
                                            <td className="py-3 ps-3 px-4">{index + 1}</td>
                                            <td className="py-3 px-4">{student.displayName}</td>
                                            <td className="py-3 px-4">{student.cycle}</td>
                                            <td className="py-3 px-4">{student.departments}</td>
                                            <td className="py-3 px-4">{student.userId}</td>
                                            <td className={`py-3 px-4`}>
                                                {calculateTotalDrivingMinutes(student)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {student.tests && student.tests.length > 0 ? (student.tests.slice(-1)[0].status === "Pass" ?
                                                    `עבר/${student.tests.slice(-1)[0].id}` :
                                                    `נכשל/${student.tests.slice(-1)[0].id}`
                                                ) : 'טרם'}
                                            </td>
                                            <td className="py-3 px-4">{student.carType ? student.carType : 'טרם'}</td>
                                            <td className="py-3 px-4">
                                                {student.detailsTheoryTest && student.detailsTheoryTest.length > 0 ? (student.detailsTheoryTest.slice(-1)[0].mistakes <= 4 ?
                                                    `עבר/${student.detailsTheoryTest.slice(-1)[0].testNumber}` :
                                                    `נכשל/${student.detailsTheoryTest.slice(-1)[0].testNumber}`
                                                ) : 'טרם'}
                                            </td>
                                            <td className="py-3 px-4">{student.previousLicense ? student.previousLicense : 'טרם'}</td>
                                            <td className="py-3 px-4">{student.mandatoryLessons ? student.mandatoryLessons : 'טרם'}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className='font-bold text-center text-2xl pt-10'>אין תוצאות</p>
                )}
                <div className='flex justify-center'>
                    <button onClick={() => setOpenModalStudentsTable(false)} className='w-[50%] max-w-96 bg-red-500 text-white p-0.5 sm:p-1 rounded-md px-5 sm:px-8 font-bold'>סגור</button>
                </div>
            </div>
        </div >
    );
};

export default StatusTable;
