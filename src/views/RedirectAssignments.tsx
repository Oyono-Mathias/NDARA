import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

/**
 * @fileOverview Redirection de la route anglaise vers la route française unifiée 'devoirs'.
 */
export function RedirectAssignments() {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/student/devoirs', { replace: true });
    }, [navigate]);

    return null;
}
