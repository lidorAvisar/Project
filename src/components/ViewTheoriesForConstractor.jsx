import React from 'react';

const theoryList = [1, 2, 3, 4, 5, 6, 7, 8];

const ViewTheoriesForConstractor = ({ studentDetails }) => {
    return (
        <div className="mb-6 w-full">
            <div dir="rtl" className="relative w-full bg-white rounded-lg overflow-hidden shadow-lg p-2 sm:p-6 mb-20 my-5 space-y-5">
                <div className="mb-6">
                    <h3 className="text-lg text-center font-bold mb-2 underline">תאוריות</h3>
                    <div className="grid grid-cols-4 gap-4">
                        {theoryList.map(num => (
                            <div
                                key={num}
                                className={`mt-1 block w-full px-2 py-1.5 text-center text-white rounded-md ${num <= studentDetails.theorySessionsQuantity ? 'bg-green-500' : 'bg-gray-400'}`}
                            >
                                <span className='hidden sm:block'>תאוריה</span> {num}
                            </div>
                        ))}
                    </div>
                </div>
                <h3 className="text-lg text-center font-bold mb-2 underline">מבחני תיאוריה</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {theoryList.map(num => {
                        const test = studentDetails.detailsTheoryTest?.find(test => test.testNumber === num) || {};
                        return (
                            <div key={num} className={`shadow-lg rounded-lg p-4 flex flex-col items-center ${test.mistakes === undefined ? '' : (test.mistakes > 4 ? 'bg-red-400' : 'bg-green-400')}`}>
                                <h4 className="text-xl font-bold mb-2">מבחן {num}</h4>
                                <div className="mb-2 w-full">
                                    <p className="text-gray-700 text-sm font-bold mb-1">תאריך:</p>
                                    <p>{test.date || 'לא נרשם תאריך'}</p>
                                </div>
                                <div className="mb-2 w-full">
                                    <p className="text-gray-700 text-sm font-bold mb-1">מספר טעויות:</p>
                                    <p>{test.mistakes !== undefined ? test.mistakes : 'לא נרשם מספר טעויות'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ViewTheoriesForConstractor;
