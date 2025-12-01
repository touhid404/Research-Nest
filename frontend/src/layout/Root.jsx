import React from 'react';
import Navbar from '../components/nav/Navbar';
import { Outlet } from 'react-router';

const Root = () => {
    return (
        <div className='bg-white dark:bg-gray-900'>
            <Navbar />
            <Outlet/>
        </div>
    );
};

export default Root;