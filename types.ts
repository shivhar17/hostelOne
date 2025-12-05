export enum IssueCategory {
  ELECTRICITY = 'Electricity',
  WATER = 'Water',
  CLEANING = 'Cleaning',
  REPAIRS = 'Room Repairs',
  MESS = 'Mess Complaint',
  OTHERS = 'Others'
}

export interface MenuItem {
  name: string;
  image?: string;
  items: string[];
  calories?: number;
  rating?: number;
}

export interface DailyMenu {
  date: string;
  breakfast: MenuItem;
  lunch: MenuItem;
  dinner: MenuItem;
}

export interface Notice {
  id: string;
  title: string;
  time: string;
  type: 'Mess' | 'Holiday' | 'Event' | 'General';
  description?: string;
  read: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  image: string;
  attendees: number;
  category: 'Volunteering' | 'Social' | 'Sports' | 'Marketplace';
}

export interface UserProfile {
  name: string;
  id: string;
  room: string;
  block: string;
  messPlan: string;
  avatar: string;
}
