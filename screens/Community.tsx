import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, MapPin, Calendar, Clock, CalendarPlus, Share2, MessageCircle, Send, MoreVertical, Phone, Video, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Category = 'All' | 'Chats' | 'Events' | 'Volunteering' | 'Marketplace' | 'Sports';

const CATEGORIES: Category[] = ['All', 'Chats', 'Events', 'Volunteering', 'Marketplace', 'Sports'];

const COMMUNITY_ITEMS = [
  {
    id: 1,
    title: "Annual Hostel Fest '24",
    category: "Events",
    description: "Join us for a day of fun, games, and music! DJ Night starts at 8 PM.",
    date: "Oct 26",
    time: "10:00 AM",
    startDateTime: "2024-10-26T10:00:00",
    endDateTime: "2024-10-26T22:00:00",
    location: "Main Ground",
    attendees: 13,
    image: "https://picsum.photos/800/600?random=party",
    featured: true,
    host: "Hostel Committee",
    hostImage: "https://picsum.photos/50/50?random=admin"
  },
  {
    id: 2,
    title: "Campus Clean-up Drive",
    category: "Volunteering",
    description: "Join us to keep our campus green and clean.",
    date: "Sun, Nov 3 • 9:00 AM",
    time: "9:00 AM",
    startDateTime: "2024-11-03T09:00:00",
    endDateTime: "2024-11-03T12:00:00",
    location: "Campus Gate",
    attendees: 5,
    image: "https://picsum.photos/200/200?random=nature",
    featured: false,
    host: "Alex",
    hostImage: "https://picsum.photos/50/50?random=u1"
  },
  {
    id: 3,
    title: "Selling Engineering Textbook",
    category: "Marketplace",
    description: "Condition: Almost new. Price negotiable.",
    date: "Condition: Almost new",
    time: "Anytime",
    startDateTime: "2024-11-01T09:00:00",
    endDateTime: "2024-11-01T18:00:00",
    location: "Block B",
    attendees: 0,
    image: "https://picsum.photos/200/200?random=book",
    featured: false,
    host: "Sarah",
    hostImage: "https://picsum.photos/50/50?random=u2"
  },
  {
    id: 4,
    title: "Inter-Hostel Football Match",
    category: "Sports",
    description: "Block A vs Block C. Come cheer for your team!",
    date: "Sat, Nov 9 • 4:00 PM",
    time: "4:00 PM",
    startDateTime: "2024-11-09T16:00:00",
    endDateTime: "2024-11-09T18:00:00",
    location: "Sports Ground",
    attendees: 22,
    image: "https://picsum.photos/200/200?random=football",
    featured: false,
    host: "Mike",
    hostImage: "https://picsum.photos/50/50?random=u3"
  }
];

// --- Chat Types & Mock Data ---

interface Message {
  id: number;
  text: string;
  sender: string; // 'me' or name
  time: string;
  isMe: boolean;
}

interface Chat {
  id: number;
  name: string;
  type: 'Group' | 'Support' | 'Direct';
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const MOCK_CHATS: Chat[] = [
  {
    id: 1,
    name: "Room A-302 (Roommates)",
    type: "Group",
    avatar: "https://picsum.photos/100/100?random=room302",
    lastMessage: "Mike: I'll handle the cleaning this week.",
    time: "10:30 AM",
    unread: 2,
    online: true
  },
  {
    id: 2,
    name: "Maintenance Support",
    type: "Support",
    avatar: "https://ui-avatars.com/api/?name=Maintenance+Support&background=0D9488&color=fff",
    lastMessage: "Your request #402 regarding the fan has been resolved.",
    time: "Yesterday",
    unread: 0,
    online: true
  },
  {
    id: 3,
    name: "Sarah (Marketplace)",
    type: "Direct",
    avatar: "https://picsum.photos/50/50?random=u2",
    lastMessage: "Is the book still available?",
    time: "Mon",
    unread: 1,
    online: false
  }
];

const INITIAL_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, text: "Hey guys, inspection is tomorrow morning!", sender: "Jane", time: "09:45 AM", isMe: false },
    { id: 2, text: "Make sure your beds are made.", sender: "Jane", time: "09:46 AM", isMe: false },
    { id: 3, text: "I'll handle the cleaning this week.", sender: "Mike", time: "10:30 AM", isMe: false },
  ],
  2: [
    { id: 1, text: "Hello, I have an issue with my ceiling fan.", sender: "me", time: "Yesterday", isMe: true },
    { id: 2, text: "We have received your request. A technician will visit shortly.", sender: "Support", time: "Yesterday", isMe: false },
    { id: 3, text: "Your request #402 regarding the fan has been resolved.", sender: "Support", time: "Yesterday", isMe: false },
  ],
  3: [
    { id: 1, text: "Hi, I saw your post about the Engineering textbook.", sender: "me", time: "Mon", isMe: true },
    { id: 2, text: "Is the book still available?", sender: "Sarah", time: "Mon", isMe: false },
  ]
};

