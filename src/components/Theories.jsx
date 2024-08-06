import React, { useEffect, useState } from 'react';
import { updateAccount } from '../firebase/firebase_config';
import { useForm, Controller } from 'react-hook-form';

const theoryList = [1, 2, 3, 4, 5, 6, 7, 8];

const Theories = ({ studentDetails, setOpenModalStudentData, refetch }) => {
    const { control, handleSubmit, formState: { errors }, setValue, resetField } = useForm();
    const [selectedTheorySessions, setSelectedTheorySessions] = useState({});
    const [theorySessionsCount, setTheorySessionsCount] = useState(studentDetails.theorySessionsQuantity);
    const [theoryTestsCount, setTheoryTestsCount] = useState(studentDetails.theoryTestsQuantity);

    useEffect(() => {
        setSelectedTheorySessions(prev => {
            const newSelection = { ...prev };
            for (const num of theoryList) {
                newSelection[num] = num <= studentDetails.theorySessionsQuantity;
            }
            return newSelection;
        });
    }, [studentDetails]);

    const handleTheoryClick = (num) => {
        setSelectedTheorySessions(prev => {
            const newSelection = { ...prev };
            if (prev[num]) {
                let maxSelected = Math.max(...Object.keys(prev).filter(key => prev[key]));
                if (num === maxSelected) {
                    newSelection[num] = false;
                    setTheorySessionsCount(prev => prev - 1);
                }
            } else {
                let minNotSelected = Math.min(...theoryList.filter(i => !prev[i]));
                if (num === minNotSelected) {
                    for (let i = 1; i <= num; i++) {
                        newSelection[i] = true;
                        setTheorySessionsCount(i);
                    }
                }
            }
            return newSelection;
        });
    };

    const handleReset = (num) => {
        resetField(`tests[${num - 1}].date`);
        resetField(`tests[${num - 1}].mistakes`);
    };

    const today = new Date().toISOString().split('T')[0];

    const onSubmit = async (data) => {

        const studentUid = studentDetails.uid;
        const updatedData = {
            theorySessionsQuantity: theorySessionsCount,
            theoryTestsQuantity: theoryTestsCount,
            detailsTheoryTest: data.tests
                .filter(test => test.date && test.mistakes !== undefined)
                .map((test, index) => ({
                    ...test,
                    testNumber: index + 1,
                })),
        };

        try {
            await updateAccount(studentUid, updatedData);
            refetch();
            setOpenModalStudentData(false);
        } catch (error) {
            alert("שגיאה ");
        }
    };

    return (
        <div className="mb-6 w-full">
            <form onSubmit={handleSubmit(onSubmit)} dir='rtl' className="relative w-full bg-white rounded-lg overflow-hidden shadow-lg p-2 sm:p-6 mb-20 my-5 space-y-5">
                <div className="mb-6">
                    <h3 className="text-lg text-center font-bold mb-2 underline">תאוריות</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {theoryList.map(num => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => handleTheoryClick(num)}
                                className={`mt-1 block w-full px-2 py-1.5 text-center text-white rounded-md ${selectedTheorySessions[String(num)] ? 'bg-green-500' : 'bg-gray-400'}`}
                            >
                                <span className='hidden sm:block'>תאוריה</span> {num}
                            </button>
                        ))}
                    </div>
                </div>
                <h3 className="text-lg text-center font-bold mb-2 underline">מבחני תיאוריה</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {theoryList.map(num => {
                        const test = studentDetails.detailsTheoryTest?.find(test => test.testNumber === num) || {};
                        return (
                            <div key={num} className={`bg-white shadow-lg rounded-lg p-4 flex flex-col items-center ${test.mistakes === undefined ? 'bg-gray-100' : (test.mistakes > 4 ? 'bg-red-400' : 'bg-green-300')}`}>
                                <h4 className="text-xl font-bold mb-2">מבחן {num}</h4>
                                <Controller
                                    control={control}
                                    name={`tests[${num - 1}].date`}
                                    defaultValue={test.date || ''}
                                    render={({ field }) => (
                                        <div className="mb-2 w-full">
                                            <label htmlFor={`date-${num}`} className="block text-gray-700 text-sm font-bold mb-1">תאריך:</label>
                                            <input
                                                type="date"
                                                id={`date-${num}`}
                                                min={today}
                                                {...field}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            />
                                            {errors.tests?.[num - 1]?.date && <span className="text-red-500 text-xs">Required</span>}
                                        </div>
                                    )}
                                />
                                <Controller
                                    control={control}
                                    name={`tests[${num - 1}].mistakes`}
                                    defaultValue={test.mistakes || ''}
                                    render={({ field }) => (
                                        <div className="mb-2 w-full">
                                            <label htmlFor={`mistakes-${num}`} className="block text-gray-700 text-sm font-bold mb-1">מספר טעויות:</label>
                                            <input
                                                type="number"
                                                id={`mistakes-${num}`}
                                                min={0}
                                                {...field}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            />
                                            {errors.tests?.[num - 1]?.mistakes && <span className="text-red-500 text-xs">Required</span>}
                                        </div>
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleReset(num)}
                                    className="bg-red-500 text-white px-4 font-bold rounded mt-2"
                                >
                                    לאפס
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="text-center">
                    <button type="submit" className="bg-blue-500 text-white px-10 font-bold py-2 rounded w-[60%] max-w-[350px]">עדכן</button>
                </div>
            </form>
        </div>
    );
};

export default Theories;
