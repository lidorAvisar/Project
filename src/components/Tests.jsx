import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { updateAccount } from '../firebase/firebase_config';
import { useMutation } from 'react-query';

const Tests = ({ studentDetails,usersRefetch, setOpenModalStudentData }) => {
    const initialTests = studentDetails?.tests?.length > 0 ? studentDetails.tests : [{ id: 1, date: '', status: '' }];
    const [tests, setTests] = useState(initialTests);
    const [completeMinutes, setCompleteMinutes] = useState(null);

    const { control, handleSubmit, setValue } = useForm({
        defaultValues: {
            tests: initialTests,
        }
    });

    const { mutate: studentUpdateTests } = useMutation({
        mutationKey: ['users'],
        mutationFn: async ({ id, data }) => await updateAccount(id, data),
        onSuccess: () => {
            usersRefetch();
            setOpenModalStudentData(false);
        },
        onError: (error) => {
            console.error('Error updating student tests:', error);
        }
    });

    const onSubmit = (data) => {
        const updatedData = {
            ...studentDetails,
            tests: data.tests
        };
        studentUpdateTests({ id: studentDetails.uid, data: updatedData });
    };

    const addNewTestRow = () => {
        const newTest = { id: tests.length + 1, date: '', status: '' };
        setTests([...tests, newTest]);
        setValue(`tests[${tests.length}]`, newTest);
    };

    useEffect(() => {
        setValue('tests', tests);
    }, [tests, setValue]);

    useEffect(() => {
        if (studentDetails.previousLicense !== "no") {
            setCompleteMinutes(800);
        }
        else {
            setCompleteMinutes(1280);
        }
    }, [studentDetails]);


    return (
        <div className="bg-slate-200 w-full p-6 rounded-md shadow-lg">
            <p className="text-center font-bold text-2xl py-6 underline">טסטים</p>
            {studentDetails?.totalDrivingMinutes && studentDetails?.totalDrivingMinutes >= completeMinutes && studentDetails.nightDriving && studentDetails.nightDriving >= 40 ? <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <table dir='rtl' className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
                        <thead>
                            <tr className="hidden sm:table-row">
                                <th className="py-2 border-b-2 border-gray-300 bg-gray-100 text-center">#</th>
                                <th className="px-4 py-2 border-b-2 border-gray-300 bg-gray-100 text-right">תאריך</th>
                                <th className="px-4 py-2 border-b-2 border-gray-300 bg-gray-100 text-right">סטטוס</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tests.map((test, index) => (
                                <tr key={index} className={`${test.status === 'Pass' ? 'bg-green-500' : test.status === 'Fail' ? 'bg-red-500' : ''} sm:table-row`}>
                                    <td className="block sm:table-cell py-2 border-b border-gray-200 text-center font-bold">{index + 1}.</td>
                                    <td className="block sm:table-cell px-4 py-2 border-b border-gray-200 text-right">
                                        <Controller
                                            name={`tests[${index}].date`}
                                            control={control}
                                            defaultValue={test.date}
                                            render={({ field }) => (
                                                <input
                                                    type="date"
                                                    className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    {...field}
                                                />
                                            )}
                                        />
                                    </td>
                                    <td className="block sm:table-cell px-4 py-2 border-b border-gray-200 text-right">
                                        <Controller
                                            name={`tests[${index}].status`}
                                            control={control}
                                            defaultValue={test.status}
                                            render={({ field }) => (
                                                <select
                                                    className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    {...field}
                                                >
                                                    <option value="">בחר</option>
                                                    <option value="Pass">עבר</option>
                                                    <option value="Fail">נכשל</option>
                                                </select>
                                            )}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-center gap-3 mt-4">
                    <button
                        type="button"
                        onClick={addNewTestRow}
                        className="px-3 py-2 bg-green-500 text-white font-semibold rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 mr-2"
                    >
                        + הוסף טסט
                    </button>
                    <button
                        type="submit"
                        className="px-10 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        שמור
                    </button>
                </div>
            </form> :
                <p className='font-bold text-xl text-center text-red-500'> 😌עדיין אינו/ה מוכנ/ה לטסט</p>
            }
        </div>
    );
};

export default Tests;
