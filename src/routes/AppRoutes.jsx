import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Login from '../pages/Login';
import SuperAdmin from '../pages/SuperAdmin';
import Admin from '../pages/Admin';
import DrivingTeacher from '../pages/DrivingTeacher';
import Error404 from '../components/Error404';
import { useCurrentUser } from '../firebase/useCurerntUser';
import { Loading } from '../components/Loading';
import Student from '../pages/Student';
import SuperSuperAdmin from '../pages/SuperSuperAdmin';
import Contractor from '../pages/Contractor';


const AppRoutes = () => {
    const [currentUser, loading] = useCurrentUser();
    const navigate = useNavigate();


    useEffect(() => {
        if (!loading) {
            if (currentUser != null) {
                switch (currentUser.user) {
                    case 'תלמידים':
                        navigate('/student');
                        break;
                    case 'מורה נהיגה':
                        navigate('/driving_teacher');
                        break;
                    case 'מ"מ':
                        navigate('/admin');
                        break;
                    case 'מ"פ':
                        navigate('/super_admin');
                        break;
                    case 'מנהל':
                        navigate('/super_super_admin');
                        break;
                    case 'קבלן':
                        navigate('/contractor');
                        break;
                    default:
                        navigate('/');
                }
            }
            else {
                navigate('/')
            }
        }
    }, [currentUser, loading, navigate]);

    if (loading) {
        return (
            <div >
                <Layout />
                <div className='absolute top-16 left-0 right-0 '><Loading /></div>
            </div>
        );
    }

    if (currentUser != null) {
        return (
            <Routes>
                <Route path='/' element={<Layout />}>
                    <Route index element={<Login />} />
                    <Route path='/student' element={<Student />} />
                    <Route path='/driving_teacher' element={<DrivingTeacher />} />
                    <Route path='/admin' element={<Admin />} />
                    <Route path='/super_admin' element={<SuperAdmin />} />
                    <Route path='/super_super_admin' element={<SuperSuperAdmin />} />
                    <Route path='/contractor' element={<Contractor />} />
                </Route>
                <Route path='*' element={<Error404 />} />
            </Routes>

        );
    }
    else {
        return (
            <Routes>
                <Route path='/' element={<Layout />}>
                    <Route index element={<Login />} />
                </Route>
                <Route path='*' element={<Error404 />} />
            </Routes>
        )

    }

};

export default AppRoutes;
