import React, { useEffect, useState } from 'react';
import { IoMenu } from 'react-icons/io5';
import { updateAccount } from '../firebase/firebase_config';
import { useForm } from 'react-hook-form';

const theoryList = [1, 2, 3, 4, 5, 6, 7, 8];

const Theories = ({ studentDetails, setOpenModalStudentData, refetch }) => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const [openFormIndex, setOpenFormIndex] = useState(null);
    const [selectedTheorySessions, setSelectedTheorySessions] = useState({});
    const [selectedTheoryTest, setSelectedTheoryTest] = useState({});
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
        setSelectedTheoryTest(prev => {
            const newSelectionTests = { ...prev };
            for (const num of theoryList) {
                newSelectionTests[num] = num <= studentDetails.theoryTestsQuantity;
            }
            return newSelectionTests;
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

    const handleTheoryTestClick = (num) => {
        setSelectedTheoryTest(prev => {
            const newSelection = { ...prev };
            if (prev[num]) {
                let maxSelected = Math.max(...Object.keys(prev).filter(key => prev[key]));
                if (num === maxSelected) {
                    newSelection[num] = false;
                    setTheoryTestsCount(prev => prev - 1);
                }
            } else {
                let minNotSelected = Math.min(...theoryList.filter(i => !prev[i]));
                if (num === minNotSelected) {
                    for (let i = 1; i <= num; i++) {
                        newSelection[i] = true;
                        setTheoryTestsCount(i);
                    }
                }
            }
            return newSelection;
        });
    };

    const handleMenuClick = (index) => {
        setOpenFormIndex(index === openFormIndex ? null : index);
    };

    const today = new Date().toISOString().split('T')[0];

    const onSubmit = async (data) => {
        const studentUid = studentDetails.uid;
        const updatedData = {
            theorySessionsQuantity: theorySessionsCount,
            theoryTestsQuantity: theoryTestsCount,
            detailsTheoryTest: data.data.map((test, index) => ({
                ...test,
                testNumber: index + 1,
                mistakes: parseInt(test.mistakes, 10),
            })),
        };
        try {
            await updateAccount(studentUid, updatedData);
            refetch();
            setOpenModalStudentData(false);
        }
        catch (error) {
            console.error("Error updating student data: ", error);
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
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-10">
                    {theoryList.map((num, index) => (
                        <div key={num} className='w-full h-full'>
                            <button
                                type="button"
                                onClick={() => { handleTheoryTestClick(num) }}
                                className={`mt-1 block w-full px-2 py-1.5 text-center text-white rounded-t-md 
                            ${selectedTheoryTest[num] ? 'bg-green-500' : 'bg-gray-400'} 
                            ${num === 7 && selectedTheoryTest[num] ? 'bg-orange-400' : ''} 
                            ${num === 8 && selectedTheoryTest[num] ? 'bg-red-500' : ''}`}
                            >
                                <span className='hidden sm:block'>מבחן</span> {num}
                            </button>
                            {selectedTheoryTest[num] && (
                                <button
                                    type='button'
                                    onClick={() => handleMenuClick(index)}
                                    className='flex justify-center text-lg w-full px-2 py-2 text-center text-white rounded-b-md bg-blue-400'
                                >
                                    <IoMenu />
                                </button>
                            )}
                            {openFormIndex === index && (
                                <div className="absolute inset-0  flex flex-col items-center justify-center space-y-5 pt-9 z-10 p-4 bg-gray-100 bg-opacity-60 backdrop-blur-md rounded-md">
                                    <p className='font-bold text-lg'>מבחן {index + 1}</p>
                                    <div className='w-[85%]  max-w-[450px]'>
                                        <div className="mb-2">
                                            <label htmlFor={`date-${index}`} className="block w-[90%] text-gray-700 text-sm font-bold mb-1">תאריך:</label>
                                            <input
                                                min={today}
                                                type="date"
                                                name={`data[${index}].date`}
                                                id={`date-${index}`}
                                                defaultValue={studentDetails.detailsTheoryTest?.find(test => test.testNumber === num)?.date || ''}
                                                onInput={(e) => setValue(`data[${index}].date`, e.target.value)}
                                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline `}
                                                {...register(`data[${index}].date`)}
                                            />
                                            {errors.data?.[index]?.date && <span className="text-red-500 text-xs">Required</span>}
                                        </div>
                                        <div className="mb-2">
                                            <label htmlFor={`mistakes-${index}`} className="block w-[90%] text-gray-700 text-sm font-bold mb-1">מספר טעויות:</label>
                                            <input
                                                min={0}
                                                type="number"
                                                name={`data[${index}].mistakes`}
                                                id={`mistakes-${index}`}
                                                defaultValue={studentDetails.detailsTheoryTest?.find(test => test.testNumber === num)?.mistakes || 0}
                                                onInput={(e) => setValue(`data[${index}].mistakes`, e.target.value)}
                                                className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                                                {...register(`data[${index}].mistakes`)}
                                            />
                                            {errors.data?.[index]?.mistakes && <span className="text-red-500 text-xs">Required</span>}
                                        </div>
                                        <div className="flex justify-center gap-3 items-center">
                                            <button
                                                onClick={() => setOpenFormIndex(null)}
                                                type="button"
                                                className="bg-red-500 hover:bg-red-600 w-80 mt-3 text-white font-bold py-2 px-12 rounded focus:outline-none focus:shadow-outline"
                                            >
                                                סגור
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="text-center">
                    <button type="submit" className="bg-blue-500 text-white px-10 font-bold py-2 rounded w-[60%] max-w-[350px]">עדכן</button>
                </div>
            </form>
        </div>
    );
};

export default Theories;
