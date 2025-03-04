import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BsTrash } from 'react-icons/bs';
import { useMutation, useQueryClient } from 'react-query';
import { deleteLesson, updateLesson } from '../../firebase/firebase_config';
import { Loading } from '../other/Loading';
import { useCurrentUser } from '../../firebase/useCurerntUser';
import toast from 'react-hot-toast';

const SHIFT_LIMITS = {
    'משמרת בוקר': 240,
    'משמרת צהריים': 300,
    'משמרת ערב': 150,
};


const TableDriving = ({ studentDetails, setOpenModalStudentData, studentShift, usersRefetch, filteredTeachers }) => {
    const { register, handleSubmit, formState: { errors }, setValue, setError } = useForm();
    const [currentUser] = useCurrentUser();
    const today = new Date().toISOString().split('T')[0];

    const [totalDrivingMinutes, setTotalDrivingMinutes] = useState(0);
    const [filteredData, setFilteredData] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [completeMinutes, setCompleteMinutes] = useState(null);
    const [isShiftOver, setIsShiftOver] = useState(false);

    const queryClient = useQueryClient();

    const { mutateAsync: updateStudentAccount, isLoading } = useMutation({
        mutationKey: ['users'],
        mutationFn: async (updateData) => {
            return await updateLesson(studentDetails.uid, updateData);
        },
    });

    const { mutateAsync: handleDeleteLesson, isLoading: deleteLoading } = useMutation({
        mutationKey: ['users'],
        mutationFn: async (lessonId) => {
            return await deleteLesson(studentDetails.uid, lessonId);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries(['users']);
            setOpenModalStudentData(false);
        }
    });

    const handleExpand = (index) => {
        setIsExpanded(index);
    };

    const handleClose = () => {
        setIsExpanded(false);
    };

    useEffect(() => {
        if (studentDetails?.practicalDriving) {
            let studentClasses = studentDetails.practicalDriving
                .sort((a, b) => {
                    // Sort by date in descending order
                    const dateComparison = new Date(b.date) - new Date(a.date);

                    if (dateComparison !== 0) {
                        return dateComparison;
                    }

                    // If dates are the same, sort by shift order: morning, noon, evening
                    const shiftOrder = ['משמרת בוקר', 'משמרת צהריים', 'משמרת ערב'];
                    return shiftOrder.indexOf(a.shift) - shiftOrder.indexOf(b.shift);
                });

            // Additional filtering for "מורה נהיגה" based on shift and today's date
            if (currentUser.user === "מורה נהיגה") {
                studentClasses = studentClasses.filter(item =>
                    item.shift === (studentShift === 'morning' ? 'משמרת בוקר' :
                        studentShift === 'noon' ? 'משמרת צהריים' : 'משמרת ערב')
                    && item.date === today
                );
            }

            // Map through studentClasses and add teacherUid
            const updatedStudentClasses = studentClasses.map(item => {
                const teacher = filteredTeachers?.find(teacher => teacher.uid === item.teacherUid);
                return {
                    ...item,
                    date: item.date || '',
                    drivingMinutes: item.drivingMinutes || '',
                    other: item.other || '',
                    teacher: item.teacher || '',
                    teacherUid: teacher ? teacher.uid : '',
                    shift: item.shift || '',
                    uid: item.uid
                };
            });

            setFilteredData(updatedStudentClasses);

            // Update form values with setValue
            updatedStudentClasses.forEach((item, index) => {
                setValue(`data[${index}].date`, item.date);
                setValue(`data[${index}].drivingMinutes`, item.drivingMinutes);
                setValue(`data[${index}].other`, item.other);
                setValue(`data[${index}].teacher`, item.teacher);
                setValue(`data[${index}].teacherUid`, item.teacherUid);
                setValue(`data[${index}].shift`, item.shift);
                setValue(`data[${index}].uid`, item.uid);
            });
        }
    }, [studentDetails, setValue, today, studentShift, currentUser, filteredTeachers]);


    useEffect(() => {
        if (studentDetails?.previousLicense && studentDetails.previousLicense !== "no") {
            setCompleteMinutes(800);
        }
        else {
            setCompleteMinutes(1280);
        }
    }, [studentDetails]);

    useEffect(() => {
        const checkShiftStatus = () => {
            const now = new Date();
            const options = { timeZone: "Asia/Jerusalem", hour: "numeric", hour12: false };
            const formatter = new Intl.DateTimeFormat("en-US", options);
            const currentHours = parseInt(formatter.format(now), 10);

            // Define shift start and end times
            const shifts = {
                morning: { start: 6, end: 12 },  // Morning: 06:00 - 12:00
                noon: { start: 12, end: 18 },    // Noon: 12:00 - 18:00
                evening: { start: 18, end: 21 }, // Evening: 18:00 - 21:00
            };

            // Get current shift time range
            const currentShift = shifts[studentShift];

            if (!currentShift) return;

            // Check if current time is outside the allowed range
            if (currentHours < currentShift.start || currentHours >= currentShift.end) {
                setIsShiftOver(true);  // Disable input
            } else {
                setIsShiftOver(false); // Enable input
            }
        };

        const intervalId = setInterval(checkShiftStatus, 1000);

        return () => clearInterval(intervalId);
    }, [studentShift]);

    useEffect(() => {
        if (studentDetails) {
            const practicalDriving = Array.isArray(studentDetails.practicalDriving)
                ? studentDetails.practicalDriving
                : [];

            const totalMinutes = practicalDriving.reduce((sum, lesson) => {
                return sum + (parseInt(lesson.drivingMinutes, 10) || 0);
            }, 0)

            setTotalDrivingMinutes(totalMinutes);
        }
    }, [studentDetails]);


    const validateShiftLimits = (formData) => {
        let savedShiftMinutes = JSON.parse(localStorage.getItem('totalShiftMinutes')) || {};
        const errors = {}; // To collect errors

        // Iterate over each lesson in form data
        for (const lesson of formData.data) {
            const date = lesson.date;  // Assuming lesson.date contains the date of the lesson
            const shift = lesson.shift;
            const studentName = studentDetails.displayName;
            const newMinutes = parseInt(lesson.drivingMinutes, 10) || 0;

            // Ensure the date exists in savedShiftMinutes
            if (!savedShiftMinutes) {
                savedShiftMinutes = {
                    'משמרת בוקר': { totalMinutes: 0, students: {} },
                    'משמרת צהריים': { totalMinutes: 0, students: {} },
                    'משמרת ערב': { totalMinutes: 0, students: {} }
                };
            }

            // Retrieve existing shift data
            const shiftData = savedShiftMinutes[shift];
            const existingStudentMinutes = shiftData.students[studentName] || 0;

            // Calculate the new total minutes
            const updatedTotalMinutes = shiftData.totalMinutes - existingStudentMinutes + newMinutes;

            // Check if the total shift minutes exceed the limit
            if (updatedTotalMinutes > SHIFT_LIMITS[shift]) {
                errors[`${date} - ${shift}`] = `הגעת למגבלה של ${SHIFT_LIMITS[shift]} דקות עבור ${shift} בתאריך ${date}`;
                console.log("Shift limit exceeded:", errors);

                return errors; // Stop further processing and return the error
            }

            // If no errors, update the total shift minutes and the student's minutes
            shiftData.totalMinutes = updatedTotalMinutes;
            shiftData.students[studentName] = newMinutes;

            // Save the updated shift data for the specific date and shift
            savedShiftMinutes[shift] = shiftData;
        }

        localStorage.setItem('totalShiftMinutes', JSON.stringify(savedShiftMinutes));

        return errors;
    };

    const onSubmit = async (formData) => {

        if (currentUser.user === "מורה נהיגה") {
            const confirmation = window.confirm('האם אתה בטוח במספר הדקות?');
            if (!confirmation) {
                return;
            }
            const errors = validateShiftLimits(formData);
            if (Object.keys(errors).length > 0) {
                alert(JSON.stringify(errors, null, 2));
                return;
            }
        }
        try {
            await updateStudentAccount(formData.data);
            toast.success("!עודכן בהצלחה", { duration: 5000 })
            const updatedData = await usersRefetch();
            if (updatedData.data) {
                setOpenModalStudentData(false);
            }
        }
        catch (error) {
            toast.error("שגיאה", { duration: 6000 })
        }
    };

    const handleSetData = (index, field, value) => {
        const updatedData = [...filteredData];
        updatedData[index][field] = value;

        if (field === 'teacher') {
            const teacher = filteredTeachers?.find(teacher => teacher.displayName === value);
            updatedData[index].teacherUid = teacher ? teacher.uid : '';
            setValue(`data[${index}].teacherUid`, updatedData[index].teacherUid);
        }

        setFilteredData(updatedData);
        setValue(`data[${index}].${field}`, value);
    };


    const isTeacher = currentUser?.user === "מורה נהיגה";
    const isAssistant = currentUser?.user === 'מ"מ' || currentUser?.user === 'מ"פ';


    if (isLoading) {
        <div className='fixed flex justify-center z-50 w-full h-full  backdrop-blur-md'>
            <Loading />
        </div>
    }


    return (
        <div className='bg-white w-full p-2 rounded-md shadow-lg'>
            <div className='flex justify-around items-center'>
                <p className='text-center font-bold text-sm underline py-6 text-blue-600'>
                    {studentDetails?.previousLicense === 'B Manual'
                        ? 'ידני B רשיון על'
                        : studentDetails?.previousLicense === 'B Auto'
                            ? 'אוטומט B רשיון על'
                            : 'אין רשיון קודם'}
                </p>
                <p className='text-center font-bold text-lg sm:text-xl py-6 '>
                    נהיגה מעשית - {studentDetails?.displayName}
                </p>
            </div>
            {filteredData.length > 0 ?
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Mobile View */}
                    <div dir='rtl' className="lg:hidden flex flex-wrap  justify-evenly">
                        {filteredData.map((item, index) => (
                            <div dir='rtl' key={index} className="bg-white mb-4 p-4 w-80 border rounded-md shadow-md">
                                <p className='text-center font-bold text-xl underline'>{index + 1}</p>
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">תאריך</label>
                                    <input
                                        type="date"
                                        value={item.date}
                                        {...register(`data[${index}].date`, { required: true })}
                                        onChange={(e) => handleSetData(index, 'date', e.target.value)}
                                        className={`w-full border p-2 rounded ${errors.data?.[index]?.date ? 'border-red-500' : 'border-gray-300'}`}
                                        readOnly={isTeacher}
                                    />
                                    {errors.data?.[index]?.date && <span className="text-red-500 text-xs">Required</span>}
                                </div>
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">משמרת</label>
                                    <select
                                        value={item.shift}
                                        {...register(`data[${index}].shift`, { required: true })}
                                        onChange={(e) => handleSetData(index, 'shift', e.target.value)}
                                        className={`w-full border p-2 rounded ${errors.data?.[index]?.shift ? 'border-red-500' : 'border-gray-300'}`}
                                        disabled={isTeacher}
                                    >
                                        <option value="">בחר משמרת . . .</option>
                                        <option value="משמרת בוקר">משמרת בוקר</option>
                                        <option value="משמרת צהריים">משמרת צהריים</option>
                                        <option value="משמרת ערב">משמרת ערב</option>
                                    </select>
                                    {errors.data?.[index]?.shift && <span className="text-red-500 text-xs">חובה*</span>}
                                </div>
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">ד'ק נהיגה</label>
                                    <input
                                        min={0}
                                        readOnly={(isTeacher && isShiftOver) || isAssistant}
                                        type="number"
                                        placeholder='הכנס דקות'
                                        value={item.drivingMinutes}
                                        {...register(`data[${index}].drivingMinutes`, isTeacher && { required: true })}
                                        onChange={(e) => handleSetData(index, 'drivingMinutes', e.target.value)}
                                        className={`w-full border-2 p-2 rounded ${errors.data?.[index]?.drivingMinutes ? 'border-red-500' : 'border-gray-300'} ${item.drivingMinutes ? 'border-green-500' : 'border-red-500'}`}
                                    />
                                    {errors.data?.[index]?.drivingMinutes && <span className="text-red-500 text-xs">חובה*</span>}
                                </div>
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">שם מורה</label>
                                    <select
                                        value={item.teacher}
                                        {...register(`data[${index}].teacher`, { required: true })}
                                        onChange={(e) => handleSetData(index, 'teacher', e.target.value)}
                                        className={`w-full border p-2 rounded ${errors.data?.[index]?.teacher ? 'border-red-500' : 'border-gray-300'}`}
                                        disabled={isTeacher}
                                    >
                                        {filteredTeachers?.map((teacher) => (
                                            <option key={teacher.uid} value={teacher.displayName}>
                                                {`${teacher.displayName} - ${teacher.school}`}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.data?.[index]?.teacher && <span className="text-red-500 text-xs">חובה*</span>}
                                </div>
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">אחר</label>
                                    <textarea
                                        maxLength={500}
                                        type="text"
                                        value={item.other}
                                        {...register(`data[${index}].other`)}
                                        onChange={(e) => handleSetData(index, 'other', e.target.value)}
                                        className={`w-full h-20 border p-2 rounded ${errors.data?.[index]?.other ? 'border-red-500' : 'border-gray-300'}`}
                                    />
                                    {errors.data?.[index]?.other && <span className="text-red-500 text-xs">Required</span>}
                                </div>
                                {(isAssistant || currentUser.user === "מנהל") && (
                                    <div className='flex justify-center'>
                                        <button
                                            onClick={() => {
                                                if (window.confirm("האם אתה בטוח?")) handleDeleteLesson(item.uid);
                                            }}
                                            type='button'
                                            className='p-1 px-8 bg-red-500 text-white font-bold rounded-md'
                                        >
                                            מחק שיעור
                                        </button>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>
                    {/* Desktop View */}
                    <div className="hidden lg:block overflow-x-auto shadow-md">
                        <table dir='rtl' className="table-auto w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-center text-[15px] font-medium text-gray-500 uppercase tracking-wider border border-gray-200 p-2">#</th>
                                    <th className="text-center text-[15px] font-medium text-gray-500 uppercase tracking-wider border border-gray-200 p-2">תאריך</th>
                                    <th className="text-center text-[15px] font-medium text-gray-500 uppercase tracking-wider border border-gray-200 p-2">משמרת</th>
                                    <th className="text-center text-[15px] font-medium text-gray-500 uppercase tracking-wider border border-gray-200 p-2">ד'ק נהיגה</th>
                                    <th className="text-center text-[15px] font-medium text-gray-500 uppercase tracking-wider border border-gray-200 px-8">שם מורה</th>
                                    <th className={`text-center text-[15px] font-medium text-gray-500 uppercase tracking-wider border border-gray-200 ${isExpanded !== false ? 'w-60' : 'max-w-[100px]'}`}>אחר</th>
                                    {(isAssistant || currentUser.user === "מנהל") && (<th className="text-center text-[15px] font-medium text-gray-500 uppercase tracking-wider border border-gray-200 p-1">מחיקה</th>)}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y w-full divide-gray-200">
                                {filteredData.map((item, index) => (
                                    <tr key={index}>
                                        <td className='p-5 border'>{index + 1}</td>
                                        <td className="text-center py-2 whitespace-nowrap border border-gray-200 p-2 overflow-hidden">
                                            <input
                                                type="date"
                                                value={item.date}
                                                {...register(`data[${index}].date`, { required: true })}
                                                onChange={(e) => handleSetData(index, 'date', e.target.value)}
                                                className={`w-full border p-2 rounded ${errors.data?.[index]?.date ? 'border-red-500' : 'border-gray-300'}`}
                                                readOnly={isTeacher}
                                            /> <br />
                                            {errors.data?.[index]?.date && <span className="text-red-500 text-xs">חובה*</span>}
                                        </td>
                                        <td className="text-center py-2 whitespace-nowrap border border-gray-200 p-2 overflow-hidden">
                                            <select
                                                value={item.shift}
                                                {...register(`data[${index}].shift`, { required: true })}
                                                onChange={(e) => handleSetData(index, 'shift', e.target.value)}
                                                className={`w-full border p-2 rounded ${errors.data?.[index]?.shift ? 'border-red-500' : 'border-gray-300'}`}
                                                disabled={isTeacher}
                                            >
                                                <option value="">בחר משמרת . . .</option>
                                                <option value="משמרת בוקר">משמרת בוקר</option>
                                                <option value="משמרת צהריים">משמרת צהריים</option>
                                                <option value="משמרת ערב">משמרת ערב</option>
                                            </select>
                                            <br />
                                            {errors.data?.[index]?.shift && <span className="text-red-500 text-xs">חובה*</span>}
                                        </td>
                                        <td className={`text-center py-2 whitespace-nowrap border border-gray-200 p-2 overflow-hidden ${item.drivingMinutes ? 'bg-green-500' : 'bg-red-500'}`}>
                                            <input
                                                readOnly={(isTeacher && isShiftOver) || isAssistant}
                                                min={0}
                                                type="number"
                                                placeholder='הכנס דקות'
                                                value={item.drivingMinutes}
                                                {...register(`data[${index}].drivingMinutes`, isTeacher && { required: true })}
                                                onChange={(e) => handleSetData(index, 'drivingMinutes', e.target.value)}
                                                className={`w-full border p-2 rounded ${errors.data?.[index]?.drivingMinutes ? 'border-red-500' : 'border-gray-300'}`}
                                            /> <br />
                                            {errors.data?.[index]?.drivingMinutes && <span className="text-white text-xs">חובה*</span>}
                                        </td>
                                        <td className="text-center py-2 whitespace-nowrap border border-gray-200 p-2 overflow-hidden">
                                            <select
                                                value={item.teacher}
                                                {...register(`data[${index}].teacher`, { required: true })}
                                                onChange={(e) => handleSetData(index, 'teacher', e.target.value)}
                                                className={`w-full border p-2 rounded ${errors.data?.[index]?.teacher ? 'border-red-500' : 'border-gray-300'}`}
                                                disabled={isTeacher}
                                            >
                                                {filteredTeachers?.map((teacher, i) => (
                                                    <option key={teacher.uid} value={teacher.displayName}>
                                                        {`${teacher.displayName} - ${teacher.school}`}
                                                    </option>
                                                ))}
                                            </select>
                                            <br />
                                            {errors.data?.[index]?.teacher && <span className="text-red-500 text-xs">חובה*</span>}
                                        </td>
                                        <td className="text-center py-2 whitespace-nowrap border border-gray-200 p-2 overflow-hidden max-w-[100px]">
                                            {isExpanded === index ? (
                                                <div className='flex flex-col'>
                                                    <textarea
                                                        type="text"
                                                        value={item.other}
                                                        {...register(`data[${index}].other`)}
                                                        onChange={(e) => handleSetData(index, 'other', e.target.value)}
                                                        className={`w-full h-28 border p-2 rounded ${errors.data?.[index]?.other ? 'border-red-500' : 'border-gray-300'}`}
                                                    />
                                                    <button
                                                        onClick={handleClose}
                                                        className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                                                    >
                                                        סגור
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleExpand(index)}
                                                    className={`w-full text-white font-bold py-1 px-3 rounded bg-blue-500  flex items-center gap-1 justify-between`}
                                                >
                                                    הערות
                                                    {item.other &&
                                                        <>
                                                            <span className='bg-red-500 text-white rounded-full px-2 p-1'>
                                                                !
                                                            </span>
                                                        </>}
                                                </button>
                                            )}
                                            {errors.data?.[index]?.other && <span className="text-red-500 text-xs">Required</span>}
                                        </td>
                                        {(isAssistant || currentUser.user === "מנהל") && (<td>
                                            <BsTrash
                                                onClick={() => { if (window.confirm("האם אתה בטוח?")) handleDeleteLesson(item.uid); }}
                                                className='text-red-500 text-lg cursor-pointer mx-auto'
                                            />
                                        </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {deleteLoading && <p className='text-xl pt-2 text-center animate-pulse'>Delete . . . </p>}
                    <div className='p-2'>
                        <p className={`${totalDrivingMinutes >= completeMinutes ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} w-fit text-lg font-bold p-1 rounded-md underline`}>
                            {isLoading ? <span className='animate-ping'>. . . </span> : totalDrivingMinutes}<span> :סה"כ דקות נהיגה</span>
                        </p>
                    </div>
                    <div className="text-center">
                        <button type="submit" className="bg-blue-500 text-white px-10 font-bold py-2 rounded w-[60%] max-w-[350px]">
                            {isLoading ? <span className='animate-ping'>. . .</span> : ' עדכן'}
                        </button>
                    </div>
                </form> :
                <p className='text-center font-bold text-lg'>אין תוצאות</p>
            }
        </div>
    );
};

export default TableDriving;