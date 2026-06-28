import { Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatList } from '../components/chat/ChatList';
import { ChatRoom } from '../components/chat/ChatRoom';
import { useRole } from '../context/RoleContext';
import { Loader2, Plus, MessageSquarePlus } from 'lucide-react';
import { FAB } from '../components/ui/FAB';

function MessagesPageContent() {
    const [searchParams] = useSearchParams();
    const { isUserLoading } = useRole();
    const chatId = searchParams.get('chatId');
    const newChatUser = searchParams.get('newChatUser');

    if (isUserLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        );
    }

    const showRoom = Boolean(chatId || newChatUser);

    return (
        <div className={`grid grid-cols-1 lg:grid-cols-[350px_1fr] w-full h-full relative overflow-hidden bg-black`}>
            {/* Chat List: Hidden on mobile when room is active */}
            <aside className={`border-r border-slate-800 bg-slate-900/20 h-full ${showRoom ? 'hidden lg:block' : 'block'}`}>
                <ChatList selectedChatId={chatId} />
                {!showRoom && (
                    <FAB 
                        icon={<MessageSquarePlus className="w-6 h-6" />} 
                        onClick={() => console.log('New Message')} 
                    />
                )}
            </aside>

            {/* Chat Room: normal grid column, full size on mobile */}
            <main className={`bg-slate-950 flex flex-col w-full h-full ${showRoom ? 'flex' : 'hidden lg:flex'}`}>
                {showRoom ? (
                    <ChatRoom chatId={chatId} newChatUser={newChatUser} />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-700 opacity-30 p-12 text-center animate-in fade-in duration-700">
                        <div className="p-8 bg-slate-900/50 rounded-full mb-6">
                            <svg className="h-24 w-24 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-[0.3em] text-white">Messagerie</h2>
                        <p className="mt-2 text-sm font-medium tracking-tight">Sélectionnez une discussion pour démarrer.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export function MessagesView() {
    return (
        <Suspense fallback={
            <div className="h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
        }>
            <MessagesPageContent />
        </Suspense>
    );
}
