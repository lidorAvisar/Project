import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuEye } from "react-icons/lu";
import useCreateUser from '../firebase/useCreateUser';
import { useCurrentUser } from '../firebase/useCurerntUser';
import { Loading } from './Loading';

export const departments = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];


const RegisterModal = ({ setOpenRegisterModal }) => {
    const [currentUser] = useCurrentUser();
    const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();

    const [departmentsToogle, setDepartmentsToogle] = useState(true);
    const [departmentToogle, setDepartmentToogle] = useState(false);
    const [cycle, setCycle] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { createUser, createAdmin } = useCreateUser()


    const onSubmit = (data) => {
        setLoading(true);
        try {
            if (departmentsToogle) {
                createAdmin(data);
            } else {
                createUser(data);
            }
            setTimeout(() => {
                setLoading(false);
                setOpenRegisterModal(false);
            }, 3000);
        }
        catch (err) {
            setLoading(false);
            alert("שגיאה המשתמש לא נוצר")
        }
        reset();
    };


    const handleSelectChange = (value) => {
        console.log(value);
        switch (value) {
            case "מורה נהיגה":
                setCycle(false);
                setDepartmentsToogle(false);
                setDepartmentToogle(false);
                setValue('departments', null);
                setValue('cycle', null);
                break;
            case 'מ"פ':
                setCycle(false);
                setDepartmentsToogle(true);
                setDepartmentToogle(false);
                setValue('departments', []);
                setValue('cycle', null);
                break;
            case 'מ"מ':
                setCycle(false);
                setDepartmentsToogle(false);
                setDepartmentToogle(true);
                setValue('departments', null);
                setValue('cycle', null);
                break;
            case "קבלן":
                setCycle(false);
                setDepartmentsToogle(false);
                setDepartmentToogle(false);
                setValue('departments', []);
                setValue('cycle', null);
                break;
            default:
                setCycle(true);
                setDepartmentsToogle(false);
                setDepartmentToogle(true);
                setValue('departments', []);
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
                <p className='text-center font-bold text-lg'>משתמש חדש</p>
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
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="הכנס סיסמא לפחות 6 תווים. . . "
                                autoComplete="current-password"
                                {...register("password", { required: true})}
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
                            <label htmlFor="password" className="block text-lg font-medium leading-6 text-gray-900">
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
                                    <label htmlFor="password" className="block text-lg font-medium leading-6 text-gray-900">
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
                            </div>}
                        {departmentToogle && <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-lg font-medium leading-6 text-gray-900">
                                    בחר מחלקה:
                                </label>
                            </div>
                            <div className="mt-2">
                                <select className='ps-1 font-bold block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                                    name="" id="department" {...register("departments", { required: true })}>
                                    {departments.map((item, i) => {
                                        return (
                                            <option key={i} className='font-bold'>{item}</option>
                                        )
                                    })}
                                </select>
                            </div>
                            {errors.department && <p className="text-red-500">בחר מחלקה</p>}
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
