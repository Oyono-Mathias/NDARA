import { Bot, Send, Sparkles, Paperclip, Mic } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useRole } from "../context/RoleContext";

export function MathiasTutor() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || "";
  const initialContext = searchParams.get('context') || "";

  const [inputValue, setInputValue] = useState(initialQuery);
  const { currentUser } = useRole();

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
      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-6 pb-6">
        
        {/* Mathias Msg */}
        <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary shrink-0 mt-1">
                <Bot className="w-4 h-4" />
            </div>
            <div className="glass-light p-4 rounded-2xl rounded-tl-none border border-white/5">
                <p className="text-white text-sm leading-relaxed mb-2">Bara ala, c'est Mathias. J'ai vu que tu venais de terminer la vidéo sur le RSI.</p>
                <p className="text-gray-300 text-sm leading-relaxed">As-tu bien compris comment identifier une zone de sur-achat ? Pose-moi tes questions en Sango ou en Français.</p>
            </div>
        </div>

        {/* User Msg */}
        <div className="flex gap-3 max-w-[85%] ml-auto justify-end">
            <div className="bg-primary/20 backdrop-blur-md p-4 rounded-2xl rounded-tr-none border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <p className="text-white text-sm leading-relaxed">Comment je sais si c'est vraiment une zone de sur-achat ou juste une tendance forte ?</p>
            </div>
             <div className="w-8 h-8 rounded-full bg-card border border-white/10 overflow-hidden shrink-0 mt-1 flex items-center justify-center">
                {currentUser?.profilePictureURL ? (
                    <img src={currentUser.profilePictureURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-white text-xs font-bold">{currentUser?.fullName?.substring(0, 2).toUpperCase() || 'MO'}</span>
                )}
            </div>
        </div>

         {/* Mathias Msg Typing... */}
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
              />
               <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 transition-colors shrink-0">
                  <Mic className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-background hover:scale-105 transition-transform shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  <Send className="w-4 h-4 ml-0.5" />
              </button>
          </div>
      </div>
    </div>
  );
}
