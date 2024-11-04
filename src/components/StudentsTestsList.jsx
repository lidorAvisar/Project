import React, { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { updateStudentsTests } from '../firebase/firebase_config';

const StudentsTestsList = ({ setOpenModalTestsList, test, refetch }) => {

    const { register, handleSubmit, control, setValue, watch, formState: { errors, isDirty } } = useForm({
        defaultValues: {
            vehicleType: test?.vehicleType || '',
            date: test?.date || '',
            questions: test?.questions || [{ questionText: '', answers: [{ text: '', isCorrect: false }] }]
        }
    });

    const { fields: questionFields, append: addQuestion, remove: removeQuestion } = useFieldArray({
        control,
        name: 'questions'
    });

    const watchQuestions = watch("questions");

    const { mutate: updateTestMutation, isLoading } = useMutation({
        mutationKey: ["students_tests"],
        mutationFn: async (data) => await updateStudentsTests(data, test.uid),
        onSuccess: async () => {
            await refetch();
            alert("Test updated successfully!");
            setOpenModalTestsList(false);
        },
    });

    useEffect(() => {
        if (test) {
            setValue("vehicleType", test.vehicleType);
            setValue("date", test.date);
            setValue("questions", test.questions);
        }
    }, [test, setValue]);

    const onSubmit = (data) => {
        updateTestMutation(data);
    };

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isDirty) {
                event.preventDefault();
                event.returnValue = ''; // Required for Chrome to show the confirmation dialog
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    return (
        <div className="fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md">
            <div className="w-full max-w-[1200px] bg-slate-100 p-6 rounded-lg h-[92%] overflow-y-auto shadow-lg">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <button
                        onClick={() => setOpenModalTestsList(false)}
                        className="bg-green-500 text-white px-5 py-2 rounded-md font-bold"
                    >
                        חזרה
                    </button>
                    <p className="text-2xl font-bold text-right">מבחן {test.vehicleType} - {test.date}</p>
                </div>
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Vehicle Type Input */}
                        <div className="mb-6">
                            <label className="block text-right text-lg font-semibold mb-2">סוג רכב</label>
                            <input
                                dir="rtl"
                                type="text"
                                {...register("vehicleType", { required: true, maxLength: 50 })}
                                className="w-full p-3 border border-gray-300 rounded-md text-lg"
                                placeholder="הזן סוג רכב..."
                            />
                        </div>

                        {/* Date Selection */}
                        <div className="mb-6">
                            <label className="block text-right text-lg font-semibold mb-2">מועד</label>
                            <select
                                dir="rtl"
                                className="w-full p-3 border border-gray-300 rounded-md text-lg"
                                {...register("date", { required: true })}
                            >
                                <option value="">בחר מועד...</option>
                                <option value="מועד א">מועד א</option>
                                <option value="מועד ב">מועד ב</option>
                            </select>
                        </div>

                        {/* Questions Section */}
                        {questionFields.map((question, qIndex) => (
                            <div
                                key={question.id}
                                className={`mb-6 p-4 bg-gray-50 rounded-lg border ${errors?.questions?.[qIndex]?.error ? 'border-red-500' : ''}`}
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(qIndex)}
                                        className="text-red-500 font-bold"
                                    >
                                        X
                                    </button>
                                    <label className="text-right text-lg font-semibold">שאלה {qIndex + 1}</label>
                                </div>

                                <textarea
                                    dir="rtl"
                                    {...register(`questions.${qIndex}.questionText`, { required: true, maxLength: 250 })}
                                    className="w-full p-3 border border-gray-300 rounded-md text-right text-lg"
                                    placeholder="הזן שאלה..."
                                />

                                <div className="mt-4">
                                    <p className="text-right text-lg font-semibold mb-2">:תשובות</p>
                                    {watchQuestions[qIndex].answers.map((answer, aIndex) => (
                                        <div key={aIndex} className="flex items-center mb-2">
                                            <textarea
                                                dir="rtl"
                                                {...register(`questions.${qIndex}.answers.${aIndex}.text`, { required: true, maxLength: 250 })}
                                                className="w-full p-3 border border-gray-300 rounded-md text-right text-lg"
                                                placeholder={`הזן תשובה ${aIndex + 1}...`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedAnswers = watchQuestions[qIndex].answers.filter((_, idx) => idx !== aIndex);
                                                    setValue(`questions.${qIndex}.answers`, updatedAnswers);
                                                }}
                                                className="ml-2 text-red-500 font-bold"
                                            >
                                                X
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedAnswers = watchQuestions[qIndex].answers.map((ans, idx) => ({
                                                        ...ans,
                                                        isCorrect: idx === aIndex
                                                    }));
                                                    setValue(`questions.${qIndex}.answers`, updatedAnswers);
                                                }}
                                                className={`ml-2 px-3 py-1 rounded-md font-semibold ${answer.isCorrect ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
                                            >
                                                {answer.isCorrect ? 'תשובה נכונה' : 'סמן כנכונה'}
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updatedAnswers = [...watchQuestions[qIndex].answers, { text: '', isCorrect: false }];
                                            setValue(`questions.${qIndex}.answers`, updatedAnswers);
                                        }}
                                        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md font-bold"
                                    >
                                        הוסף תשובה
                                    </button>
                                </div>
                                {errors?.questions?.[qIndex]?.error && (
                                    <p className="text-red-500 text-right mt-2">אנא סמן תשובה נכונה</p>
                                )}
                            </div>
                        ))}

                        {/* Add Question Button */}
                        <button
                            type="button"
                            onClick={() => addQuestion({ questionText: '', answers: [{ text: '', isCorrect: false }] })}
                            className="w-full mt-6 py-2 bg-green-600 text-white rounded-md font-bold"
                        >
                            הוסף שאלה
                        </button>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full mt-6 py-2 bg-blue-600 text-white rounded-md font-bold"
                        >
                            <span className={`${isLoading && 'animate-pulse'}`}>{isLoading ? 'Loading . . .' : 'שמור'}</span>
                        </button>
                    </form>
                    <div className="flex justify-center py-4 items-center mb-5 w-full">
                        <button
                            onClick={() => setOpenModalTestsList(false)}
                            className="bg-red-500 w-full text-white px-5 py-2 rounded-md font-bold"
                        >
                            סגור
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentsTestsList
