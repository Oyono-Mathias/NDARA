import React, { useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FolderTree, BookOpen, Search, Filter, Plus, FileVideo, CheckSquare, Book } from 'lucide-react';
import { TouchArea } from '../../../components/ui/TouchArea';
import { EbooksManager } from './EbooksManager';
import { CoursesManager } from './CoursesManager';
import { CategoriesManager } from './CategoriesManager';
import { CourseBuilder } from './CourseBuilder';

export function AdminCatalogView() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const tabs = [
    { label: 'Formations', path: '/admin/catalog', icon: BookOpen },
    { label: 'Catégories', path: '/admin/catalog/categories', icon: FolderTree },
    { label: 'Ebooks', path: '/admin/catalog/ebooks', icon: Book },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black uppercase tracking-widest text-white">Catalogue</h1>
      </div>

      <div className="flex border-b border-white/10">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path || (tab.path !== '/admin/catalog' && location.pathname.startsWith(tab.path));
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 py-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors ${
                isActive ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6">
        <Routes>
          <Route path="/" element={<CoursesManager />} />
          <Route path="/categories" element={<CategoriesManager />} />
          <Route path="/ebooks" element={<EbooksManager />} />
          <Route path="/courses/:courseId/builder" element={<CourseBuilder />} />
        </Routes>
      </div>
    </div>
  );
}
