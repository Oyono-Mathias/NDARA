import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, setDoc, doc, serverTimestamp, getDocs, getDoc, writeBatch } from 'firebase/firestore';
import { useRole } from '../../context/RoleContext';
import { useSocket } from '../../hooks/useSocket';
import { Phone, Video, Search, PhoneCall, Monitor, Paperclip, X, Smile, Loader2, Bell, Bot, Sparkles, Lightbulb, MessageSquare, Camera, Mic, Plus, Send } from 'lucide-react';

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
    
        const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inCall, setInCall] = useState<{type: 'audio' | 'video' | 'screen' | null, incoming: boolean, active: boolean}>({ type: null, incoming: false, active: false });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [pushEnabled, setPushEnabled] = useState(false);

    // Call handlers
    const initiateCall = (type: 'audio' | 'video' | 'screen') => {
        if (!activeChatId) return;
        setInCall({ type, incoming: false, active: true });
        socket?.emit("call-request", { roomId: activeChatId, type, senderId: currentUser?.uid });
    };

    const endCall = () => {
        if (!activeChatId) return;
        setInCall({ type: null, incoming: false, active: false });
        socket?.emit("call-ended", { roomId: activeChatId });
    };

    const enablePush = async () => {
        if ('Notification' in window) {
            const perm = await Notification.requestPermission();
            if (perm === 'granted') {
                setPushEnabled(true);
                alert("Notifications Push activées !");
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadProgress(0);
        
        // Simulate large file multipart upload
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setUploading(false);
                    // Add message
                    handleSendFile(file.name, file.size);
                    return 100;
                }
                return prev + 10;
            });
        }, 300);
    };

    const handleSendFile = async (filename: string, size: number) => {
        if (!currentUser?.uid || !activeChatId) return;
        const msgData = {
            chatId: activeChatId,
            senderId: currentUser.uid,
            text: `[Fichier: ${filename}] (${(size / 1024 / 1024).toFixed(2)} MB)`,
            createdAt: serverTimestamp(),
            status: 'sent'
        };
        await addDoc(collection(db, 'messages'), msgData);
    };

    const addReaction = async (msgId: string, emoji: string) => {
        const msgRef = doc(db, 'messages', msgId);
        const msgDoc = await getDoc(msgRef);
        if (msgDoc.exists()) {
            const reactions = msgDoc.data().reactions || {};
            reactions[emoji] = (reactions[emoji] || 0) + 1;
            await setDoc(msgRef, { reactions }, { merge: true });
        }
    };

    useEffect(() => {
        if (socket) {
            socket.on("call-request", (data) => {
                if (data.senderId !== currentUser?.uid) {
                    setInCall({ type: data.type, incoming: true, active: false });
                }
            });
            socket.on("call-ended", () => {
                setInCall({ type: null, incoming: false, active: false });
            });
        }
        return () => {
            socket?.off("call-request");
            socket?.off("call-ended");
        };
    }, [socket, currentUser]);

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
                    {!pushEnabled && (
                        <button onClick={enablePush} title="Activer les notifications push" className="p-2 rounded-full hover:bg-[#2a3942] text-gray-400 hover:text-amber-400">
                            <Bell className="w-5 h-5" />
                        </button>
                    )}
                    <button onClick={() => setIsSearching(!isSearching)} className="p-2 rounded-full hover:bg-[#2a3942] text-gray-400 hover:text-emerald-400">
                        <Search className="w-5 h-5" />
                    </button>
                    <button onClick={() => initiateCall('screen')} title="Partager l'écran" className="p-2 rounded-full hover:bg-[#2a3942] text-gray-400 hover:text-blue-400">
                        <Monitor className="w-5 h-5" />
                    </button>
                    <button onClick={() => initiateCall('video')} className="p-2 rounded-full hover:bg-[#2a3942] text-gray-400 hover:text-emerald-400">
                        <Video className="w-5 h-5" />
                    </button>
                    <button onClick={() => initiateCall('audio')} className="p-2 rounded-full hover:bg-[#2a3942] text-gray-400 hover:text-emerald-400">
                        <Phone className="w-5 h-5" />
                    </button>
                </div>
            </div>


            {isSearching && (
                <div className="bg-[#1f2c34] p-3 border-b border-[#334155]">
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Rechercher dans la conversation..."
                        className="w-full bg-[#2a3942] rounded-lg px-4 py-2 text-sm text-white focus:outline-none"
                    />
                </div>
            )}

            {inCall.type && (
                <div className="absolute inset-x-0 top-16 z-50 p-4 bg-gray-900/95 backdrop-blur-md text-white border-b border-gray-800 shadow-2xl flex flex-col items-center justify-center animate-in slide-in-from-top-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                        {inCall.type === 'audio' ? <PhoneCall className="w-8 h-8 text-emerald-500 animate-pulse" /> : 
                         inCall.type === 'screen' ? <Monitor className="w-8 h-8 text-blue-500 animate-pulse" /> :
                         <Video className="w-8 h-8 text-emerald-500 animate-pulse" />}
                    </div>
                    <h3 className="text-lg font-bold mb-1">
                        {inCall.incoming && !inCall.active ? `Appel ${inCall.type} entrant de ${partnerName}` : 
                         !inCall.active ? `Appel ${inCall.type} en cours...` : 
                         `Appel ${inCall.type} actif avec ${partnerName}`}
                    </h3>
                    <div className="flex gap-4 mt-6">
                        {inCall.incoming && !inCall.active && (
                            <button onClick={() => setInCall(prev => ({ ...prev, active: true }))} className="px-6 py-2 bg-emerald-500 rounded-full font-bold">Accepter</button>
                        )}
                        <button onClick={endCall} className="px-6 py-2 bg-red-500 rounded-full font-bold">{inCall.active || !inCall.incoming ? 'Raccrocher' : 'Refuser'}</button>
                    </div>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 chat-bg hide-scrollbar flex flex-col">
                
                {messages.length === 0 && !isTyping && !searchQuery ? (
                    <div className="m-auto flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in duration-500 w-full max-w-sm">
                        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full flex items-center justify-center mb-6 shadow-xl border border-white/5">
                            <Bot className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2 text-center">Assistant IA</h2>
                        <p className="text-[15px] text-gray-400 text-center mb-8 max-w-[280px]">
                            Posez une question sur votre cours ou demandez une explication.
                        </p>
                        
                        <div className="w-full flex flex-col gap-3">
                            <button onClick={() => handleTyping("Résume ce chapitre s'il te plaît.")} className="flex items-center gap-4 bg-[#1f2c34] hover:bg-[#2a3942] border border-[#334155] p-4 rounded-2xl transition-all active:scale-[0.98]">
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                </div>
                                <span className="text-[15px] font-medium text-gray-200 text-left">Résume ce chapitre</span>
                            </button>
                            <button onClick={() => handleTyping("Génère un exercice pratique sur ce sujet.")} className="flex items-center gap-4 bg-[#1f2c34] hover:bg-[#2a3942] border border-[#334155] p-4 rounded-2xl transition-all active:scale-[0.98]">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <Lightbulb className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-[15px] font-medium text-gray-200 text-left">Génère un exercice</span>
                            </button>
                            <button onClick={() => handleTyping("Peux-tu m'expliquer ce concept plus simplement ?")} className="flex items-center gap-4 bg-[#1f2c34] hover:bg-[#2a3942] border border-[#334155] p-4 rounded-2xl transition-all active:scale-[0.98]">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <MessageSquare className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-[15px] font-medium text-gray-200 text-left">Explique ce concept</span>
                            </button>
                        </div>
                    </div>
                ) : (
                <div className="flex flex-col space-y-4">
                {/* Messages */}
                {messages.filter(m => !searchQuery || m.text.toLowerCase().includes(searchQuery.toLowerCase())).map((msg, index) => {
                    const isMine = msg.senderId === currentUser?.uid;
                    const time = msg.createdAt ? new Date(msg.createdAt.toDate?.() || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                    
                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-message-in`}>
                            <div className="flex gap-2 max-w-[80%] sm:max-w-[70%]">
                                {!isMine && (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-auto overflow-hidden">
                                        {partnerAvatar ? <img src={partnerAvatar} alt="avatar" className="w-full h-full object-cover" /> : partnerName.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className="relative group">
                                    <div className={`${isMine ? 'message-sent' : 'message-received'} rounded-[20px] ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'} px-4 py-2.5`}>

                                        <p className="text-[15px] text-gray-200 leading-relaxed whitespace-pre-line">{formatText(msg.text)}</p>
                                        
                                        {/* Reactions display */}
                                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                            <div className="flex gap-1 mt-1 -mb-1">
                                                {Object.entries(msg.reactions).map(([emoji, count]) => (
                                                    <span key={emoji} className="bg-black/20 text-[10px] px-1.5 py-0.5 rounded-full">{emoji} {count as number}</span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            {/* Quick reaction button */}
                                            <button onClick={() => addReaction(msg.id, '❤️')} className="text-gray-500 hover:text-pink-500 mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Smile className="w-3 h-3" />
                                            </button>

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
                        <div className="flex gap-2 max-w-[80%] sm:max-w-[70%]">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-auto overflow-hidden">
                                {partnerAvatar ? <img src={partnerAvatar} alt="avatar" className="w-full h-full object-cover" /> : partnerName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="message-received rounded-[20px] rounded-bl-sm px-4 py-3 flex items-center">
                                <div className="flex items-center gap-1 h-4">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot-1"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot-2"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot-3"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </div>
                )}
                
                <div ref={messagesEndRef} className="h-4 shrink-0" />
            </div>

            {/* Input Area */}
            <div className="w-full shrink-0 bg-[#1f2c34] pb-[max(12px,env(safe-area-inset-bottom))] pt-2 px-4 border-t border-[#334155]">
                {/* Action Bar */}
                <div className="flex items-center gap-3 mb-3 overflow-x-auto hide-scrollbar">
                    <button className="w-11 h-11 shrink-0 flex items-center justify-center text-gray-400 bg-[#2a3942] rounded-full hover:text-emerald-400 transition-colors">
                        <Mic className="w-5 h-5" />
                    </button>
                    <label className="w-11 h-11 shrink-0 flex items-center justify-center text-gray-400 bg-[#2a3942] rounded-full hover:text-emerald-400 transition-colors cursor-pointer">
                        <Paperclip className="w-5 h-5" />
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button className="w-11 h-11 shrink-0 flex items-center justify-center text-gray-400 bg-[#2a3942] rounded-full hover:text-emerald-400 transition-colors">
                        <Camera className="w-5 h-5" />
                    </button>
                    <button className="w-11 h-11 shrink-0 flex items-center justify-center text-gray-400 bg-[#2a3942] rounded-full hover:text-emerald-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                    <button className="w-11 h-11 shrink-0 flex items-center justify-center text-gray-400 bg-[#2a3942] rounded-full hover:text-emerald-400 transition-colors">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                

                {uploading && (
                    <div className="w-full h-1 bg-gray-800 mb-2 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                )}
                
                {/* Input Wrapper */}
                <div className="flex items-end gap-2 bg-[#2a3942] p-1.5 rounded-[24px] mb-1">
                    <button className="w-10 h-10 shrink-0 flex items-center justify-center text-gray-400 hover:text-emerald-400 rounded-full transition-colors">
                        <Smile className="w-6 h-6" />
                    </button>
                    
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
                        placeholder="Message..." 
                        className="flex-1 bg-transparent py-2.5 min-h-[44px] max-h-28 text-[15px] text-white placeholder-gray-400 resize-none focus:outline-none overflow-y-auto hide-scrollbar"
                    />

                    <button 
                        onClick={handleSend} 
                        disabled={!newMessage.trim()} 
                        className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full transition-all active:scale-95 ${newMessage.trim() ? 'bg-emerald-500 text-white shadow-lg' : 'bg-transparent text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    >
                        {newMessage.trim() ? <Send className="w-4 h-4 ml-0.5" /> : <Mic className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}

