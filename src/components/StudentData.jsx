import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { TiArrowBack } from 'react-icons/ti';
import TableDriving from './TableDriving';
import { deleteAccount, deleteLessons, storage, updateAccount } from '../firebase/firebase_config';
import Theories from './Theories';
import Tests from './Tests';
import { useMutation } from 'react-query';
import { BsTrash } from 'react-icons/bs';
import { BiEditAlt } from 'react-icons/bi';
import { EditUserModal } from './EditUserModal';
import AddFileStudent from './AddFileStudent';
import { Loading } from './Loading';
import { deleteObject, listAll, ref } from 'firebase/storage';


const StudentData = ({ setOpenModalStudentData, studentDetails, refetch, filteredTeachers }) => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    const [openEditModal, setOpenEditModal] = useState(false);

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
            refetch()
            setOpenModalStudentData(false)
        },
    });


    const onSubmit = async (data) => {
        try {
            const studentUid = studentDetails.uid;
            await updateAccount(studentUid, data);
            refetch();
            setOpenModalStudentData(false);
        }
        catch (error) {
            alert("שגיאה");
        }
    };

    if (isLoading) {
        return <div className='fixed flex justify-center z-50 w-full h-full  backdrop-blur-md'>
            <Loading />
        </div>
    }


    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='relative w-[98%]  max-w-[1100px]  bg-slate-100 p-4 py-5 mb-5 rounded-lg h-[90%] overflow-y-auto'>
                {openEditModal && <EditUserModal user={studentDetails} setOpenEditModal={setOpenEditModal} />}
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
                                        <label htmlFor="previousLicenseYesB">B</label>
                                        <input
                                            type="radio"
                                            id="previousLicenseYesB"
                                            value="B"
                                            defaultChecked={studentDetails?.previousLicense === "B"}
                                            {...register('previousLicense', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="previousLicenseYesMotorcycle">אופנוע</label>
                                        <input
                                            type="radio"
                                            id="previousLicenseYesMotorcycle"
                                            value="motorcycle"
                                            defaultChecked={studentDetails?.previousLicense === "motorcycle"}
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
                                <label className="block text-right text-sm font-medium text-gray-700">טופס 115:</label>
                                <div className='flex gap-4'>
                                    <div>
                                        <label htmlFor="haveForm115">כן</label>
                                        <input
                                            type="radio"
                                            id="haveForm115"
                                            value="yes"
                                            defaultChecked={studentDetails?.form115 === "yes"}
                                            {...register('form115', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="noForm115">לא</label>
                                        <input
                                            type="radio"
                                            id="noForm115"
                                            value="no"
                                            defaultChecked={studentDetails?.form115 === "no"}
                                            {...register('form115', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                </div>
                                {errors.form115 && <span className="text-red-500 text-sm">{errors.form115.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="completeMinutes" className="block text-right text-sm font-medium text-gray-700">סה"כ דקות להשלמה:</label>
                                <input
                                    min={0}
                                    type="number"
                                    id="completeMinutes"
                                    defaultValue={studentDetails?.completeMinutes || ""}
                                    {...register('completeMinutes', { required: "זהו שדה חובה" })}
                                    className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-100 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md"
                                    placeholder="הכנס דקות"
                                />
                                {errors.completeMinutes && <span className="text-red-500 text-sm">{errors.completeMinutes.message}</span>}
                            </div>
                        </div>

                        <div className='space-y-5'>
                            <h3 className="text-lg font-bold mb-2 text-right underline">תוכנית למידה</h3>
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
                            <div className="mb-4">
                                <label htmlFor="mandatoryLessonsScore" className="block text-right text-sm font-medium text-gray-700">מבחן שיעורי חובה:</label>
                                <input
                                    type="text"
                                    id="mandatoryLessonsScore"
                                    defaultValue={studentDetails?.mandatoryLessonsScore || ""}
                                    {...register('mandatoryLessonsScore')}
                                    className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-100 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md"
                                    placeholder="הכנס ציון"
                                />
                                {errors.mandatoryLessonsScore && <span className="text-red-500 text-sm">{errors.mandatoryLessonsScore.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-right text-sm font-medium text-gray-700">קשירת מטענים:</label>
                                <div className='flex gap-4'>
                                    <div>
                                        <label htmlFor="cargoSecuringYes">כן</label>
                                        <input
                                            type="radio"
                                            id="cargoSecuringYes"
                                            value="yes"
                                            defaultChecked={studentDetails?.cargoSecuring === "yes"}
                                            {...register('cargoSecuring', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="cargoSecuringNo">לא</label>
                                        <input
                                            type="radio"
                                            id="cargoSecuringNo"
                                            value="no"
                                            defaultChecked={studentDetails?.cargoSecuring === "no"}
                                            {...register('cargoSecuring', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                </div>
                                {errors.cargoSecuring && <span className="text-red-500 text-sm">{errors.cargoSecuring.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="cargoSecuringScore" className="block text-right text-sm font-medium text-gray-700">מבחן קשירת מטענים:</label>
                                <input
                                    type="text"
                                    id="cargoSecuringScore"
                                    defaultValue={studentDetails?.cargoSecuringScore || ""}
                                    {...register('cargoSecuringScore')}
                                    className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-100 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md"
                                    placeholder="הכנס ציון"
                                />
                                {errors.cargoSecuringScore && <span className="text-red-500 text-sm">{errors.cargoSecuringScore.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-right text-sm font-medium text-gray-700">חומרים מסוכנים:</label>
                                <div className='flex gap-4'>
                                    <div>
                                        <label htmlFor="HazardousMaterialsYes">כן</label>
                                        <input
                                            type="radio"
                                            id="HazardousMaterialsYes"
                                            value="yes"
                                            defaultChecked={studentDetails?.HazardousMaterials === "yes"}
                                            {...register('HazardousMaterials', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="HazardousMaterialsNo">לא</label>
                                        <input
                                            type="radio"
                                            id="HazardousMaterialsNo"
                                            value="no"
                                            defaultChecked={studentDetails?.HazardousMaterials === "no"}
                                            {...register('HazardousMaterials', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                </div>
                                {errors.HazardousMaterials && <span className="text-red-500 text-sm">{errors.HazardousMaterials.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-right text-sm font-medium text-gray-700">מסמכי הרכב:</label>
                                <div className='flex gap-4'>
                                    <div>
                                        <label htmlFor="vehicleDocumentsYes">כן</label>
                                        <input
                                            type="radio"
                                            id="vehicleDocumentsYes"
                                            value="yes"
                                            defaultChecked={studentDetails?.vehicleDocuments === "yes"}
                                            {...register('vehicleDocuments', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="vehicleDocumentsNo">לא</label>
                                        <input
                                            type="radio"
                                            id="vehicleDocumentsNo"
                                            value="no"
                                            defaultChecked={studentDetails?.vehicleDocuments === "no"}
                                            {...register('vehicleDocuments', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                </div>
                                {errors.vehicleDocuments && <span className="text-red-500 text-sm">{errors.vehicleDocuments.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label className="block text-right text-sm font-medium text-gray-700">לומדת בטיחות:</label>
                                <div className='flex gap-4'>
                                    <div>
                                        <label htmlFor="safetyModuleYes">כן</label>
                                        <input
                                            type="radio"
                                            id="safetyModuleYes"
                                            value="yes"
                                            defaultChecked={studentDetails?.safetyModule === "yes"}
                                            {...register('safetyModule', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="safetyModuleNo">לא</label>
                                        <input
                                            type="radio"
                                            id="safetyModuleNo"
                                            value="no"
                                            defaultChecked={studentDetails?.safetyModule === "no"}
                                            {...register('safetyModule', { required: "זהו שדה חובה" })}
                                        />
                                    </div>
                                </div>
                                {errors.safetyModule && <span className="text-red-500 text-sm">{errors.safetyModule.message}</span>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="safetyModuleScore" className="block text-right text-sm font-medium text-gray-700">מבחן לומדת בטיחות:</label>
                                <input
                                    type="text"
                                    id="safetyModuleScore"
                                    defaultValue={studentDetails?.safetyModuleScore || ""}
                                    {...register('safetyModuleScore')}
                                    className="mt-1 block w-full px-2 py-1.5 text-gray-900 bg-gray-100 focus:outline-none focus:ring-0 focus:border-indigo-500 border-black rounded-md"
                                    placeholder="הכנס ציון"
                                />
                                {errors.safetyModuleScore && <span className="text-red-500 text-sm">{errors.safetyModuleScore.message}</span>}
                            </div>
                        </div>

                        <div className='space-y-5'>
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
                                </select>
                                {errors.carType && <span className="text-red-500 text-sm">{errors.carType.message}</span>}
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <button type="submit" className="bg-green-500 text-white font-bold py-2 w-64 rounded-lg">
                                עדכן
                            </button>
                        </div>
                    </form>
                    <AddFileStudent studentDetails={studentDetails} />
                    <Theories studentDetails={studentDetails} refetch={refetch} setOpenModalStudentData={setOpenModalStudentData} />
                    <TableDriving studentDetails={studentDetails} filteredTeachers={filteredTeachers} setOpenModalStudentData={setOpenModalStudentData} />
                    <Tests studentDetails={studentDetails} refetch={refetch} setOpenModalStudentData={setOpenModalStudentData} />
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