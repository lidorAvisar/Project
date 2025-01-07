import React, { useState } from 'react'
import { GiArchiveRegister } from 'react-icons/gi'
import { useMutation, useQueryClient } from 'react-query';
import { archiveStudent, deleteAccount } from '../../firebase/firebase_config';

const MoveToArchive = ({ setOpenModalMoveToArchive, allUsers }) => {
    const queryClient = useQueryClient();
    const [selectedCycle, setSelectedCycle] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // const { data, isLoading: isUsersLoading, refetch: usersRefetch } = useQuery({
    //     queryKey: ['users'],
    //     queryFn: async () => await getAccounts(),
    // });

    const uniqueCycles = [...new Set(allUsers?.filter(student => student.user === "תלמידים").map(student => student.cycle))]

    const { mutate: archived, isLoading: archiveLoading } = useMutation({
        mutationKey: ['student_archive'],
        mutationFn: async (students) => {
            try {
                // Archive all students in the selected cohort
                for (const student of students) {
                    await archiveStudent(student);
                    deleteMutation(student.uid); // Delete each student after archiving
                }
            }
            catch (error) {
                console.log(error);
                alert("העברת התלמידים לארכיון נכשלה.");
            }
        },
        onSuccess: async () => {
            alert("התלמידים הועברו לארכיון בהצלחה!");
            await queryClient.invalidateQueries(['users']);
        },
        onSettled: () => {
            setIsProcessing(false); // Stop loading UI
            setOpenModalMoveToArchive(false);
        }
    });

    const { mutate: deleteMutation, isLoading: deleteLoading } = useMutation({
        mutationKey: ['users'],
        mutationFn: async (id) => {
            await deleteAccount(id);
        }
    });

    const handleMoveToArchive = () => {
        if (!selectedCycle) {
            alert("נא לבחור מחזור להעברה לארכיון");
            return;
        }

        const studentsToArchive = allUsers.filter(student => student.cycle === selectedCycle);

        if (studentsToArchive.length > 0 && window.confirm(`האם אתה בטוח שברצונך להעביר את כל תלמידי מחזור ${selectedCycle} לארכיון? פעולה זו תמחוק אותם מהפעילות`)) {
            setIsProcessing(true); // Start loading UI
            archived(studentsToArchive); // Archive and delete students
        }
        else {
            alert("לא נמצאו תלמידים להעברה.");
        }
    };

    if (isProcessing || archiveLoading || deleteLoading) {
        return (
            <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md py-10'>
                <div className='w-[90%] sm:w-[85%] max-w-[600px] bg-slate-100 py-10 p-5 rounded-lg h-[96%] mt-14 mb-20 space-y-10 overflow-y-auto'>
                    <p className='text-center font-bold text-lg'>מבצע העברה לארכיון...</p>
                    <p className='text-center'>אנא המתן, תלמידים מועברים לארכיון.</p>
                </div>
            </div>
        );
    }
    console.log(selectedCycle);


    return (
        <div className='fixed inset-0 h-screen w-full flex items-center justify-center backdrop-blur-md py-10'>
            <div className='flex flex-col justify-between w-[90%] sm:w-[85%] max-w-[600px] bg-slate-100 py-10 p-5 rounded-lg h-[96%] mt-14 mb-20 space-y-10 overflow-y-auto'>
                <p className='text-center font-bold text-lg'>העברת מחזור תלמידים לארכיון</p>
                <div className="flex flex-col items-center">
                    <label htmlFor="cohort-select" className="font-bold mb-2">:בחר מחזור</label>
                    <select
                        id="cohort-select"
                        value={selectedCycle}
                        onChange={(e) => setSelectedCycle(e.target.value)}
                        onInput={(e) => setSelectedCycle(e.target.value)}
                        className='border rounded-md px-4 py-2 mb-5 w-full text-right'
                    >
                        <option value="">בחר מחזור</option>
                        {uniqueCycles.map(cycle => (
                            <option key={cycle} value={cycle}>{cycle}</option>
                        ))}
                    </select>
                </div>
                <p className='text-center font-medium flex flex-col'> <span>:מחזור שנבחר</span><span className='font-bold text-lg'>{selectedCycle || 'נא לבחור מחזור'}</span> </p>
                <div className='flex justify-center'>
                    <button
                        onClick={handleMoveToArchive}
                        className='bg-slate-300 rounded-lg w-fit p-1 px-10 sm:px-12 font-bold flex items-center gap-2'
                    >
                        <GiArchiveRegister className='text-xl' /> <span>העבר לארכיון</span>
                    </button>
                </div>
                <div>
                    <button
                        onClick={() => setOpenModalMoveToArchive(false)}
                        type="button"
                        className="flex w-full justify-center rounded-md bg-red-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600">
                        סגור
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MoveToArchive;
