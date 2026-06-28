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
                        setPartnerName(data.name || 'Utilisateur');
                        setPartnerAvatar(data.photoURL || null);
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
                        "rounded-2xl p-4 flex items-center gap-4 transition relative overflow-hidden group border",
                        selectedChatId === chat.id 
                            ? "bg-amber-500/10 border-amber-500/30" 
                            : "bg-slate-900 border-white/5 hover:bg-white/5"
                    )}
                >
                    {selectedChatId === chat.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-slate-800 flex items-center justify-center">
                        {displayAvatar ? <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-white font-bold">{displayName.substring(0, 2).toUpperCase()}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className={cn("font-bold text-sm truncate pr-2", selectedChatId === chat.id ? "text-amber-500" : "text-white")}>
                                {displayName}
                            </h3>
                            {chat.updatedAt && (
                                <span className="text-[10px] text-gray-500 shrink-0">
                                    {new Date(chat.updatedAt?.toDate?.() || chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                            <p className="truncate max-w-[200px]">{chat.lastMessage}</p>
                            {chat.unread?.[currentUser.uid] > 0 && (
                                <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    {chat.unread[currentUser.uid]}
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

    useEffect(() => {
        if (!currentUser?.uid) return;
        const q = query(
            collection(db, 'chats'), 
            where('participants', 'array-contains', currentUser.uid)
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
        });
        return () => unsubscribe();
    }, [currentUser?.uid]);

    return (
        <div className="flex flex-col h-full bg-slate-900/50 shrink-0">
            <TopAppBar title="Messagerie" showBack={false} transparent />
            <div className="relative mb-6 shrink-0 mt-4 px-4">
                <div className="absolute inset-y-0 left-4 pl-4 flex items-center pointer-events-none">
                    <Search className="text-gray-500 w-4 h-4" />
                </div>
                <input 
                    type="text" 
                    placeholder="Rechercher une discussion..." 
                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                />
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 px-4 pb-20">
                {chats.length > 0 ? chats.map(chat => (
                    <ChatItem key={chat.id} chat={chat} selectedChatId={selectedChatId} basePath={basePath} currentUser={currentUser} />
                )) : (
                    <div className="text-center text-slate-500 text-sm mt-8">Aucune discussion</div>
                )}
            </div>
        </div>
    );
}
