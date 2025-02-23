import React, { useEffect, useState } from 'react'
import { TiArrowBack } from 'react-icons/ti'
import ViewFilesForContractor from '../constractor/ViewFilesForContractor'
import ViewTheoriesForConstractor from '../constractor/ViewTheoriesForConstractor'
import ViewTestsContractor from '../constractor/ViewTestsContractor'
import ViewTableDriving from '../constractor/ViewTableDriving'
import { useForm } from 'react-hook-form'
import { useMutation } from 'react-query'
import { updateAccountArchive } from '../../firebase/firebase_config'

const StudentDataArchive = ({ setOpenModalStudentData, userData }) => {
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

    const [nightDriving, setNightDriving] = useState(0);
    const [totalDrivingMinutes, setTotalDrivingMinutes] = useState(0);
    const [openButtonCycle, setOpenButtonCycle] = useState(false);

    const { mutate: cycleUpdate, isLoading } = useMutation({
        mutationKey: ['student_archive'],
        mutationFn: async (data) => {
            await updateAccountArchive(userData.uid, data)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries(['student_archive']);
            setOpenModalStudentData(false)
        },
    });


    useEffect(() => {
        if (userData) {
            const practicalDriving = Array.isArray(userData.practicalDriving)
                ? userData.practicalDriving
                : [];

            const nightLessons = practicalDriving.filter(
                lesson => lesson.shift === 'משמרת ערב'
            );

            const totalMinutes = practicalDriving.reduce((sum, lesson) => {
                return sum + (parseInt(lesson.drivingMinutes, 10) || 0);
            }, 0)

            const totalNightDrivingMinutes = nightLessons.reduce((sum, lesson) => {
                return sum + (parseInt(lesson.drivingMinutes, 10) || 0);
            }, 0);

            setTotalDrivingMinutes(totalMinutes);
            setNightDriving(totalNightDrivingMinutes);
        }
    }, [userData]);

    const onSubmit = (data) => {
        try {
            cycleUpdate(data);
        }
        catch (error) {
            alert("שגיאה");
        }
    };

    return (
        <div className='z-30 fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='relative w-[98%]  max-w-[1100px]  bg-slate-100 p-4 py-5 space-y-3 mb-5 rounded-lg h-[90%] overflow-y-auto'>
                <div dir='rtl' className='flex items-center justify-between  px-2 sm:px-10 space-y-3'>
                    <p className='font-bold pt-2 text-lg'>{userData.displayName}</p>
                    <button onClick={() => setOpenModalStudentData(false)} className='bg-green-500 rounded-lg p-1 px-3 sm:px-4 text-white font-bold  flex items-center shadow-lg'>
                        <TiArrowBack className='text-2xl' /><span>חזור</span>
                    </button>
                </div>
                <div dir='rtl' className="mb-6">
                    <h3 className="text-xl font-bold mb-2 text-center py-5 underline">פרטים אישיים</h3>
                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">שם מלא:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {userData?.displayName || "לא זמין"}
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">ת.ז:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {userData?.userId || "לא זמין"}
                        </p>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <label htmlFor="cycle" className="block text-right text-sm font-medium text-gray-700">מחזור:</label>
                            <input
                                onClick={() => setOpenButtonCycle(true)}
                                onInput={() => setOpenButtonCycle(true)}
                                type="text"
                                id="cycle"
                                defaultValue={userData?.cycle || ""}
                                {...register('cycle', { required: "זהו שדה חובה" })}
                                className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md"
                                placeholder="הכנס מחזור"
                            />
                            {errors.cycle && <span className="text-red-500 text-sm">{errors.cycle.message}</span>}
                        </div>
                        {openButtonCycle && <div className="flex">
                            <button type="submit" className="bg-green-500 text-white font-bold py-0.5 w-24 rounded-lg">
                                {isLoading ? <span className='animate-fade-in'>. . .</span> : <p>עדכן מחזור</p>}
                            </button>
                        </div>}
                    </form>
                    <div className="mb-4">
                        <p className="block text-lg font-bold text-gray-700 ">שפה:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {userData?.language || "לא זמין"}
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">אם יש רשיון קודם:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {userData?.previousLicense === "B"
                                ? "B"
                                : userData?.previousLicense === "motorcycle"
                                    ? "אופנוע"
                                    : "לא"}
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">משקפיים:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {userData?.glasses === "yes" ? "כן" : "לא"}
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">טופס 115:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {userData?.form115 === "yes" ? "כן" : "לא"}
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">סה"כ דקות שבוצעו:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {totalDrivingMinutes}
                        </p>
                    </div>
                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">סה"כ דקות נהיגת לילה:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {nightDriving}
                        </p>
                    </div>
                </div>

                <div dir='rtl' className='space-y-5'>
                    <p className="text-xl font-bold mb-2 text-center py-5 underline">תוכנית למידה</p>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">שיעורי חובה:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{userData?.mandatoryLessons === "yes" ? "כן" : "לא"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">קשירת מטענים:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{userData?.cargoSecuring === "yes" ? "כן" : "לא"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">מבחן קשירת מטענים:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{userData?.cargoSecuringScore || "לא זמין"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">חומרים מסוכנים:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{userData?.HazardousMaterials === "yes" ? "כן" : "לא"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">מבחן חומ"ס:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{userData?.hazardousMaterialsScore || "לא זמין"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">מסמכי הרכב:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{userData?.vehicleDocuments === "yes" ? "כן" : "לא"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">לומדת בטיחות:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{userData?.safetyModule === "yes" ? "כן" : "לא"}</p>
                    </div>
                </div>

                <div dir='rtl' className='space-y-5'>
                    <p className="text-xl font-bold mb-2 text-center py-5 underline">סוג רכב</p>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700">סוג רכב:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{userData?.carType || "לא נבחר סוג רכב"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700">מבחן {userData?.carType || "רכב"}:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{userData?.carTypeScore || "לא זמין"}</p>
                    </div>
                </div>

                <ViewFilesForContractor studentDetails={userData} />
                <ViewTheoriesForConstractor studentDetails={userData} />
                <ViewTableDriving studentDetails={userData} drivingLessons={userData.practicalDriving || []} />
                <ViewTestsContractor studentDetails={userData} />
                <div className='flex justify-center'>
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

export default StudentDataArchive