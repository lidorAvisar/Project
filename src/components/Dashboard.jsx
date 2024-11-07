import React from 'react'
import PieChartComponent from './PieChartComponent'
import BarChartActiveStudents from './BarChartActiveStudents';
import Highlights from './Highlights';
import TeachersTableReport from './TeachersTableReport';

const Dashboard = ({ setOpenModalDashboard }) => {

    const topTeacher = { name: "משה כהן", hours: 120 };
    const bestCycle = { name: "מחזור אביב", performance: 95 };

    const testData = [
        { name: 'טסט-8', value: 0, color: '#900C3F' },
        { name: 'טסט-7', value: 0, color: '#C70039' },
        { name: 'טסט-6', value: 0, color: '#FF5733' },
        { name: 'טסט-5', value: 5, color: '#AF19FF' },
        { name: 'טסט-4', value: 40, color: '#FF8042' },
        { name: 'טסט-3', value: 10, color: '#FFBB28' },
        { name: 'טסט-2', value: 40, color: '#00C49F' },
        { name: 'טסט-1', value: 50, color: '#0088FE' },
    ];

    const theoriesData = [
        { name: 'תאוריה-8', value: 0, color: '#900C3F' },
        { name: 'תאוריה-7', value: 0, color: '#C70039' },
        { name: 'תאוריה-6', value: 0, color: '#FF5733' },
        { name: 'תאוריה-5', value: 5, color: '#AF19FF' },
        { name: 'תאוריה-4', value: 40, color: '#FF8042' },
        { name: 'תאוריה-3', value: 10, color: '#FFBB28' },
        { name: 'תאוריה-2', value: 40, color: '#00C49F' },
        { name: 'תאוריה-1', value: 50, color: '#0088FE' },
    ];

    const studentData = [
        { name: '1', value: 80 },
        { name: '2', value: 15 },
        { name: '3', value: 50 },
        { name: '4', value: 20 },
        { name: '5', value: 50 },
        { name: '6', value: 12 },
        { name: '7', value: 17 },
        { name: '8', value: 14 },
        { name: '9', value: 13 },
        { name: '10', value: 16 },
        { name: '11', value: 30 },
        { name: '12', value: 10 },
    ];

    const teachersData = [
        { name: 'משה כהן', school: 'שרייבר', hoursWorked: 120 },
        { name: 'משה כהן', school: 'שרייבר', hoursWorked: 100 },
        { name: 'משה כהן', school: 'שרייבר', hoursWorked: 100 },
        { name: 'משה כהן', school: 'שרייבר', hoursWorked: 200 },
        { name: 'משה כהן', school: 'שרייבר', hoursWorked: 100 },
        { name: 'משה כהן', school: 'יובלי', hoursWorked: 90 },
        { name: 'משה כהן', school: 'יובלי', hoursWorked: 90 },
        { name: 'משה כהן', school: 'יובלי', hoursWorked: 200 },
        { name: 'משה כהן', school: 'יובלי', hoursWorked: 70 },
        { name: 'משה כהן', school: 'יובלי', hoursWorked: 90 },
        { name: 'משה כהן', school: 'צבאי', hoursWorked: 130 },
        { name: 'משה כהן', school: 'צבאי', hoursWorked: 10 },
        { name: 'משה כהן', school: 'צבאי', hoursWorked: 19},
        { name: 'משה כהן', school: 'צבאי', hoursWorked: 180 },
        { name: 'משה כהן', school: 'צבאי', hoursWorked: 130 },
    ];



    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md'>
            <div className='w-[100%] bg-slate-100 p-4 py-5 mb-3 rounded-lg h-full overflow-y-auto'>
                <p className='text-center font-bold text-2xl py-3'>תמונת מצב</p>
                <div className='w-full flex flex-col items-center gap-3 md:flex-row justify-around py-6'>
                    <div className='flex flex-col  justify-center items-center'>
                        <p className='font-bold text-xl'>תאוריות</p>
                        <PieChartComponent data={theoriesData} />
                    </div>
                    <div className='flex flex-col justify-center items-center'>
                        <p className='font-bold text-xl'>טסטים</p>
                        <PieChartComponent data={testData} />
                    </div>
                </div>
                <div>
                    <BarChartActiveStudents data={studentData} size={600} />
                </div>
                <div className='p-4'>
                <p className='font-bold text-xl text-center p-1'>טבלת מורים</p>
                    <TeachersTableReport teachersData={teachersData} />
                </div>
                <div className="p-4">
                    <Highlights topTeacher={topTeacher} bestCycle={bestCycle} />
                </div>
                <div className='flex justify-center py-8 '>
                    <button onClick={() => setOpenModalDashboard(false)} className='w-[50%] max-w-96 bg-red-500 text-white p-0.5 sm:p-1 rounded-md px-5 sm:px-8 font-bold'>סגור</button>
                </div>
            </div>
        </div>
    )
}

export default Dashboard