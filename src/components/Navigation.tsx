import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../context/RoleContext';
import { AdminNavigation } from './AdminNavigation';
import { InstructorNavigation } from './InstructorNavigation';
import { NavLink } from 'react-router-dom';
import { classNames } from '../lib/utils';
import { LayoutDashboard, BookOpen, Settings } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { role, loading } = useRole();

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-2 p-2">
        <div className="h-11 bg-gray-100 rounded-xl animate-pulse"></div>
        <div className="h-11 bg-gray-100 rounded-xl animate-pulse"></div>
        <div className="h-11 bg-gray-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (role === 'admin') {
    return <AdminNavigation />;
  }

  if (role === 'instructor') {
    return <InstructorNavigation />;
  }

  const userLinks = [
    { name: 'Mon Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Mes Formations', path: '/dashboard/learning', icon: BookOpen },
    { name: 'Paramètres', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <nav className="flex flex-col space-y-1" aria-label="Navigation Utilisateur">
      {userLinks.map((link) => (
        <NavLink
          key={link.name}
          to={link.path}
          end={link.path === '/dashboard'}
          className={({ isActive }) =>
            classNames(
              "flex items-center px-3 py-3 min-h-[44px] rounded-xl text-base sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            )
          }
        >
          <link.icon className="mr-3 h-6 w-6 sm:h-5 sm:w-5 flex-shrink-0" aria-hidden="true" />
          {link.name}
        </NavLink>
      ))}
    </nav>
  );
};
