import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * @fileOverview Redirection de l'ancienne route vers la route unifiée Android-First.
 */
export function RedirectMesFormations() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate('/student/courses', { replace: true });
    }, [navigate]);

    return null;
}
