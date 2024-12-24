import React, { useState } from 'react'
import { useQuery } from 'react-query';
import { getStudentsTests } from '../../firebase/firebase_config';


const AveragesChart = ({ filteredStudents }) => {

    const tests = [
        'חומ"ס',
        'קשירת מטענים',
        'דויד',
        "ג'יפ",
        'האמר',
        'האמר ממוגן',
        'סאונה',
        'טיגריס',
    ];

    const [selectedTest, setSelectedTest] = useState('');
    const [selectedTestForHardestQuestion, setSelectedTestForHardestQuestion] = useState('');

    const { data: allTests, isLoading } = useQuery({
        queryKey: ["students_tests"],
        queryFn: getStudentsTests,
    });

    const calculateAverage = (testName) => {
        if (!testName) return null;

        // Filter students who took the test
        const studentsWhoTookTest = filteredStudents.filter(student =>
            (student.studentExams || []).some(exam => exam.testName === testName)
        );

        if (studentsWhoTookTest.length === 0) return null;

        // Sum the highest scores of each student for the given test
        const totalScore = studentsWhoTookTest.reduce((sum, student) => {
            const testScores = student.studentExams
                .filter(exam => exam.testName === testName)
                .map(exam => exam.score);

            // Add the highest score of this student for the test
            return sum + Math.max(...testScores);
        }, 0);

        // Calculate average by dividing total score by the number of unique students
        return (totalScore / studentsWhoTookTest.length).toFixed(0);
    };

    const averageScore = calculateAverage(selectedTest);


    const findHardestQuestion = (testName) => {
        if (!testName) return null;

        // Step 1: Get the test details for the selected test and specific date
        const filteredTest = allTests.find(test => test.testName === testName && test.date === "מועד א");
        if (!filteredTest) return null; // If no test matches, return null

        const { questions } = filteredTest; // Array of questions with answers

        // Step 2: Get student tests matching the selected test
        const filteredTestsForStudentsWhoTookIt = filteredStudents.flatMap(student =>
            (student.studentExams || []).filter(test => test.testName === testName)
        );
        if (filteredTestsForStudentsWhoTookIt.length === 0) return null;

        // Step 3: Initialize a count for incorrect answers for each question
        const incorrectCounts = Array(questions.length).fill(0); // One entry per question

        filteredTestsForStudentsWhoTookIt.forEach(test => {
            // Student answers for the test
            const { answers } = test;

            Object.entries(answers).forEach(([key, answerText], index) => {
                const question = questions[index]; // Match question by index
                if (!question) return; // Skip if question is missing

                // Find the correct answer for this question
                const correctAnswer = question.answers.find(answer => answer.isCorrect);
                if (correctAnswer && correctAnswer.text !== answerText) {
                    // Increment count if the student's answer is incorrect
                    incorrectCounts[index]++;
                }
            });
        });

        // Step 4: Find the hardest question (highest incorrect count)
        const hardestQuestionIndex = incorrectCounts.reduce((maxIndex, count, index) =>
            count > incorrectCounts[maxIndex] ? index : maxIndex, 0);

        // Return the hardest question's text or index
        const hardestQuestion = `שאלה מספר ${hardestQuestionIndex + 1}: ${questions[hardestQuestionIndex]?.questionText || ''}`;
        return hardestQuestion;
    };


    const hardestQuestion = findHardestQuestion(selectedTestForHardestQuestion);

    return (
        <div className="flex justify-between gap-2 w-full">
            <div dir='rtl' className="bg-[#b9e6fe] flex flex-col items-center p-1.5 rounded-lg w-full transition-transform duration-300">
                <div className="w-full flex justify-center items-center">
                    <select
                        id="testFilter"
                        value={selectedTestForHardestQuestion}
                        onClick={(e) => setSelectedTestForHardestQuestion(e.target.value)}
                        onInput={(e) => setSelectedTestForHardestQuestion(e.target.value)}
                        className="bg-[#dff4ff] ml-4 px-3 py-1 w-full rounded-md focus:outline-none"
                    >
                        <option value="">-- בחר מבחן --</option>
                        {tests.map((test, index) => (
                            <option key={index} value={test}>
                                {test}
                            </option>
                        ))}
                    </select>
                </div>
                <div
                    dir="rtl"
                    className="bg-[#b9e6fe] flex flex-col items-center py-3 rounded-lg w-full transition-transform duration-300"
                >
                    <p>ממוצע השאלה הכי קשה</p>
                    {selectedTestForHardestQuestion ? (
                        hardestQuestion !== null ? (
                            <p className="text-lg font-bold">{hardestQuestion}</p>
                        ) : (
                            <p className="text-sm text-gray-500">אין נתונים זמינים</p>
                        )
                    ) : (
                        <p className="text-sm text-gray-500">בחר מבחן להצגת ממוצע</p>
                    )}
                </div>
            </div>

            <div dir='rtl' className="bg-[#b9e6fe] flex flex-col items-center p-1.5 rounded-lg  w-full transition-transform duration-300">
                <div className="w-full flex justify-center items-center">
                    <select
                        id="testFilter"
                        value={selectedTest}
                        onClick={(e) => setSelectedTest(e.target.value)}
                        onInput={(e) => setSelectedTest(e.target.value)}
                        className="bg-[#dff4ff] ml-4 px-3 py-1 w-full rounded-md focus:outline-none"
                    >
                        <option value="">-- בחר מבחן --</option>
                        {tests.map((test, index) => (
                            <option key={index} value={test}>
                                {test}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Averages Display */}
                <div className="flex justify-between gap-2 w-full">
                    <div
                        dir="rtl"
                        className="bg-[#b9e6fe] flex flex-col items-center py-2 rounded-lg w-full transition-transform duration-300"
                    >
                        <p>ממוצע ציוני בוחן</p>
                        {selectedTest ? (
                            averageScore !== null ? (
                                <p className="text-lg font-bold">{averageScore}</p>
                            ) : (
                                <p className="text-sm text-gray-500">אין נתונים זמינים</p>
                            )
                        ) : (
                            <p className="text-sm text-gray-500">בחר מבחן להצגת ממוצע</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AveragesChart