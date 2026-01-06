import { Navigate, useLocation } from 'react-router-dom';

interface RequireAdminProps {
    children: JSX.Element;
}

const RequireAdmin = ({ children }: RequireAdminProps) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const isAdmin = user?.role === 'Admin' || user?.selectedRole === 'Admin';

    if (!token || !isAdmin) {
        return <Navigate to="/" replace state={{ from: location.pathname }} />;
    }

    return children;
};

export default RequireAdmin;


