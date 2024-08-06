import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { updateAccount } from "../firebase/firebase_config";
import { departments } from "./RegisterModal";
import { useState } from "react";
import UpdatePasswordAdmin from "./UpdatePasswordAdmin";


export function EditUserModal({ setOpenEditModal, user }) {

    const [openModalPassword, setOpenModalPassword] = useState(false);

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
        defaultValues: {
            ...user
        }
    });

    const client = useQueryClient();

    const handleRefetch = async () => {
        await client.refetchQueries(['users'])
    }

    const { mutate: updateAccountMutation, isLoading } = useMutation({
        mutationKey: ["users"],
        mutationFn: async (data) => await updateAccount(data.uid, data),
        onSuccess: () => {
            setOpenEditModal(false);
            handleRefetch()
        },
    })


    const onSubmit = (data) => {
        try {
            updateAccountMutation(data)
        }
        catch (error) {
            alert("שגיאה")
        }
        reset();
    };

    return <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
        {openModalPassword && <UpdatePasswordAdmin setOpenModalPassword={setOpenModalPassword} user={user} />}
        <div className='w-[90%] sm:w-96 bg-slate-100 p-4 py-8 rounded-lg'>
            <div className=" sm:mx-auto sm:w-full sm:max-w-sm">
                <p className="text-center text-xl font-bold underline">{user.user}</p>
                <form dir='rtl' className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                    {user.user === 'מ"פ' &&
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-lg font-medium leading-6 text-gray-900">
                                    בחר מחלקה:
                                </label>
                            </div>
                            <div className="mt-2">
                                <select
                                    className='ps-1 h-[120px] font-bold block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
                                    id="departments"
                                    {...register("departments", { required: true, maxLength: 3 })}
                                    multiple
                                    maxLength={3}

                                >
                                    {departments.map((item, i) => (
                                        <option key={i} className='font-bold' value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    }
                    {user.user === 'מ"מ' &&
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
                                            <option key={i} className='font-bold' defaultValue={user.departments}>{item}</option>
                                        )
                                    })}
                                </select>
                            </div>
                            {errors.department && <p className="text-red-500">בחר מחלקה</p>}
                        </div>
                    }
                    {user.user === 'תלמידים' &&
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
                                            <option key={i} className='font-bold' defaultValue={user.departments}>{item}</option>
                                        )
                                    })}
                                </select>
                            </div>
                            {errors.department && <p className="text-red-500">בחר מחלקה</p>}
                        </div>
                    }
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
                                {...register("userId", { required: true, minLength: 9 })}
                                className="block w-full ps-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        {errors.userId && <p className="text-red-500">ת"ז זה אינו חוקי</p>}
                    </div>
                    <div className="text-center font-bold underline text-blue-700 hover:text-blue-500">
                        <p onClick={() => setOpenModalPassword(true)} className="cursor-pointer">לחץ לשינוי סיסמא</p>
                    </div>
                    {!isLoading ? <div className='space-y-5'>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                            עדכן
                        </button>
                        <button
                            onClick={() => setOpenEditModal(false)}
                            type="button"
                            className="flex w-full justify-center rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                            סגור
                        </button>
                    </div> :
                        <div className="flex justify-center text-lg font-bold">
                            <p>Loading . . . </p>
                        </div>
                    }
                </form>
            </div>
        </div>
    </div>
}