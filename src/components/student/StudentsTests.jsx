import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { addStudentsTests, getStudentsTests } from '../../firebase/firebase_config';
import StudentsTestsList from '../student/StudentsTestsList';

const StudentsTests = ({ setOpenModalStudentsTests }) => {

    const [openModaltestsList, setOpenModalTestsList] = useState(false);
    const [test, setTest] = useState([]);
    const [testName, setTestName] = useState("");

    const { register, handleSubmit, reset, control, setValue, watch, formState: { errors, isDirty } } = useForm({
        defaultValues: {
            vehicleType: '',
            questions: [{ questionText: '', answers: [{ text: '', isCorrect: false }] }]
        }
    });

    const { fields: questionFields, append: addQuestion, remove: removeQuestion } = useFieldArray({
        control,
        name: 'questions'
    });

    const watchQuestions = watch("questions");

    const { data: tests, isLoading: loadingTest, error, refetch } = useQuery('studentsTests', async () => {
        const fetchedTests = await getStudentsTests();
        // Sort by Hebrew alphabet
        return fetchedTests.sort((a, b) => a.testName.localeCompare(b.testName, 'he'));
    });


    const { mutate: addTestMutation, isLoading } = useMutation({
        mutationKey: ["students_tests"],
        mutationFn: async (data) => await addStudentsTests(data),
        onSuccess: () => {
            alert("Test added successfully!");
            setOpenModalStudentsTests(false);
            reset();
        },
    })

    const onSubmit = (data) => {
        data.testName = testName;

        // Validation: Check if every question has a correct answer
        const allQuestionsHaveCorrectAnswer = data.questions.every((question, index) => {
            const hasCorrectAnswer = question.answers.some(answer => answer.isCorrect);
            if (!hasCorrectAnswer) {
                setValue(`questions.${index}.error`, true);  // Set an error for questions missing a correct answer
            }
            return hasCorrectAnswer;
        });

        if (!allQuestionsHaveCorrectAnswer) {
            alert('אנא סמן תשובה אחת נכונה!');
            return;
        }
        addTestMutation(data);
    };

    const handleClose = () => {
        if (isDirty) {
            const confirmClose = window.confirm(
                "האם אתה בטוח לצאת? אם לא שמרת הנתונים לא ישמרו."
            );
            if (!confirmClose) return;
        }

        setOpenModalStudentsTests(false);
    };

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isDirty) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);


    if (loadingTest) return <p>Loading...</p>;
    if (error) return <p>Error loading tests</p>;

    return (
        <div className="fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md">
            <div className="w-full max-w-[1200px] bg-slate-100 p-1 rounded-lg h-[92%] overflow-y-auto shadow-lg">
                {openModaltestsList && <StudentsTestsList setOpenModalTestsList={setOpenModalTestsList} test={test} refetch={refetch} />}
                {/* Header */}
                <div className="flex justify-between items-center mb-5 p-2">
                    <button
                        onClick={() => handleClose()}
                        className="bg-red-500 text-white px-5 py-2 rounded-md font-bold"
                    >
                        סגור
                    </button>
                    <p className="text-2xl font-bold text-right">מבחני תלמידים</p>
                    <div></div>
                </div>

                {/* Tests List Section */}
                <section className="mb-8 p-5 bg-white rounded-md shadow-sm border">
                    <p dir="rtl" className="text-xl font-bold underline text-right mb-4">רשימת מבחנים:</p>
                    <div className='flex justify-center'>
                        <div dir='rtl' className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {tests?.map(test => (
                                <button
                                    key={test.uid}
                                    onClick={() => {
                                        setTest(test); // Set the selected test
                                        setOpenModalTestsList(true); // Open the modal
                                    }}
                                    className="p-2 px-14 bg-gray-400 text-white rounded-md shadow transition duration-200 text-lg"
                                >
                                    {`${test.testName || 'לא ידוע'} - ${test.date || 'לא ידוע'}`}
                                </button>
                            ))}
                        </div>
                    </div>

                </section>

                {/* Add New Test Section */}
                <section className="p-6 bg-white rounded-md shadow-sm border">
                    <p className="text-xl font-bold underline text-right mb-6">:הוספת מבחן</p>
                    <form onSubmit={handleSubmit(onSubmit)}>

                        {/* Vehicle Type Input */}
                        <div className="mb-6">
                            <label className="block text-right text-lg font-semibold mb-2">:מבחן על</label>
                            <select
                                dir="rtl"
                                {...register("vehicleType", { required: true })}
                                className="w-full p-3 border border-gray-300 rounded-md text-lg bg-white"
                                onClick={(e) => { const selectedOption = e.target.options[e.target.selectedIndex].text; { setTestName(selectedOption) } }}
                                onInput={(e) => { const selectedOption = e.target.options[e.target.selectedIndex].text; { setTestName(selectedOption) } }}
                            >
                                <option className='text-base' value="">בחר סוג מבחן. . . </option>
                                <option value="hazardousMaterialsScore">מבחן חומ"ס</option>
                                <option value="cargoSecuringScore">מבחן קשירת מטענים</option>
                                <option value="davidCarScore">מבחן דויד</option>
                                <option value="jeepCarScore">מבחן ג'יפ</option>
                                <option value="hummerCarScore">מבחן האמר</option>
                                <option value="hummerProtectedCarScore">מבחן האמר ממוגן</option>
                                <option value="saunaCarScore">מבחן סאונה</option>
                                <option value="tigerCarScore">מבחן טיגריס</option>
                            </select>
                        </div>

                        {/* Date Selection */}
                        <div className="mb-6">
                            <label className="block text-right text-lg font-semibold mb-2">:מועד</label>
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
                        <div className='flex flex-col items-center justify-center'>
                            <button
                                type="button"
                                onClick={() => addQuestion({ questionText: '', answers: [{ text: '', isCorrect: false }] })}
                                className="w-full sm:w-[50%] max-w-[500px] mt-6 py-2 bg-green-600 text-white rounded-md font-bold"
                            >
                                הוסף שאלה
                            </button>


                            <button
                                type="submit"
                                className="w-full sm:w-[50%] max-w-[500px] mt-6 py-2 bg-blue-600 text-white rounded-md font-bold "
                            >
                                <span className={`${isLoading && 'animate-pulse'}`}>{isLoading ? 'Loading . . .' : 'שמור'}</span>
                            </button>
                        </div>
                    </form>
                    <div className='flex justify-center pt-5 mb-6'>
                        <button
                            onClick={() => handleClose()}
                            className="bg-red-500 w-full sm:w-[50%] max-w-[500px] text-white px-5 py-2 rounded-md font-bold"
                        >
                            סגור
                        </button>
                    </div>
                </section>
            </div>
        </div>

    );
};

export default StudentsTests;
