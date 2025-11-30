import Navbar from '../components/nav/Navbar';
import { Outlet } from 'react-router';
import LeftSidebar from '../components/sidebar/LeftSidebar';
import RightSidebar from '../components/sidebar/RightSidebar';

const Home = () => {
    return (
        <div>
            <Navbar />
            <div className="">
                <LeftSidebar />
                <Outlet />
                <RightSidebar />
            </div>
            
        </div>
    );
};

export default Home;