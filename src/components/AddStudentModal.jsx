import React, { useState } from 'react'
import useCreateUser from '../firebase/useCreateUser';
import { useForm } from 'react-hook-form';
import { LuEye } from "react-icons/lu";
import { useCurrentUser } from '../firebase/useCurerntUser';
import { Loading } from './Loading';
import { useMutation } from 'react-query';

const departments = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const AddStudentModal = ({ setOpenModalAddStudent, refetch }) => {
    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();
    const { createUser } = useCreateUser();

    const [showPassword, setShowPassword] = useState(false);
    const [departmentsToogle, setDepartmentsToogle] = useState(true);

    const { mutate: addUser, isLoading } = useMutation({
        mutationKey: ["users"],
        mutationFn: (data) => createUser(data),
        onSuccess: () => {
            refetch();
            setOpenModalAddStudent(false);
        }
    });

    const onSubmit = (data) => {
        try {
            addUser(data);
        }
        catch (err) {
            throw err;
        }
        reset();
    };

    const handleSelectChange = (value) => {
        if (value === "מורה נהיגה") {
            setDepartmentsToogle(false);
            setValue('departments', null);
        }
        else {
            setDepartmentsToogle(true);
        }
    };


    if (isLoading) {
        return <Loading />
    }

    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='w-[90%] sm:w-96 bg-slate-100 p-4 py-8 rounded-lg'>
                <div className=" sm:mx-auto sm:w-full sm:max-w-sm">
                    <p className='text-center font-bold text-xl underline py-2'>יצירת תלמיד / מורה</p>
                    <form dir='rtl' className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="displayName" className="block text-lg font-medium leading-6 text-gray-900">
                                שם מלא:
                            </label>
                            <div className="mt-2">
                                <input
                                    id="displayName"
                                    name="displayName"
                                    type="text"
                                    placeholder='הכנס שם'
                                    required
                                    {...register('displayName', { required: true })}
                                    className="ps-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                                {errors.text && <span className="text-red-600">הכנס שם </span>}
                            </div>
                        </div>
                        <div>
                            <label htmlFor="email" className="text-lg block font-medium leading-6 text-gray-900">
                                אימייל:
                            </label>
                            <div className="mt-2">
                                <input
                                    dir='ltr'
                                    minLength={6}
                                    id="email"
                                    type="email"
                                    placeholder="הכנס אימייל"
                                    {...register("email", { required: true, minLength: 6 })}
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
                                    minLength={6}
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="הכנס סיסמא לפחות 6 תווים. . . "
                                    {...register("password", { required: true, maxLength: 6 })}
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
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-lg font-medium leading-6 text-gray-900">
                                    תלמיד\מורי נהיגה:
                                </label>
                            </div>
                            <div className="mt-2">
                                <select onClick={(e) => { handleSelectChange(e.target.value) }} className='ps-1 font-bold block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                                    name="user" id="user" {...register("user", { required: true })}>
                                    <option className='font-bold' value='תלמידים'>תלמיד</option>
                                    <option className='font-bold' value='מורה נהיגה'>מורה נהיגה</option>
                                </select>
                            </div>
                        </div>
                        {departmentsToogle &&
                            <div>
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
                            </div>
                        }
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="userId" className="block text-lg font-medium leading-6 text-gray-900">
                                    ת.ז:
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    maxLength={9}
                                    minLength={8}
                                    id="userId"
                                    name="userId"
                                    type="text"
                                    placeholder='הכנס ת.ז'
                                    required
                                    {...register('userId', { required: true, minLength: 8, pattern: { value: /^[0-9]+$/, message: "ת.ז חייב להיות מספרים בלבד" } })}
                                    className="ps-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                                {errors.id && <span className="text-red-600">הכנס ת.ז </span>}
                            </div>
                        </div>
                        <div className='space-y-5'>
                            <button
                                type="submit"
                                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                הוספה
                            </button>
                            <button
                                onClick={() => setOpenModalAddStudent(false)}
                                type="button"
                                className="flex w-full justify-center rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                                סגור
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddStudentModal