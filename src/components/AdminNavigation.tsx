import React from 'react';
import { NavLink } from 'react-router-dom';
import { classNames } from '../lib/utils';
import { Users, BookOpen, Settings, LayoutDashboard } from 'lucide-react';

export const AdminNavigation: React.FC = () => {
  const links = [
    { name: 'Tableau de bord', path: '/admin', icon: LayoutDashboard },
    { name: 'Utilisateurs', path: '/admin/users', icon: Users },
    { name: 'Cours', path: '/admin/courses', icon: BookOpen },
    { name: 'Paramètres', path: '/admin/settings', icon: Settings },
  ];

  return (
    <nav className="flex flex-col space-y-1" aria-label="Navigation Administrateur">
      {links.map((link) => (
        <NavLink
          key={link.name}
          to={link.path}
          end={link.path === '/admin'}
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
