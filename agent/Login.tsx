
import React, { useState } from 'react';
import { api } from '../services/apiService';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onNavigateToSignup: () => void;
  onNavigateToForgot: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToSignup, onNavigateToForgot }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await api.verifyLogin(userId, password); 
      onLogin(user);
    } catch (err: any) {
      setError("Incorrect User ID or Password Node.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[420px] mx-auto animate-slide-up bg-white py-16 px-4">
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-unicou-orange" />
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner font-black text-2xl text-unicou-navy">U</div>
          <h2 className="text-3xl font-display font-black text-unicou-navy tracking-tighter uppercase leading-none">Identity <span className="text-unicou-orange">Sync</span></h2>
          <p className="text-slate-400 text-[9px] mt-4 font-black uppercase tracking-[0.4em]">Protocol V1.1 Authentication</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-unicou-navy uppercase tracking-widest ml-1">Official User ID</label>
            <input 
              type="text" required value={userId} onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. admin@unicou.uk"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 outline-none focus:border-unicou-navy transition-all shadow-inner font-bold text-base placeholder:text-slate-300"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between px-1">
              <label className="text-[9px] font-black text-unicou-navy uppercase tracking-widest">Password Node</label>
              <button type="button" onClick={onNavigateToForgot} className="text-[8px] font-black text-unicou-orange uppercase hover:underline">Recover Access?</button>
            </div>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-900 outline-none focus:border-unicou-navy transition-all shadow-inner font-bold text-base"
            />
          </div>

          {error && <div className="text-unicou-orange text-[9px] font-black uppercase tracking-widest bg-orange-50 p-4 rounded-xl border border-orange-100 text-center animate-pulse">{error}</div>}

          <button type="submit" disabled={loading} className="w-full py-5 bg-unicou-navy hover:bg-slate-950 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-[1.5rem] transition-all shadow-2xl active:scale-95 disabled:opacity-50">
            {loading ? 'SYNCHRONIZING...' : 'AUTHORIZE SESSION'}
          </button>
        </form>

        <div className="text-center pt-8 border-t border-slate-50 mt-10">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">New Student? <button type="button" onClick={onNavigateToSignup} className="text-unicou-orange font-black hover:underline transition-all ml-1">Establish Identity</button></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
