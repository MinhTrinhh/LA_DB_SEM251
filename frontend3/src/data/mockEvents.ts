import heroMusicFestival from "@/assets/hero-music-festival.jpg";
import heroTechSummit from "@/assets/hero-tech-summit.jpg";
import heroArtExhibition from "@/assets/hero-art-exhibition.jpg";
import eventEdm from "@/assets/event-edm.jpg";
import eventJazz from "@/assets/event-jazz.jpg";
import eventWorkshop from "@/assets/event-workshop.jpg";
import eventMarathon from "@/assets/event-marathon.jpg";
import eventNetworking from "@/assets/event-networking.jpg";
import eventPhotography from "@/assets/event-photography.jpg";

export interface TicketCategory {
  name: string;
  price: number;
  available: number;
  total: number;
  description: string;
}

export interface Session {
  date: string;
  time: string;
  ticketCategories: TicketCategory[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  date: string;
  time: string;
  endDate?: string;
  venue: string;
  location: string;
  organizerId: string;
  organizerName: string;
  isFeatured: boolean;
  isFree: boolean;
  price?: number;
  attendees?: number;
  sessions?: Session[];
  ticketCategories: TicketCategory[];
  organizer: {
    name: string;
    email: string;
    avatar: string;
  };
}

export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  category: string;
  quantity: number;
  totalPrice: number;
  purchaseDate: string;
  qrCode: string;
  status: 'valid' | 'used' | 'cancelled';
}

export interface SelectedTickets {
  [categoryName: string]: number;
}

