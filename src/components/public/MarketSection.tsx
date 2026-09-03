import React from 'react';
import { Card, CardContent } from '../ui/card';
import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'motion/react';

export const MarketSection: React.FC = () => {
  const mockCourses = [
    {
      id: 1,
      title: 'Maîtrise du Marketing Digital en 2024',
      instructor: 'Équipe NDARA',
      price: '15 000 XAF',
      rating: 4.8,
      category: 'Business',
      img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 2,
      title: 'Développement Web Full-Stack avec React',
      instructor: 'Mathias Tutor',
      price: '25 000 XAF',
      rating: 4.9,
      category: 'Technologie',
      img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 3,
      title: 'Stratégies d\'Investissement Financier',
      instructor: 'Cabinet NDARA Finance',
      price: '20 000 XAF',
      rating: 4.7,
      category: 'Finance',
      img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=600&auto=format&fit=crop'
    }
  ];

  return (
    <div className="bg-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Marché & Formations</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl">
              Explorez notre sélection de contenus éducatifs plébiscités par la communauté.
            </p>
          </div>
          <button className="text-blue-600 font-semibold flex items-center hover:text-blue-700 transition-colors py-2">
            Voir le catalogue complet <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-none shadow-sm ring-1 ring-slate-100 hover:shadow-md transition-shadow group overflow-hidden bg-white">
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  <img 
                    src={course.img} 
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                    {course.category}
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium text-slate-700">{course.rating}</span>
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">{course.instructor}</p>
                  
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
                    <span className="font-bold text-lg text-slate-900">{course.price}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
