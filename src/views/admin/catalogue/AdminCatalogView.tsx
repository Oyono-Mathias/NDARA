import React, { useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FolderTree, BookOpen, Search, Filter, Plus, FileVideo, CheckSquare } from 'lucide-react';
import { TouchArea } from '../../../components/ui/TouchArea';

export function AdminCatalogView() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const tabs = [
    { label: 'Formations', path: '/admin/catalog', icon: BookOpen },
    { label: 'Catégories', path: '/admin/catalog/categories', icon: FolderTree },
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
          <Route path="/courses/:courseId/builder" element={<CourseBuilder />} />
        </Routes>
      </div>
    </div>
  );
}

function CoursesManager() {
  const navigate = useNavigate();
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-bold text-white mb-2">Formations</h2>
      <p className="text-slate-400 mb-6">Gérez l'ensemble des formations du catalogue.</p>
      <TouchArea as="button" onClick={() => navigate('/admin/catalog/courses/new/builder')} className="px-6 py-3 bg-emerald-500 text-slate-950 font-bold uppercase tracking-widest rounded-xl">
        Créer une formation
      </TouchArea>
    </div>
  );
}

function CategoriesManager() {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-bold text-white mb-2">Catégories</h2>
      <p className="text-slate-400 mb-6">Organisez le catalogue en catégories et sous-catégories.</p>
    </div>
  );
}

function CourseBuilder() {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-bold text-white mb-2">Éditeur de formation</h2>
    </div>
  );
}
