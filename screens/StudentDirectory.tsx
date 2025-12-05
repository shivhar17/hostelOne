
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  room: string;
  photo: string;
  status: 'Paid' | 'Pending';
}

const INITIAL_STUDENTS: Student[] = [
  { id: '21BCE1234', name: 'Rohan Sharma', room: 'B-304', photo: 'https://ui-avatars.com/api/?name=Rohan+Sharma&background=0D9488&color=fff', status: 'Paid' },
  { id: '1', name: 'Ananya Sharma', room: 'A-301', photo: 'https://picsum.photos/100/100?random=20', status: 'Paid' },
  { id: '2', name: 'Rohan Mehta', room: 'B-102', photo: 'https://picsum.photos/100/100?random=21', status: 'Paid' },
  { id: '3', name: 'Priya Patel', room: 'C-405', photo: 'https://picsum.photos/100/100?random=22', status: 'Pending' },
  { id: '4', name: 'Vikram Singh', room: 'A-301', photo: 'https://picsum.photos/100/100?random=23', status: 'Paid' },
  { id: '5', name: 'Sameer Khan', room: 'D-211', photo: 'https://picsum.photos/100/100?random=24', status: 'Pending' },
  { id: '6', name: 'Neha Gupta', room: 'B-105', photo: 'https://picsum.photos/100/100?random=25', status: 'Paid' },
  { id: '7', name: 'Meera Patel', room: 'C-305', photo: 'https://picsum.photos/100/100?random=26', status: 'Paid' },
];

export const StudentDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('allStudents');
    if (saved) {
        setStudents(JSON.parse(saved));
    } else {
        setStudents(INITIAL_STUDENTS);
        localStorage.setItem('allStudents', JSON.stringify(INITIAL_STUDENTS));
    }
  }, []);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.id.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-[#0F172A] border-b border-white/5 sticky top-0 z-20">
        <h1 className="text-2xl font-bold mb-4">Student Directory</h1>
        
        <div className="flex gap-3">
          <div className="flex-1 bg-[#1E293B] rounded-xl flex items-center px-4 py-3 border border-slate-700/50 focus-within:border-blue-500/50 transition-colors">
             <Search size={20} className="text-slate-400 mr-3" />
             <input 
               type="text" 
               placeholder="Search by Name / Room / ID" 
               className="bg-transparent outline-none text-white placeholder:text-slate-500 w-full text-sm font-medium"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <button className="bg-[#1E293B] p-3 rounded-xl border border-slate-700/50 hover:bg-slate-700 transition-colors">
             <Filter size={20} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* List Header */}
      <div className="px-6 py-2 flex text-xs font-bold text-slate-500 uppercase tracking-wider">
         <span className="flex-[3]">Photo & Name</span>
         <span className="flex-1 text-center">Room No.</span>
         <span className="flex-1 text-right">Fee Status</span>
      </div>

      {/* Student List */}
      <div className="flex-1 px-6 pb-6 space-y-2">
         {filteredStudents.map((student) => (
           <div 
             key={student.id} 
             onClick={() => navigate(`/staff/student/${student.id}`)}
             className="bg-[#1E293B]/50 hover:bg-[#1E293B] p-3 rounded-2xl flex items-center border border-transparent hover:border-slate-700 transition-all cursor-pointer group"
           >
              <div className="flex-[3] flex items-center gap-3">
                 <img src={student.photo} className="w-10 h-10 rounded-full object-cover border border-slate-700" alt={student.name} />
                 <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">{student.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono">ID: {student.id}</p>
                 </div>
              </div>
              <div className="flex-1 text-center text-sm font-medium text-slate-300">
                 {student.room}
              </div>
              <div className="flex-1 text-right">
                 <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                    student.status === 'Paid' 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                 }`}>
                    {student.status}
                 </span>
              </div>
           </div>
         ))}

         {filteredStudents.length === 0 && (
           <div className="text-center py-12 text-slate-500">
             No students found matching "{searchQuery}"
           </div>
         )}
      </div>
    </div>
  );
};
