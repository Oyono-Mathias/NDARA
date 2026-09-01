export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'account' | 'course' | 'payment' | 'technical' | 'certificate' | 'other';
export type SenderRole = 'student' | 'instructor' | 'support' | 'admin';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  requesterId: string;
  assignedTo?: string;
  messagesCount: number;
  isMock: boolean;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: SenderRole;
  content: string;
  createdAt: string;
  isMock: boolean;
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
}

import { TicketController } from '../controllers/ticketController';

export class TicketService {
  static async getTickets(): Promise<Ticket[]> {
    return TicketController.listTickets();
  }

  static async getTicketById(id: string): Promise<{ ticket: Ticket; messages: TicketMessage[] }> {
    return TicketController.getTicket(id);
  }

  static async createTicket(payload: CreateTicketPayload): Promise<Ticket> {
    return TicketController.createTicket(payload);
  }

  static async addTicketMessage(ticketId: string, content: string): Promise<TicketMessage> {
    return TicketController.sendMessage(ticketId, content);
  }

  static async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
    return TicketController.updateStatus(ticketId, status);
  }
}
