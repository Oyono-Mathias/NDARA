import { Plus, Search, MoreVertical, Edit2, Play, Eye } from "lucide-react";
import { Link } from "react-router-dom";

export function InstructorCourses() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-white mb-2 leading-none">Catalogue</h1>
          <p className="text-secondary text-sm font-bold uppercase tracking-wider">Usine à Savoir</p>
        </div>
        <Link 
          to="/instructor/courses/create"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary text-background font-bold text-sm shadow-[0_0_20px_rgba(204,119,34,0.4)] hover:shadow-[0_0_30px_rgba(204,119,34,0.6)] hover:bg-amber-600 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Importer un Chapitre
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
         <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-500 w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher une formation..." 
            className="w-full bg-card border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-secondary/50 focus:ring-1 focus:ring-secondary/50 transition-all font-medium"
          />
        </div>
        <div className="flex gap-2">
            <button className="px-5 py-3 rounded-full text-sm font-bold bg-white/10 text-white border border-white/10">Tous</button>
            <button className="px-5 py-3 rounded-full text-sm font-bold bg-transparent text-gray-500 hover:text-white transition">En ligne</button>
            <button className="px-5 py-3 rounded-full text-sm font-bold bg-transparent text-gray-500 hover:text-white transition">Examen</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CourseCard 
            title="Trading & Finance Décentralisée"
            status="En ligne"
            revenue="850,000 XAF"
            students="124"
            image="1611974789855-9c2a0a7236a3"
        />
        <CourseCard 
            title="Fondations du Mobile Money Africain"
            status="En ligne"
            revenue="340,000 XAF"
            students="86"
            image="1581091226825-a6a2a5aee158"
        />
        <CourseCard 
            title="Souveraineté Numérique"
            status="En examen"
            revenue="-"
            students="0"
            image="1518770660439-4636190af475"
            draft
        />
      </div>
    </div>
  );
}

function CourseCard({ title, status, revenue, students, image, draft }: any) {
    return (
        <div className="glass rounded-3xl p-5 card-hover relative overflow-hidden group border border-white/5">
            <div className={`absolute top-0 left-0 w-full h-1 ${draft ? 'bg-amber-500' : 'bg-primary'} opacity-50`}></div>
            <div className="w-full h-40 rounded-2xl overflow-hidden bg-card mb-5 relative group-hover:shadow-[0_0_20px_rgba(204,119,34,0.15)] transition-all">
               <img src={`https://images.unsplash.com/photo-${image}?auto=format&fit=crop&q=80&w=400&h=300`} alt="Course" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute top-3 left-3">
                   <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md backdrop-blur-md border border-white/10 ${draft ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'}`}>
                       {status}
                   </span>
               </div>
               <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-white/10 transition cursor-pointer">
                   <MoreVertical className="w-4 h-4 text-white" />
               </div>
            </div>
            
            <h3 className="font-serif text-lg font-bold text-white line-clamp-2 mb-4 h-14">{title}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Généré</p>
                    <p className="text-sm font-bold text-white">{revenue}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Étudiants</p>
                    <p className="text-sm font-bold text-white flex items-center gap-1.5"><Users className="w-3 h-3 text-secondary"/> {students}</p>
                </div>
            </div>

            <div className="flex gap-2">
                <Link to="/instructor/courses/edit/1" className="flex-1 glass-light py-2.5 rounded-xl text-center text-xs font-bold text-white hover:bg-white/10 transition flex items-center justify-center gap-2">
                   <Edit2 className="w-3 h-3"/> Éditeur
                </Link>
                <button className="flex-1 bg-white/5 py-2.5 rounded-xl text-center text-xs font-bold text-gray-300 hover:text-white transition flex items-center justify-center gap-2">
                   <Eye className="w-3 h-3"/> Aperçu
                </button>
            </div>
        </div>
    );
}

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
