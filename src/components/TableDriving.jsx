import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { deleteLesson, getAccounts, getPracticalDriving, updateAccount, updateLesson } from '../firebase/firebase_config';
import { Loading } from './Loading';
import { useCurrentUser } from '../firebase/useCurerntUser';
import { BsTrash } from 'react-icons/bs';

const SHIFT_LIMITS = {
    'משמרת בוקר': 240,
    'משמרת צהריים': 270,
    'משמרת ערב': 150,
};

const TableDriving = ({ studentDetails, studentUid, setOpenModalStudentData, refetchStudent, studentShift }) => {
    const today = new Date().toISOString().split('T')[0];

    const [currentUser] = useCurrentUser();
    const { register, handleSubmit, formState: { errors }, setValue, setError } = useForm();
    const [filteredData, setFilteredData] = useState([]);
    const [totalDrivingMinutes, setTotalDrivingMinutes] = useState(0);
    const [shiftAvailability, setShiftAvailability] = useState({ morning: true, noon: true, evening: true });
    const [isExpanded, setIsExpanded] = useState(false);



    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['practical_driving'],
        queryFn: getPracticalDriving,
    });

    const { mutate: updateMutation, isLoading: loading } = useMutation({
        mutationKey: ['practical_driving'],
        mutationFn: async (formData) => {
            return await updateLesson(formData.lessonId, formData.lessonData);
        },
    });

    const { data: studentData, isLoading: teacherLoading } = useQuery({
        queryKey: ['users'],
        queryFn: getAccounts,
    });

    const filteredTeachers = studentData?.filter(account =>
        account.user === "מורה נהיגה").sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

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
        checkShiftAvailability();

        const intervalId = setInterval(checkShiftAvailability, 60000);

        return () => clearInterval(intervalId);
    }, []);

    const handleExpand = (index) => {
        setIsExpanded(index);
    };

    const handleClose = () => {
        setIsExpanded(false);
    };


    useEffect(() => {
        if (data) {
            let studentClasses = data
                .filter(item => item.studentUid === (studentDetails ? studentDetails.uid : studentUid))
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            if (currentUser.user === "מורה נהיגה") {
                studentClasses = studentClasses.filter(item => item.shift === (studentShift === 'morning' ? 'משמרת בוקר' : studentShift === 'noon' ? 'משמרת צהריים' : 'משמרת ערב') && item.date === today);
            }

            setFilteredData(studentClasses.map(item => ({
                ...item,
                date: item.date || '',
                drivingMinutes: item.drivingMinutes || '',
                other: item.other || '',
                teacher: item.teacher || '',
            })));

            const totalMinutes = data.reduce((total, item) => {
                if (item.studentUid === (studentDetails ? studentDetails.uid : studentUid)) {
                    return total + (parseInt(item.drivingMinutes, 10) || 0);
                }
                return total;
            }, 0);

            setTotalDrivingMinutes(totalMinutes);

            studentClasses.forEach((item, index) => {
                setValue(`data[${index}].date`, item.date || '');
                setValue(`data[${index}].drivingMinutes`, item.drivingMinutes || '');
                setValue(`data[${index}].other`, item.other || '');
                setValue(`data[${index}].teacher`, item.teacher || '');
                setValue(`data[${index}].shift`, item.shift || '');
            });
        }
    }, [data, studentDetails, setValue, today, studentUid, currentUser, studentShift]);

    const validateShiftLimits = (formData) => {
        const savedShiftMinutes = JSON.parse(localStorage.getItem('totalShiftMinutes')) || {
            'משמרת בוקר': 0,
            'משמרת צהריים': 0,
            'משמרת ערב': 0
        };

        const shiftTotals = { ...savedShiftMinutes };


        // Calculate totals for each shift from form data
        formData.data.forEach(lesson => {
            const shift = lesson.shift;
            const minutes = parseInt(lesson.drivingMinutes, 10) || 0;

            if (!shiftTotals[shift]) {
                shiftTotals[shift] = 0;
            }
            shiftTotals[shift] += minutes;
        });


        // Check if any shift exceeds the limit
        const errors = {};
        Object.keys(shiftTotals).forEach(shift => {
            if (shiftTotals[shift] > SHIFT_LIMITS[shift]) {
                errors[shift] = `הגעת למגבלה של ${SHIFT_LIMITS[shift]} דקות עבור ${shift}`;
            }
        });

        // Save updated totals to localStorage if no errors
        if (Object.keys(errors).length === 0) {
            localStorage.setItem('totalShiftMinutes', JSON.stringify(shiftTotals));
        }

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

        let totalMinutes = 0;

        for (let i = 0; i < filteredData.length; i++) {
            const lessonData = formData.data[i];
            const lessonId = filteredData[i].uid;
            updateMutation({ lessonId, lessonData });

            // Accumulate total minutes
            totalMinutes += parseInt(lessonData.drivingMinutes, 10) || 0;
        }

        // Update total driving minutes
        setTotalDrivingMinutes(totalMinutes);

        await updateAccount(studentDetails.uid, { totalDrivingMinutes });
        await refetch();
        { currentUser.user === "מורה נהיגה" && await refetchStudent(); }
        setOpenModalStudentData(false);
    };

    const handleSetData = (index, field, value) => {
        const updatedData = [...filteredData];
        updatedData[index][field] = value;
        setFilteredData(updatedData);
        setValue(`data[${index}].${field}`, value);
    };

    const handleDeleteLesson = async (lessonId) => {
        deleteLesson(lessonId);
        refetch();
    };

    const isTeacher = currentUser?.user === "מורה נהיגה";
    const isAssistant = currentUser?.user === 'מ"מ' || currentUser?.user === 'מ"פ' || currentUser?.user === "מנהל";

    if (isLoading || teacherLoading) {
        <div className='fixed flex justify-center z-50 w-full h-full  backdrop-blur-md'>
            <Loading />
        </div>
    }

    if (isError) {
        return <div>{error.message}</div>;
    }


    return (
        <div className='bg-white w-full p-2 rounded-md shadow-lg'>
            <div className='flex justify-around items-center'>
                <p className='text-center font-bold text-sm underline py-6 text-blue-600'>
                    {studentDetails?.previousLicense === 'B'
                        ? 'B רשיון על'
                        : studentDetails?.previousLicense === 'motorcycle'
                            ? 'רשיון על אופנוע'
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
                                        <option value="משמרת בוקר" disabled={!shiftAvailability.morning}>משמרת בוקר</option>
                                        <option value="משמרת צהריים" disabled={!shiftAvailability.noon}>משמרת צהריים</option>
                                        <option value="משמרת ערב" disabled={!shiftAvailability.evening}>משמרת ערב</option>
                                    </select>
                                    {errors.data?.[index]?.shift && <span className="text-red-500 text-xs">חובה*</span>}
                                </div>
                                <div className="mb-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-1">ד'ק נהיגה</label>
                                    <input
                                        min={0}
                                        readOnly={isAssistant}
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
                                            <option key={teacher.uid}>
                                                {teacher.displayName}
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
                                        readOnly={isTeacher}
                                    />
                                    {errors.data?.[index]?.other && <span className="text-red-500 text-xs">Required</span>}
                                </div>
                                {isAssistant && <div className='flex justify-center '>
                                    <button
                                        onClick={() => {
                                            if (window.confirm("האם אתה בטוח?")) handleDeleteLesson(item.uid);
                                        }}
                                        type='button'
                                        className='p-1 px-8 bg-red-500 text-white font-bold rounded-md'
                                    >
                                        מחק שיעור
                                    </button>
                                </div>}
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
                                    {isAssistant && <th className="text-center text-[15px] font-medium text-gray-500 uppercase tracking-wider border border-gray-200 p-1">מחיקה</th>}
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
                                                <option value="משמרת בוקר" disabled={!shiftAvailability.morning}>משמרת בוקר</option>
                                                <option value="משמרת צהריים" disabled={!shiftAvailability.noon}>משמרת צהריים</option>
                                                <option value="משמרת ערב" disabled={!shiftAvailability.evening}>משמרת ערב</option>
                                            </select>
                                            <br />
                                            {errors.data?.[index]?.shift && <span className="text-red-500 text-xs">חובה*</span>}
                                        </td>
                                        <td className={`text-center py-2 whitespace-nowrap border border-gray-200 p-2 overflow-hidden ${item.drivingMinutes ? 'bg-green-500' : 'bg-red-500'}`}>
                                            <input
                                                min={0}
                                                type="number"
                                                placeholder='הכנס דקות'
                                                value={item.drivingMinutes}
                                                {...register(`data[${index}].drivingMinutes`, isTeacher && { required: true })}
                                                onChange={(e) => handleSetData(index, 'drivingMinutes', e.target.value)}
                                                className={`w-full border p-2 rounded ${errors.data?.[index]?.drivingMinutes ? 'border-red-500' : 'border-gray-300'}`}
                                                readOnly={isAssistant}
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
                                                    <option key={i}>
                                                        {teacher.displayName}
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
                                        {isAssistant && <td>
                                            <BsTrash
                                                onClick={() => { if (window.confirm("האם אתה בטוח?")) handleDeleteLesson(item.uid); }}
                                                className='text-red-500 text-lg cursor-pointer mx-auto'
                                            />
                                        </td>}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className='p-2'>
                        <p className={`${totalDrivingMinutes >= studentDetails.completeMinutes ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} w-fit text-lg font-bold p-1 rounded-md underline`}>
                            {loading ? <span className='animate-ping'>. . . </span> : totalDrivingMinutes}<span> :סה"כ דקות נהיגה</span></p>
                    </div>
                    <div className="text-center">
                        <button type="submit" className="bg-blue-500 text-white px-10 font-bold py-2 rounded w-[60%] max-w-[350px]">
                            {loading ? <span className='animate-ping'>. . .</span> : ' עדכן'}
                        </button>
                    </div>
                </form> :
                <p className='text-center font-bold text-lg'>אין תוצאות</p>
            }
        </div>
    );
};

export default TableDriving;
