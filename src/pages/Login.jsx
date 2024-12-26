import React, { useState } from "react";
import { GiSteeringWheel } from "react-icons/gi";
import { LuEye } from "react-icons/lu";
import { useForm } from "react-hook-form";
import { IoArrowUndoOutline } from "react-icons/io5";
import { signIn } from "../firebase/firebase_config";
import SignaturePad from "../components/other/SignaturePad";


const Login = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);



    const translateError = (error) => {
        switch (error.code) {
            case 'auth/invalid-credential':
                return 'האימייל או הסיסמא לא נכון'
            case 'auth/too-many-requests':
                return 'הגישה לחשבון זה הושבתה זמנית עקב ניסיונות התחברות רבים, אתה יכול לנסות שוב מאוחר יותר.'
            case 'auth/email-already-in-use':
                return 'כתובת הדוא"ל כבר נמצאת בשימוש';
            case 'auth/invalid-email':
                return 'כתובת דוא"ל לא תקינה';
            case 'auth/operation-not-allowed':
                return 'פעולה זו אינה מותרת';
            case 'auth/weak-password':
                return 'הסיסמה חלשה מדי';
            case 'auth/network-request-failed':
                return 'הבקשה לרשת נכשלה';
            case 'auth/internal-error':
                return 'שגיאה פנימית';
            default:
                return 'שגיאה נסה שוב מאוחר יותר🫡';
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await signIn(data.email, data.password)
            reset();
        }
        catch (error) {
            setErr(translateError(error));
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center space-y-3  px-6 mt-10 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col gap-4">
                <GiSteeringWheel className="mx-auto h-10 w-auto animate-spin text-green-900 " style={{ animationDuration: '2.5s' }} />
                <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
                    התחברות
                </h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
                <form dir="rtl" className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="email" className="text-lg block font-medium leading-6 text-gray-900">
                            אימייל:
                        </label>
                        <div className="mt-2">
                            <input
                                dir="ltr"
                                id="email"
                                type="email"
                                placeholder="הכנס אימייל"
                                autoComplete="email"
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
                                placeholder="הכנס סיסמא"
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
                    <div>
                        <p className="text-center font-bold text-red-500">{err}</p>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                            {loading ? 'טוען . . .' : 'התחברות'}
                        </button>
                    </div>
                </form>
            </div>
            <div className="flex flex-col items-center justify-center py-5">
                <a href="https://mador-till-prod.github.io/lomda-cards-theory/src/" target="_blank" rel="noopener noreferrer">
                    <button dir="rtl" className="flex items-center gap-3 bg-green-500 p-1 rounded-md px-2 text-white font-bold">
                        לימודי תאוריה
                        <IoArrowUndoOutline className="mx-auto h-5 w-auto" />
                    </button>
                </a>
                {/* <div>
                    <SignaturePad />
                </div> */}
            </div>
        </div>
    )
}

export default Login;
