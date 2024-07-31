import React from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'

const Layout = () => {


  return (
    <div className='h-screen flex flex-col'>
      <div className=''><Navbar /></div>
      <div className=''><Outlet /></div>
      <div className=' fixed bottom-0 inset-x-0'><Footer /></div>
    </div>

  )
}

export default Layout