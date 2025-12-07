import { Navigate, Outlet } from "react-router";
import useAuth from "../hooks/useAuth";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>loading</div>;

    return user ? children : <Navigate to="/auth/login" replace />;
};
export default PrivateRoute;