import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuEye } from "react-icons/lu";
import useCreateUser from '../../firebase/useCreateUser';
import { useCurrentUser } from '../../firebase/useCurerntUser';
import { Loading } from '../other/Loading';
import toast from 'react-hot-toast';

export const departments = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];


const RegisterModal = ({ setOpenRegisterModal }) => {
    const [currentUser] = useCurrentUser();
    const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();

    const [departmentsToogle, setDepartmentsToogle] = useState(true);
    const [departmentToogle, setDepartmentToogle] = useState(false);
    const [driverType, setDriverType] = useState(false);
    const [cycle, setCycle] = useState(false);
    const [schools, setSchools] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { createUser, createAdmin } = useCreateUser()


    const cleanUserData = (data) => {
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
                key,
                typeof value === "string" ? value.trim().replace(/\s+/g, " ") : value
            ])
        );
    };

    const onSubmit = (data) => {
        setLoading(true);
        try {
            const cleanedData = cleanUserData(data);
            if (departmentsToogle) {
                createAdmin(cleanedData);
            } else {
                createUser(cleanedData);
            }
            setTimeout(() => {
                setLoading(false);
                setOpenRegisterModal(false);
            }, 3000);
            reset();
            toast.success("!המשתמש נוסף בהצלחה", { duration: 5000 })
        }
        catch (err) {
            setLoading(false);
            toast.error("שגיאה המשתמש לא נוצר", { duration: 6000 })
        }
    };


    const handleSelectChange = (value) => {

        switch (value) {
            case "מורה נהיגה":
                setCycle(false);
                setDepartmentsToogle(false);
                setDepartmentToogle(false);
                setSchools(true);
                setDriverType(false);
                setValue('departments', null);
                setValue('cycle', null);
                break;
            case 'מ"פ':
                setCycle(false);
                setDepartmentsToogle(true);
                setDepartmentToogle(false);
                setSchools(false);
                setDriverType(false);
                setValue('departments', []);
                setValue('cycle', null);
                setValue('school', null);
                break;
            case 'מ"מ':
                setCycle(false);
                setDepartmentsToogle(false);
                setDepartmentToogle(true);
                setSchools(false);
                setDriverType(false);
                setValue('departments', null);
                setValue('cycle', null);
                setValue('school', null);
                break;
            case "קבלן":
                setCycle(false);
                setDepartmentsToogle(false);
                setDepartmentToogle(false);
                setSchools(false);
                setDriverType(false);
                setValue('departments', []);
                setValue('cycle', null);
                setValue('school', null);
                break;
            default:
                setCycle(true);
                setDepartmentsToogle(false);
                setDepartmentToogle(true);
                setDriverType(true);
                setSchools(false);
                setValue('departments', []);
                setValue('school', null)
                break;
        }
    };

    if (loading) {
        return <div className='fixed flex justify-center z-50 w-full h-full pb-40 backdrop-blur-md'>
            <Loading />
        </div>
    }

    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md py-10'>
            <div className='w-[90%] sm:w-[85%] max-w-[600px] bg-slate-100  py-10 p-5 rounded-lg h-[96%] mt-14 mb-20 space-y-10 overflow-y-auto'>
                <div className='flex justify-between items-center'>
                    <button
                        onClick={() => setOpenRegisterModal(false)}
                        type="button"
                        className="flex w-24 justify-center rounded-md bg-red-500 px-3 py-1 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                        סגור
                    </button>
                    <p className='text-center font-bold text-xl'>משתמש חדש</p>
                </div>
                <form dir='rtl' className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="displayName" className="text-lg block font-medium leading-6 text-gray-900">
                            שם מלא:
                        </label>
                        <div className="mt-2">
                            <input
                                id="displayName"
                                placeholder="הכנס שם"
                                autoComplete="displayName"
                                {...register("displayName", { required: true, minLength: 2 })}
                                className="block w-full ps-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        {errors.displayName && <p className="text-red-500">שם אינו חוקי</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="text-lg block font-medium leading-6 text-gray-900">
                            אימייל:
                        </label>
                        <div className="mt-2">
                            <input
                                dir='ltr'
                                minLength={3}
                                id="email"
                                type="email"
                                placeholder="הכנס אימייל"
                                autoComplete="email"
                                {...register("email", { required: true, minLength: 3 })}
                                className="block w-full text-right pe-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        {errors.email && <p className="text-red-500">אימייל אינו חוקי</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-lg font-medium leading-6 text-gray-900">
                                סיסמא:
                            </label>
                        </div>
                        <div className="mt-2 relative">
                            <input
                                maxLength={30}
                                minLength={6}
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="הכנס סיסמא לפחות 6 תווים. . . "
                                autoComplete="current-password"
                                {...register("password", { required: true, minLength: 6 })}
                                className="block w-full ps-3 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                            <button
                                type="button"
                                className="absolute left-0 top-0 px-3 py-2.5  font-semibold text-gray-600 focus:outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <LuEye />
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500">הסיסמא אינה חוקית</p>}
                    </div>
                    <div className='space-y-3'>
                        <div className="flex items-center justify-between">
                            <label htmlFor="user" className="block text-lg font-medium leading-6 text-gray-900">
                                מ"פ\מ"מ\מורי נהיגה\תלמיד:
                            </label>
                        </div>
                        <div className="mt-2">
                            <select onClick={(e) => { handleSelectChange(e.target.value) }} onInput={(e) => { handleSelectChange(e.target.value) }} className='ps-1 font-bold block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                                name="user" id="user" {...register("user", { required: true })}>
                                <option value="">בחר משתמש . . .</option>
                                {currentUser.user === "מנהל" && <option className='font-bold' value='מ"פ'>מ"פ</option>}
                                {currentUser.user === "מנהל" && <option className='font-bold' value='קבלן'>קבלן</option>}
                                <option className='font-bold' value='מ"מ'>מ"מ</option>
                                <option className='font-bold' value='מורה נהיגה'>מורה נהיגה</option>
                                <option className='font-bold' value='תלמידים'>תלמיד</option>
                            </select>
                        </div>
                        {departmentsToogle &&
                            <div className='py-4'>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="departments" className="block text-lg font-medium leading-6 text-gray-900">
                                        בחר מחלקה:
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <select
                                        value={watch("departments")}
                                        className='ps-1 font-bold block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                                        id="departments"
                                        {...register("departments", { required: true })}
                                        multiple
                                    >
                                        {departments.map((item, i) => (
                                            <option key={i} className='font-bold' value={item}>{item}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.department && <p className="text-red-500">בחר מחלקה</p>}
                            </div>
                        }
                        {departmentToogle && <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="department" className="block text-lg font-medium leading-6 text-gray-900">
                                    בחר מחלקה:
                                </label>
                            </div>
                            <div className="mt-2">
                                <select className='ps-1 font-bold block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                                    name="" id="department" {...register("departments", { required: true })}>
                                    <option value="">בחר מחלקה .  .  .</option>
                                    {departments.map((item, i) => {
                                        return (
                                            <option key={i} className='font-bold'>{item}</option>
                                        )
                                    })}
                                </select>
                            </div>
                            {errors.department && <p className="text-red-500">בחר מחלקה</p>}
                        </div>}
                        {driverType && <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="lineTraining" className="block text-lg font-medium leading-6 text-gray-900">
                                    שם הכשרה:
                                </label>
                            </div>
                            <div className="mt-2">
                                <select className='ps-1 font-bold block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                                    name="" id="lineTraining" {...register("lineTraining", { required: true })}>
                                    <option value="">בחר הכשרה . . .</option>
                                    <option value='נהג בט"ש B'>נהג בט"ש B</option>
                                    <option value='נהג בט"ש C1'>נהג בט"ש C1</option>
                                    <option value='נהג ליין משא'>נהג ליין משא</option>
                                    <option value='נהג משא יח"ש'>נהג משא יח"ש</option>
                                </select>
                            </div>
                            {errors.lineTraining && <p className="text-red-500">בחר הכשרה</p>}
                        </div>}
                        <div>
                            <label htmlFor="userId" className="text-lg block font-medium leading-6 text-gray-900">
                                ת.ז:
                            </label>
                            <div className="mt-2">
                                <input
                                    maxLength={9}
                                    minLength={8}
                                    id="userId"
                                    placeholder="הכנס תעודת זהות"
                                    autoComplete="userId"
                                    {...register("userId", { required: true, minLength: 8, pattern: { value: /^[0-9]+$/, message: "ת.ז חייב להיות מספרים בלבד" } })}
                                    className="block w-full ps-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                            {errors.userId && <p className="text-red-500">ת"ז זה אינו חוקי</p>}
                        </div>
                        {schools && <div>
                            <label htmlFor="school" className="text-lg block font-medium leading-6 text-gray-900">
                                בית ספר:
                            </label>
                            <select className='ps-1 font-bold block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                                name="school" id="school" {...register("school", { required: true })}>
                                <option value="">בחר בית ספר . . .</option>
                                <option className='font-bold' value='שרייבר'>שרייבר</option>
                                <option className='font-bold' value='יובלי'>יובלי</option>
                                <option className='font-bold' value='צבאי'>צבאי</option>
                            </select>
                            {errors.school && <p className="text-red-500">בית ספר זה אינו חוקי</p>}
                        </div>}

                        {cycle && <div>
                            <label htmlFor="cycle" className="text-lg block font-medium leading-6 text-gray-900">
                                מספר מחזור:
                            </label>
                            <div className="mt-2">
                                <input
                                    id="cycle"
                                    placeholder="הכנס מספר"
                                    autoComplete="cycle"
                                    {...register("cycle", { required: true })}
                                    className="block w-full ps-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                            {errors.cycle && <p className="text-red-500">שדה חובה*</p>}
                        </div>}
                    </div>
                    <div className='space-y-6'>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                            להרשם
                        </button>
                        <button
                            onClick={() => setOpenRegisterModal(false)}
                            type="button"
                            className="flex w-full justify-center rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                            סגור
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RegisterModal;
