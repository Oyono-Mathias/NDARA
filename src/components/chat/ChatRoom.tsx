import { useState, useEffect, useRef } from 'react';
import { 
    ArrowLeft, Send, Video, Phone, MoreVertical, 
    Paperclip, Smile, Camera, Mic, Play, Check, CheckCheck
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, setDoc, doc, serverTimestamp, getDocs, getDoc } from 'firebase/firestore';
import { useRole } from '../../context/RoleContext';
import { useSocket } from '../../hooks/useSocket';

export function ChatRoom({ chatId, newChatUser }: { chatId: string | null, newChatUser?: string | null }) {
    const { currentUser } = useRole();
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = location.pathname.startsWith('/instructor') ? '/instructor/messages' : '/student/messages';
    
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const { socket, isConnected } = useSocket();
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<any>(null);
    const [activeChatId, setActiveChatId] = useState<string | null>(chatId);
    
    const [partnerName, setPartnerName] = useState<string>('Chargement...');
    const [partnerAvatar, setPartnerAvatar] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (chatId) {
            setActiveChatId(chatId);
        } else if (newChatUser && currentUser?.uid) {
            const q = query(
                collection(db, 'chats'), 
                where('participants', 'array-contains', currentUser.uid)
            );
            getDocs(q).then(snap => {
                const existingChat = snap.docs.find(d => d.data().participants.includes(newChatUser));
                if (existingChat) {
                    setActiveChatId(existingChat.id);
                    navigate(`${basePath}?chatId=${existingChat.id}`, { replace: true });
                } else {
                    setActiveChatId(null);
                }
            });
        }
    }, [chatId, newChatUser, currentUser?.uid, navigate, basePath]);

    useEffect(() => {
        if (!activeChatId) return;
        const q = query(collection(db, 'messages'), where('chatId', '==', activeChatId), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [activeChatId]);

    useEffect(() => {
        const fetchPartner = async (partnerId: string) => {
            try {
                const docRef = doc(db, 'users', partnerId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setPartnerName(docSnap.data().name || 'Utilisateur');
                    setPartnerAvatar(docSnap.data().photoURL || null);
                } else {
                    setPartnerName('Utilisateur');
                }
            } catch (error) {
                setPartnerName('Utilisateur');
            }
        };

        if (activeChatId) {
            getDoc(doc(db, 'chats', activeChatId)).then(snap => {
                if (snap.exists()) {
                    const parts = snap.data().participants || [];
                    const pid = parts.find((p: string) => p !== currentUser?.uid);
                    if (pid) fetchPartner(pid);
                }
            });
        } else if (newChatUser) {
            fetchPartner(newChatUser);
        }
    }, [activeChatId, newChatUser, currentUser?.uid]);

    useEffect(() => {
        if (socket && activeChatId && currentUser) {
            socket.emit("join-room", activeChatId);
            
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
    }, [socket, activeChatId, currentUser]);

    const handleSend = async () => {
        const text = newMessage.trim();
        if (!text || !currentUser?.uid) return;
        if (!activeChatId && !newChatUser) return;
        
        let targetChatId = activeChatId;

        if (!targetChatId && newChatUser) {
           const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid));
           const snap = await getDocs(q);
           const existingChat = snap.docs.find(d => d.data().participants.includes(newChatUser));

           if (existingChat) {
               targetChatId = existingChat.id;
               setActiveChatId(targetChatId);
               navigate(`${basePath}?chatId=${targetChatId}`, { replace: true });
               await setDoc(doc(db, 'chats', targetChatId), {
                   updatedAt: serverTimestamp(),
                   lastMessage: text
               }, { merge: true });
           } else {
               const newChatRef = await addDoc(collection(db, 'chats'), {
                   participants: [currentUser.uid, newChatUser],
                   updatedAt: serverTimestamp(),
                   lastMessage: text,
                   unread: {
                       [newChatUser]: 1
                   }
               });
               targetChatId = newChatRef.id;
               setActiveChatId(targetChatId);
               navigate(`${basePath}?chatId=${targetChatId}`, { replace: true });
           }
        } else if (targetChatId) {
           await setDoc(doc(db, 'chats', targetChatId), {
               updatedAt: serverTimestamp(),
               lastMessage: text
           }, { merge: true });
        }

        if (targetChatId) {
            await addDoc(collection(db, 'messages'), {
                chatId: targetChatId,
                senderId: currentUser.uid,
                text: text,
                createdAt: serverTimestamp()
            });
        }
        
        setNewMessage('');
    };

    const handleTyping = (text: string) => {
        setNewMessage(text);
        if (socket && activeChatId) {
            socket.emit("typing", { roomId: activeChatId, userId: currentUser?.uid });
        }
    };

    return (
        <div className="flex flex-col h-full bg-black relative">
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .glass {
                    background: rgba(26, 26, 26, 0.8);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                .glass-light {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .message-sent {
                    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
                    border-radius: 1.25rem 1.25rem 0 1.25rem;
                }
                .message-received {
                    background: #2A2A2A;
                    border-radius: 1.25rem 1.25rem 1.25rem 0;
                }
                .message-bubble {
                    max-width: 75%;
                    padding: 12px 16px;
                }
                .card-hover:active { transform: scale(0.97); }
                .touch-btn:active { transform: scale(0.95); }

                .input-area {
                    background: rgba(26, 26, 26, 0.95);
                    backdrop-filter: blur(20px);
                }

                .typing-dot {
                    width: 8px; height: 8px;
                    background: #9CA3AF;
                    border-radius: 50%;
                    animation: typing 1.4s infinite ease-in-out;
                }
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
                .typing-dot:nth-child(3) { animation-delay: 0s; }
                @keyframes typing {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
            `}} />

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%2310B981\\' fill-opacity=\\'0.4\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>

            {/* Header */}
            <div className="absolute top-0 w-full z-50 glass">
                <div className="px-4 py-2 flex items-center gap-3 safe-area-pt">
                    <Link to={basePath} className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-gray-400 hover:text-white transition card-hover lg:hidden">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    
                    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-emerald-500/30 flex-shrink-0 bg-[#2A2A2A] flex items-center justify-center">
                        {partnerAvatar ? (
                            <img src={partnerAvatar} alt="Contact" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white font-bold text-sm tracking-wider">{partnerName.substring(0,2).toUpperCase()}</span>
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <h1 className="font-bold text-white text-sm truncate">{partnerName}</h1>
                        <p className="text-emerald-500 text-xs font-medium">{isConnected ? "En ligne" : "Hors ligne"}</p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <button className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-gray-400 hover:text-emerald-500 transition card-hover">
                            <Video className="w-5 h-5" />
                        </button>
                        <button className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-gray-400 hover:text-emerald-500 transition card-hover">
                            <Phone className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto hide-scrollbar pt-24 pb-4 px-4 relative z-10 w-full">
                {/* Date Separator */}
                <div className="flex justify-center my-4 animate-in fade-in duration-500">
                    <span className="glass-light px-4 py-2 rounded-full text-xs text-gray-400 font-medium">Aujourd'hui</span>
                </div>

                {messages.map((msg, index) => {
                    const isMine = msg.senderId === currentUser?.uid;
                    const time = msg.createdAt ? new Date(msg.createdAt.toDate?.() || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    
                    return (
                        <div key={msg.id} className={`flex items-end gap-2 mb-4 animate-in slide-in-from-bottom-2 duration-300 ${isMine ? 'justify-end' : ''}`}>
                            {!isMine && (
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#2A2A2A] flex items-center justify-center">
                                    {partnerAvatar ? (
                                        <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-white font-bold text-xs">{partnerName.substring(0,1).toUpperCase()}</span>
                                    )}
                                </div>
                            )}
                            
                            <div className={`message-bubble ${isMine ? 'message-sent' : 'message-received'}`}>
                                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-end'}`}>
                                    <span className={isMine ? "text-gray-200 text-[10px]" : "text-gray-400 text-[10px]"}>{time}</span>
                                    {isMine && <CheckCheck className="w-3 h-3 text-white opacity-80" />}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {isTyping && (
                    <div className="flex items-end gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#2A2A2A] flex items-center justify-center">
                            {partnerAvatar ? (
                                <img src={partnerAvatar} alt="Typing" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white font-bold text-xs">{partnerName.substring(0,1).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="message-bubble message-received py-3">
                            <div className="flex items-center gap-1">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <div className="w-full input-area relative z-20 shrink-0 border-t border-white/5 bg-black safe-area-pb">
                <div className="px-4 py-3 flex items-end gap-2">
                    <button className="w-10 h-10 rounded-full glass-light flex items-center justify-center text-gray-400 hover:text-emerald-500 transition card-hover flex-shrink-0">
                        <Paperclip className="w-5 h-5" />
                    </button>

                    <div className="flex-1 glass-light rounded-3xl flex items-center px-4 py-2 min-h-[44px]">
                        <button className="text-gray-400 hover:text-emerald-500 transition touch-btn mr-2">
                            <Smile className="w-5 h-5" />
                        </button>
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => handleTyping(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Écrire un message..." 
                            className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none py-2 border-none w-full min-w-0"
                        />
                        <button className="text-gray-400 hover:text-emerald-500 transition touch-btn ml-2">
                            <Camera className="w-5 h-5" />
                        </button>
                    </div>

                    <button onClick={handleSend} className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-black card-hover flex-shrink-0 transition">
                        {newMessage.trim() ? <Send className="w-5 h-5 ml-1" /> : <Mic className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
