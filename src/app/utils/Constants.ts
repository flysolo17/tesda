import {
  Appointment,
  AppointmentStatus,
  PersonalInformation,
  ServiceInformation,
} from '../models/Appointment';
import { Feedback, Sentiment } from '../models/Feedback';
import { Schedule } from '../models/Schedule';

export const SAMPLE_FEEDBACKS: Feedback[] = [
  {
    id: 'fb1',
    name: 'Christopher Johnathon',
    profile: 'https://avatar.iran.liara.run/public/boy',
    uid: 'user001',
    sentiment: Sentiment.VerySatisfied,
    comment: 'Brilliant presentation! Really well done.',
    allowFollowUp: true,
    submittedAt: new Date('2023-04-01'),
  },
  {
    id: 'fb2',
    name: 'Maria Gonzales',
    profile: 'https://avatar.iran.liara.run/public/girl',
    uid: 'user002',
    sentiment: Sentiment.Satisfied,
    comment: 'Loved the new dashboard layout. Very intuitive.',
    allowFollowUp: false,
    submittedAt: new Date('2023-04-03'),
  },
  {
    id: 'fb3',
    name: 'Liam Tan',
    profile: 'https://avatar.iran.liara.run/public/boy',
    uid: 'user003',
    sentiment: Sentiment.Neutral,
    comment: 'The system works fine, but could be faster.',
    allowFollowUp: true,
    submittedAt: new Date('2023-04-05'),
  },
  {
    id: 'fb4',
    name: 'Ayesha Malik',
    profile: 'https://avatar.iran.liara.run/public/girl',
    uid: 'user004',
    sentiment: Sentiment.Dissatisfied,
    comment: 'Had trouble logging in multiple times.',
    allowFollowUp: false,
    submittedAt: new Date('2023-04-06'),
  },
  {
    id: 'fb5',
    name: 'Jared Cruz',
    profile: 'https://avatar.iran.liara.run/public/boy',
    uid: 'user005',
    sentiment: Sentiment.VerySatisfied,
    comment: 'Support team was very responsive. Thanks!',
    allowFollowUp: true,
    submittedAt: new Date('2023-04-07'),
  },
  {
    id: 'fb6',
    name: 'Sofia Reyes',
    profile: 'https://avatar.iran.liara.run/public/girl',
    uid: 'user006',
    sentiment: Sentiment.Satisfied,
    comment: 'Looking forward to the next update.',
    allowFollowUp: false,
    submittedAt: new Date('2023-04-08'),
  },
  {
    id: 'fb7',
    name: 'Nathaniel Blake',
    profile: 'https://avatar.iran.liara.run/public/boy',
    uid: 'user007',
    sentiment: Sentiment.VeryDissatisfied,
    comment: 'Some features are buggy on mobile.',
    allowFollowUp: true,
    submittedAt: new Date('2023-04-09'),
  },
  {
    id: 'fb8',
    name: 'Emily Zhang',
    profile: 'https://avatar.iran.liara.run/public/girl',
    uid: 'user008',
    sentiment: Sentiment.VerySatisfied,
    comment: 'Great job on the analytics module!',
    allowFollowUp: true,
    submittedAt: new Date('2023-04-10'),
  },
  {
    id: 'fb9',
    name: 'Carlos Mendoza',
    profile: 'https://avatar.iran.liara.run/public/boy',
    uid: 'user009',
    sentiment: Sentiment.Neutral,
    comment: 'Still learning the system, but it’s okay so far.',
    allowFollowUp: false,
    submittedAt: new Date('2023-04-11'),
  },
  {
    id: 'fb10',
    name: 'Hannah Lee',
    profile: 'https://avatar.iran.liara.run/public/girl',
    uid: 'user010',
    sentiment: Sentiment.Satisfied,
    comment: 'Very clean UI and easy to navigate.',
    allowFollowUp: true,
    submittedAt: new Date('2023-04-12'),
  },
];

export function generateAppointmentId(length: number = 11): string {
  let id = '';
  for (let i = 0; i < length; i++) {
    id += Math.floor(Math.random() * 10);
  }
  return id;
}

// Sample personal info
const NAMES: PersonalInformation[] = [
  { name: 'John Doe', email: 'john@example.com', contact: '09123456789' },
  { name: 'Jane Smith', email: 'jane@example.com', contact: '09987654321' },
  { name: 'Alice Johnson', email: 'alice@example.com', contact: '09234567890' },
  { name: 'Bob Williams', email: 'bob@example.com', contact: '09345678901' },
];

// Random date generator (Nov 15 → Dec 31, 2025)
function randomDate(start: Date, end: Date): string {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Random time generator (8AM–3PM)
function randomTime(): string {
  const hours = Math.floor(Math.random() * 8) + 8;
  const minutes = Math.random() < 0.5 ? '00' : '30';
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHour = hours > 12 ? hours - 12 : hours;
  return `${formattedHour}:${minutes} ${period}`;
}

export function generateRandomNumberWithDate(): string {
  // Generate a 15-digit random number
  let random = '';
  for (let i = 0; i < 15; i++) {
    random += Math.floor(Math.random() * 10).toString();
  }

  // Format date as yyyyMMdd
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const date = `${yyyy}${mm}${dd}`;

  return random + date;
}
