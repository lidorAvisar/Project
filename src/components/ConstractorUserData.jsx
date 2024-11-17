import React, { useEffect, useState } from 'react'
import { TiArrowBack } from 'react-icons/ti'
import { useQuery } from 'react-query';
import { getPracticalDriving } from '../firebase/firebase_config';
import { Loading } from './Loading';
import ViewFilesForContractor from './ViewFilesForContractor';
import ViewTheoriesForConstractor from './ViewTheoriesForConstractor';
import ViewTableDriving from './ViewTableDriving';
import ViewTestsContractor from './ViewTestsContractor';

const ConstractorUserData = ({ setOpenModalStudentData, studentDetails }) => {

    const [nightDriving, setNightDriving] = useState(0);

    const { data, isLoading, isError, error } = useQuery({
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
    }, [data, studentDetails, isLoading]);

    if (isLoading) {
        return <div className='fixed flex justify-center z-50 w-full h-full  backdrop-blur-md'>
            <Loading />
        </div>
    }

    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='relative w-[98%]  max-w-[1100px]  bg-slate-100 p-4 py-5 space-y-3 mb-5 rounded-lg h-[90%] overflow-y-auto'>
                <div dir='rtl' className='flex items-center justify-between  px-5 sm:px-10 space-y-3'>
                    <p className='font-bold  text-xl'>{studentDetails.displayName}</p>
                    <div className='flex gap-3'>
                        <button onClick={() => setOpenModalStudentData(false)} className='bg-green-500 rounded-lg p-1 px-2 sm:px-3 text-white font-bold w-fit flex items-center shadow-lg'>
                            <TiArrowBack className='text-2xl' /><span className='hidden sm:flex'>חזור</span>
                        </button>
                    </div>
                </div>
                <div dir='rtl' className="mb-6">
                    <h3 className="text-xl font-bold mb-2 text-center py-5 underline">פרטים אישיים</h3>
                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">שם מלא:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {studentDetails?.displayName || "לא זמין"}
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">ת.ז:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {studentDetails?.userId || "לא זמין"}
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">מחזור:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {studentDetails?.cycle || "לא זמין"}
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="block text-lg font-bold text-gray-700 ">שפה:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {studentDetails?.language || "לא זמין"}
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">אם יש רשיון קודם:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {studentDetails?.previousLicense === "B Manual"
                                ? "B ידני"
                                : studentDetails?.previousLicense === "B Auto"
                                    ? "B אוטומט"
                                    : "לא"}
                        </p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">משקפיים:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {studentDetails?.glasses === "yes" ? "כן" : "לא"}
                        </p>
                    </div>
                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">סה"כ דקות שבוצעו:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {studentDetails?.totalDrivingMinutes || "טרם"}
                        </p>
                    </div>
                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">סה"כ דקות נהיגת לילה:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">
                            {nightDriving || "טרם"}
                        </p>
                    </div>
                </div>

                <div dir='rtl' className='space-y-5'>
                    <p className="text-xl font-bold mb-2 text-center py-5 underline">תוכנית למידה</p>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">סוג הכשרה:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{studentDetails?.lineTraining || 'טרם'}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">שיעורי חובה:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{studentDetails?.mandatoryLessons === "yes" ? "כן" : "לא"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">קשירת מטענים:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{studentDetails?.cargoSecuring === "yes" ? "כן" : "לא"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">מבחן קשירת מטענים:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{studentDetails?.cargoSecuringScore || "לא זמין"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">חומרים מסוכנים:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{studentDetails?.HazardousMaterials === "yes" ? "כן" : "לא"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">מבחן חומ"ס:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{studentDetails?.hazardousMaterialsScore || "לא זמין"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">מסמכי הרכב:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{studentDetails?.vehicleDocuments === "yes" ? "כן" : "לא"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700 ">לומדת בטיחות:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{studentDetails?.safetyModule === "yes" ? "כן" : "לא"}</p>
                    </div>
                </div>

                <div dir='rtl' className='space-y-5'>
                    <p className="text-xl font-bold mb-2 text-center py-5 underline">סוג רכב</p>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700">סוג רכב:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{studentDetails?.carType || "לא נבחר סוג רכב"}</p>
                    </div>

                    <div className="mb-4">
                        <p className="block  text-lg font-bold text-gray-700">מבחן {studentDetails?.carType || "רכב"}:</p>
                        <p className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-200 border-black rounded-md">{studentDetails?.carTypeScore || "לא זמין"}</p>
                    </div>
                </div>

                <ViewFilesForContractor studentDetails={studentDetails} />
                <ViewTheoriesForConstractor studentDetails={studentDetails} />
                <ViewTableDriving studentDetails={studentDetails} drivingLessons={data} />
                <ViewTestsContractor studentDetails={studentDetails} />
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

export default ConstractorUserData