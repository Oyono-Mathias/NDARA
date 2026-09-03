import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import { Loader2 } from 'lucide-react';

export const ProfileRedirect: React.FC = () => {
  const { role, loading } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'instructor') {
        navigate('/instructor', { replace: true });
      } else if (role === 'agent') {
        navigate('/ambassador', { replace: true });
      } else {
        // user
        navigate('/catalog', { replace: true });
      }
    }
  }, [role, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
      <h2 className="text-xl font-bold text-gray-900 text-center">Redirection en cours...</h2>
    </div>
  );
};
