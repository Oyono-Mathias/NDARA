export interface MentorshipProgram {
  id: string;
  title: string;
  description: string;
  domain: string;
  durationWeeks: number;
  sessionsCount: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  format: '1-on-1' | 'group';
  price: number;
  currency: string;
  isMock: boolean;
}

export interface MentorProfile {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  bio: string;
  expertise: string[];
  languages: string[];
  experienceYears: number;
  rating?: number;
  totalSessions?: number;
  availabilityStatus: 'available' | 'soon' | 'unavailable';
  isMock: boolean;
}

export interface Mentor extends MentorProfile {}

export interface MentorMatchingCriteria {
  programId?: string;
  domain?: string;
  level?: string;
  language?: string;
}

export interface MentorMatch {
  mentor: Mentor;
  matchScore: number; // 0-100
  matchingReasons: string[];
}

export interface AvailabilitySlot {
  id: string;
  mentorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
  status: 'available' | 'booked';
}

export type MentoringStatus = 'pending' | 'confirmed' | 'rejected' | 'slot_unavailable' | 'backend_not_connected' | 'payment_required' | 'completed';

export interface MentoringSession {
  id: string;
  mentorId: string;
  studentId?: string;
  programId: string;
  slotId: string;
  status: MentoringStatus;
  bookingReference: string;
  price: number;
  currency: string;
  isPaid: boolean;
  isMock: boolean;
}

export interface BookingRequest {
  mentorId: string;
  programId: string;
  slotId: string;
}

export interface BookingResponse {
  session?: MentoringSession;
  status: MentoringStatus;
  message?: string;
}

export interface MentoringServiceResponse<T> {
  data: T;
  isMock: boolean;
  error?: string;
  errorCode?: 'MENTOR_NOT_FOUND' | 'PROGRAM_NOT_FOUND' | 'NO_AVAILABLE_SLOT' | 'SLOT_ALREADY_BOOKED' | 'BOOKING_FAILED' | 'BACKEND_NOT_CONNECTED' | 'PAYMENT_REQUIRED';
}

// --- MOCK DATA ---
const MOCK_PROGRAMS: MentorshipProgram[] = [
  {
    id: 'prog-1',
    title: 'Accélération Dev Frontend',
    description: 'Devenez expert sur React, TypeScript et l\'architecture frontend avec un mentor dédié.',
    domain: 'Développement Web',
    durationWeeks: 8,
    sessionsCount: 8,
    level: 'intermediate',
    format: '1-on-1',
    price: 0,
    currency: 'XAF',
    isMock: true,
  },
  {
    id: 'prog-2',
    title: 'Introduction au Design UI/UX',
    description: 'Apprenez les bases du design d\'interface, des systèmes de design et de l\'accessibilité.',
    domain: 'Design',
    durationWeeks: 4,
    sessionsCount: 4,
    level: 'beginner',
    format: '1-on-1',
    price: 15000,
    currency: 'XAF',
    isMock: true,
  }
];

const MOCK_MENTORS: Mentor[] = [
  {
    id: 'mentor-1',
    displayName: 'Amina Ndoye',
    bio: 'Tech Lead avec 8 ans d\'expérience dans des startups africaines. Spécialiste React.',
    expertise: ['React', 'TypeScript', 'Frontend Architecture'],
    languages: ['Français', 'Anglais'],
    experienceYears: 8,
    rating: 4.9,
    totalSessions: 124,
    availabilityStatus: 'available',
    isMock: true
  },
  {
    id: 'mentor-2',
    displayName: 'Kwami Mensah',
    bio: 'Product Designer freelance passionné par l\'accessibilité et les interfaces épurées.',
    expertise: ['UI Design', 'Figma', 'UX Research'],
    languages: ['Français'],
    experienceYears: 5,
    rating: 4.7,
    totalSessions: 42,
    availabilityStatus: 'soon',
    isMock: true
  },
  {
    id: 'mentor-3',
    displayName: 'Sarah Diop',
    bio: 'Développeuse Fullstack, je vous aide à structurer vos projets de A à Z.',
    expertise: ['Node.js', 'React', 'Firebase'],
    languages: ['Français', 'Anglais', 'Wolof'],
    experienceYears: 6,
    rating: 5.0,
    totalSessions: 89,
    availabilityStatus: 'available',
    isMock: true
  }
];

