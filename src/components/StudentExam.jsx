import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { createUserExam } from '../firebase/firebase_config';
import Cookies from 'js-cookie'; // Import js-cookie

const StudentExam = ({ filteredTests, testName, setOpenTestModal, uid }) => {
    const { register, handleSubmit, reset } = useForm();

    const [currentTest, setCurrentTest] = useState(null);
    const [showNextTest, setShowNextTest] = useState(false);
    const [testsA, setTestsA] = useState([]);
    const [testsB, setTestsB] = useState([]);
    const [deadline, setDeadline] = useState('A'); // Track deadlines (A, B, C)
    const containerRef = useRef(null);

    const { mutate: addExamMutation, isLoading } = useMutation({
        mutationKey: ["users"],
        mutationFn: async (data) => {
            await createUserExam(uid, data);
        },
    });

    useEffect(() => {
        const filteredByName = filteredTests.filter(test => test.testName === testName);

        // Separate tests by deadline
        const testsA = filteredByName.filter(test => test.date === 'מועד א');
        const testsB = filteredByName.filter(test => test.date === 'מועד ב');

        setTestsA(testsA);
        setTestsB(testsB);

        // Restore progress from cookie
        const savedTestData = Cookies.get('studentTestProgress');
        if (savedTestData) {
            const { lastTestName, lastDeadline } = JSON.parse(savedTestData);

            if (lastTestName === testName && lastDeadline) {
                setDeadline(lastDeadline);
                if (lastDeadline === 'A' && testsA.length > 0) {
                    setCurrentTest(testsA[0]);
                } else if (lastDeadline === 'B' && testsB.length > 0) {
                    setCurrentTest(testsB[0]);
                } else if (lastDeadline === 'C' && testsA.length > 0) {
                    setCurrentTest(testsA[0]);
                } else {
                    setCurrentTest(null); // No further tests available
                }
                return;
            }
        }

        // Default: Start with מועד א if available
        if (testsA.length > 0) {
            setCurrentTest(testsA[0]);
            setDeadline('A');
        } else {
            setCurrentTest(null); // No tests available
        }
    }, [testName, filteredTests]);


    const updateTestProgressInCookie = (testName, deadline) => {
        Cookies.set('studentTestProgress', JSON.stringify({ lastTestName: testName, lastDeadline: deadline }), {
            expires: 356,
        });
    };

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'האם אתה בטוח שאתה רוצה לצאת? התשובות שלך יאבדו.';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const onSubmit = (data) => {
        if (!currentTest) return;

        const { questions } = currentTest;
        let score = 0;

        // Calculate the score
        questions.forEach((question, index) => {
            const selectedAnswer = data[`question_${index}`];
            const correctAnswer = question.answers.find(answer => answer.isCorrect);
            if (selectedAnswer === correctAnswer.text) score += 10;
        });

        const testResult = {
            testName: currentTest.testName,
            examDate: new Date(),
            date: deadline,
            score,
            answers: data,
        };

        // Save test progress in Firebase
        addExamMutation(testResult);

        // Reset form
        reset();

        // Handle the result
        if (score >= 70) {
            alert(`מזל טוב קיבלת ${score} ! עברת את המבחן.`);
            updateTestProgressInCookie(currentTest.testName, 'D');
            setCurrentTest(null);
            setOpenTestModal(false);
        }
        else {
            if (deadline === 'A') {
                alert(`הציון שלך הוא ${score}. לא עברת 🥲. לא נורא, תוכל לעשות עכשיו מבחן של מועד ב 😇.`);
                if (testsB.length > 0) {
                    setDeadline('B');
                    setCurrentTest(testsB[0]);
                } else {
                    setDeadline('B');
                    setCurrentTest(testsA[0]);
                }
                updateTestProgressInCookie(currentTest.testName, 'B');
                setShowNextTest(true);
            }
            else if (deadline === 'B') {
                alert(`הציון שלך הוא ${score}. לא עברת 🥲. לא נורא, תוכל לעשות עכשיו מבחן של מועד ג 😇.`);
                if (testsB.length > 0) {
                    setDeadline('C');
                    setCurrentTest(testsB[0]);
                } else {
                    setDeadline('C');
                    setCurrentTest(testsA[0]);
                }
                updateTestProgressInCookie(currentTest.testName, 'C');
                setShowNextTest(true);
            }
            else {
                alert(`הציון שלך הוא ${score}. לא ניתן יותר לבצע מבחן נוסף.`);
                updateTestProgressInCookie(currentTest.testName, 'D');
                setCurrentTest(null);
                setOpenTestModal(false);
            }
        }
    };

    const handleClose = () => {
        if (window.confirm('האם אתה בטוח שאתה רוצה לצאת? התשובות שלך יאבדו.')) {
            setOpenTestModal(false);
        }
    };

    const handleNextTest = () => {
        setShowNextTest(false);
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    console.log(currentTest);
    console.log(testsA);
    console.log(testsB);


    return (
        <div className='z-30 fixed inset-0 h-screen w-full flex items-center justify-center'>
            <div
                ref={containerRef}
                className='relative w-full bg-gray-100 p-4 sm:p-10 py-12 mb-5 rounded-lg h-full overflow-y-auto scroll-smooth'
            >
                <div className='flex items-center justify-between w-full py-3'>
                    <button onClick={handleClose} className='bg-red-500 text-white p-1 px-10 rounded-md font-bold'>
                        חזור
                    </button>
                </div>

                {currentTest ? (
                    <form dir='rtl' onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mb-5">
                        <h2 className="text-xl font-bold text-center mb-4">
                            {currentTest.testName} - {deadline === 'A' ? 'מועד א' : deadline === 'B' ? 'מועד ב' : 'מועד ג'}
                        </h2>
                        {currentTest.questions.map((question, index) => (
                            <div key={index} className="p-4 bg-white shadow rounded-md">
                                <h3 className="font-bold text-lg mb-3">{index + 1}. {question.questionText}</h3>
                                <div className="flex flex-col gap-2">
                                    {question.answers.map((answer, answerIndex) => (
                                        <label key={answerIndex} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                value={answer.text}
                                                {...register(`question_${index}`, { required: true })}
                                                className="form-radio"
                                            />
                                            {answer.text}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md font-bold">
                            בדוק מבחן
                        </button>
                    </form>
                ) : (
                    <p className="text-center text-lg font-bold">
                        {deadline === null
                            ? 'לא ניתן לגשת למבחן נוסף. כל המועדים נוצלו.'
                            : '.אין מבחנים זמינים כרגע'}
                    </p>
                )}

                {showNextTest && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 bg-yellow-100 rounded-md text-center">
                        <p className="text-yellow-800 font-bold mb-4">
                            לא עברת את המבחן. נא לגשת למבחן הבא
                        </p>
                        <button
                            onClick={handleNextTest}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md font-bold"
                        >
                            עבור למבחן
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentExam;
