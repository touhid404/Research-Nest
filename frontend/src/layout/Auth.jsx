
import { Outlet } from 'react-router';
const Auth = () => {
    return (
        <div className='min-h-screen'>

            <main className=''>
                <Outlet></Outlet>
            </main>

            {/* <Footer/> */}

            
        </div>
    );
};

export default Auth;
