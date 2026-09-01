export type EventType = 'live' | 'course' | 'assignment' | 'other';
export type SessionStatus = 'open' | 'full' | 'past' | 'cancelled';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'none';

export interface ScheduleInstructor {
  id: string;
  name: string;
  avatar?: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  startAt: string; // ISO Date String
  endAt: string; // ISO Date String
  instructor: ScheduleInstructor;
  type: EventType;
  courseId?: string;
  isMock: boolean;
}

export interface LiveSession extends ScheduleEvent {
  type: 'live';
  status: SessionStatus;
  capacity: number;
  bookedCount: number;
  meetingUrl?: string;
  timezone: string;
  bookingRequired: boolean;
  userBookingStatus: BookingStatus;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const instructor1: ScheduleInstructor = { id: 'i-1', name: 'Alice Ndara' };
const instructor2: ScheduleInstructor = { id: 'i-2', name: 'Bob Professeur' };

// Utility to generate relative ISO dates
const getRelativeDate = (daysOffset: number, hours: number, minutes: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

let mockEvents: (ScheduleEvent | LiveSession)[] = [
  {
    id: 'e-1',
    title: 'Introduction au développement Web',
    description: 'Une session en direct pour démarrer le parcours de développement.',
    startAt: getRelativeDate(1, 10, 0), // Tomorrow 10:00
    endAt: getRelativeDate(1, 11, 30),
    instructor: instructor1,
    type: 'live',
    status: 'open',
    capacity: 50,
    bookedCount: 12,
    timezone: 'Europe/Paris',
    bookingRequired: true,
    userBookingStatus: 'none',
    isMock: true
  } as LiveSession,
  {
    id: 'e-2',
    title: 'Masterclass: React avancé',
    description: 'Plongée dans les hooks et les performances.',
    startAt: getRelativeDate(2, 14, 0), // In 2 days 14:00
    endAt: getRelativeDate(2, 16, 0),
    instructor: instructor2,
    type: 'live',
    status: 'full',
    capacity: 20,
    bookedCount: 20,
    timezone: 'Europe/Paris',
    bookingRequired: true,
    userBookingStatus: 'none',
    isMock: true
  } as LiveSession,
  {
    id: 'e-3',
    title: 'Session Q&A (Passée)',
    description: 'Réponses à vos questions sur JavaScript.',
    startAt: getRelativeDate(-1, 15, 0), // Yesterday 15:00
    endAt: getRelativeDate(-1, 16, 0),
    instructor: instructor1,
    type: 'live',
    status: 'past',
    capacity: 100,
    bookedCount: 45,
    timezone: 'Europe/Paris',
    bookingRequired: true,
    userBookingStatus: 'confirmed',
    isMock: true
  } as LiveSession,
  {
    id: 'e-4',
    title: 'Workshop UI/UX (Annulé)',
    description: 'Atelier pratique sur Figma.',
    startAt: getRelativeDate(3, 9, 0),
    endAt: getRelativeDate(3, 12, 0),
    instructor: instructor2,
    type: 'live',
    status: 'cancelled',
    capacity: 30,
    bookedCount: 5,
    timezone: 'Europe/Paris',
    bookingRequired: true,
    userBookingStatus: 'none',
    isMock: true
  } as LiveSession,
  {
    id: 'e-5',
    title: 'Rendu du Projet 1',
    description: 'Date limite pour rendre le premier projet.',
    startAt: getRelativeDate(0, 23, 59), // Today midnight
    endAt: getRelativeDate(0, 23, 59),
    instructor: instructor1,
    type: 'assignment',
    isMock: true
  } as ScheduleEvent,
  {
    id: 'e-6',
    title: 'Coaching individuel',
    description: 'Session réservée et confirmée.',
    startAt: getRelativeDate(4, 11, 0),
    endAt: getRelativeDate(4, 12, 0),
    instructor: instructor2,
    type: 'live',
    status: 'open',
    capacity: 1,
    bookedCount: 1,
    timezone: 'Europe/Paris',
    bookingRequired: true,
    userBookingStatus: 'confirmed',
    isMock: true
  } as LiveSession
];

export class ScheduleService {
  /**
   * Récupère tout le planning (pour le calendrier).
   */
  static async getSchedule(): Promise<{ events: ScheduleEvent[], isMock: boolean }> {
    await delay(600);
    return { events: [...mockEvents], isMock: true };
  }

  /**
   * Récupère une session live par son ID.
   */
  static async getLiveSessionById(sessionId: string): Promise<{ session: LiveSession, isMock: boolean }> {
    await delay(500);
    const session = mockEvents.find(e => e.id === sessionId && e.type === 'live') as LiveSession | undefined;
    if (!session) {
      throw new Error("SESSION_NOT_FOUND");
    }
    return { session: { ...session }, isMock: true };
  }

  /**
   * Réserve une session live.
   * C'est ici que l'appel backend interviendra.
   */
  static async bookLiveSession(sessionId: string): Promise<{ success: boolean, message: string, isMock: boolean }> {
    await delay(1000);
    
    // BACKEND_NOT_CONNECTED simulation but we update mock state to let the UI proceed for testing phase.
    const sessionIndex = mockEvents.findIndex(e => e.id === sessionId && e.type === 'live');
    if (sessionIndex === -1) {
      throw new Error("SESSION_NOT_FOUND");
    }

    const session = mockEvents[sessionIndex] as LiveSession;

    if (session.status === 'past') throw new Error("SESSION_PAST: Cette session est déjà terminée.");
    if (session.status === 'cancelled') throw new Error("SESSION_CANCELLED: Cette session est annulée.");
    if (session.status === 'full' || session.bookedCount >= session.capacity) throw new Error("SESSION_FULL: Il n'y a plus de places disponibles.");
    if (session.userBookingStatus === 'confirmed') throw new Error("ALREADY_BOOKED: Vous avez déjà réservé cette session.");

    // Update mock state
    session.bookedCount += 1;
    session.userBookingStatus = 'confirmed';
    if (session.bookedCount >= session.capacity) {
      session.status = 'full';
    }

    return { 
      success: true, 
      message: "Réservation mockée avec succès. BACKEND_NOT_CONNECTED.", 
      isMock: true 
    };
  }
}
