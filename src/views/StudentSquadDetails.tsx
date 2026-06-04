import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Loader2, Users, MoreVertical } from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc
} from "firebase/firestore";
import { db } from "../firebase";
import { useRole } from "../context/RoleContext";

interface SquadMessage {
  id: string;
  squadId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  messageText: string;
  createdAt: any;
}

export function StudentSquadDetails() {
  const { squadId } = useParams<{ squadId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useRole();
  
  const [squadName, setSquadName] = useState<string>("Chargement...");
  const [memberCount, setMemberCount] = useState<number>(0);
  const [messages, setMessages] = useState<SquadMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!squadId) return;

    // Load Squad Metadata
    const squadRef = doc(db, "squads", squadId);
    const unsubSquad = onSnapshot(squadRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSquadName(data.name || "Squad sans nom");
        setMemberCount(data.membersCount || 0);
      }
    });

    // Load Chat Messages
    const q = query(
      collection(db, "squad_messages"),
      where("squadId", "==", squadId),
      orderBy("createdAt", "asc")
    );

    const unsubMessages = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as SquadMessage[];
      setMessages(msgs);
    });

    return () => {
      unsubSquad();
      unsubMessages();
    };
  }, [squadId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isSending || !currentUser?.uid || !squadId) return;

    setIsSending(true);
    const textToSend = inputValue.trim();
    setInputValue(""); // Optimistic clear

    try {
      await addDoc(collection(db, "squad_messages"), {
        squadId,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.fullName || "Étudiant",
        senderAvatar: currentUser.photoURL || currentUser.profilePictureURL || "",
        messageText: textToSend,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Erreur d'envoi du message :", err);
      // Restore input on failure
      setInputValue(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp safely
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-black animate-in fade-in relative">
      {/* Header */}
      <div className="shrink-0 bg-background/90 backdrop-blur-xl border-b border-white/5 pt-4 pb-3 px-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white leading-tight">{squadName}</h1>
            <p className="text-[11px] text-primary font-bold flex items-center gap-1 mt-0.5">
               <Users className="w-3 h-3" /> {memberCount} membre{memberCount > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 hide-scrollbar relative z-10 mb-20">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center opacity-50 space-y-3">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
               <Users className="w-8 h-8 text-slate-400" />
             </div>
             <div>
               <p className="text-white font-bold text-sm">Soyez le premier à discuter !</p>
               <p className="text-xs text-slate-500">Posez une question, partagez une ressource...</p>
             </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUser?.uid;
            
            // Check if previous message is from same sender to group them visually
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const isConsecutive = prevMsg?.senderId === msg.senderId;

            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''} ${isConsecutive ? 'mt-1' : 'mt-5'}`}
              >
                {!isMe && !isConsecutive && (
                  <div className="w-8 h-8 rounded-full bg-card border border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                    {msg.senderAvatar ? (
                      <img src={msg.senderAvatar} alt={msg.senderName} className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-[10px] font-bold text-white uppercase">{msg.senderName?.substring(0, 2) || "AN"}</span>
                    )}
                  </div>
                )}
                {/* Invisible spacer if consecutive to keep alignment */}
                {!isMe && isConsecutive && <div className="w-8 h-8 shrink-0" />}

                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && !isConsecutive && (
                     <span className="text-[10px] text-slate-400 mb-1 ml-1">{msg.senderName}</span>
                  )}
                  <div className={`p-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm break-words ${
                    isMe 
                      ? 'bg-primary text-[#0f172a] rounded-tr-sm font-medium' 
                      : 'bg-white/10 text-white rounded-tl-sm border border-white/5'
                  }`}>
                    {msg.messageText}
                  </div>
                  <span className={`text-[9px] text-slate-500 mt-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="bg-background border-t border-white/5 p-4 fixed bottom-0 left-0 right-0 z-30 pb-safe">
        <form 
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-full focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-inner max-w-md mx-auto"
        >
          <input
            type="text"
            className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            placeholder="Écrivez un message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center text-[#0f172a] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shrink-0 shadow-[0_4px_10px_rgba(16,185,129,0.3)]"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
