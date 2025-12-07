import { Navigate, Outlet } from "react-router";
import useAuth from "../hooks/useAuth";
import Loader from "../components/loader/Loader";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <Loader/>;

    return user ? children : <Navigate to="/auth/login" replace />;
};
export default PrivateRoute;