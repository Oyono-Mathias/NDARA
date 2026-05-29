import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function RedirectMesDevoirs() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/student/devoirs', { replace: true });
    }, [navigate]);

    return null;
}
