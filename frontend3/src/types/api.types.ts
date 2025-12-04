/**
 * API Type Definitions Matching Backend DTOs
 *
 * TYPE CONVERSIONS (Java → JSON → TypeScript):
 * - Backend: LocalDate → JSON: string (ISO 8601) → Frontend: string ("2000-01-01")
 * - Backend: Long/Integer → JSON: number → Frontend: number
 * - Backend: enum → JSON: string → Frontend: string literal union
 */

// ============================================
// Enums
// ============================================

export enum Role {
  ROLE_PARTICIPANT = 'ROLE_PARTICIPANT',
  ROLE_ORGANIZER = 'ROLE_ORGANIZER'
}

export enum UserStatus {
  PENDING = 'PENDING',
  AUTHENTICATED = 'AUTHENTICATED',
  SUSPENDED = 'SUSPENDED'
}

export enum EventStatus {
  COMING_SOON = 'COMING_SOON',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  DRAFT = 'DRAFT'
}

export enum OrganizerStatus{
    PENDING = 'PENDING',
    VERIFIED = 'VERIFIED',
}

// ============================================
// Auth Related Types
// ============================================

export interface RegisterRequest {
  email: string;
  password: string;
  recaptchaToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  roles: Role[];
  hasParticipantProfile: boolean;
  hasOrganizerProfile: boolean;
}

export interface CompleteParticipantProfileRequest {
  fullName: string;
  phoneNumber?: string;
  dateOfBirth: string;  // ISO date "YYYY-MM-DD"
}

export interface CompleteOrganizerProfileRequest {
  officialName: string;
  taxId: string;
  logoUrl?: string | null;
}

// ============================================
// User Profile Types
// ============================================

// Participant Profile (standalone)
export interface ParticipantProfile {
  profileCode: string;  // Auto-generated: P1, P2, P3...
  fullName: string;
  phoneNumber?: string;
  dateOfBirth: string;  // ISO date "YYYY-MM-DD"
  age: number;
  userStatus: UserStatus;  // User account status
}

// Organizer Profile (standalone)
export interface OrganizerProfile {
  profileCode: string;  // Auto-generated: O1, O2, O3...
  officialName: string;
  taxId: string;
  logoUrl?: string;
  status: OrganizerStatus;
}

// Complete User Profile Response (with nested profiles)
export interface UserProfileResponse {
  userId: number;
  email: string;
  status: UserStatus;
  roles: Role[];

  // Optional participant profile
  participantProfile?: ParticipantProfile;

  // Optional organizer profile
  organizerProfile?: OrganizerProfile;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;  // ISO date "YYYY-MM-DD"
}

// ============================================
// Event Types (Backend Structure)
// ============================================

export interface BackendTicketCategory {
  ticketCategoryId: number;
  sessionId: number;
  categoryName: string;
  price: number;
  quantity: number;
  soldQuantity?: number;
}

export interface BackendSession {
  sessionId: number;
  startDateTime: string;  // ISO datetime
  endDateTime: string;    // ISO datetime
  maxCapacity?: number;
  type: string;  // ONLINE or OFFLINE
  
  // For offline sessions
  venueName?: string;
  venueAddress?: string;
  
  // For online sessions
  meetingUrl?: string;
  platformName?: string;
  
  // Ticket categories for this session
  ticketCategories?: BackendTicketCategory[];
}

export interface BackendEvent {
  eventId: number;
  title: string;
  generalIntroduction: string;
  eventStatus: EventStatus;
  organizerId: number;
  startDateTime?: string;  // ISO datetime
  endDateTime?: string;    // ISO datetime
  timestamp?: string;      // ISO datetime
  posterUrl?: string;
  location?: string;       // Extracted from first offline session
  sessions: BackendSession[];  // Sessions are included in event response
  
  // Legacy fields for backward compatibility
  startDate?: string;  // ISO date
  endDate?: string;    // ISO date
}

// ============================================
// Error Types
// ============================================

export interface ErrorResponse {
  message: string;
}

// ============================================
// Auth Context Types
// ============================================

export interface AuthState {
  isAuthenticated: boolean;
  authData: AuthResponse | null;
  token: string | null;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateAuthData: (authData: AuthResponse) => void;
}

