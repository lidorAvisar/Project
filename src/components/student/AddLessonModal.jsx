import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { IoArrowDown } from 'react-icons/io5';
import { addLesson } from '../../firebase/firebase_config';
import { useCurrentUser } from '../../firebase/useCurerntUser';
import { Loading } from '../other/Loading';

const AddLessonModal = ({ setOpenModalAddLesson, studentDetails, filteredTeachers, setOpenModalStudentData, filteredStudents }) => {
    const schools = ["שרייבר", "יובלי", "צבאי"]

    const { register, handleSubmit, formState: { errors } } = useForm();
    const [expandedSchool, setExpandedSchool] = useState(null);
    const [currentUser] = useCurrentUser();
    const queryClient = useQueryClient();
    const [teacherUid, setTeacherUid] = useState(null);


    const { mutate: addLessonMutation, isLoading: loading, error: err } = useMutation({
        mutationKey: ["users"],
        mutationFn: async (lessonData) => {
            return await addLesson(studentDetails.uid, lessonData)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries(['users']);
            { currentUser.user === "מנהל" || currentUser.user === 'מ"פ' && setOpenModalStudentData(false); }
            setOpenModalAddLesson(false);
        }
    });

    const onSubmit = async (data) => {

        if (teacherUid === null) {
            alert('יש לבחור מורה');
            return;
        }

        data.other = data.other || "";
        data.studentUid = studentDetails.uid;
        data.teacherUid = teacherUid;
        data.student = studentDetails.displayName;
        data.drivingMinutes = null;

        // Check if the student is already assigned for this shift on this day
        const existingLesson = filteredStudents.some(student =>
            Array.isArray(student.practicalDriving) &&
            student.practicalDriving.some(lesson =>
                lesson.studentUid === data.studentUid &&
                lesson.date === data.date &&
                lesson.shift === data.shift
            )
        );

        if (existingLesson) {
            alert('התלמיד כבר משובץ למשמרת זו');
            return;
        }

        console.log(data);

        try {
            addLessonMutation(data);

        } catch (error) {
            alert("לא נוסף השיעור");
        }
    };

    const handleToggleSchool = (school) => {
        setExpandedSchool(expandedSchool === school ? null : school);
    };

    const getTeachersCount = (school) => {
        return filteredTeachers?.filter(account => account.school === school).length || 0;
    };

    const handleTeacherChange = (event) => {
        const selectedTeacher = filteredTeachers.find(account => account.displayName === event.target.value);
        setTeacherUid(selectedTeacher.uid);
    };

    if (loading) {
        return <div className='fixed flex justify-center z-50 w-full h-full pb-40 backdrop-blur-md'>
            <Loading />
        </div>
    }

    console.log(teacherUid);


    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='w-[90%] h-[94%] md:w-[50%] bg-slate-200 p-4 py-8 rounded-lg overflow-y-auto'>
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <p className='text-center font-bold text-lg underline'>{studentDetails.displayName}</p>
                    <form dir='rtl' className="space-y-6 py-5" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="teacher" className="block text-lg font-medium leading-6 text-gray-900">
                                שם מורה:
                            </label>
                            <div className="mt-2">
                                {schools.map((school, index) => (
                                    <div key={index} className='mb-5 w-[95%] max-w-[1000px]'>
                                        {/* School Row */}
                                        <div
                                            className='flex flex-col justify-center gap-2 items-center w-full cursor-pointer bg-gray-300 p-1 rounded-md shadow-md'
                                            onClick={() => handleToggleSchool(school)}
                                        >
                                            <span className='text-lg font-bold'>{school} {getTeachersCount(school)}</span>
                                            <span className='text-lg font-bold'><IoArrowDown /></span>
                                        </div>

                                        {/* Teachers Table - Expand/Collapse */}
                                        {expandedSchool === school && (
                                            <div className='overflow-hidden transition-all ease-in-out duration-500'>
                                                <div className='py-3'>
                                                    <select
                                                        onClick={handleTeacherChange}
                                                        onInput={handleTeacherChange}
                                                        className='ps-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                                                        name="teacher"
                                                        id="teacher"
                                                        {...register('teacher', { required: 'This field is required' })}
                                                    >
                                                        <option value="">בחר מורה . . .</option>
                                                        {filteredTeachers?.filter(account => account.school === school).map(account => (
                                                            <option key={account.displayName} value={account.displayName}>{account.displayName}</option>
                                                        ))}
                                                    </select>
                                                    {errors.teacher && <span className="text-red-500 text-xs">{errors.teacher.message}</span>}
                                                </div>

                                                {/* <table dir='rtl' className="table-auto w-[98%] sm:w-[95%] max-w-[1500px] divide-y divide-gray-200 shadow-md mt-3">
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
                                                </table> */}
                                            </div>
                                        )}
                                    </div>
                                ))}
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
                                    <option value="משמרת בוקר">משמרת בוקר</option>
                                    <option value="משמרת צהריים">משמרת צהריים</option>
                                    <option value="משמרת ערב">משמרת ערב</option>
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
                                onClick={() => { setOpenModalAddLesson(false), setOpenModalStudentData(false) }}
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
