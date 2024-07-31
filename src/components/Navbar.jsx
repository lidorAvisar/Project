import React from 'react'
import '../../public/Atal_-_logo.png'
import '../../public/בית ספר ללוגיסטיקה.png'
import '../../public/תג_חיל_הלוגיסטיקה2.png'
import '../../public/Hatal.png'

const Navbar = () => {
    return (
        <div className='h-20 flex bg-slate-200  justify-around items-center'>
            <div className='flex items-center gap-1'>
                <img className='h-8  sm:h-12  sm:w-14' src="בית ספר ללוגיסטיקה.png" alt="" />
                <img className='h-8 sm:h-12  sm:w-10' src="תג_חיל_הלוגיסטיקה2.png" alt="" />
            </div>
            <p className='sm:text-2xl font-bold text-blue-800'>בית ספר ללימודי נהיגה</p>
            <div className='flex items-center gap-2'>
                <img className='h-8 sm:h-12  sm:w-12' src="Hatal.png" alt="" />
                <img className='h-8 sm:h-12  sm:w-12' src="Atal_-_logo.png" alt="" />
            </div>
            
        </div>
    )
}

export default Navbar