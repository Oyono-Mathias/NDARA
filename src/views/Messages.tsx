import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

export const Messages: React.FC = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setMessage('');
      alert("Intention d'envoi enregistrée. Dépend du backend réel pour l'envoi effectif.");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <MessageSquare className="w-6 h-6 text-gray-900" />
        <h1 className="text-2xl font-extrabold text-gray-900">Messagerie</h1>
      </div>

      <Card className="flex-1 flex flex-col border-none shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
          Aucune conversation sélectionnée (Simulation UI)
        </div>
        <CardContent className="p-4 bg-white border-t border-gray-100 shrink-0">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Écrire un message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={handleSend} disabled={sending || !message.trim()} className="px-6 rounded-xl">
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
