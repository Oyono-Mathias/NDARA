import { useState, useCallback } from 'react';
import { TicketService, Ticket, TicketMessage, CreateTicketPayload, TicketStatus } from '../services/ticketService';

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    try {
      const data = await TicketService.getTickets();
      if (isMounted) setTickets(data);
    } catch (err: unknown) {
      if (isMounted) setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      if (isMounted) setLoading(false);
    }
    return () => { isMounted = false; };
  }, []);

  const fetchTicketDetail = useCallback(async (id: string) => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    try {
      const data = await TicketService.getTicketById(id);
      if (isMounted) {
        setSelectedTicket(data.ticket);
        setMessages(data.messages);
      }
    } catch (err: unknown) {
      if (isMounted) setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      if (isMounted) setLoading(false);
    }
    return () => { isMounted = false; };
  }, []);

  const createTicket = useCallback(async (payload: CreateTicketPayload): Promise<Ticket | null> => {
    setSubmitting(true);
    setError(null);
    try {
      const newTicket = await TicketService.createTicket(payload);
      setTickets(prev => [newTicket, ...prev]);
      return newTicket;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const sendMessage = useCallback(async (ticketId: string, content: string): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      const newMsg = await TicketService.addTicketMessage(ticketId, content);
      setMessages(prev => [...prev, newMsg]);
      if (selectedTicket && selectedTicket.id === ticketId) {
         setSelectedTicket(prev => prev ? { ...prev, messagesCount: prev.messagesCount + 1, updatedAt: newMsg.createdAt } : null);
      }
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [selectedTicket]);

  const changeStatus = useCallback(async (ticketId: string, status: TicketStatus): Promise<boolean> => {
    setSubmitting(true);
    setError(null);
    try {
      const updatedTicket = await TicketService.updateTicketStatus(ticketId, status);
      setSelectedTicket(updatedTicket);
      setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return {
    tickets,
    selectedTicket,
    messages,
    loading,
    submitting,
    error,
    fetchTickets,
    fetchTicketDetail,
    createTicket,
    sendMessage,
    changeStatus,
    clearError: () => setError(null)
  };
}
