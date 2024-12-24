import React from 'react';
import { FaTruck } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCurrentUser } from '../../firebase/useCurerntUser';

const Error404 = () => {
    const { currentUser } = useCurrentUser();
    const nav = useNavigate();


    const navigate = () => {
        if (currentUser != null) nav(-1);
        else nav('/')
    }

    return (
        <div className='flex flex-col justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-purple-500 text-white'>
            <motion.div
                initial={{ opacity: 0, scale: 1.8 }}
                animate={{ opacity: 1, scale: 1.2 }}
                transition={{ duration: 2 }}
                className='w-[80%] max-w-[500px] flex flex-col gap-4 items-center p-5 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg '>
                <FaTruck className='text-6xl mb-2 animate-bounce' style={{ animationDuration: '1.5s' }} />
                <p className='text-6xl font-extrabold'>404</p>
                <p className='text-2xl font-semibold'>הדף לא נמצא</p>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={navigate}
                    className='mt-4 bg-green-500 hover:bg-green-600 transition-colors p-2 rounded-lg px-5 text-lg font-bold'>
                    חזור לדף בית
                </motion.button>
            </motion.div>
        </div>
    );
}

export default Error404;
