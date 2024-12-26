import React from 'react'
import Truck from './Truck';


export const Loading = () => {
  return (
    <div className='flex flex-col gap-1 items-center mt-16 text-xl justify-center'>
        <p className='font-bold'>Loading . . .</p>
      <Truck />
    </div>
  )
}
