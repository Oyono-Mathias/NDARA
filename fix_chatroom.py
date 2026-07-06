import re

with open('src/components/chat/ChatRoom.tsx', 'r') as f:
    content = f.read()

# 1. Imports: add Search, Phone, Video, PhoneCall, Monitor, Upload, Paperclip
if 'import { Phone, Video, Search, PhoneCall, Monitor, Paperclip, X, Smile, Loader2 } from "lucide-react";' not in content:
    content = content.replace("import { useSocket } from '../../hooks/useSocket';", "import { useSocket } from '../../hooks/useSocket';\nimport { Phone, Video, Search, PhoneCall, Monitor, Paperclip, X, Smile, Loader2, Bell } from 'lucide-react';")

# 2. Add states for Call, Search, File Upload, Reactions inside ChatRoom
states_to_add = """    const [isSearching, setIsSearching] = useState(false);
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
"""

if 'const [isSearching, setIsSearching] = useState(false);' not in content:
    content = content.replace("const [partnerName, setPartnerName] = useState<string>('Chargement...');", states_to_add + "\n    const [partnerName, setPartnerName] = useState<string>('Chargement...');")

# 3. Replace the header buttons (Call, Video, Search)
header_buttons_old = """                    <button className="p-2 sm:p-2.5 rounded-full hover:bg-[#2a3942] transition-colors text-gray-400 hover:text-emerald-400">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    </button>
                    <button className="p-2 sm:p-2.5 rounded-full hover:bg-[#2a3942] transition-colors text-gray-400 hover:text-emerald-400">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    </button>
                    <button className="p-2 sm:p-2.5 rounded-full hover:bg-[#2a3942] transition-colors text-gray-400 hover:text-emerald-400">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
                    </button>"""

header_buttons_new = """                    {!pushEnabled && (
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
                    </button>"""

content = content.replace(header_buttons_old, header_buttons_new)

# 4. Search bar & Call Overlay
search_and_call_ui = """
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
"""
content = content.replace("            {/* Chat Area */}", search_and_call_ui + "\n            {/* Chat Area */}")

# 5. Filter messages based on search
content = content.replace(
    "                {messages.map((msg, index) => {",
    "                {messages.filter(m => !searchQuery || m.text.toLowerCase().includes(searchQuery.toLowerCase())).map((msg, index) => {"
)

# 6. Message Reactions UI
reaction_ui = """
                                        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{formatText(msg.text)}</p>
                                        
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
"""
content = content.replace(
    """                                        <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{formatText(msg.text)}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1">""",
    reaction_ui
)

# 7. File Upload input inside Input Area
file_input_ui = """
                    <label className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#2a3942] rounded-full text-[11px] font-medium text-gray-300 hover:text-white transition-colors cursor-pointer">
                        <Paperclip className="w-3.5 h-3.5" /> Fichier lourd
                        <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
"""
content = content.replace(
    """                    <button className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#2a3942] rounded-full text-[11px] font-medium text-gray-300 hover:text-white transition-colors">
                        📎 Fichier
                    </button>""",
    file_input_ui
)

# 8. Upload progress bar
upload_progress_ui = """
                {uploading && (
                    <div className="w-full h-1 bg-gray-800 mb-2 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                )}
                <div className="flex items-end gap-2 mb-2">
"""
content = content.replace("                <div className=\"flex items-end gap-2 mb-2\">", upload_progress_ui)

with open('src/components/chat/ChatRoom.tsx', 'w') as f:
    f.write(content)

