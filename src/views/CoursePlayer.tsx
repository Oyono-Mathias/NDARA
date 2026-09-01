import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFirestoreDocument } from '../hooks/data/useFirestoreDocument';
import { ClientCourse } from '../hooks/catalog/useCatalogClient';
import { Button } from '../components/ui/button';
import { VideoPlayer } from '../components/ui/VideoPlayer';
import { ArrowLeft, Menu, X, CheckCircle2, Circle } from 'lucide-react';

export const CoursePlayer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: course, loading, error, empty } = useFirestoreDocument<ClientCourse>('courses', id || null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (error || empty || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">Impossible de charger le lecteur</h1>
          <p className="text-gray-400 mb-8">{error?.message || 'Cours introuvable.'}</p>
          <Link to="/courses">
            <Button variant="outline">Retour au catalogue</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Mock modules for the UI presentation
  const mockModules = [
    { id: 'm1', title: 'Introduction', duration: '12:30', completed: true },
    { id: 'm2', title: 'Les fondamentaux', duration: '45:00', completed: false },
    { id: 'm3', title: 'Pratique avancée', duration: '30:15', completed: false },
    { id: 'm4', title: 'Conclusion et certification', duration: '10:00', completed: false },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="h-[64px] bg-black border-b border-gray-800 flex items-center justify-between px-4 shrink-0 safe-area-top z-20">
        <div className="flex items-center">
          <Link to={`/courses/${id}`} className="p-2 -ml-2 text-gray-400 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="ml-2 font-semibold text-sm sm:text-base line-clamp-1">{course.title}</h1>
        </div>
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 flex flex-col bg-black relative">
          <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col justify-center">
            {/* Aspect ratio container for 16:9 video */}
            <div className="w-full aspect-video bg-gray-900">
              <VideoPlayer 
                src="https://www.w3schools.com/html/mov_bbb.mp4" 
                poster={course.thumbnailUrl}
                autoPlay={false}
              />
            </div>
            
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Les fondamentaux</h2>
              <p className="text-gray-400 text-sm mb-6">Module 2 • 45 minutes</p>
              
              <div className="prose prose-invert max-w-none text-gray-300">
                <p>Bienvenue dans ce module central. Prenez des notes et n'hésitez pas à revoir les passages complexes.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Overlay (Mobile) */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 z-10 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar (Curriculum) */}
        <div className={`
          absolute lg:relative top-0 bottom-0 right-0 z-20
          w-full sm:w-80 bg-gray-900 border-l border-gray-800 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 border-b border-gray-800 bg-black shrink-0">
            <h3 className="font-bold text-lg">Contenu du cours</h3>
            <div className="w-full bg-gray-800 rounded-full h-1.5 mt-4 mb-2">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
            </div>
            <p className="text-xs text-gray-400">1 / 4 modules terminés</p>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col">
              {mockModules.map((module, index) => (
                <button 
                  key={module.id}
                  className={`
                    flex items-start p-4 text-left border-b border-gray-800/50 hover:bg-gray-800 transition-colors focus:outline-none focus:bg-gray-800 min-h-[64px]
                    ${index === 1 ? 'bg-gray-800 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="mt-0.5 mr-3 shrink-0">
                    {module.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : index === 1 ? (
                      <Circle className="w-5 h-5 text-blue-500 fill-blue-500/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${index === 1 ? 'text-white' : 'text-gray-300'}`}>
                      {index + 1}. {module.title}
                    </h4>
                    <span className="text-xs text-gray-500 mt-1 block">{module.duration}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
