import React from 'react';
import { Menu, LogOut, Bell } from 'lucide-react';
import { useRole } from '../../context/RoleContext';
import { auth } from '../../firebase';

export function AdminHeader({ onOpenSidebar }: { onOpenSidebar: () => void }) {
    const { currentUser } = useRole();
    return (
        <div className="flex items-center justify-between h-16 px-4 md:px-8 border-b border-slate-800/50 bg-[#090E17]/90 backdrop-blur-md shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <button onClick={onOpenSidebar} className="md:hidden p-2 -ml-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                    <Menu className="w-6 h-6" />
                </button>
                <span className="font-black text-white tracking-widest text-sm uppercase hidden md:block">NDARA ADMIN CORE</span>
                <span className="font-black text-white tracking-widest text-sm uppercase md:hidden">NDARA ADMIN</span>
            </div>
            
            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-[#090E17]"></span>
                </button>
                <div className="hidden md:flex items-center gap-3 pl-4 border-l border-slate-800">
                    <div className="text-right">
                        <div className="text-sm font-bold text-white">{currentUser?.displayName || currentUser?.email || 'Admin'}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{currentUser?.role || 'System'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
