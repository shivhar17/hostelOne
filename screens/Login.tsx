import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Eye, EyeOff, ShieldCheck, Briefcase, ArrowLeftRight } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isStaffLogin, setIsStaffLogin] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    code: ''
  });

  const handleLogin = () => {
    // In a real app, validate credentials here
    if (isStaffLogin) {
      navigate('/staff-dashboard');
    } else {
      navigate('/');
    }
  };

  const handleSwitchToStaff = () => {
    setIsStaffLogin(true);
    setShowSwitchModal(false);
    setFormData({ ...formData, email: '' }); // Clear ID field as format might differ
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 px-6 py-8 flex flex-col transition-colors duration-300 relative">
      {/* Header Back Button */}
      <div className="mb-6">
        <button 
          onClick={() => navigate('/onboarding')} 
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center mb-10 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm ring-1 transition-colors duration-300 ${
            isStaffLogin 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 ring-blue-100 dark:ring-blue-900' 
                : 'bg-teal-50 dark:bg-teal-900/20 text-teal-500 ring-teal-100 dark:ring-teal-900'
        }`}>
           {isStaffLogin ? <Briefcase size={36} strokeWidth={1.5} /> : <User size={40} strokeWidth={1.5} />}
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white text-center tracking-tight transition-all">
            {isStaffLogin ? 'Staff Login' : 'Student Login'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mt-2 text-sm">
            {isStaffLogin ? 'Access maintenance dashboard & requests.' : 'Enter your credentials to access your dashboard.'}
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-5 flex-1">
         {/* Email / ID */}
         <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                {isStaffLogin ? 'Staff ID / Email' : 'Student ID / Email'}
            </label>
            <input 
              type="text" 
              placeholder={isStaffLogin ? "Enter Staff ID" : "Enter your ID or email"}
              className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 outline-none text-slate-800 dark:text-white transition-all placeholder:text-slate-400 focus:ring-4 ${
                  isStaffLogin ? 'focus:border-blue-500 focus:ring-blue-500/10' : 'focus:border-teal-500 focus:ring-teal-500/10'
              }`}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
         </div>

         {/* Password */}
         <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password"
                className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 outline-none text-slate-800 dark:text-white transition-all placeholder:text-slate-400 focus:ring-4 pr-12 ${
                    isStaffLogin ? 'focus:border-blue-500 focus:ring-blue-500/10' : 'focus:border-teal-500 focus:ring-teal-500/10'
                }`}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 bottom-0 px-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
         </div>

         {/* Optional Code */}
         <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">2FA Code (Optional)</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Enter 6-digit code"
                className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 outline-none text-slate-800 dark:text-white transition-all placeholder:text-slate-400 focus:ring-4 ${
                    isStaffLogin ? 'focus:border-blue-500 focus:ring-blue-500/10' : 'focus:border-teal-500 focus:ring-teal-500/10'
                }`}
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                 <ShieldCheck size={20} />
              </div>
            </div>
         </div>

         <div className="flex justify-between items-center pt-2 px-1">
            <button className={`text-sm font-semibold hover:underline ${isStaffLogin ? 'text-blue-600 dark:text-blue-400' : 'text-teal-600 dark:text-teal-400'}`}>
                Forgot Password?
            </button>
            <label className="flex items-center gap-2 cursor-pointer group">
               <div className="relative flex items-center">
                  <input type="checkbox" className={`peer w-4 h-4 rounded border-slate-300 cursor-pointer ${isStaffLogin ? 'text-blue-500 focus:ring-blue-500' : 'text-teal-500 focus:ring-teal-500'}`} />
               </div>
               <span className="text-sm text-slate-600 dark:text-slate-400 font-medium group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Remember me</span>
            </label>
         </div>
      </div>

      <div className="mt-auto mb-4 space-y-4">
        <button 
            onClick={handleLogin}
            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 ${
                isStaffLogin 
                ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30' 
                : 'bg-teal-500 hover:bg-teal-600 shadow-teal-500/30'
            }`}
        >
            Login
        </button>
        
        {!isStaffLogin && (
            <button 
                onClick={() => setShowSwitchModal(true)}
                className="w-full text-sm text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-300 py-2 transition-colors"
            >
                Are you a staff member? <span className="text-teal-600 dark:text-teal-400 font-bold ml-1">Switch to Staff Login</span>
            </button>
        )}
        
        {isStaffLogin && (
             <button 
                onClick={() => setIsStaffLogin(false)}
                className="w-full text-sm text-slate-500 dark:text-slate-400 font-medium hover:text-slate-700 dark:hover:text-slate-300 py-2 transition-colors"
            >
                Not a staff member? <span className="text-blue-600 dark:text-blue-400 font-bold ml-1">Back to Student Login</span>
            </button>
        )}
      </div>

      {/* Switch Confirmation Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowSwitchModal(false)} />
            
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-8 relative z-10 shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-300 dark:text-emerald-400 ring-1 ring-emerald-100 dark:ring-emerald-900/40">
                    <ArrowLeftRight size={32} strokeWidth={2.5} />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-4 tracking-tight">
                    Staff Member?
                </h3>
                
                <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-8 leading-relaxed px-2">
                    It looks like you've entered a Staff ID. Would you like to switch to the Staff Login screen?
                </p>
                
                <div className="space-y-3">
                    <button 
                        onClick={handleSwitchToStaff}
                        className="w-full bg-[#86EFAC] hover:bg-emerald-400 text-emerald-900 font-bold py-4 rounded-full shadow-[0_4px_14px_rgba(134,239,172,0.4)] transition-all active:scale-95 text-sm"
                    >
                        Yes, Switch
                    </button>
                    <button 
                        onClick={() => setShowSwitchModal(false)}
                        className="w-full py-2 text-slate-600 dark:text-slate-400 font-bold text-sm hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                    >
                        No, Stay Here
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};