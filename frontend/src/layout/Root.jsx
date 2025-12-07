import React from 'react';
import { Outlet } from 'react-router';
import RootNav from '../components/nav/RootNav';

const Root = () => {
    return (
        <div className='bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500'>
            <RootNav />
            <Outlet/>
        </div>
    );
};

export default Root;