export interface OrderData {
  orderId: string;
  event: Event;
  session: Session;
  selectedTickets: SelectedTickets;
  totalAmount: number;
  totalTickets: number;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Summer Music Festival 2025",
    description: "Join us for the biggest music festival of the summer! Featuring top artists from around the world, multiple stages, and an unforgettable experience. Three days of non-stop music, food trucks, art installations, and more. Don't miss out on the event of the year!",
    category: "Music",
    image: heroMusicFestival,
    date: "2025-07-15",
    time: "14:00",
    endDate: "2025-07-17",
    venue: "City Park Main Stage",
    location: "Los Angeles, CA",
    organizerId: "org1",
    organizerName: "Live Nation Events",
    isFeatured: true,
    isFree: false,
    price: 149,
    attendees: 15000,
    sessions: [
      {
        date: "Jul 15, 2025",
        time: "2:00 PM - 11:00 PM",
        ticketCategories: [
          {
            name: "General Admission",
            price: 149,
            available: 5000,
            total: 10000,
            description: "Access to all stages and festival grounds"
          },
          {
            name: "VIP Pass",
            price: 299,
            available: 150,
            total: 500,
            description: "VIP lounge access, premium viewing areas, exclusive merch"
          },
          {
            name: "Premium Experience",
            price: 499,
            available: 30,
            total: 100,
            description: "Meet & greet, backstage access, VIP lounge, premium viewing"
          }
        ]
      },
      {
        date: "Jul 16, 2025",
        time: "2:00 PM - 11:00 PM",
        ticketCategories: [
          {
            name: "General Admission",
            price: 149,
            available: 4800,
            total: 10000,
            description: "Access to all stages and festival grounds"
          },
          {
            name: "VIP Pass",
            price: 299,
            available: 120,
            total: 500,
            description: "VIP lounge access, premium viewing areas, exclusive merch"
          },
          {
            name: "Premium Experience",
            price: 499,
            available: 25,
            total: 100,
            description: "Meet & greet, backstage access, VIP lounge, premium viewing"
          }
        ]
      },
      {
        date: "Jul 17, 2025",
        time: "2:00 PM - 10:00 PM",
        ticketCategories: [
          {
            name: "General Admission",
            price: 149,
            available: 5200,
            total: 10000,
            description: "Access to all stages and festival grounds"
          },
          {
            name: "VIP Pass",
            price: 299,
            available: 140,
            total: 500,
            description: "VIP lounge access, premium viewing areas, exclusive merch"
          },
          {
            name: "Premium Experience",
            price: 499,
            available: 28,
            total: 100,
            description: "Meet & greet, backstage access, VIP lounge, premium viewing"
          }
        ]
      }
    ],
    ticketCategories: [
      {
        name: "General Admission",
        price: 149,
        available: 5000,
        total: 10000,
        description: "Access to all stages and festival grounds"
      },
      {
        name: "VIP Pass",
        price: 299,
        available: 150,
        total: 500,
        description: "VIP lounge access, premium viewing areas, exclusive merch"
      },
      {
        name: "Premium Experience",
        price: 499,
        available: 30,
        total: 100,
        description: "Meet & greet, backstage access, VIP lounge, premium viewing"
      }
    ],
    organizer: {
      name: "Live Nation Events",
      email: "contact@livenation.com",
      avatar: "LN"
    }
  },
  {
    id: "2",
    title: "Tech Summit 2025",
    description: "The premier technology conference bringing together innovators, developers, and industry leaders. Experience keynote speeches from tech giants, hands-on workshops, and networking opportunities with thousands of tech professionals.",
    category: "Conference",
    image: heroTechSummit,
    date: "2025-08-22",
    time: "09:00",
    venue: "Convention Center",
    location: "San Francisco, CA",
    organizerId: "org2",
    organizerName: "TechCorp International",
    isFeatured: true,
    isFree: false,
    price: 299,
    attendees: 3000,
    ticketCategories: [
      {
        name: "Standard Pass",
        price: 299,
        available: 800,
        total: 2000,
        description: "Access to all sessions and expo hall"
      },
      {
        name: "Professional Pass",
        price: 499,
        available: 200,
        total: 500,
        description: "Standard access plus workshops and networking events"
      },
      {
        name: "Enterprise Pass",
        price: 899,
        available: 50,
        total: 100,
        description: "Full access including VIP dinners and executive meetings"
      }
    ],
    organizer: {
      name: "TechCorp International",
      email: "events@techcorp.com",
      avatar: "TC"
    }
  },
  {
    id: "3",
    title: "Contemporary Art Exhibition",
    description: "Explore groundbreaking contemporary artworks from emerging and established artists. This curated exhibition features paintings, sculptures, digital art, and installations that push the boundaries of modern creativity.",
    category: "Arts",
    image: heroArtExhibition,
    date: "2025-06-10",
    time: "10:00",
    endDate: "2025-07-10",
    venue: "Modern Art Gallery",
    location: "New York, NY",
    organizerId: "org3",
    organizerName: "Gallery Moderna",
    isFeatured: true,
    isFree: true,
    attendees: 5000,
    ticketCategories: [
      {
        name: "Free Entry",
        price: 0,
        available: 5000,
        total: 5000,
        description: "General admission to the exhibition"
      }
    ],
    organizer: {
      name: "Gallery Moderna",
      email: "info@gallerymoderna.com",
      avatar: "GM"
    }
  },
  {
    id: "4",
    title: "Electric Dreams - EDM Night",
    description: "Get ready for an electrifying night of electronic dance music featuring world-renowned DJs and producers. State-of-the-art sound system, stunning visual effects, and non-stop beats until dawn.",
    category: "Music",
    image: eventEdm,
    date: "2025-06-28",
    time: "21:00",
    venue: "Echo Nightclub",
    location: "Miami, FL",
    organizerId: "org4",
    organizerName: "Pulse Events",
    isFeatured: false,
    isFree: false,
    price: 45,
    attendees: 1200,
    ticketCategories: [
      {
        name: "General Entry",
        price: 45,
        available: 400,
        total: 800,
        description: "Entry to main floor"
      },
      {
        name: "VIP Table",
        price: 250,
        available: 15,
        total: 20,
        description: "Reserved table with bottle service"
      }
    ],
    organizer: {
      name: "Pulse Events",
      email: "bookings@pulseevents.com",
      avatar: "PE"
    }
  },
  {
    id: "5",
    title: "Jazz Under the Stars",
    description: "An intimate evening of smooth jazz in a sophisticated setting. Enjoy world-class musicians performing classic and contemporary jazz standards. Wine and cocktails available.",
    category: "Music",
    image: eventJazz,
    date: "2025-07-05",
    time: "19:30",
    venue: "Blue Note Lounge",
    location: "Chicago, IL",
    organizerId: "org5",
    organizerName: "Jazz Society",
    isFeatured: false,
    isFree: false,
    price: 35,
    attendees: 150,
    ticketCategories: [
      {
        name: "Standard Seating",
        price: 35,
        available: 80,
        total: 100,
        description: "General seating with table service"
      },
      {
        name: "Premium Seating",
        price: 55,
        available: 20,
        total: 30,
        description: "Front row seating with complimentary drink"
      }
    ],
    organizer: {
      name: "Jazz Society",
      email: "info@jazzsociety.org",
      avatar: "JS"
    }
  },
  {
    id: "6",
    title: "Digital Marketing Masterclass",
    description: "Comprehensive workshop covering the latest digital marketing strategies, SEO, social media marketing, content creation, and analytics. Perfect for business owners, marketers, and entrepreneurs looking to boost their online presence.",
    category: "Workshop",
    image: eventWorkshop,
    date: "2025-07-20",
    time: "10:00",
    venue: "Innovation Hub",
    location: "Austin, TX",
    organizerId: "org6",
    organizerName: "Marketing Academy",
    isFeatured: false,
    isFree: false,
    price: 149,
    attendees: 50,
    ticketCategories: [
      {
        name: "Early Bird",
        price: 149,
        available: 15,
        total: 20,
        description: "Workshop access plus course materials"
      },
      {
        name: "Standard",
        price: 199,
        available: 25,
        total: 30,
        description: "Workshop access plus course materials"
      }
    ],
    organizer: {
      name: "Marketing Academy",
      email: "learn@marketingacademy.com",
      avatar: "MA"
    }
  },
  {
    id: "7",
    title: "City Marathon 2025",
    description: "Join thousands of runners in our annual city marathon. Multiple categories including full marathon, half marathon, and 10K. Chip timing, water stations every mile, and finisher medals for all participants. Family-friendly event with live entertainment.",
    category: "Sports",
    image: eventMarathon,
    date: "2025-09-14",
    time: "07:00",
    venue: "City Center",
    location: "Boston, MA",
    organizerId: "org7",
    organizerName: "City Athletics",
    isFeatured: false,
    isFree: false,
    price: 65,
    attendees: 8000,
    ticketCategories: [
      {
        name: "Full Marathon",
        price: 95,
        available: 2000,
        total: 3000,
        description: "42.195 km race registration"
      },
      {
        name: "Half Marathon",
        price: 75,
        available: 2500,
        total: 3500,
        description: "21.097 km race registration"
      },
      {
        name: "10K Run",
        price: 45,
        available: 1000,
        total: 1500,
        description: "10 km race registration"
      }
    ],
    organizer: {
      name: "City Athletics",
      email: "register@cityathletics.org",
      avatar: "CA"
    }
  },
  {
    id: "8",
    title: "Startup Networking Night",
    description: "Connect with founders, investors, and innovators in the startup ecosystem. Pitch sessions, panel discussions, and plenty of networking time. Perfect for entrepreneurs seeking funding, partnerships, or just great conversations.",
    category: "Networking",
    image: eventNetworking,
    date: "2025-06-18",
    time: "18:00",
    venue: "Startup Hub",
    location: "Seattle, WA",
    organizerId: "org8",
    organizerName: "Founders Network",
    isFeatured: false,
    isFree: true,
    attendees: 200,
    ticketCategories: [
      {
        name: "Free Admission",
        price: 0,
        available: 180,
        total: 200,
        description: "Networking and refreshments included"
      }
    ],
    organizer: {
      name: "Founders Network",
      email: "hello@foundersnetwork.co",
      avatar: "FN"
    }
  },
  {
    id: "9",
    title: "Photography Workshop: Urban Landscapes",
    description: "Learn advanced techniques for capturing stunning urban photography. Covers composition, lighting, post-processing, and storytelling through images. Includes hands-on shooting session and portfolio review.",
    category: "Workshop",
    image: eventPhotography,
    date: "2025-07-12",
    time: "13:00",
    venue: "Creative Studio",
    location: "Portland, OR",
    organizerId: "org9",
    organizerName: "PhotoPro Institute",
    isFeatured: false,
    isFree: false,
    price: 129,
    attendees: 25,
    ticketCategories: [
      {
        name: "Standard",
        price: 129,
        available: 18,
        total: 20,
        description: "Workshop and course materials"
      },
      {
        name: "Premium",
        price: 199,
        available: 4,
        total: 5,
        description: "Workshop, materials, and 1-on-1 portfolio review"
      }
    ],
    organizer: {
      name: "PhotoPro Institute",
      email: "workshops@photopro.com",
      avatar: "PP"
    }
  }
];
