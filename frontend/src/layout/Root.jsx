import React from 'react';
import { Outlet } from 'react-router';
import RootNav from '../components/nav/RootNav';

const Root = () => {
    return (
        <div className='bg-white dark:bg-gray-900'>
            <RootNav />
            <Outlet/>
        </div>
    );
};

export default Root;