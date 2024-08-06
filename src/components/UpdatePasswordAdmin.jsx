import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { LuEye } from 'react-icons/lu';
import { changePassword } from '../firebase/firebase_config';

const ChangePasswordModal = ({ setOpenModalPassword, user }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [success, setSuccess] = useState(null);
    const [err, setErr] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const onSubmit = async (data) => {
        try {

            await changePassword(user.uid, data.newPassword);
            reset(); // Clear form inputs after successful password change
        } catch (error) {
            alert("שינוי סיסמא נכשל")
        }
    };




    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='w-[90%] h-[75%] sm:w-96 bg-slate-100 p-4 pt-20 rounded-lg'>
                <div className="sm:mx-auto sm:w-full sm:max-w-sm h-full flex flex-col space-y-8">
                    <p className='text-center font-bold text-lg'>שינוי סיסמא</p>
                    <form dir='rtl' onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 space-y-3 ">
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                                סיסמה חדשה
                            </label>
                            <div className='mt-2 relative'>
                                <input
                                    minLength={6}
                                    placeholder='הכנס סיסמה חדשה . . .'
                                    type={showPassword ? "text" : "password"}
                                    id="newPassword"
                                    {...register('newPassword', { required: 'שדה זה הוא חובה' })}
                                    className="block w-full ps-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                                <button
                                    type="button"
                                    className="absolute left-0 top-0 px-3 py-2.5 font-semibold text-gray-600 focus:outline-none"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    <LuEye />
                                </button>
                            </div>
                            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
                        </div>

                        {success && <p className="text-green-500 text-xs mt-1">{success}</p>}
                        <p className="text-red-500 text-xs mt-1">{err}</p>
                        <div className='flex flex-col gap-5'>
                            <button
                                type="submit"
                                className=" w-full justify-center rounded-md bg-blue-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                                עדכן סיסמא
                            </button>
                            <button
                                onClick={() => setOpenModalPassword(false)}
                                type="button"
                                className=" flex w-full justify-center rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                                סגור
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
