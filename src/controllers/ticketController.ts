import { Ticket, TicketMessage, CreateTicketPayload, TicketStatus } from '../services/ticketService';

/**
 * TicketController
 * Couche préparatoire pour le backend. Actuellement, gère un état en mémoire (Mock).
 * ZERO TRUST: Le backend futur devra revalider toutes ces opérations (droits, rôles, etc.).
 */

const mockTickets: Ticket[] = [
  {
    id: 't-101',
    subject: 'Problème d\'accès au cours React',
    description: 'Je ne peux pas lire la vidéo du module 3.',
    category: 'technical',
    priority: 'high',
    status: 'open',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    requesterId: 'u-123',
    messagesCount: 1,
    isMock: true
  },
  {
    id: 't-102',
    subject: 'Demande de remboursement',
    description: 'J\'ai acheté ce cours par erreur hier.',
    category: 'payment',
    priority: 'medium',
    status: 'pending',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    requesterId: 'u-123',
    messagesCount: 2,
    isMock: true
  },
  {
    id: 't-103',
    subject: 'Certificat non généré',
    description: 'J\'ai fini le cours mais pas de certificat.',
    category: 'certificate',
    priority: 'low',
    status: 'resolved',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    requesterId: 'u-123',
    messagesCount: 3,
    isMock: true
  }
];

const mockMessages: TicketMessage[] = [
  {
    id: 'm-1',
    ticketId: 't-101',
    senderId: 'u-123',
    senderRole: 'student',
    content: 'Je ne peux pas lire la vidéo du module 3.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isMock: true
  },
  {
    id: 'm-2',
    ticketId: 't-102',
    senderId: 'u-123',
    senderRole: 'student',
    content: 'J\'ai acheté ce cours par erreur hier.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    isMock: true
  },
  {
    id: 'm-3',
    ticketId: 't-102',
    senderId: 's-999',
    senderRole: 'support',
    content: 'Bonjour, merci de fournir le numéro de transaction pour procéder.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isMock: true
  },
  {
    id: 'm-4',
    ticketId: 't-103',
    senderId: 'u-123',
    senderRole: 'student',
    content: 'J\'ai fini le cours mais pas de certificat.',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    isMock: true
  },
  {
    id: 'm-5',
    ticketId: 't-103',
    senderId: 's-999',
    senderRole: 'support',
    content: 'Nous avons regénéré votre certificat, il devrait être disponible sur votre profil.',
    createdAt: new Date(Date.now() - 300000000).toISOString(),
    isMock: true
  },
  {
    id: 'm-6',
    ticketId: 't-103',
    senderId: 'u-123',
    senderRole: 'student',
    content: 'Parfait, merci !',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    isMock: true
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class TicketController {
  static async listTickets(): Promise<Ticket[]> {
    await delay(600);
    return [...mockTickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  static async getTicket(id: string): Promise<{ ticket: Ticket; messages: TicketMessage[] }> {
    await delay(500);
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) throw new Error("Ticket introuvable");
    const messages = mockMessages.filter(m => m.ticketId === id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return { ticket, messages };
  }

  static async createTicket(payload: CreateTicketPayload): Promise<Ticket> {
    await delay(800);
    if (!payload.subject || !payload.description || !payload.category || !payload.priority) {
      throw new Error("Données invalides");
    }

    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
      subject: payload.subject,
      description: payload.description,
      category: payload.category,
      priority: payload.priority,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requesterId: 'u-123', // Utilisateur mocké connecté
      messagesCount: 1,
      isMock: true
    };

    const firstMessage: TicketMessage = {
      id: `m-${Date.now()}`,
      ticketId: newTicket.id,
      senderId: newTicket.requesterId,
      senderRole: 'student',
      content: payload.description,
      createdAt: newTicket.createdAt,
      isMock: true
    };

    mockTickets.push(newTicket);
    mockMessages.push(firstMessage);

    return newTicket;
  }

  static async sendMessage(ticketId: string, content: string): Promise<TicketMessage> {
    await delay(600);
    if (!content.trim()) throw new Error("Le message ne peut être vide.");
    
    const ticketIndex = mockTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) throw new Error("Ticket introuvable");

    const newMessage: TicketMessage = {
      id: `m-${Date.now()}`,
      ticketId,
      senderId: 'u-123',
      senderRole: 'student',
      content,
      createdAt: new Date().toISOString(),
      isMock: true
    };

    mockMessages.push(newMessage);
    
    mockTickets[ticketIndex] = {
      ...mockTickets[ticketIndex],
      updatedAt: newMessage.createdAt,
      messagesCount: mockTickets[ticketIndex].messagesCount + 1,
      status: mockTickets[ticketIndex].status === 'resolved' || mockTickets[ticketIndex].status === 'closed' ? 'open' : mockTickets[ticketIndex].status
    };

    return newMessage;
  }

  static async updateStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
    await delay(500);
    const ticketIndex = mockTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) throw new Error("Ticket introuvable");

    mockTickets[ticketIndex] = {
      ...mockTickets[ticketIndex],
      status,
      updatedAt: new Date().toISOString()
    };

    return mockTickets[ticketIndex];
  }
}
