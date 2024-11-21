import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const StudentExam = ({ filteredTests, testName, setOpenTestModal }) => {
    const { register, handleSubmit } = useForm();
    const [currentTest, setCurrentTest] = useState(null);
    const [showBTests, setShowBTests] = useState(false);
    const [testsA, setTestsA] = useState([]);
    const [testsB, setTestsB] = useState([]);

    // Step 1: Filter A and B tests
    useEffect(() => {
        const testsA = filteredTests.filter(test => test.date === 'מועד א');
        const testsB = filteredTests.filter(test => test.date === 'מועד ב');
        setTestsA(testsA);
        setTestsB(testsB);
        setCurrentTest(testsA.find(test => test.testName === testName));
    }, [testName, filteredTests]);

    // Step 2: Warn user before leaving the page
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'האם אתה בטוח שאתה רוצה לצאת? התשובות שלך יאבדו..';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const onSubmit = (data) => {
        if (!currentTest) return;

        // Step 3: Check answers
        const { questions } = currentTest;
        let score = 0;

        questions.forEach((question, index) => {
            const selectedAnswer = data[`question_${index}`];
            const correctAnswer = question.answers.find(answer => answer.isCorrect);

            if (selectedAnswer === correctAnswer.text) {
                score += 10;
            }
        });

        if (score >= 70) {
            alert('מזל טוב! עברת את המבחן.');
        } else {
            alert(`הציון שלך ${score}. לא עברת 🥲. לא נורא תוכל לעשות עכשיו מבחן של מועד הבא😇.`);
            setShowBTests(true);
        }
    };

    // Warn user when trying to leave the component
    const handleClose = () => {
        if (window.confirm('האם אתה בטוח שאתה רוצה לצאת? התשובות שלך יאבדו.')) {
            setOpenTestModal(false);
        }
    };
    console.log(filteredTests);


    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center'>
            <div className='relative w-[100%] bg-gray-100 p-4 sm:p-10 py-12 mb-5 rounded-lg h-full overflow-y-auto'>
                <div className='flex items-center justify-between w-full py-3'>
                    <button onClick={handleClose} className='bg-red-500 text-white p-1 px-10 rounded-md font-bold'>
                        חזור
                    </button>
                </div>

                {currentTest ? (
                    <form dir='rtl' onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mb-5">
                        <h2 className="text-xl font-bold text-center mb-4">{currentTest.testName} - {currentTest.date}</h2>

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
                    <p>Loading test...</p>
                )}

                {/* Show B Test Message/Button */}
                {showBTests && (
                    <div className="relative w-full">
                        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-6 p-4 bg-yellow-100 rounded-md text-center">
                            <p className="text-yellow-800 font-bold mb-4">
                                .לא עברת את המבחן. נא לגשת למבחן הבא
                            </p>
                            <button
                                onClick={() => setCurrentTest(testsB[0])}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md font-bold"
                            >
                                הצג מבחני תאריך B
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentExam;
