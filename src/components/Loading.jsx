import React from 'react'
import { FaTruck } from "react-icons/fa";


export const Loading = () => {
  return (
    <div className='flex flex-col gap-1 items-center mt-16 text-xl justify-center'>
        <p className='animate-bounce text-2xl'><FaTruck /></p>
        <p className='font-bold'>Loading . . .</p>
    </div>
  )
}
