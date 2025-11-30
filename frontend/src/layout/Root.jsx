import React from 'react';
import Navbar from '../components/nav/Navbar';
import { Outlet } from 'react-router';

const Root = () => {
    return (
        <div>
            <Navbar />
            <Outlet/>
        </div>
    );
};

export default Root;