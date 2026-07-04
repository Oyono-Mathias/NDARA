import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { ChatList } from '../components/chat/ChatList';
import { ChatRoom } from '../components/chat/ChatRoom';
import { useRole } from '../context/RoleContext';
import { Loader2, MessageSquarePlus, Users } from 'lucide-react';
import { FAB } from '../components/ui/FAB';
import { BottomSheet } from '../components/ui/BottomSheet';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { TouchArea } from '../components/ui/TouchArea';

function MessagesPageContent() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isUserLoading, currentUser } = useRole();
    const chatId = searchParams.get('chatId');
    const newChatUser = searchParams.get('newChatUser');
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(false);

    useEffect(() => {
        if (isNewChatOpen && staffList.length === 0) {
            setLoadingStaff(true);
            const q = query(collection(db, 'users'), where('role', 'in', ['admin', 'instructor']));
            getDocs(q).then(snap => {
                setStaffList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setLoadingStaff(false);
            }).catch(err => {
                console.error(err);
                setLoadingStaff(false);
            });
        }
    }, [isNewChatOpen, staffList.length]);

    if (isUserLoading) {
        return (
            <div className="h-[100dvh] w-full flex items-center justify-center bg-[#0B0F19]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    const showRoom = Boolean(chatId || newChatUser);

    const startNewChat = (userId: string) => {
        setIsNewChatOpen(false);
        const basePath = location.pathname.startsWith('/instructor') ? '/instructor/messages' : '/student/messages';
        navigate(`${basePath}?newChatUser=${userId}`);
    };

    return (
        <div 
            className="flex w-full h-[100dvh] relative overflow-hidden bg-[#0b141a]"
        >
            {/* Chat List: Hidden on mobile when room is active */}
            <aside className={`sidebar-panel w-full md:w-[380px] lg:w-[400px] shrink-0 bg-[#111827] border-r border-[#334155] flex-col h-full ${showRoom ? 'hidden md:flex' : 'flex'}`}>
                <ChatList selectedChatId={chatId} />
                {!showRoom && (
                    <FAB 
                        icon={<MessageSquarePlus className="w-6 h-6" />} 
                        onClick={() => setIsNewChatOpen(true)} 
                    />
                )}
            </aside>

            {/* Chat Room: normal grid column, full size on mobile */}
            <main className={`chat-panel flex-1 flex-col h-full bg-[#0B0F19] ${showRoom ? 'flex' : 'hidden md:flex'}`}>
                {showRoom ? (
                    <ChatRoom chatId={chatId} newChatUser={newChatUser} />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-[#0B0F19]">
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl">💬</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Bienvenue sur NDARA Messages</h3>
                            <p className="text-sm text-gray-400 max-w-xs mx-auto">Sélectionnez une conversation pour commencer à discuter. Transférez de l'argent, partagez des fichiers et collaborez.</p>
                        </div>
                    </div>
                )}
            </main>

            <BottomSheet isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)}>
                <div className="p-6 h-[80vh] flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#10B981]" /> Nouvelle Discussion
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {loadingStaff ? (
                            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[#10B981]" /></div>
                        ) : staffList.length > 0 ? (
                            staffList.map(staff => (
                                <TouchArea key={staff.id} onClick={() => startNewChat(staff.id)} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-white/5 transition">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 shrink-0">
                                        {staff.photoURL ? <img src={staff.photoURL} alt={staff.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold">{staff.name?.substring(0, 2).toUpperCase() || 'U'}</div>}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{staff.name || 'Utilisateur'}</div>
                                        <div className="text-xs text-emerald-500 uppercase font-black tracking-wider">{staff.role === 'admin' ? 'Administration' : 'Instructeur'}</div>
                                    </div>
                                </TouchArea>
                            ))
                        ) : (
                            <div className="text-center text-slate-500 text-sm mt-8">Aucun contact trouvé</div>
                        )}
                    </div>
                </div>
            </BottomSheet>
        </div>
    );
}

export function MessagesView() {
    return (
        <Suspense fallback={
            <div className="h-[100dvh] w-full bg-[#0B0F19] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        }>
            <MessagesPageContent />
        </Suspense>
    );
}
