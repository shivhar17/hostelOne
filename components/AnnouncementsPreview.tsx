import React, { useEffect, useState } from 'react';
import { Volume2, Bell, Loader2 } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: any;
  isRead: boolean;
}

const AnnouncementsPreview: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const announcementsRef = collection(db, 'announcements');
        const q = query(
          announcementsRef,
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        
        const querySnapshot = await getDocs(q);
        const announcementsData: Announcement[] = [];
        
        querySnapshot.forEach((doc) => {
          announcementsData.push({
            id: doc.id,
            ...doc.data()
          } as Announcement);
        });
        
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-4">
        <Bell className="mx-auto mb-2 text-purple-400" size={32} />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No recent announcements
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcements.map((announcement) => (
        <div 
          key={announcement.id}
          className={`p-3 rounded-lg border ${
            !announcement.isRead 
              ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800/50' 
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <h4 className="font-medium text-slate-800 dark:text-slate-100">
            {announcement.title}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {announcement.message}
          </p>
          {!announcement.isRead && (
            <span className="inline-block mt-1 text-xs text-purple-600 dark:text-purple-300">
              New
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default AnnouncementsPreview;
