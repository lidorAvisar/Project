import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { addLesson, getPracticalDriving, updateAccount } from '../firebase/firebase_config';
import { Loading } from './Loading';

const AddLessonModal = ({ setOpenModalAddLesson, studentDetails, filteredTeachers }) => {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [teacherUid, setTeacherUid] = useState();
    const [shiftAvailability, setShiftAvailability] = useState({ morning: true, noon: true, evening: true });

    const { data: lessons, isLoading, error } = useQuery({
        queryKey: ['practical_driving'],
        queryFn: getPracticalDriving,
    });

    const { mutate: addLessonMutation, isLoading: loading, error: err } = useMutation({
        mutationKey: ["practical_driving"],
        mutationFn: async (lessonData) => {
            const { lessonId, data } = lessonData;
            return await addLesson(lessonId, data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['practical_driving']);
            setOpenModalAddLesson(false);
        }
    });

    const onSubmit = async (data) => {
        data.other = data.other || "";
        data.studentUid = studentDetails.uid;
        data.teacherUid = teacherUid;
        data.student = studentDetails.displayName;
        data.drivingMinutes = null;
        try {
            const lessonId = crypto.randomUUID();
            const lessonData = { lessonId, data }
            addLessonMutation(lessonData);
            updateAccount(studentDetails.uid, { lessonId })

        } catch (error) {
            alert(error);
        }
    };

    const handleTeacherChange = (event) => {
        const selectedTeacher = filteredTeachers.find(account => account.displayName === event.target.value);
        setTeacherUid(selectedTeacher.uid);
    };

    useEffect(() => {
        const checkShiftAvailability = () => {
            const israelTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" });
            const currentHour = new Date(israelTime).getHours();

            if (currentHour >= 0 && currentHour < 12) {
                setShiftAvailability({ morning: true, noon: true, evening: true });
            } else if (currentHour >= 12 && currentHour < 18) {
                setShiftAvailability({ morning: false, noon: true, evening: true });
            } else if (currentHour >= 18 && currentHour < 21) {
                setShiftAvailability({ morning: false, noon: false, evening: true });
            } else {
                setShiftAvailability({ morning: false, noon: false, evening: false });
            }
        };
        checkShiftAvailability(); // Initial check when component mounts

        const intervalId = setInterval(checkShiftAvailability, 60000); // Check every minute

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, []);

    if (isLoading || loading) {
        return <div className='fixed flex justify-center z-50 w-full h-full pb-40 backdrop-blur-md'>
            <Loading />
        </div>
    }

    if (error || err) {
        return <p>{error || err}</p>
    }

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='w-[90%] sm:w-96 bg-slate-100 p-4 py-8 rounded-lg'>
                <div className=" sm:mx-auto sm:w-full sm:max-w-sm">
                    <p className='text-center font-bold text-lg underline'>{studentDetails.displayName}</p>
                    <form dir='rtl' className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="teacher" className="block text-lg font-medium leading-6 text-gray-900">
                                שם מורה:
                            </label>
                            <div className="mt-2">
                                <select
                                    onClick={handleTeacherChange}
                                    className='ps-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                                    name="teacher"
                                    id="teacher"
                                    {...register('teacher', { required: 'This field is required' })}
                                >
                                    <option className value="">בחר מורה . . .</option>
                                    {filteredTeachers?.map(account => (
                                        <option key={account.displayName} value={account.displayName}>{account.displayName}</option>
                                    ))}
                                </select>
                                {errors.teacher && <span className="text-red-500 text-xs">{errors.teacher.message}</span>}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="date" className="text-lg block font-medium leading-6 text-gray-900">
                                תאריך:
                            </label>
                            <div className="mt-2">
                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    autoComplete="off"
                                    {...register('date', { required: 'This field is required' })}
                                    className="ps-2 pe-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    min={today}
                                />
                                {errors.date && <span className="text-red-500 text-xs">{errors.date.message}</span>}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="shift" className="block text-lg font-medium leading-6 text-gray-900">
                                משמרת :
                            </label>
                            <div className="mt-2">
                                <select
                                    className='ps-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                                    name="shift"
                                    id="shift"
                                    {...register('shift', { required: 'This field is required' })}
                                >
                                    <option value="">בחר משמרת . . .</option>
                                    <option value="משמרת בוקר" disabled={!shiftAvailability.morning}>משמרת בוקר</option>
                                    <option value="משמרת צהריים" disabled={!shiftAvailability.noon}>משמרת צהריים</option>
                                    <option value="משמרת ערב" disabled={!shiftAvailability.evening}>משמרת ערב</option>
                                </select>
                                {errors.shift && <span className="text-red-500 text-xs">{errors.shift.message}</span>}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="other" className="text-lg block font-medium leading-6 text-gray-900">
                                אחר:
                            </label>
                            <div className="mt-2">
                                <textarea maxLength={500}
                                    placeholder='הערות . . .'
                                    id="other"
                                    name="other"
                                    type="text"
                                    autoComplete="off"
                                    {...register('other')}
                                    className="ps-2 h-20 pe-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                                {errors.other && <span className="text-red-500 text-xs">{errors.other.message}</span>}
                            </div>
                        </div>
                        <div className='space-y-5'>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                הוספה
                            </button>
                            <button
                                type="button"
                                onClick={() => setOpenModalAddLesson(false)}
                                className="flex w-full justify-center rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                                סגור
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddLessonModal;
