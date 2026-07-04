import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, setDoc, doc, serverTimestamp, getDocs, getDoc, writeBatch } from 'firebase/firestore';
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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        const q = query(collection(db, 'chats', activeChatId, 'messages'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snap) => {
            setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Mark as read
        if (currentUser?.uid) {
            getDoc(doc(db, 'chats', activeChatId)).then(docSnap => {
                if (docSnap.exists() && docSnap.data().unreadBy?.includes(currentUser.uid)) {
                    setDoc(doc(db, 'chats', activeChatId), {
                        unreadBy: docSnap.data().unreadBy.filter((uid: string) => uid !== currentUser.uid)
                    }, { merge: true });
                }
            });
        }

        return () => unsubscribe();
    }, [activeChatId, currentUser?.uid]);

    useEffect(() => {
        const fetchPartner = async (partnerId: string) => {
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
        const batch = writeBatch(db);

        try {
            if (!targetChatId && newChatUser) {
                const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid));
                const snap = await getDocs(q);
                const existingChat = snap.docs.find(d => d.data().participants.includes(newChatUser));

                if (existingChat) {
                    targetChatId = existingChat.id;
                    setActiveChatId(targetChatId);
                    navigate(`${basePath}?chatId=${targetChatId}`, { replace: true });
                } else {
                    const newChatRef = doc(collection(db, 'chats'));
                    targetChatId = newChatRef.id;
                    batch.set(newChatRef, {
                        participants: [currentUser.uid, newChatUser],
                        updatedAt: serverTimestamp(),
                        lastMessage: text,
                        unreadBy: [newChatUser]
                    });
                    setActiveChatId(targetChatId);
                    navigate(`${basePath}?chatId=${targetChatId}`, { replace: true });
                }
            }

            if (targetChatId) {
                const chatRef = doc(db, 'chats', targetChatId);
                
                let pId = newChatUser;
                if (!pId) {
                    const chatSnap = await getDoc(chatRef);
                    if (chatSnap.exists()) {
                        pId = chatSnap.data().participants.find((p: string) => p !== currentUser.uid);
                    }
                }

                if (activeChatId || (targetChatId && newChatUser)) {
                    batch.set(chatRef, {
                        updatedAt: serverTimestamp(),
                        lastMessage: text,
                        unreadBy: pId ? [pId] : []
                    }, { merge: true });
                }

                const newMessageRef = doc(collection(db, 'chats', targetChatId, 'messages'));
                batch.set(newMessageRef, {
                    senderId: currentUser.uid,
                    text: text,
                    createdAt: serverTimestamp()
                });

                await batch.commit();
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
        
        setNewMessage('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleTyping = (text: string) => {
        setNewMessage(text);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 112) + 'px';
        }
        if (socket && activeChatId) {
            socket.emit("typing", { roomId: activeChatId, userId: currentUser?.uid });
        }
    };

    const formatText = (text: string) => {
        if (!text) return '';
        let formatted = text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-[#0D1117] px-1.5 py-0.5 rounded text-emerald-400 text-xs font-mono">$1</code>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" class="text-blue-400 underline" target="_blank">$1</a>');
        return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
    };

    return (
        <div 
            className="w-full h-full flex flex-col justify-between items-stretch overflow-hidden relative bg-[#0b141a] text-[#F8FAFC] font-sans"
        >
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(1.4); opacity: 0; } }
                @keyframes typing-wave { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
                @keyframes messageIn { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                
                .animate-message-in { animation: messageIn 0.3s ease-out; }
                
                .typing-dot-1 { animation: typing-wave 1.4s infinite; }
                .typing-dot-2 { animation: typing-wave 1.4s infinite 0.2s; }
                .typing-dot-3 { animation: typing-wave 1.4s infinite 0.4s; }
                
                .status-indicator { animation: pulse-ring 2s infinite; }
                
                .chat-bg {
                    background-image: 
                        radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
                        radial-gradient(circle at 50% 80%, rgba(139, 92, 246, 0.02) 0%, transparent 50%);
                }
                
                .message-sent { background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.08)); border: 1px solid rgba(16, 185, 129, 0.2); }
                .message-received { background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(51, 65, 85, 0.5); }
            `}} />

            {/* Chat Header */}
            <div className="w-full h-[max(60px,calc(60px+env(safe-area-inset-top)))] pt-[env(safe-area-inset-top)] bg-[#1f2c34] z-50 flex items-center justify-between px-4 shrink-0 border-b border-[#334155]">
                <div className="flex items-center gap-2 sm:gap-3">
                    <Link to={basePath} className="md:hidden p-2 rounded-full hover:bg-[#2a3942] transition-colors flex items-center justify-center -ml-2">
                        <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
                    </Link>
                    <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-sm font-bold overflow-hidden shadow-md">
                            {partnerAvatar ? <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" /> : partnerName.substring(0, 2).toUpperCase()}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#1f2c34] ${isConnected ? '' : 'hidden'}`}></div>
                    </div>
                    <div className="flex flex-col justify-center">
                        <h3 className="text-[15px] font-bold text-white leading-tight">{partnerName}</h3>
                        <p className="text-[11px] text-emerald-400 font-medium">{isConnected ? "En ligne" : "En ligne"}</p>
                    </div>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1">
                    <button className="p-2 sm:p-2.5 rounded-full hover:bg-[#2a3942] transition-colors text-gray-400 hover:text-emerald-400">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    </button>
                    <button className="p-2 sm:p-2.5 rounded-full hover:bg-[#2a3942] transition-colors text-gray-400 hover:text-emerald-400">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    </button>
                    <button className="p-2 sm:p-2.5 rounded-full hover:bg-[#2a3942] transition-colors text-gray-400 hover:text-emerald-400">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 chat-bg hide-scrollbar">
                
                {/* Messages */}
                {messages.map((msg, index) => {
                    const isMine = msg.senderId === currentUser?.uid;
                    const time = msg.createdAt ? new Date(msg.createdAt.toDate?.() || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    
                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-message-in`}>
                            <div className="flex gap-2 max-w-[85%] sm:max-w-[70%]">
                                {!isMine && (
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-1 overflow-hidden">
                                        {partnerAvatar ? <img src={partnerAvatar} alt="avatar" className="w-full h-full object-cover" /> : partnerName.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className="relative group">
                                    <div className={`${isMine ? 'message-sent' : 'message-received'} rounded-2xl ${isMine ? 'rounded-tr-md' : 'rounded-tl-md'} px-3 py-2`}>
                                        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{formatText(msg.text)}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <span className="text-[10px] text-gray-500">{time}</span>
                                            {isMine && (
                                                <span className={`text-[10px] ${msg.status === 'read' ? 'text-blue-400' : 'text-gray-500'}`}>✓✓</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start animate-message-in">
                        <div className="flex gap-2 max-w-[85%] sm:max-w-[70%]">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-1 overflow-hidden">
                                {partnerAvatar ? <img src={partnerAvatar} alt="avatar" className="w-full h-full object-cover" /> : partnerName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="message-received rounded-2xl rounded-tl-md px-3 py-2 flex items-center">
                                <div className="flex items-center gap-1.5 h-5">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot-1"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot-2"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot-3"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} className="h-2 shrink-0" />
            </div>

            {/* Input Area */}
            <div className="w-full shrink-0 bg-[#1f2c34] pb-[env(safe-area-inset-bottom)] pt-2 px-3 sm:px-4 border-t border-[#334155]">
                {/* Quick Actions */}
                <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 hide-scrollbar">
                    <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#2a3942] rounded-full text-[11px] font-medium text-gray-300 hover:text-white transition-colors">
                        🎤 Vocal
                    </button>
                    <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#2a3942] rounded-full text-[11px] font-medium text-gray-300 hover:text-white transition-colors">
                        💸 Transférer
                    </button>
                    <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#2a3942] rounded-full text-[11px] font-medium text-gray-300 hover:text-white transition-colors">
                        📎 Fichier
                    </button>
                    <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#2a3942] rounded-full text-[11px] font-medium text-gray-300 hover:text-white transition-colors">
                        📸 Photo
                    </button>
                </div>
                
                <div className="flex items-end gap-2 mb-2">
                    <div className="flex-1 relative">
                        <textarea 
                            ref={textareaRef}
                            rows={1} 
                            value={newMessage}
                            onChange={(e) => handleTyping(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Écrivez un message..." 
                            className="w-full bg-[#2a3942] rounded-3xl px-4 py-2.5 pr-10 text-[15px] text-white placeholder-gray-400 max-h-28 resize-none focus:outline-none transition-colors overflow-y-auto"
                        />
                        <button className="absolute right-3 bottom-2 p-1 text-gray-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </button>
                    </div>
                    <button 
                        onClick={handleSend} 
                        disabled={!newMessage.trim()} 
                        className={`p-3 rounded-full transition-all active:scale-95 flex items-center justify-center ${newMessage.trim() ? 'bg-emerald-500 text-white' : 'bg-[#2a3942] text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

