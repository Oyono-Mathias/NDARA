import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { BookOpen, Users, DollarSign, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  pendingDevoirs: number;
  pendingQna: number;
  estimatedRevenue: number;
}

export const InstructorDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalCourses: 5,
        publishedCourses: 3,
        totalStudents: 142,
        pendingDevoirs: 12,
        pendingQna: 5,
        estimatedRevenue: 450000 // Informatif uniquement
      });
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500">Bienvenue dans votre espace instructeur.</p>
      </div>

      {loading || !stats ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-blue-600 mb-2">
                  <BookOpen className="w-5 h-5" />
                  <span className="text-sm font-medium">Cours (Publiés)</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{stats.publishedCourses} <span className="text-sm text-gray-400 font-normal">/ {stats.totalCourses}</span></p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-green-600 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium">Étudiants</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{stats.totalStudents}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-orange-600 mb-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Q&A en attente</span>
                </div>
                <p className="text-2xl font-black text-gray-900">{stats.pendingQna}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm ring-1 ring-gray-100 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-blue-800 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-sm font-medium">Revenus estimés</span>
                </div>
                <p className="text-xl font-black text-gray-900">{stats.estimatedRevenue} XAF</p>
                <p className="text-[10px] text-gray-500 leading-tight mt-1">* Soumis à validation serveur</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm ring-1 ring-gray-100">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Actions requises</h3>
                {stats.pendingDevoirs > 0 ? (
                  <div className="flex items-center justify-between bg-orange-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-bold text-orange-900">{stats.pendingDevoirs} devoirs à corriger</p>
                      </div>
                    </div>
                    <Link to="/instructor/devoirs" className="text-sm font-bold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-lg">Voir</Link>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucune action requise pour le moment.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
