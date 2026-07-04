import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Archive, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { useRole } from '../../context/RoleContext';
import { SwipeableItem } from '../ui/SwipeableItem';
import { TouchArea } from '../ui/TouchArea';
import { TopAppBar } from '../ui/TopAppBar';
import { NdaraSkeleton } from '../../views/admin/AdminSupport';

function ChatItem({ chat, selectedChatId, basePath, currentUser }: any) {
    const [partnerName, setPartnerName] = useState<string>('');
    const [partnerAvatar, setPartnerAvatar] = useState<string | null>(null);

    useEffect(() => {
        if (!chat.participants || !currentUser) return;
        const partnerId = chat.participants.find((p: string) => p !== currentUser.uid);
        if (partnerId) {
            const fetchPartner = async () => {
                try {
                    const docRef = doc(db, 'users', partnerId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setPartnerName(data.name || data.displayName || data.fullName || 'Utilisateur');
                        setPartnerAvatar(data.photoURL || data.avatarUrl || null);
                    } else {
                        setPartnerName('Utilisateur');
                    }
                } catch (e) {
                    setPartnerName('Utilisateur');
                }
            };
            fetchPartner();
        }
    }, [chat.participants, currentUser]);

    const displayName = chat.name || partnerName || 'Chat ' + chat.id.substring(0, 4);
    const displayAvatar = chat.avatar || partnerAvatar;

    return (
        <SwipeableItem
            leftAction={<div className="flex flex-col items-center"><Trash2 className="w-5 h-5 mb-1" /><span className="text-[10px] uppercase font-bold tracking-wider">Supprimer</span></div>}
            rightAction={<div className="flex flex-col items-center"><Archive className="w-5 h-5 mb-1" /><span className="text-[10px] uppercase font-bold tracking-wider">Archiver</span></div>}
            onSwipeLeft={() => console.log('Delete', chat.id)}
            onSwipeRight={() => console.log('Archive', chat.id)}
        >
            <Link 
                to={`${basePath}?chatId=${chat.id}`}
                className="block w-full h-full"
            >
                <TouchArea
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors relative",
                        selectedChatId === chat.id 
                            ? "bg-emerald-500/10 border-l-[3px] border-emerald-500" 
                            : "hover:bg-[#1E293B]/80 border-l-[3px] border-transparent"
                    )}
                >
                    <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                            {displayAvatar ? <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-white font-bold text-sm shadow-lg">{displayName.substring(0, 2).toUpperCase()}</span>}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#111827]"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h4 className={cn("font-semibold text-sm truncate pr-2", selectedChatId === chat.id ? "text-white" : "text-gray-200")}>
                                {displayName}
                            </h4>
                            {chat.updatedAt && (
                                <span className="text-[10px] text-gray-500 flex-shrink-0">
                                    {new Date(chat.updatedAt?.toDate?.() || chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{chat.lastMessage}</p>
                            {chat.unreadBy?.includes(currentUser.uid) && (
                                <span className="flex-shrink-0 ml-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                                    Nouveau
                                </span>
                            )}
                        </div>
                    </div>
                </TouchArea>
            </Link>
        </SwipeableItem>
    );
}

export function ChatList({ selectedChatId }: { selectedChatId: string | null }) {
    const { currentUser } = useRole();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/instructor') ? '/instructor/messages' : '/student/messages';
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const userDisplayName = currentUser?.name || currentUser?.displayName || currentUser?.fullName || 'Utilisateur';

    useEffect(() => {
        if (!currentUser?.uid) return;
        setLoading(true);
        const q = query(
            collection(db, 'chats'), 
            where('participants', 'array-contains', currentUser.uid),
            orderBy('updatedAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snap) => {
            const rawChats = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
            // Deduplicate by partner
            const uniqueChats: any[] = [];
            const seenPartners = new Set<string>();
            rawChats.sort((a, b) => {
                const aTime = a.updatedAt?.toMillis?.() || 0;
                const bTime = b.updatedAt?.toMillis?.() || 0;
                return bTime - aTime;
            });
            for (const chat of rawChats) {
                const partnerId = chat.participants?.find((p: string) => p !== currentUser.uid);
                if (partnerId) {
                    if (!seenPartners.has(partnerId)) {
                        seenPartners.add(partnerId);
                        uniqueChats.push(chat);
                    }
                } else {
                    uniqueChats.push(chat);
                }
            }
            setChats(uniqueChats);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser?.uid]);

    return (
        <div className="flex flex-col h-full shrink-0 font-sans">
            {/* Sidebar Header */}
            <div className="flex-shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 border-b border-[#334155]">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-emerald-500/20">
                            {userDisplayName.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white leading-tight">Messages</h1>
                            <p className="text-[10px] text-gray-500">{chats.length} conversations</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-[#1E293B] transition-colors relative">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                        </button>
                        <button className="p-2 rounded-lg hover:bg-[#1E293B] transition-colors relative">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>
                </div>
                
                {/* Search */}
                <div className="relative group">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <input type="text" placeholder="Rechercher une conversation..." 
                           className="w-full bg-[#1E293B] border border-[#334155] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex-shrink-0 px-4 py-2 border-b border-[#334155]">
                <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">Tout</button>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-gray-400 hover:text-white whitespace-nowrap">
                        Non lus 
                        {chats.filter(c => c.unreadBy?.includes(currentUser?.uid || '')).length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded-full text-[10px]">
                                {chats.filter(c => c.unreadBy?.includes(currentUser?.uid || '')).length}
                            </span>
                        )}
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                {loading ? (
                    <NdaraSkeleton type="list" />
                ) : chats.length > 0 ? chats.map(chat => (
                    <ChatItem key={chat.id} chat={chat} selectedChatId={selectedChatId} basePath={basePath} currentUser={currentUser} />
                )) : (
                    <div className="text-center text-gray-500 text-sm mt-8">Aucune discussion</div>
                )}
            </div>
        </div>
    );
}
