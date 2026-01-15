
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/apiService';
import { LMSCourse, LMSModule, LMSLesson, ViewState, Enrollment } from '../types';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

interface LMSCoursePlayerProps {
  courseId: string;
  initialLessonId?: string;
  onNavigate: (v: ViewState) => void;
}

const LMSQuiz: React.FC<{ content: string; onComplete: () => void }> = ({ content, onComplete }) => {
  const questions: QuizQuestion[] = useMemo(() => {
    try {
      return JSON.parse(content);
    } catch (e) {
      return [];
    }
  }, [content]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (questions.length === 0) return <div className="text-center text-slate-500 py-10">Invalid quiz data.</div>;

  const currentQ = questions[currentIdx];

  const handleOptionSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOpt(idx);
  };

  const handleSubmit = () => {
    if (selectedOpt === null) return;
    setIsSubmitted(true);
    if (selectedOpt === currentQ.correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOpt(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    const passed = (score / questions.length) >= 0.7;
    return (
      <div className="glass p-12 rounded-[2.5rem] border-slate-800 text-center space-y-8 shadow-2xl animate-in zoom-in duration-300">
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto ${passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {passed 
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            }
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-display font-bold mb-2">Quiz Complete</h2>
          <p className="text-slate-400">You scored <span className="text-white font-bold">{score} / {questions.length}</span></p>
        </div>
        <button 
          onClick={onComplete}
          className="px-10 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95"
        >
          Confirm Results & Continue
        </button>
      </div>
    );
  }

  return (
    <div className="glass p-10 md:p-14 rounded-[3rem] border border-slate-800 shadow-2xl animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">Question {currentIdx + 1} of {questions.length}</span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-1 w-6 rounded-full transition-all ${i <= currentIdx ? 'bg-primary-500' : 'bg-slate-800'}`} />
          ))}
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-10 leading-tight text-slate-100">{currentQ.question}</h3>

      <div className="space-y-4 mb-10">
        {currentQ.options.map((opt, i) => {
          let styles = "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800";
          if (selectedOpt === i) styles = "bg-primary-600/10 border-primary-500 text-primary-400";
          
          if (isSubmitted) {
            if (i === currentQ.correct) styles = "bg-emerald-500/20 border-emerald-500 text-emerald-400 cursor-default";
            else if (selectedOpt === i) styles = "bg-red-500/20 border-red-500 text-red-400 cursor-default";
            else styles = "bg-slate-900 border-slate-800 text-slate-600 cursor-default grayscale opacity-50";
          }

          return (
            <button
              key={i}
              disabled={isSubmitted}
              onClick={() => handleOptionSelect(i)}
              className={`w-full text-left p-6 rounded-3xl border transition-all flex items-center gap-5 group ${styles}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
                selectedOpt === i ? 'bg-primary-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'
              }`}>
                {String.fromCharCode(65 + i)}
              </div>
              <span className="text-lg font-medium">{opt}</span>
              {isSubmitted && i === currentQ.correct && (
                <svg className="w-6 h-6 ml-auto text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-8 border-t border-slate-900">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={selectedOpt === null}
            className="w-full py-5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-5 bg-white text-slate-950 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {currentIdx < questions.length - 1 ? 'Continue to Next Question' : 'Finish Quiz'}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        )}
      </div>
    </div>
  );
};

const LMSCoursePlayer: React.FC<LMSCoursePlayerProps> = ({ courseId, initialLessonId, onNavigate }) => {
  const [course, setCourse] = useState<LMSCourse | null>(null);
  const [modules, setModules] = useState<LMSModule[]>([]);
  const [activeLesson, setActiveLesson] = useState<LMSLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [lastCompletedId, setLastCompletedId] = useState<string | null>(null);

  const allLessons = useMemo(() => {
    return modules.flatMap((m: LMSModule) => m.lessons);
  }, [modules]);

  const activeLessonIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return allLessons.findIndex(l => l.id === activeLesson.id);
  }, [allLessons, activeLesson]);

  const isLessonCompleted = (lessonId: string) => {
    const idx = allLessons.findIndex(l => l.id === lessonId);
    if (idx === -1) return false;
    const progressThreshold = ((idx + 1) / allLessons.length) * 100;
    return progress >= progressThreshold;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allCourses = await api.getAllLMSCourses();
        const c = allCourses.find(x => x.id === courseId);
        const mods = await api.getCourseModules(courseId);
        const enrollment = await api.getEnrollmentByCourse(courseId) as Enrollment;
        
        setCourse(c || null);
        setModules(mods);
        setProgress(enrollment?.progress || 0);
        
        if (mods.length > 0) {
          const flat = mods.flatMap((m: LMSModule) => m.lessons);
          const initial = initialLessonId ? flat.find(l => l.id === initialLessonId) : flat[0];
          setActiveLesson(initial || null);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, initialLessonId]);

  useEffect(() => {
    setQuizStarted(false);
  }, [activeLesson?.id]);

  const handleNext = () => {
    if (activeLessonIndex >= 0 && activeLessonIndex < allLessons.length - 1) {
      const nextLesson = allLessons[activeLessonIndex + 1];
      setActiveLesson(nextLesson);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (activeLessonIndex > 0) {
      const prevLesson = allLessons[activeLessonIndex - 1];
      setActiveLesson(prevLesson);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMarkComplete = async () => {
    if (!course || savingProgress || !activeLesson) return;
    setSavingProgress(true);
    
    const newProgress = Math.min(100, Math.round(((activeLessonIndex + 1) / allLessons.length) * 100));
    const higherProgress = Math.max(progress, newProgress);
    
    try {
      await api.updateCourseProgress(courseId, higherProgress);
      setProgress(higherProgress);
      setLastCompletedId(activeLesson.id);
      
      setTimeout(() => setLastCompletedId(null), 3000);

      if (activeLessonIndex < allLessons.length - 1) {
        handleNext();
      } else {
        alert("Congratulations! Module Synchronization Authorized. Course Complete.");
      }
    } catch (e) {
      console.error("Failed to sync progress node.");
    } finally {
      setSavingProgress(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-white">Entering Secure Virtual Classroom...</div>;
  if (error) return (
    <div className="max-w-xl mx-auto py-20 text-center">
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl">
        <h3 className="text-xl font-bold text-red-400 mb-2">Access Restricted</h3>
        <p className="text-slate-500 mb-6">{error}</p>
        <button 
          onClick={() => onNavigate({ type: 'lms-dashboard' })}
          className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold"
        >Back to Learning Hub</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950">
      <div className="w-full lg:w-80 h-auto lg:h-screen lg:overflow-y-auto glass border-r border-slate-900 sticky top-0 z-20">
        <div className="p-6 border-b border-slate-900">
          <button 
            onClick={() => onNavigate({ type: 'lms-dashboard' })}
            className="text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Exit Hub
          </button>
          <h2 className="text-lg font-bold text-white uppercase">{course?.title}</h2>
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden relative">
             <div 
               className="bg-primary-500 h-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(14,165,233,0.5)]" 
               style={{ width: `${progress}%` }} 
             />
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block font-bold uppercase tracking-widest">{progress}% COMPLETE</span>
        </div>

        <div className="py-4">
          {modules.map(mod => (
            <div key={mod.id}>
              <div className="px-6 py-3 bg-slate-900/40 text-[10px] font-black uppercase tracking-widest text-slate-500 border-y border-slate-900">
                {mod.title}
              </div>
              <div className="space-y-1 p-2">
                {mod.lessons.map(les => {
                  const completed = isLessonCompleted(les.id);
                  const active = activeLesson?.id === les.id;
                  const isLastCompleted = lastCompletedId === les.id;
                  
                  return (
                    <button 
                      key={les.id}
                      onClick={() => setActiveLesson(les)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-500 flex items-center gap-3 relative overflow-hidden ${
                        active 
                          ? 'bg-primary-600/10 text-primary-400 font-bold border border-primary-500/20 shadow-lg shadow-primary-500/5' 
                          : completed 
                            ? 'text-emerald-500/70 hover:bg-slate-900/50' 
                            : 'text-slate-400 hover:bg-slate-900'
                      } ${isLastCompleted ? 'animate-pulse bg-emerald-500/5' : ''}`}
                    >
                      <span className={`shrink-0 transition-transform duration-500 ${completed ? 'scale-110' : ''}`}>
                        {completed ? (
                          <svg className="w-4 h-4 text-emerald-500 animate-in fade-in zoom-in" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : les.type === 'Video' ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                        ) : les.type === 'Text' ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                      </span>
                      <span className="truncate">{les.title}</span>
                      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-500 rounded-full animate-in slide-in-from-left duration-300" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          
          <div className="p-4 mt-8">
             <button 
               onClick={() => onNavigate({ type: 'lms-practice-test', testId: 'full-mock-1' })}
               className="w-full p-4 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-600/20 transition-all shadow-lg hover:shadow-emerald-500/5"
             >
               Launch Full Practice Test
             </button>
          </div>
        </div>
      </div>

      <div className="flex-grow p-4 md:p-12 lg:h-screen lg:overflow-y-auto">
        {activeLesson ? (
          <div key={activeLesson.id} className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-white">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 mb-2 block">Playback Terminal • {activeLessonIndex + 1} / {allLessons.length}</span>
                <h1 className="text-3xl md:text-4xl font-display font-black uppercase tracking-tight">{activeLesson.title}</h1>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl shadow-inner">
                 <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Node</span>
              </div>
            </div>

            {activeLesson.type === 'Video' && (
              <div className="aspect-video rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 relative group">
                <iframe 
                  className="w-full h-full"
                  src={activeLesson.content}
                  title={activeLesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {activeLesson.type === 'Text' && (
              <div className="glass p-8 md:p-12 rounded-[2rem] border-slate-800 prose prose-invert prose-primary max-w-none shadow-2xl">
                <div className="text-slate-300 leading-relaxed space-y-6 text-lg font-medium italic">
                   {activeLesson.content.split('\n').map((line, i) => (
                     <p key={i}>{line.startsWith('###') ? <strong className="text-white text-2xl font-display font-black block mb-4 pt-4 border-t border-white/5 uppercase tracking-tighter">{line.replace('###', '')}</strong> : line}</p>
                   ))}
                </div>
              </div>
            )}

            {activeLesson.type === 'Quiz' && (
              quizStarted ? (
                <LMSQuiz content={activeLesson.content} onComplete={handleMarkComplete} />
              ) : (
                <div className="glass p-12 rounded-[2.5rem] border-slate-800 text-center space-y-6 shadow-2xl">
                  <div className="w-16 h-16 bg-primary-600/10 text-primary-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter">Module Assessment</h2>
                  <p className="text-slate-500 max-w-sm mx-auto font-bold italic">"Establish your comprehension node before proceeding to high-stakes simulation."</p>
                  <button 
                    onClick={() => setQuizStarted(true)}
                    className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                  >
                    Authorize Quiz
                  </button>
                </div>
              )
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center pt-12 border-t border-slate-900 gap-6">
               <button 
                onClick={handlePrev}
                disabled={activeLessonIndex <= 0}
                className="text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2 group"
               >
                 <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                 Prev Node
               </button>
               
               {activeLesson.type !== 'Quiz' && (
                 <button 
                  onClick={handleMarkComplete}
                  disabled={savingProgress}
                  className="px-10 py-4 bg-white hover:bg-slate-200 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center gap-3 group/complete"
                 >
                   {savingProgress ? (
                     <>
                       <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                       Syncing...
                     </>
                   ) : (
                     <>
                       Commit Learning
                       <svg className="w-5 h-5 group-hover/complete:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                     </>
                   )}
                 </button>
               )}
               
               <button 
                onClick={handleNext}
                disabled={activeLessonIndex === -1 || activeLessonIndex === allLessons.length - 1}
                className="text-primary-400 font-black uppercase text-[10px] tracking-widest hover:text-primary-300 transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2 group"
               >
                 Next Node
                 <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
               </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <svg className="w-16 h-16 opacity-10 mb-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm0-10h2v8h-2V6z"/></svg>
            <p className="font-black uppercase tracking-widest text-[10px]">Select a module to begin playback.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LMSCoursePlayer;
