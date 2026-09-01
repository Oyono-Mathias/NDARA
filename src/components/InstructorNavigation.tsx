import React from 'react';
import { NavLink } from 'react-router-dom';
import { classNames } from '../lib/utils';
import { BookOpen, Users, LayoutDashboard, Calendar } from 'lucide-react';

export const InstructorNavigation: React.FC = () => {
  const links = [
    { name: 'Tableau de bord', path: '/instructor', icon: LayoutDashboard },
    { name: 'Mes Cours', path: '/instructor/courses', icon: BookOpen },
    { name: 'Étudiants', path: '/instructor/students', icon: Users },
    { name: 'Planning', path: '/instructor/schedule', icon: Calendar },
  ];

  return (
    <nav className="flex flex-col space-y-1" aria-label="Navigation Instructeur">
      {links.map((link) => (
        <NavLink
          key={link.name}
          to={link.path}
          end={link.path === '/instructor'}
          className={({ isActive }) =>
            classNames(
              "flex items-center px-3 py-3 min-h-[44px] rounded-xl text-base sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500",
              isActive
                ? "bg-purple-50 text-purple-700"
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
