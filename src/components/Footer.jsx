import React from 'react'
import '../../public/Hatal.png'
import '../../public/זרוע_היבשה.png'

const Footer = () => {
    const currentYear = new Date().getFullYear();


    return (
        <div className='flex justify-center items-center  gap-2  sm:gap-3 bg-slate-300 h-8  w-full'>
            <p className='font-semibold text-sm  sm:text-base text-center'>©{currentYear} פותח ע"י יחידת חט"ל\תוכניות וחדשנות </p>
        </div>
    )
}

export default Footer