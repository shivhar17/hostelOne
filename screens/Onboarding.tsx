import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    id: 1,
    image: "https://picsum.photos/800/800?random=1",
    title: "Welcome to HostelOne!",
    desc: "Your one-stop app for making hostel life easier, more connected, and a lot more fun."
  },
  {
    id: 2,
    image: "https://picsum.photos/800/800?random=2",
    title: "Your Daily Menu, On-Demand",
    desc: "Check the daily mess menu anytime and see real-time hygiene ratings to eat with peace of mind."
  },
  {
    id: 3,
    image: "https://picsum.photos/800/800?random=3",
    title: "Stay in the Loop",
    desc: "Never miss out on hostel events, announcements, and important notices."
  }
];

export const Onboarding: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(curr => curr + 1);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between p-6 pb-10">
      <div className="flex justify-between items-center mt-2">
        <span className="text-gray-400 font-medium text-sm">{currentSlide + 1} of {slides.length}</span>
        <button onClick={() => navigate('/login')} className="text-teal-500 font-semibold text-sm">Skip</button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center mt-8">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-72 h-72 mb-10 rounded-[3rem] overflow-hidden shadow-2xl bg-orange-50 border-4 border-white">
              <img 
                src={slides[currentSlide].image} 
                alt="Illustration" 
                className="w-full h-full object-cover mix-blend-multiply opacity-90"
              />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-800 mb-4 px-2 leading-tight">
              {slides[currentSlide].title}
            </h1>
            <p className="text-slate-500 px-4 leading-relaxed">
              {slides[currentSlide].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-8 mt-auto">
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <div 
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-teal-500' : 'w-2 bg-gray-200'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full bg-teal-400 hover:bg-teal-500 text-white font-bold py-4 rounded-full shadow-[0_10px_20px_rgba(45,212,191,0.3)] transition-all active:scale-95"
        >
          Continue
        </button>
      </div>
    </div>
  );
};