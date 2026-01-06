import { useNavigate } from 'react-router-dom';

// Custom hook for role-aware navigation with scroll-to-top (FIX FOR ISSUES #5, #8-11, #19)
export const useRoleNavigation = () => {
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.selectedRole?.toLowerCase() || 'student';

    const navigateWithScroll = (path: string) => {
        navigate(path);
        window.scrollTo(0, 0); // Scroll to top
    };

    const goToDashboard = () => {
        navigateWithScroll(`/${role}/dashboard`);
    };

    return {
        navigate: navigateWithScroll,
        goToDashboard,
        role
    };
};
