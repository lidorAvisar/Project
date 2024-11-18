import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { TiArrowBack } from 'react-icons/ti';
import TableDriving from './TableDriving';
import { deleteAccount, deleteLessons, getPracticalDriving, storage, updateAccount } from '../firebase/firebase_config';
import Theories from './Theories';
import Tests from './Tests';
import { useMutation, useQuery } from 'react-query';
import { BsTrash } from 'react-icons/bs';
import { BiEditAlt } from 'react-icons/bi';
import { EditUserModal } from './EditUserModal';
import AddFileStudent from './AddFileStudent';
import { Loading } from './Loading';
import { deleteObject, listAll, ref } from 'firebase/storage';
import { GiArchiveRegister } from "react-icons/gi";
import StatusBar from './StatusBar';


const driverType = [
    'נהג בט"ש B',
    'נהג בט"ש C1',
    'נהג ליין משא',
    'נהג משא יח"ש',
]

const StudentData = ({ setOpenModalStudentData, studentDetails, usersRefetch, filteredTeachers }) => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

    const [openEditModal, setOpenEditModal] = useState(false);
    const [nightDriving, setNightDriving] = useState(0);
    const [selectedDriverType, setSelectedDriverType] = useState("");

    const { data, isLoading: lessonsLoading, isError, error } = useQuery({
        queryKey: ['practical_driving'],
        queryFn: getPracticalDriving,
    });

    useEffect(() => {
        if (data && studentDetails) {
            const totalNightDrivingMinutes = data.reduce((total, item) => {
                if (item.studentUid === studentDetails.uid && item.shift === 'משמרת ערב') {
                    return total + (parseInt(item.drivingMinutes, 10) || 0);
                }
                return total;
            }, 0);

            setNightDriving(totalNightDrivingMinutes);
        }
    }, [data, studentDetails, lessonsLoading]);

    const deleteFiles = async (uid) => {
        const listRef = ref(storage, `students/${uid}`);
        try {
            const res = await listAll(listRef);
            const deletePromises = res.items.map(item => deleteObject(item));
            await Promise.all(deletePromises);
        }
        catch (error) {
            alert("הקבצים של אותו תלמיד לא נמחקו")
        }
    };

    const { mutate: deleteMutation, isLoading } = useMutation({
        mutationKey: ['users'],
        mutationFn: async (id) => {
            if (studentDetails.lessons) {
                await deleteLessons(studentDetails.lessons)
            }
            if (studentDetails.uid) {
                await deleteFiles(studentDetails.uid);
            }
            await deleteAccount(id)
        },
        onSuccess: () => {
            usersRefetch()
            setOpenModalStudentData(false)
        },
    });


    const onSubmit = async (data) => {

        try {
            const studentUid = studentDetails.uid;
            await updateAccount(studentUid, data);
            usersRefetch();
            setOpenModalStudentData(false);
        }
        catch (error) {
            alert("שגיאה");
        }
    };

    useEffect(() => {
        const updateNightDriving = async () => {
            if (!studentDetails.nightDriving || studentDetails.nightDriving !== nightDriving) {
                try {
                    await updateAccount(studentDetails.uid, { nightDriving });
                }
                catch (error) {
                    console.log(error);
                }

            }
        };

        updateNightDriving();
    }, [studentDetails, nightDriving]);

    const testsByDriverType = {
        "נהג בט\"ש B": ["hazardousMaterialsScore", "davidCarScore", "jeepCarScore"],
        "נהג בט\"ש C1": [
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
        "נהג משא יח\"ש": ["hazardousMaterialsScore", "cargoSecuringScore"],
    };

    const renderTestField = (fieldId, label) => (
        <div className="mb-4" key={fieldId}>
            <label
                htmlFor={fieldId}
                className="block text-right text-sm font-medium text-gray-700"
            >
                {label}
            </label>
            <input
                type="text"
                id={fieldId}
                defaultValue={studentDetails?.[fieldId] || ""}
                {...register(fieldId)}
                className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-100 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md"
                placeholder="הכנס ציון"
            />
            {errors[fieldId] && (
                <span className="text-red-500 text-sm">
                    {errors[fieldId].message}
                </span>
            )}
        </div>
    );

    // Get the list of tests to show based on selected driver type
    const visibleTests = testsByDriverType[selectedDriverType] || [];

    if (isLoading) {
        return <div className='fixed flex justify-center z-50 w-full h-full  backdrop-blur-md'>
            <Loading />
        </div>
    }


    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='relative w-[98%]  max-w-[1100px]  bg-slate-100 p-4 py-5 mb-10 rounded-lg h-[90%] overflow-y-auto'>
                {openEditModal && <EditUserModal user={studentDetails} usersRefetch={usersRefetch} setOpenEditModal={setOpenEditModal} />}
                <div className='flex flex-col gap-2'>
                    <div dir='rtl' className='flex items-center justify-between  px-5 sm:px-10 space-y-3'>
                        <p className='font-bold  text-xl'>{studentDetails.displayName}</p>
                        <div className='flex gap-3'>
                            <button onClick={() => setOpenModalStudentData(false)} className='bg-green-500 rounded-lg p-1 px-2 sm:px-3 text-white font-bold w-fit flex items-center shadow-lg'>
                                <TiArrowBack className='text-2xl' /><span className='hidden sm:flex'>חזור</span>
                            </button>
                            <button onClick={() => setOpenEditModal(true)} className='bg-blue-500 rounded-lg p-1 px-2 sm:px-3 text-white font-bold flex items-center w-fit gap-2 shadow-lg'>
                                <BiEditAlt className='text-2xl' /><span className='hidden sm:flex'>עריכה</span>
                            </button>
                            <button onClick={() => window.confirm("האם אתה בטוח?") && deleteMutation(studentDetails.uid)} className='bg-red-500 rounded-lg w-fit p-1 px-2 sm:px-3 text-white font-bold flex items-center gap-2 shadow-lg'>
                                <BsTrash className='text-xl' /> <span className='hidden sm:flex'>הסר תלמיד</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div dir='rtl' className='py-1'>
                    <StatusBar studentId={studentDetails.uid} usersRefetch={usersRefetch} studentDetails={studentDetails} />
                </div>
                <div className="flex flex-col items-center w-full">
                    <form onSubmit={handleSubmit(onSubmit)} dir='rtl' className="w-full bg-white rounded-lg overflow-hidden shadow-lg p-2 sm:p-6 mb-20 my-5 space-y-6 max-w-[900px]">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold mb-2 text-right underline">פרטים אישיים</h3>
                            <div className="mb-4">
                                <label htmlFor="fullName" className="block text-right text-sm font-medium text-gray-700">שם מלא:</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    defaultValue={studentDetails?.displayName || ""}
                                    {...register('fullName', { required: "זהו שדה חובה" })}
                                    className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-100 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md"
                                    placeholder="הכנס שם מלא"
                                />
                                {errors.fullName && <span className="text-red-500 text-sm">{errors.fullName.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="idNumber" className="block text-right text-sm font-medium text-gray-700">ת.ז:</label>
                                <input
                                    type="text"
                                    id="idNumber"
                                    defaultValue={studentDetails?.userId || ""}
                                    {...register('idNumber', { required: "זהו שדה חובה" })}
                                    className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-100 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md"
                                    placeholder="הכנס ת.ז"
                                />
                                {errors.idNumber && <span className="text-red-500 text-sm">{errors.idNumber.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="cycle" className="block text-right text-sm font-medium text-gray-700">מחזור:</label>
                                <input
                                    type="text"
                                    id="cycle"
                                    defaultValue={studentDetails?.cycle || ""}
                                    {...register('cycle', { required: "זהו שדה חובה" })}
                                    className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-100 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md"
                                    placeholder="הכנס מחזור"
                                />
                                {errors.cycle && <span className="text-red-500 text-sm">{errors.cycle.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="language" className="block text-right text-sm font-medium text-gray-700">שפה:</label>
                                <input
                                    type="text"
                                    id="language"
                                    defaultValue={studentDetails?.language || ""}
                                    {...register('language', { required: "זהו שדה חובה" })}
                                    className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-100 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md"
                                    placeholder="הכנס שפה"
                                />
                                {errors.language && <span className="text-red-500 text-sm">{errors.language.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-right text-sm font-medium text-gray-700">אם יש רשיון קודם:</label>
                                <div className='flex gap-4'>
                                    <div>
                                        <label htmlFor="previousLicenseYesBManual">B ידני</label>
                                        <input
                                            type="radio"
                                            id="previousLicenseYesBManual"
                                            value="B Manual"
                                            defaultChecked={studentDetails?.previousLicense === "B Manual"}
                                            {...register('previousLicense', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="previousLicenseYesBAuto">B אוטומט</label>
                                        <input
                                            type="radio"
                                            id="previousLicenseYesBAuto"
                                            value="B Auto"
                                            defaultChecked={studentDetails?.previousLicense === "B Auto"}
                                            {...register('previousLicense', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="previousLicenseNo">לא</label>
                                        <input
                                            type="radio"
                                            id="previousLicenseNo"
                                            value="no"
                                            defaultChecked={studentDetails?.previousLicense === "no"}
                                            {...register('previousLicense', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                </div>
                                {errors.previousLicense && <span className="text-red-500 text-sm">{errors.previousLicense.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-right text-sm font-medium text-gray-700">משקפיים:</label>
                                <div className='flex gap-4'>
                                    <div>
                                        <label htmlFor="haveGlasses">כן</label>
                                        <input
                                            type="radio"
                                            id="haveGlasses"
                                            value="yes"
                                            defaultChecked={studentDetails?.glasses === "yes"}
                                            {...register('glasses', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="noGlasses">לא</label>
                                        <input
                                            type="radio"
                                            id="noGlasses"
                                            value="no"
                                            defaultChecked={studentDetails?.glasses === "no"}
                                            {...register('glasses', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                </div>
                                {errors.glasses && <span className="text-red-500 text-sm">{errors.glasses.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="totalDrivingMinutes" className="block text-right text-sm font-medium text-gray-700">סה"כ דקות שבוצעו:</label>
                                <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-100 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md">
                                    {studentDetails?.totalDrivingMinutes || "טרם"}
                                </p>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="nightDriving" className="block text-right text-sm font-medium text-gray-700">
                                    סה"כ דקות נהיגת לילה:
                                </label>
                                <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-100 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md">
                                    {nightDriving}
                                </p>
                            </div>
                        </div>
                        <div className='space-y-5'>
                            <h3 className="text-lg font-bold mb-2 text-right underline">תוכנית למידה</h3>
                            <div className="mb-4">
                                <label
                                    htmlFor="lineTraining"
                                    className="block text-right text-sm font-medium text-gray-700"
                                >
                                    סוג הכשרה:
                                </label>
                                <select
                                    id="lineTraining"
                                    defaultValue={studentDetails?.lineTraining || ''}
                                    {...register("lineTraining", { required: true })}
                                    className="ps-1 font-bold block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    onClick={(e) => setSelectedDriverType(e.target.value)}
                                    onInput={(e) => setSelectedDriverType(e.target.value)}
                                >
                                    <option value="">בחר סוג הכשרה...</option>
                                    {driverType.map((item, i) => (
                                        <option key={i} value={item} className="font-bold">
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-right text-sm font-medium text-gray-700">שיעורי חובה:</label>
                                <div className='flex gap-4'>
                                    <div>
                                        <label htmlFor="mandatoryLessonsYes">כן</label>
                                        <input
                                            type="radio"
                                            id="mandatoryLessonsYes"
                                            value="yes"
                                            defaultChecked={studentDetails?.mandatoryLessons === "yes"}
                                            {...register('mandatoryLessons', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="mandatoryLessonsNo">לא</label>
                                        <input
                                            type="radio"
                                            id="mandatoryLessonsNo"
                                            value="no"
                                            defaultChecked={studentDetails?.mandatoryLessons === "no"}
                                            {...register('mandatoryLessons', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                </div>
                                {errors.mandatoryLessons && <span className="text-red-500 text-sm">{errors.mandatoryLessons.message}</span>}
                            </div>

                            {/* Render Test Fields Dynamically */}
                            {visibleTests.map((fieldId) =>
                                renderTestField(fieldId, {
                                    hazardousMaterialsScore: "מבחן חומ\"ס",
                                    cargoSecuringScore: "מבחן קשירת מטענים",
                                    davidCarScore: "מבחן דויד",
                                    jeepCarScore: "מבחן ג'יפ",
                                    hummerCarScore: "מבחן האמר",
                                    hummerProtectedCarScore: "מבחן האמר ממוגן",
                                    saunaCarScore: "מבחן סאונה",
                                    tigerCarScore: "מבחן טיגריס"
                                }[fieldId])
                            )}
                        </div>
                        {/* <div className='space-y-5'>
                            <h3 className="text-lg font-bold mb-2 text-right underline">סוג רכב</h3>
                            <div className="mb-4">
                                <label htmlFor="carType" className="block text-right text-sm font-medium text-gray-700">סוג רכב:</label>
                                <select
                                    id="carType"
                                    defaultValue={studentDetails?.carType || ""}
                                    {...register('carType')}
                                    className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-100 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md"
                                >
                                    <option className='font-thin' value="">בחר סוג רכב. . .</option>
                                    <option className='font-bold' value="ג'יפ">ג'יפ</option>
                                    <option className='font-bold' value="דוד">דוד</option>
                                    <option className='font-bold' value="האמר">האמר</option>
                                    <option className='font-bold' value="טיגריס">טיגריס</option>
                                    <option className='font-bold' value="האמר ממוגן">האמר ממוגן</option>
                                    <option className='font-bold' value="סאונה">סאונה</option>
                                </select>
                                {errors.carType && <span className="text-red-500 text-sm">{errors.carType.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="carTypeScore" className="block text-right text-sm font-medium text-gray-700">מבחן {studentDetails?.carType}:</label>
                                <input
                                    type="text"
                                    id="carTypeScore"
                                    defaultValue={studentDetails?.carTypeScore || ""}
                                    {...register('carTypeScore')}
                                    className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-100 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md"
                                    placeholder="הכנס ציון"
                                />
                                {errors.carTypeScore && <span className="text-red-500 text-sm">{errors.carTypeScore.message}</span>}
                            </div>
                        </div> */}
                        <div className="flex justify-center">
                            <button type="submit" className="bg-green-500 text-white font-bold py-2 w-64 rounded-lg">
                                עדכן
                            </button>
                        </div>
                    </form>
                    <AddFileStudent studentDetails={studentDetails} />
                    <Theories studentDetails={studentDetails} usersRefetch={usersRefetch} setOpenModalStudentData={setOpenModalStudentData} />
                    <TableDriving studentDetails={studentDetails} filteredTeachers={filteredTeachers} setOpenModalStudentData={setOpenModalStudentData} usersRefetch={usersRefetch} />
                    <Tests studentDetails={studentDetails} usersRefetch={usersRefetch} setOpenModalStudentData={setOpenModalStudentData} />
                    <button
                        onClick={() => setOpenModalStudentData(false)}
                        type="button"
                        className="flex w-full my-3 mt-4 max-w-[450px] justify-center rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                        סגור
                    </button>
                </div>
            </div>
        </div>
    )
}

export default StudentData