const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'Volunteering':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-500 dark:text-blue-400'
      };
    case 'Marketplace':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-500 dark:text-emerald-400'
      };
    case 'Sports':
      return {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-500 dark:text-orange-400'
      };
    default:
      return {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-500 dark:text-purple-400'
      };
  }
};

export const Community: React.FC = () => {
   const [userPhoto, setUserPhoto] = useState('https://picsum.photos/100/100?random=10');
   const [activeCategory, setActiveCategory] = useState<Category>('All');
   
   // Chat State
   const [chats, setChats] = useState<Chat[]>(() => {
      const saved = localStorage.getItem('chats');
      return saved ? JSON.parse(saved) : MOCK_CHATS;
   });

   const [activeChat, setActiveChat] = useState<Chat | null>(null);
   const [messages, setMessages] = useState(INITIAL_MESSAGES);
   const [inputText, setInputText] = useState("");
   const messagesEndRef = useRef<HTMLDivElement>(null);

   const totalUnread = chats.reduce((acc, chat) => acc + chat.unread, 0);

   useEffect(() => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
         const parsed = JSON.parse(savedProfile);
         if (parsed.photo) setUserPhoto(parsed.photo);
      }
   }, []);

   useEffect(() => {
     if (activeChat) {
       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
     }
   }, [activeChat, messages]);

   const filteredItems = COMMUNITY_ITEMS.filter(item => 
     activeCategory === 'All' || item.category === activeCategory
   );

   const featuredItem = filteredItems.find(item => item.featured);
   const listItems = filteredItems.filter(item => !item.featured);

   const handleOpenChat = (chat: Chat) => {
      // Mark as read in state
      const updatedChats = chats.map(c => 
         c.id === chat.id ? { ...c, unread: 0 } : c
      );
      setChats(updatedChats);
      localStorage.setItem('chats', JSON.stringify(updatedChats));
      
      // Open chat with unread cleared
      setActiveChat({ ...chat, unread: 0 });
   };

   const handleAddToCalendar = (item: typeof COMMUNITY_ITEMS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Format date for ICS (YYYYMMDDTHHmmSSZ)
    const formatDate = (dateString: string) => {
      return dateString.replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const start = formatDate(item.startDateTime);
    const end = formatDate(item.endDateTime);

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${item.title}`,
      `DESCRIPTION:${item.description}`,
      `LOCATION:${item.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${item.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
   };

   const handleSendMessage = () => {
      if (!inputText.trim() || !activeChat) return;

      const newMessage: Message = {
        id: Date.now(),
        text: inputText,
        sender: "me",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      };

      setMessages(prev => ({
        ...prev,
        [activeChat.id]: [...(prev[activeChat.id] || []), newMessage]
      }));

      // Also update the last message in the chat list preview
      const updatedChats = chats.map(c => 
         c.id === activeChat.id ? { ...c, lastMessage: `You: ${inputText}`, time: 'Just now' } : c
      );
      setChats(updatedChats);
      localStorage.setItem('chats', JSON.stringify(updatedChats));

      setInputText("");
   };

   // --- Chat Interface Render ---
   if (activeChat) {
     const currentMessages = messages[activeChat.id] || [];
     
     return (
       <div className="fixed inset-0 z-[60] bg-[#F8FAFC] dark:bg-slate-950 flex flex-col h-full">
         {/* Chat Header */}
         <div className="bg-white dark:bg-slate-900 px-4 py-4 shadow-sm flex items-center gap-3">
           <button 
             onClick={() => setActiveChat(null)}
             className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
           >
             <ChevronLeft size={24} />
           </button>
           
           <div className="relative">
             <img src={activeChat.avatar} className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800" alt="Avatar" />
             {activeChat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>}
           </div>
           
           <div className="flex-1">
             <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{activeChat.name}</h3>
             <p className="text-xs text-slate-400 dark:text-slate-500">{activeChat.online ? 'Online' : 'Offline'}</p>
           </div>

           <div className="flex items-center gap-1 text-teal-500">
              <button className="p-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-full"><Phone size={20} /></button>
              <button className="p-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-full"><Video size={20} /></button>
           </div>
         </div>

         {/* Chat Messages */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 scroll-smooth">
            <div className="text-center text-xs text-slate-400 my-4 uppercase font-bold tracking-wider opacity-60">Today</div>
            {currentMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                   msg.isMe 
                    ? 'bg-teal-500 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none'
                 }`}>
                   {!msg.isMe && activeChat.type === 'Group' && <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 mb-1">{msg.sender}</p>}
                   {msg.text}
                   <p className={`text-[10px] mt-1 text-right ${msg.isMe ? 'text-teal-100' : 'text-slate-400'}`}>{msg.time}</p>
                 </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
         </div>

         {/* Input Area */}
         <div className="bg-white dark:bg-slate-900 p-4 pb-safe border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-teal-500 transition-colors bg-slate-100 dark:bg-slate-800 rounded-full">
               <Plus size={20} />
            </button>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Message..." 
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-3 rounded-full outline-none placeholder:text-slate-400"
            />
            <button 
               onClick={handleSendMessage}
               disabled={!inputText.trim()}
               className={`p-3 rounded-full text-white transition-all ${
                 inputText.trim() ? 'bg-teal-500 shadow-lg shadow-teal-500/30 active:scale-95' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
               }`}
            >
               <Send size={20} />
            </button>
         </div>
       </div>
     );
   }

   // --- Main Render ---
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-6 pt-12 pb-4 shadow-sm sticky top-0 z-20 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Community</h1>
           <div className="bg-orange-100 dark:bg-orange-900/40 p-1 rounded-full">
            <img src={userPhoto} className="w-8 h-8 rounded-full border border-white dark:border-slate-700 object-cover" alt="User" />
           </div>
        </div>
        
        {/* Search Bar (Hidden in Chats view for simplicity, or could be kept) */}
        {activeCategory !== 'Chats' && (
          <div className="relative mb-6">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input 
                type="text" 
                placeholder="Search events, items..." 
                className="w-full bg-slate-100 dark:bg-slate-800 py-3 pl-12 pr-4 rounded-xl outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 font-medium transition-colors"
             />
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
           {CATEGORIES.map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveCategory(tab)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === tab 
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                 {tab}
                 {tab === 'Chats' && totalUnread > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{totalUnread}</span>
                 )}
              </button>
           ))}
        </div>
      </div>

      <div className="p-6 space-y-8">
         {activeCategory === 'Chats' ? (
           // --- Chat List View ---
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              {chats.map((chat) => (
                <div 
                  key={chat.id} 
                  onClick={() => handleOpenChat(chat)}
                  className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm flex items-center gap-4 active:scale-98 transition-all cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                   <div className="relative">
                      <img 
                        src={chat.avatar} 
                        className={`w-14 h-14 rounded-full object-cover transition-all ${
                          chat.online ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                        }`} 
                        alt={chat.name} 
                      />
                      {chat.online && (
                        <div className="absolute bottom-1 right-0 w-3.5 h-3.5">
                           <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                           <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                        </div>
                      )}
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                         <h3 className="font-bold text-slate-800 dark:text-white truncate">{chat.name}</h3>
                         <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{chat.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <p className={`text-sm truncate pr-2 ${chat.unread > 0 ? 'text-slate-800 dark:text-slate-200 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                           {chat.type === 'Group' && !chat.lastMessage.startsWith('You:') ? <span className="text-teal-500">{chat.lastMessage.split(':')[0]}: </span> : ''}
                           {chat.type === 'Group' ? chat.lastMessage.split(':').slice(1).join(':') : chat.lastMessage}
                         </p>
                         {chat.unread > 0 && (
                            <div className="bg-teal-500 text-white text-[10px] font-bold h-5 min-w-[1.25rem] px-1 rounded-full flex items-center justify-center">
                               {chat.unread}
                            </div>
                         )}
                      </div>
                   </div>
                </div>
              ))}
           </div>
         ) : (
           // --- Standard Community Feed ---
           <>
             {/* Featured Event - Only show if it matches filter */}
             {featuredItem && (
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm group transition-colors">
                     <div className="h-48 relative">
                        <img src={featuredItem.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={featuredItem.title} />
                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 dark:text-white shadow-sm">
                           +{featuredItem.attendees} Going
                        </div>
                        <div className="absolute top-4 left-4 bg-purple-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm">
                           Featured
                        </div>
                     </div>
                     <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="text-xl font-bold text-slate-800 dark:text-white flex-1 mr-2">{featuredItem.title}</h3>
                           <button 
                             onClick={(e) => handleAddToCalendar(featuredItem, e)}
                             className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
                             title="Add to Calendar"
                           >
                              <CalendarPlus size={20} />
                           </button>
                        </div>
                        
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2">
                          {featuredItem.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-6">
                           <span className="flex items-center gap-1"><Calendar size={14} /> {featuredItem.date}</span>
                           <span className="flex items-center gap-1"><Clock size={14} /> {featuredItem.time}</span>
                           <span className="flex items-center gap-1"><MapPin size={14} /> {featuredItem.location}</span>
                        </div>

                        <div className="flex gap-2">
                           <button className="flex-1 bg-yellow-300 hover:bg-yellow-400 text-slate-900 font-bold py-3 rounded-xl transition-colors active:scale-95 shadow-sm">
                              Join Event
                           </button>
                           <button className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                              <Share2 size={20} />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
             )}

             {/* Filtered Activities List */}
             {listItems.length > 0 ? (
               <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                    {activeCategory === 'All' ? 'Upcoming Activities' : `${activeCategory} Activities`}
                  </h2>
                  <div className="space-y-4">
                     {listItems.map((item) => {
                       const styles = getCategoryStyles(item.category);
                       return (
                         <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm flex gap-4 transition-colors hover:shadow-md animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
                            <img src={item.image} className="w-20 h-20 rounded-xl object-cover shrink-0" alt={item.title} />
                            <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start mb-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${styles.bg} ${styles.text}`}>
                                    {item.category}
                                  </span>
                                  {item.category === 'Events' || item.category === 'Sports' || item.category === 'Volunteering' ? (
                                    <button 
                                      onClick={(e) => handleAddToCalendar(item, e)}
                                      className="text-slate-400 hover:text-teal-500 transition-colors p-1"
                                    >
                                       <CalendarPlus size={16} />
                                    </button>
                                  ) : null}
                               </div>
                               <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1 truncate pr-6">{item.title}</h3>
                               <p className="text-xs text-slate-400 mb-2 truncate">{item.date}</p>
                               <div className="flex items-center gap-2">
                                  <img src={item.hostImage} className="w-5 h-5 rounded-full object-cover" alt={item.host} />
                                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {item.category === 'Marketplace' ? 'Sold by: ' : 'Hosted by: '}{item.host}
                                  </span>
                               </div>
                            </div>
                         </div>
                       );
                     })}
                  </div>
               </div>
             ) : !featuredItem && (
               <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in">
                 <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                   <Search size={24} />
                 </div>
                 <h3 className="text-slate-800 dark:text-white font-bold mb-1">No activities found</h3>
                 <p className="text-slate-500 text-sm">There are no {activeCategory.toLowerCase()} items at the moment.</p>
               </div>
             )}
           </>
         )}
      </div>

      {/* Floating Action Button - Context Aware */}
      <button className="fixed bottom-24 right-6 bg-yellow-300 text-slate-900 p-4 rounded-full shadow-lg shadow-yellow-200 hover:scale-105 transition-transform z-30">
         {activeCategory === 'Chats' ? <MessageCircle size={24} strokeWidth={3} /> : <Plus size={24} strokeWidth={3} />}
      </button>
    </div>
  );
};