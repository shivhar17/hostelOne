import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bell, ChevronDown, User, RefreshCw, Send, UserPlus } from 'lucide-react';

interface ChatMessage {
  id: number;
  text: string;
  sender: string;
  time: string;
  isStaff: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    text: "Hi John, we've received your complaint. Our technician will visit your room by 2 PM today.",
    sender: "Staff",
    time: "11:02 AM",
    isStaff: true
  },
  {
    id: 2,
    text: "Thank you for the quick response. I'll be in my room.",
    sender: "John Doe",
    time: "11:05 AM",
    isStaff: false
  }
];

export const ComplaintDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Student Chat');
  const [chatMessage, setChatMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage or use defaults
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(`complaint_chat_${id}`);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      text: chatMessage,
      sender: "Staff",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStaff: true
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem(`complaint_chat_${id}`, JSON.stringify(updatedMessages));
    setChatMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-[#0F172A] border-b border-white/5 sticky top-0 z-20 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-800 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">View Complaints</h1>
        </div>
        <button className="relative p-2 hover:bg-slate-800 rounded-full transition-colors">
           <Bell size={20} />
           <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-slate-800"></div>
        </button>
      </div>

      {/* Filters (Mock) */}
      <div className="px-6 py-4 flex gap-4">
         <div className="flex-1 bg-[#1E293B] px-4 py-2.5 rounded-xl flex justify-between items-center text-xs font-medium text-slate-300">
            Sort by: Urgency <ChevronDown size={14} />
         </div>
         <div className="flex-1 bg-[#1E293B] px-4 py-2.5 rounded-xl flex justify-between items-center text-xs font-medium text-slate-300">
            Status: All <ChevronDown size={14} />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
         {/* Complaint Card Detail */}
         <div className="bg-[#1E293B] rounded-3xl p-5 mb-6 border border-slate-700/50">
            <div className="flex justify-between items-start mb-1">
               <span className="text-xs font-bold text-slate-400">#{id || 'C-1245'}</span>
            </div>
            
            <div className="flex gap-2 mb-4">
               <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-lg text-xs font-bold">Pending</span>
               <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-xs font-bold">Maintenance</span>
            </div>

            <h2 className="text-2xl font-bold mb-4">Wi-Fi not working in Room 404</h2>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
               The Wi-Fi router in my room (404, Block C) has not been working since this morning. The signal is extremely weak and frequently disconnects, making it impossible to attend online classes. I have tried restarting the router multiple times without any success. Please look into this matter urgently.
            </p>

            <h3 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Submitted Photos</h3>
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
               <div className="w-24 h-24 bg-white rounded-xl overflow-hidden shrink-0">
                  <img src="https://picsum.photos/200/200?random=router1" className="w-full h-full object-cover" alt="Evidence 1" />
               </div>
               <div className="w-24 h-24 bg-white rounded-xl overflow-hidden shrink-0">
                  <img src="https://picsum.photos/200/200?random=router2" className="w-full h-full object-cover" alt="Evidence 2" />
               </div>
               <div className="w-24 h-24 bg-white rounded-xl overflow-hidden shrink-0">
                  <img src="https://picsum.photos/200/200?random=router3" className="w-full h-full object-cover" alt="Evidence 3" />
               </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/5">
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Submitted by</span>
                  <span className="font-semibold">John Doe - 21BCE1234</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Submitted on</span>
                  <span className="font-semibold">15 Aug 2023, 10:45 AM</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Assigned to</span>
                  <span className="font-semibold text-blue-400">Rajesh Kumar</span>
               </div>
            </div>
         </div>

         {/* Action Buttons */}
         <div className="flex gap-4 mb-8">
            <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
               <RefreshCw size={16} /> Update Status
            </button>
            <button className="flex-1 bg-[#334155] hover:bg-slate-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
               <UserPlus size={16} /> Assign
            </button>
         </div>

         {/* Chat Tabs */}
         <div className="flex border-b border-white/10 mb-6">
            <button 
               onClick={() => setActiveTab('Student Chat')}
               className={`pb-3 pr-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'Student Chat' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent'}`}
            >
               Student Chat
            </button>
            <button 
               onClick={() => setActiveTab('Internal Notes')}
               className={`pb-3 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'Internal Notes' ? 'text-blue-500 border-blue-500' : 'text-slate-500 border-transparent'}`}
            >
               Internal Notes
            </button>
         </div>

         {/* Chat Area */}
         {activeTab === 'Student Chat' && (
            <div className="space-y-6">
               {messages.map((msg) => (
                   <div key={msg.id} className={`flex items-start gap-3 ${msg.isStaff ? 'justify-end' : ''}`}>
                       {!msg.isStaff && (
                           <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0 mt-1">
                               <img src="https://ui-avatars.com/api/?name=John+Doe&background=334155&color=fff" alt="Student" />
                           </div>
                       )}
                       
                       <div className={`flex flex-col ${msg.isStaff ? 'items-end' : 'items-start'} max-w-[85%]`}>
                           <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                               msg.isStaff 
                               ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-none' 
                               : 'bg-[#334155] text-slate-200 rounded-tl-none'
                           }`}>
                               {msg.text}
                           </div>
                           <div className={`text-[10px] text-slate-500 mt-1 ${msg.isStaff ? 'mr-1' : 'ml-1'}`}>
                               {msg.sender} - {msg.time}
                           </div>
                       </div>

                       {msg.isStaff && (
                           <div className="w-8 h-8 rounded-full bg-blue-900 overflow-hidden shrink-0 mt-1 border border-blue-700">
                               <img src="https://ui-avatars.com/api/?name=Staff&background=1e3a8a&color=fff" alt="Staff" />
                           </div>
                       )}
                   </div>
               ))}
               <div ref={messagesEndRef} />
            </div>
         )}
         
         {activeTab === 'Internal Notes' && (
            <div className="text-center py-8 text-slate-500 text-sm">
                No internal notes added yet.
            </div>
         )}
      </div>

      {/* Chat Input */}
      {activeTab === 'Student Chat' && (
          <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A] p-4 border-t border-white/5 flex gap-3 max-w-md mx-auto">
             <input 
                type="text" 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 bg-[#1E293B] text-white rounded-full px-5 py-3.5 outline-none placeholder:text-slate-500 text-sm focus:ring-2 focus:ring-blue-600/50 transition-all"
             />
             <button 
                onClick={handleSendMessage}
                disabled={!chatMessage.trim()}
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <Send size={20} className="ml-0.5" />
             </button>
          </div>
      )}
    </div>
  );
};