import { Bot, Send, Sparkles, Paperclip, Mic, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { useRole } from "../context/RoleContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export function MathiasTutor() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || "";

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { currentUser } = useRole();

  useEffect(() => {
    if (!currentUser?.uid) return;
    const historyRef = doc(db, 'users', currentUser.uid, 'ai_chats', 'mathias');
    getDoc(historyRef).then(snap => {
      if (snap.exists() && snap.data().messages) {
         setMessages(snap.data().messages);
      } else {
         // Default welcome message
         setMessages([{
           id: "init",
           role: 'model',
           content: "Bara ala, c'est Mathias. Je suis là pour t'accompagner dans ta formation. Comment puis-je t'aider aujourd'hui ?"
         }]);
      }
      setIsHistoryLoading(false);
    }).catch(err => {
      console.error(err);
      setIsHistoryLoading(false);
    });
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!isHistoryLoading && initialQuery && messages.length <= 1) {
       setInputValue(initialQuery);
    }
  }, [isHistoryLoading, initialQuery, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping || !currentUser?.uid) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    // Save to Firestore immediately
    const historyRef = doc(db, 'users', currentUser.uid, 'ai_chats', 'mathias');
    await setDoc(historyRef, { messages: newMessages }, { merge: true });

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      let aiResponse: Message;
      if (response.ok && data.reply) {
         aiResponse = { id: Date.now().toString(), role: 'model', content: data.reply };
         
      } else {
         aiResponse = { id: Date.now().toString(), role: 'model', content: "Désolé, j'ai rencontré un problème réseau. Peux-tu reformuler ?" };
      }
      const updatedMessages = [...newMessages, aiResponse];
      setMessages(updatedMessages);
      await setDoc(historyRef, { messages: updatedMessages }, { merge: true });
    } catch (err) {
      console.error(err);
      const errResponse: Message = { id: Date.now().toString(), role: 'model', content: "Désolé, je suis hors ligne actuellement." };
      const updatedMessages = [...newMessages, errResponse];
      setMessages(updatedMessages);
      await setDoc(historyRef, { messages: updatedMessages }, { merge: true });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col animate-in fade-in duration-500 relative">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse-slow">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-white">Mathias IA</h1>
            <p className="text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> En ligne
            </p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-secondary shadow-[0_0_10px_rgba(204,119,34,0.1)]">
            <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6 pb-6 pr-2">
        
        {messages.map((msg) => (
          msg.role === 'model' ? (
            <div key={msg.id} className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                </div>
                <div className="glass-light p-4 rounded-2xl rounded-tl-none border border-white/5">
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
            </div>
          ) : (
            <div key={msg.id} className="flex gap-3 max-w-[85%] ml-auto justify-end">
                <div className="bg-primary/20 backdrop-blur-md p-4 rounded-2xl rounded-tr-none border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-card border border-white/10 overflow-hidden shrink-0 mt-1 flex items-center justify-center">
                    {currentUser?.profilePictureURL ? (
                        <img src={currentUser.profilePictureURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-white text-xs font-bold">{currentUser?.fullName?.substring(0, 2).toUpperCase() || 'MO'}</span>
                    )}
                </div>
            </div>
          )
        ))}

         {/* Mathias Msg Typing... */}
         {isTyping && (
           <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
              </div>
              <div className="glass-light p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-1.5 h-12 w-20 justify-center">
                   <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '0ms'}}></div>
                   <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '150ms'}}></div>
                   <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
          </div>
         )}
         
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="pt-2 shrink-0">
          <div className="glass rounded-full p-2 flex items-center gap-2 border border-white/10 focus-within:border-primary/50 transition-colors">
              <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors shrink-0">
                  <Paperclip className="w-5 h-5" />
              </button>
              <input 
                  type="text" 
                  placeholder="Écrivez votre message..." 
                  className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder:text-gray-500"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
              />
               <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors shrink-0">
                  <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSend}
                disabled={isTyping || !inputValue.trim()}
                className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background hover:scale-105 transition-transform shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:hover:scale-100"
              >
                  {isTyping ? <Loader2 className="w-4 h-4 ml-0.5 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
              </button>
          </div>
      </div>
    </div>
  );
}
