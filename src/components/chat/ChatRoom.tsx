import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { useRole } from '../../context/RoleContext';
import { useSocket } from '../../hooks/useSocket';

export function ChatRoom({ chatId }: { chatId: string }) {
    const { currentUser } = useRole();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const { socket, isConnected } = useSocket();
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);

    useEffect(() => {
        if (!chatId) return;
        const q = query(collection(db, 'messages'), where('chatId', '==', chatId), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [chatId]);

    useEffect(() => {
        if (socket && chatId && currentUser) {
            socket.emit("join-room", chatId);
            
            const handleTyping = ({ userId }: any) => {
                if (userId !== currentUser.uid) {
                    setIsTyping(true);
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
                }
            };
            
            socket.on("typing", handleTyping);
            return () => {
                socket.off("typing", handleTyping);
            };
        }
    }, [socket, chatId, currentUser]);

    const handleSend = async () => {
        if (!newMessage.trim() || !currentUser?.uid || !chatId) return;
        
        await addDoc(collection(db, 'messages'), {
            chatId,
            senderId: currentUser.uid,
            text: newMessage.trim(),
            createdAt: serverTimestamp()
        });
        
        setNewMessage('');
    };

    const handleTyping = (text: string) => {
        setNewMessage(text);
        if (socket && chatId) {
            socket.emit("typing", { roomId: chatId, userId: currentUser?.uid });
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950">
            <header className="h-16 border-b border-slate-800 flex items-center px-4 gap-4 shrink-0 bg-slate-900/50">
                <Link to="/student/messages" className="lg:hidden w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-800 flex items-center justify-center relative">
                    <span className="text-white font-bold">EX</span>
                    {isConnected && <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>}
                </div>
                <div>
                    <h2 className="text-sm font-bold text-white">Discussion {chatId.substring(0, 4)}</h2>
                    {isConnected ? (
                        <p className="text-[10px] text-green-500 font-medium">En ligne</p>
                    ) : (
                        <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Hors ligne</p>
                    )}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => {
                    const isMine = msg.senderId === currentUser?.uid;
                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={isMine ? "bg-amber-500 text-slate-950 p-4 rounded-[2rem] rounded-tr-sm max-w-[80%]" : "bg-slate-900 border border-slate-800 text-white p-4 rounded-[2rem] rounded-tl-sm max-w-[80%]"}>
                                <p className="text-sm font-medium">{msg.text}</p>
                            </div>
                        </div>
                    );
                })}
                {isTyping && (
                    <div className="flex justify-start animate-in fade-in">
                        <div className="bg-slate-900 border border-slate-800 rounded-full px-4 py-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                {messages.length === 0 && (
                    <div className="text-center text-slate-500 text-sm mt-8">Aucun message. Envoyez le premier !</div>
                )}
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-slate-800 shrink-0">
                <div className="flex gap-2 relative">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={e => handleTyping(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Écrivez un message..." 
                        className="w-full bg-slate-950 border border-slate-800 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-medium"
                    />
                    <button onClick={handleSend} className="absolute right-1 top-1 bottom-1 w-10 bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center rounded-full transition-colors">
                        <Send className="w-4 h-4 ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