const MOCK_SLOTS: Record<string, AvailabilitySlot[]> = {
  'mentor-1': [
    { id: 'slot-1-1', mentorId: 'mentor-1', date: '2026-09-05', startTime: '14:00', endTime: '15:00', timezone: 'UTC+1', status: 'available' },
    { id: 'slot-1-2', mentorId: 'mentor-1', date: '2026-09-05', startTime: '15:30', endTime: '16:30', timezone: 'UTC+1', status: 'available' },
    { id: 'slot-1-3', mentorId: 'mentor-1', date: '2026-09-06', startTime: '09:00', endTime: '10:00', timezone: 'UTC+1', status: 'booked' },
  ],
  'mentor-2': [
    { id: 'slot-2-1', mentorId: 'mentor-2', date: '2026-09-10', startTime: '10:00', endTime: '11:00', timezone: 'UTC+1', status: 'available' },
  ],
  'mentor-3': []
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MentoringService {
  static async getMentorshipPrograms(): Promise<MentoringServiceResponse<MentorshipProgram[]>> {
    await delay(600);
    return { data: [...MOCK_PROGRAMS], isMock: true };
  }

  static async findMentors(criteria: MentorMatchingCriteria): Promise<MentoringServiceResponse<MentorMatch[]>> {
    await delay(800);
    
    // Simulate matching logic
    const matches: MentorMatch[] = MOCK_MENTORS.map(mentor => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // Fake evaluation based on program domain
      if (criteria.domain) {
        const matchesDomain = mentor.expertise.some(e => e.toLowerCase().includes(criteria.domain!.toLowerCase()) || criteria.domain!.toLowerCase().includes(e.toLowerCase()) || (criteria.domain === 'Développement Web' && e === 'React'));
        if (matchesDomain) {
          score += 30;
          reasons.push('Expertise alignée avec le programme');
        }
      }

      if (criteria.language && mentor.languages.includes(criteria.language)) {
        score += 10;
        reasons.push('Langue commune');
      }

      if (mentor.availabilityStatus === 'available') {
        score += 10;
        reasons.push('Disponibilité immédiate');
      }

      return { mentor, matchScore: Math.min(score, 100), matchingReasons: reasons };
    });

    // Sort by score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return { data: matches, isMock: true };
  }

  static async getMentorAvailability(mentorId: string): Promise<MentoringServiceResponse<AvailabilitySlot[]>> {
    await delay(500);
    const slots = MOCK_SLOTS[mentorId] || [];
    return { data: [...slots], isMock: true };
  }

  static async createBooking(request: BookingRequest): Promise<MentoringServiceResponse<BookingResponse>> {
    await delay(1200);

    const slots = MOCK_SLOTS[request.mentorId];
    if (!slots) {
      return { data: { status: 'rejected' }, isMock: true, error: 'Mentor introuvable', errorCode: 'MENTOR_NOT_FOUND' };
    }

    const slot = slots.find(s => s.id === request.slotId);
    if (!slot) {
      return { data: { status: 'slot_unavailable' }, isMock: true, error: 'Créneau introuvable', errorCode: 'NO_AVAILABLE_SLOT' };
    }

    if (slot.status === 'booked') {
      return { data: { status: 'rejected' }, isMock: true, error: 'Créneau déjà réservé', errorCode: 'SLOT_ALREADY_BOOKED' };
    }

    const program = MOCK_PROGRAMS.find(p => p.id === request.programId);
    if (!program) {
      return { data: { status: 'rejected' }, isMock: true, error: 'Programme introuvable', errorCode: 'PROGRAM_NOT_FOUND' };
    }

    // Mock confirmation
    const session: MentoringSession = {
      id: `session-${Date.now()}`,
      mentorId: request.mentorId,
      studentId: 'student-mock',
      programId: request.programId,
      slotId: request.slotId,
      status: 'confirmed',
      bookingReference: `REF-${Math.floor(Math.random() * 10000)}`,
      price: program.price,
      currency: program.currency,
      isPaid: program.price === 0, // Gratuit = payé
      isMock: true
    };

    return { 
      data: { session, status: 'confirmed' }, 
      isMock: true 
    };
  }
}
