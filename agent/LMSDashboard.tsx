import React from 'react';
import { ViewState } from '../types';

interface LMSDashboardProps {
  onNavigate: (v: ViewState) => void;
}

const LMSDashboard: React.FC<LMSDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 bg-white min-h-screen animate-in fade-in duration-1000">
      <div className="text-center mb-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-unicou-navy/5 rounded-full text-unicou-navy text-[10px] font-black uppercase tracking-[0.2em] mb-8">
           <span className="w-1.5 h-1.5 bg-unicou-navy rounded-full animate-pulse" />
           Academic Preparation Infrastructure
        </div>
        <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter mb-8 text-slate-950 leading-none uppercase">
          LEARNING <span className="text-unicou-orange">HUB</span>
        </h1>
        <p className="text-2xl text-slate-600 font-bold leading-relaxed italic border-l-8 border-unicou-navy pl-10 text-left mb-16">
          "The most advanced training node for global academic mobility. Access high-fidelity mock tests, curriculum-aligned video modules, and professional evaluation services."
        </p>

        <a 
          href="https://lms.unicou.uk" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-6 px-16 py-8 bg-unicou-navy hover:bg-slate-900 text-white rounded-[2.5rem] font-black text-lg uppercase tracking-widest shadow-3xl hover:scale-105 transition-all group"
        >
          <span className="text-3xl">🔑</span>
          Login to Study Hub
          <svg className="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
        <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-100 shadow-inner group hover:bg-white hover:border-unicou-navy transition-all">
          <div className="text-4xl mb-8">💻</div>
          <h3 className="text-2xl font-display font-black text-unicou-navy mb-4 uppercase">Simulated Testing</h3>
          <p className="text-slate-500 font-bold italic leading-relaxed">Full-fidelity exam simulations for PTE, IELTS, and TOEFL with real-time analytics nodes.</p>
        </div>
        <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-100 shadow-inner group hover:bg-white hover:border-unicou-navy transition-all">
          <div className="text-4xl mb-8">📺</div>
          <h3 className="text-2xl font-display font-black text-unicou-navy mb-4 uppercase">Masterclass Content</h3>
          <p className="text-slate-500 font-bold italic leading-relaxed">Curated video modules from world-class trainers focusing on critical academic scoring rubrics.</p>
        </div>
        <div className="bg-slate-50 p-12 rounded-[4rem] border border-slate-100 shadow-inner group hover:bg-white hover:border-unicou-navy transition-all">
          <div className="text-4xl mb-8">✍️</div>
          <h3 className="text-2xl font-display font-black text-unicou-navy mb-4 uppercase">Expert Evaluation</h3>
          <p className="text-slate-500 font-bold italic leading-relaxed">Direct transmission of speaking and writing samples to human evaluators for personalized feedback.</p>
        </div>
      </div>

      <div className="bg-slate-950 p-16 md:p-24 rounded-[5rem] text-white shadow-3xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 p-16 opacity-10 font-display font-black text-[12rem] uppercase pointer-events-none select-none italic tracking-tighter">LMS</div>
        <h2 className="text-4xl md:text-5xl font-display font-black uppercase mb-10 tracking-tighter relative z-10">Centralized Credentials</h2>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto italic font-medium leading-relaxed mb-12 relative z-10">
          Your learning identity node is unified across the UniCou network. Access your performance metrics, certificates, and course materials on the dedicated LMS subdomain.
        </p>
        <button 
          onClick={() => window.open('https://lms.unicou.uk', '_blank')}
          className="relative z-10 px-12 py-5 bg-white text-unicou-navy rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-110 active:scale-95 transition-all"
        >
          Initialize Sync Node
        </button>
      </div>
    </div>
  );
};

export default LMSDashboard;
