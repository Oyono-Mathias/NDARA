import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useRole } from '../../context/RoleContext';

export function ChatList({ selectedChatId }: { selectedChatId: string | null }) {
    const { currentUser } = useRole();
    const [chats, setChats] = useState<any[]>([]);

    useEffect(() => {
        if (!currentUser?.uid) return;
        const q = query(
            collection(db, 'chats'), 
            where('participants', 'array-contains', currentUser.uid)
        );
        const unsubscribe = onSnapshot(q, (snap) => {
            setChats(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [currentUser?.uid]);

    return (
        <div className="flex flex-col h-full bg-slate-900/50 p-4 shrink-0">
            <div className="relative mb-6 shrink-0 mt-4">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="text-gray-500 w-4 h-4" />
                </div>
                <input 
                    type="text" 
                    placeholder="Rechercher une discussion..." 
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                />
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                {chats.length > 0 ? chats.map(chat => (
                    <Link 
                        key={chat.id} 
                        to={`/student/messages?chatId=${chat.id}`}
                        className={cn(
                            "rounded-3xl p-4 flex items-center gap-4 transition relative overflow-hidden group border",
                            selectedChatId === chat.id 
                                ? "bg-amber-500/10 border-amber-500/30" 
                                : "bg-slate-900 border-white/5 hover:bg-white/5"
                        )}
                    >
                        {selectedChatId === chat.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-800 flex items-center justify-center">
                            {chat.avatar ? <img src={chat.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-white font-bold">{chat.name?.substring(0, 2).toUpperCase() || 'CH'}</span>}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className={cn("font-bold text-sm", selectedChatId === chat.id ? "text-amber-500" : "text-white")}>
                                    {chat.name || 'Chat ' + chat.id.substring(0, 4)}
                                </h3>
                                <span className={cn("text-xs font-bold", chat.unread?.[currentUser?.uid] > 0 ? "text-amber-500" : "text-gray-500")}>
                                    {chat.updatedAt ? new Date(chat.updatedAt?.toDate?.() || chat.updatedAt).toLocaleTimeString() : ''}
                                </span>
                            </div>
                            <p className="text-gray-400 text-xs line-clamp-1">{chat.lastMessage}</p>
                        </div>
                        {chat.unread?.[currentUser?.uid] > 0 && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 text-[10px] font-black shrink-0">
                                {chat.unread[currentUser.uid]}
                            </div>
                        )}
                    </Link>
                )) : (
                    <div className="text-center text-slate-500 text-sm mt-8">Aucune discussion</div>
                )}
            </div>
        </div>
    );
}
