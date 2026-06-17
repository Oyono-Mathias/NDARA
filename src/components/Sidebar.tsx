import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Search, BookOpen, Wallet, LayoutGrid, Bot, TrendingUp, Users, MessageSquare, Award, Bookmark, User, Bell, LifeBuoy, LogOut, ArrowLeftRight, Heart, Medal, ShoppingBag, Folder, BadgeCheck, Tag, Megaphone, ClipboardCheck, FileQuestion, Star, Building, Settings, Terminal, DownloadCloud } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { cn } from '../lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { currentUser, role } = useRole();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (e) {
            console.error("Logout error", e);
        }
    };

    if (!isOpen) return null;

    const isInstructorMode = location.pathname.startsWith('/instructor');

    return (
        <div className="absolute inset-0 z-[100] flex justify-start transition-opacity duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            {/* Sidebar content */}
            <div className="w-[85%] max-w-sm h-full bg-[#111827] relative shadow-[10px_0_30px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-left duration-300">
                <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-teal-500 flex items-center justify-center text-white font-black text-lg">
                                N
                            </div>
                            <span className="font-serif font-black text-xl tracking-tight text-white uppercase">NDARA</span>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Profile Summary */}
                    <div className="px-6 mb-8">
                        <div className="bg-slate-900 border border-white/5 rounded-3xl p-5 flex flex-col gap-2 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-xl -mr-10 -mt-10" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-700">
                                    {currentUser?.profilePictureURL ? (
                                        <img src={currentUser.profilePictureURL} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-bold text-white">{currentUser?.fullName?.substring(0, 2).toUpperCase() || '👤'}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-white uppercase tracking-tight text-lg">{currentUser?.fullName || 'Utilisateur'}</h3>
                                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{isInstructorMode ? 'EXPERT NDARA' : 'ÉTUDIANT NDARA'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Groups */}
                    <div className="px-4 space-y-8">
                        {isInstructorMode ? (
                            <>
                                <div className="space-y-3">
                                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">CHANGER DE MODE</p>
                                    <button 
                                        onClick={() => { navigate('/student/dashboard'); onClose(); }}
                                        className="w-full h-12 rounded-2xl bg-white/5 flex items-center justify-center gap-3 text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition"
                                    >
                                        <ArrowLeftRight size={16} />
                                        ÉTUDIANT
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">• GESTION</p>
                                    <NavItem icon={LayoutGrid} label="COCKPIT DASHBOARD" to="/instructor/dashboard" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={BookOpen} label="CATALOGUE FORMATIONS" to="/instructor/courses" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Folder} label="SUPPORTS & RESSOURCES" to="/instructor/resources" current={location.pathname} onClick={onClose} />
                                </div>

                                <div className="space-y-2">
                                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">• CROISSANCE</p>
                                    <NavItem icon={BadgeCheck} label="AMBASSADEUR ELITE" to="/instructor/ambassador" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Tag} label="COUPONS & MARKETING" to="/instructor/coupons" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Megaphone} label="RADAR ANNONCES" to="/instructor/annonces" current={location.pathname} onClick={onClose} />
                                </div>

                                <div className="space-y-2">
                                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">• PÉDAGOGIE</p>
                                    <NavItem icon={ClipboardCheck} label="USINE DE CORRECTION" to="/instructor/devoirs" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={FileQuestion} label="ÉVALUATION (QUIZ)" to="/instructor/quiz" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={MessageSquare} label="INTERACTIONS Q&R" to="/instructor/qna" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Star} label="AVIS & TÉMOIGNAGES" to="/instructor/avis" current={location.pathname} onClick={onClose} />
                                </div>

                                <div className="space-y-2">
                                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">• RÉSULTATS</p>
                                    <NavItem icon={Users} label="BASE ÉTUDIANTS" to="/instructor/students" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Building} label="WEALTH MANAGEMENT" to="/instructor/revenus" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Award} label="REGISTRE DIPLÔMES" to="/instructor/certificats" current={location.pathname} onClick={onClose} />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* EXPERT MODE */}
                                {role === 'admin' || role === 'instructor' ? (
                                    <div className="space-y-3">
                                        <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">CHANGER DE MODE</p>
                                        <button 
                                            onClick={() => { navigate(role === 'admin' ? '/admin' : '/instructor'); onClose(); }}
                                            className="w-full h-12 rounded-2xl bg-white/5 flex items-center justify-center gap-3 text-slate-300 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition"
                                        >
                                            <ArrowLeftRight size={16} />
                                            EXPERT
                                        </button>
                                    </div>
                                ) : null}

                                {/* UNIV */}
                                <div className="space-y-2">
                                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">VOTRE UNIVERS</p>
                                    <NavItem icon={LayoutGrid} label="TABLEAU DE BORD" to="/student/dashboard" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Search} label="CATALOGUE" to="/student/search" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Wallet} label="PORTEFEUILLE" to="/student/wallet" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={TrendingUp} label="BOURSE" to="/student/bourse" badge="HOT" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={BookOpen} label="MES COURS" to="/student/courses" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={DownloadCloud} label="TÉLÉCHARGEMENTS" to="/student/downloads" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Bot} label="TUTEUR MATHIAS" to="/student/mathias" badge="IA" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={ShoppingBag} label="MARCHÉ E-BOOK" to="/student/ebooks" badge="NEW" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={LayoutGrid} label="OUTILS & TEMPLATES" to="/student/tools" badge="HOT" current={location.pathname} onClick={onClose} />
                                </div>

                                {/* COMM */}
                                <div className="space-y-2">
                                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">RÉSEAU COMMUNAUTAIRE</p>
                                    <NavItem icon={Terminal} label="LABO SANDBOX" to="/student/sandbox" badge="BETA" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Users} label="COMMUNAUTÉS (SQUADS)" to="/student/squads" badge="NEW" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={TrendingUp} label="AMBASSADEUR" to="/student/ambassador" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Users} label="ANNUAIRE NDARA" to="/student/directory" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={MessageSquare} label="MESSAGES" to="/student/messages" current={location.pathname} onClick={onClose} />
                                </div>

                                {/* SUIVI */}
                                <div className="space-y-2">
                                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">MON SUIVI</p>
                                    <NavItem icon={Medal} label="MES SCORES" to="/student/results" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Award} label="DIPLÔMES" to="/student/certificates" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Heart} label="MES FAVORIS" to="/student/wishlist" current={location.pathname} onClick={onClose} />
                                </div>

                                {/* ACCOUNT */}
                                <div className="space-y-2">
                                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">MON COMPTE</p>
                                    <NavItem icon={User} label="PROFIL" to="/student/profile" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={Bell} label="ALERTES" to="/student/notifications" current={location.pathname} onClick={onClose} />
                                    <NavItem icon={LifeBuoy} label="SUPPORT" to="/student/support" current={location.pathname} onClick={onClose} />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer fixed */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-900 border-t border-white/5">
                    <button onClick={handleLogout} className="w-full h-14 rounded-2xl bg-red-500/10 text-red-500 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-red-500/20 transition">
                        <LogOut size={18} />
                        DÉCONNEXION
                    </button>
                </div>
            </div>
        </div>
    );
}

function NavItem({ icon: Icon, label, to, badge, current, onClick }: { icon: any, label: string, to: string, badge?: string, current: string, onClick: () => void }) {
    const isActive = current === to || current.startsWith(to + '/');
    return (
        <Link 
            to={to} 
            onClick={onClick}
            className={cn(
                "flex items-center justify-between p-4 rounded-3xl transition-all group",
                isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800/50 text-slate-400"
            )}
        >
            <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-colors", isActive ? "bg-primary/20 text-primary" : "bg-white/5 text-slate-500 group-hover:text-slate-300")}>
                    <Icon size={20} />
                </div>
                <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
            </div>
            {badge && (
                <span className="px-2 py-1 rounded-full bg-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">
                    {badge}
                </span>
            )}
        </Link>
    );
}
