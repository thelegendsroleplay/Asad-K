
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/apiService';
import { AIEvaluator } from '../services/aiEvaluator';
import { LMSPracticeTest as ITest, TestResult, ViewState, LMSTestQuestion, LMSTestSection } from '../types';

interface LMSPracticeTestProps {
  testId: string;
  onNavigate: (v: ViewState) => void;
}

const LMSPracticeTest: React.FC<LMSPracticeTestProps> = ({ testId, onNavigate }) => {
  const [test, setTest] = useState<ITest | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Media states
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const t = await api.getTestById(testId);
      if (t) {
        setTest(t);
        setTimeLeft(t.sections[0].timeLimit * 60);
      }
      setLoading(false);
    };
    fetch();
  }, [testId]);

  useEffect(() => {
    if (timeLeft > 0 && !isFinished) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !loading && !isFinished) {
      handleNextSection();
    }
  }, [timeLeft, isFinished]);

  const handleNextSection = () => {
    if (test && currentSectionIdx < test.sections.length - 1) {
      setCurrentSectionIdx(prev => prev + 1);
      setTimeLeft(test.sections[currentSectionIdx + 1].timeLimit * 60);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsFinished(true);
    const res = await api.submitTestResult(testId, answers, 0);
    setResult(res);
  };

  const toggleAnswerArray = (qid: string, val: any) => {
    const current = (answers[qid] || []) as any[];
    if (current.includes(val)) {
      setAnswers({ ...answers, [qid]: current.filter(x => x !== val) });
    } else {
      setAnswers({ ...answers, [qid]: [...current, val] });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordProgress(0);
      // Fix: Use a local variable to track progress within the interval to avoid scoping errors
      let pVal = 0;
      const interval = setInterval(() => {
        pVal += 1;
        setRecordProgress(pVal);
        if (pVal >= 100) clearInterval(interval);
      }, 100);
    } catch (e) {
      alert("Microphone node unreachable.");
    }
  };

  const stopRecording = (qid: string) => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAnswers({ ...answers, [qid]: "AUDIO_NODE_CAPTURED" });
    }
  };

  const renderQuestionUI = (q: LMSTestQuestion) => {
    switch (q.type) {
      case 'MCQ':
        return (
          <div className="grid grid-cols-1 gap-4">
            {q.options?.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => setAnswers({...answers, [q.id]: i})}
                className={`w-full text-left p-6 rounded-[1.5rem] border-2 transition-all flex items-center gap-5 ${answers[q.id] === i ? 'bg-unicou-navy text-white border-unicou-navy shadow-lg scale-[1.02]' : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100 hover:border-slate-200'}`}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${answers[q.id] === i ? 'bg-unicou-orange text-white' : 'bg-white border'}`}>{String.fromCharCode(65+i)}</span>
                <span className="font-bold text-base">{opt}</span>
              </button>
            ))}
          </div>
        );

      case 'MCQ-Multiple':
        return (
          <div className="grid grid-cols-1 gap-4">
            <p className="text-[10px] font-black text-unicou-orange uppercase tracking-widest mb-2 ml-2">Select multiple correct options</p>
            {q.options?.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => toggleAnswerArray(q.id, i)}
                className={`w-full text-left p-6 rounded-[1.5rem] border-2 transition-all flex items-center gap-5 ${answers[q.id]?.includes(i) ? 'bg-unicou-navy text-white border-unicou-navy shadow-lg scale-[1.02]' : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100 hover:border-slate-200'}`}
              >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${answers[q.id]?.includes(i) ? 'bg-unicou-orange border-unicou-orange' : 'bg-white border-slate-300'}`}>
                  {answers[q.id]?.includes(i) && <span className="text-white text-xs">✓</span>}
                </div>
                <span className="font-bold">{opt}</span>
              </button>
            ))}
          </div>
        );

      case 'Fill-Blanks':
      case 'Note-Completion':
      case 'Sentence-Completion':
        return (
          <div className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 shadow-inner">
             <div className="text-slate-800 font-bold text-lg leading-relaxed mb-6">
                {q.text.split('___________________')[0]}
                <input 
                  type="text"
                  className="mx-3 w-48 bg-white border-b-4 border-unicou-orange p-2 text-xl font-black text-unicou-navy outline-none shadow-sm focus:bg-orange-50 transition-all text-center rounded-t-lg"
                  placeholder="Enter Answer"
                  value={answers[q.id] || ''}
                  onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                />
                {q.text.split('___________________')[1]}
             </div>
          </div>
        );

      case 'Matching':
        return (
          <div className="space-y-4">
             <div className="bg-slate-900 p-6 rounded-[2rem] text-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Prompt Context</p>
                <p className="font-bold text-lg leading-relaxed">{q.text}</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {q.options?.map((opt, i) => (
                  <div key={i} className="flex flex-col gap-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                     <p className="text-[10px] font-black uppercase text-slate-400">Target Segment {i+1}</p>
                     <p className="text-sm font-bold text-slate-700 mb-4">{opt}</p>
                     <select 
                       className="p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-unicou-navy text-xs"
                       value={answers[`${q.id}_match_${i}`] || ''}
                       onChange={(e) => setAnswers({...answers, [`${q.id}_match_${i}`]: e.target.value})}
                     >
                       <option value="">Map To Category...</option>
                       {q.options?.map((_, idx) => <option key={idx} value={idx}>Category {idx + 1}</option>)}
                     </select>
                  </div>
                ))}
             </div>
          </div>
        );

      case 'Ordering':
        return (
          <div className="space-y-3">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Arrange segments in logical sequence:</p>
             {(q.options || []).map((opt, i) => {
               const pos = (answers[q.id] || []).indexOf(i);
               return (
                 <button 
                   key={i} 
                   onClick={() => toggleAnswerArray(q.id, i)}
                   className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center gap-6 ${pos > -1 ? 'bg-unicou-orange text-white border-unicou-orange' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
                 >
                   <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black">{pos > -1 ? pos + 1 : '○'}</span>
                   <span className="font-bold text-sm">{opt}</span>
                 </button>
               );
             })}
          </div>
        );

      case 'TFNG':
      case 'YNMNG':
        const opts = q.type === 'TFNG' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];
        return (
          <div className="flex flex-wrap gap-3">
            {opts.map(o => (
              <button 
                key={o} 
                onClick={() => setAnswers({...answers, [q.id]: o})}
                className={`px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${answers[q.id] === o ? 'bg-unicou-navy text-white border-unicou-navy' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
              >
                {o}
              </button>
            ))}
          </div>
        );

      case 'Insert-Sentence':
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 p-8 rounded-[2rem] border border-orange-100 text-unicou-navy font-bold text-lg italic shadow-inner">
               " {q.targetSentence} "
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Select insertion node location:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {['A', 'B', 'C', 'D', 'E', 'F'].map((node, i) => (
                <button 
                  key={node} 
                  onClick={() => setAnswers({...answers, [q.id]: node})}
                  className={`py-4 rounded-xl font-black text-xs transition-all border-2 ${answers[q.id] === node ? 'bg-unicou-orange text-white border-unicou-orange shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'}`}
                >
                  Gap [{node}]
                </button>
              ))}
            </div>
          </div>
        );

      case 'Read-Aloud':
      case 'Audio-Record':
      case 'Repeat-Sentence':
        return (
          <div className="space-y-8">
            <div className="bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-12 text-center relative overflow-hidden">
               {q.type === 'Repeat-Sentence' && (
                  <button className="mb-8 w-20 h-20 rounded-full bg-unicou-navy text-white flex items-center justify-center text-2xl shadow-xl hover:scale-110 transition-all mx-auto">▶</button>
               )}
               <p className="text-2xl font-display font-black text-slate-900 leading-relaxed uppercase tracking-tight">{q.text}</p>
            </div>
            
            <div className="flex flex-col items-center gap-6">
               <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all ${isRecording ? 'border-red-500 scale-110 shadow-xl' : 'border-slate-100'}`}>
                  {isRecording ? (
                     <div className="flex gap-1 items-center h-8">
                        {[1,2,3,4,5].map(i => <div key={i} className="w-1.5 bg-red-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%` }} />)}
                     </div>
                  ) : (
                     <span className="text-4xl">🎙️</span>
                  )}
               </div>
               
               {isRecording ? (
                  <button onClick={() => stopRecording(q.id)} className="px-12 py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl animate-pulse">COMMIT AUDIO</button>
               ) : (
                  <button onClick={startRecording} className="px-12 py-5 bg-unicou-navy text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all">INITIALIZE RECORDING</button>
               )}
               
               {answers[q.id] === "AUDIO_NODE_CAPTURED" && (
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Biometric Audio Synced
                 </p>
               )}
            </div>
          </div>
        );

      case 'Essay':
      case 'Integrated-Writing':
      case 'Independent-Essay':
        return (
          <div className="space-y-6">
            <textarea 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[3rem] p-10 min-h-[500px] outline-none focus:bg-white focus:border-unicou-navy transition-all font-sans text-lg font-medium leading-relaxed shadow-inner placeholder:text-slate-300"
              placeholder="Begin academic transmission here..."
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            />
            <div className="flex justify-between items-center px-6">
               <div className="flex items-center gap-6">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Word Count: <span className="text-unicou-navy">{(answers[q.id] || '').split(/\s+/).filter(Boolean).length}</span> / {q.wordLimit || 250}</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Continuous Sync Node Active</span>
               </div>
            </div>
          </div>
        );

      case 'Describe-Image':
        return (
          <div className="space-y-8">
            <div className="aspect-video bg-slate-100 rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-inner flex items-center justify-center">
               {q.image ? <img src={q.image} className="w-full h-full object-contain" /> : <span className="text-4xl opacity-20">🖼️</span>}
            </div>
            <div className="flex flex-col items-center gap-6">
               <button onClick={isRecording ? () => stopRecording(q.id) : startRecording} className={`px-16 py-6 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-unicou-navy text-white hover:bg-black'}`}>
                  {isRecording ? 'FINALIZE DESCRIPTION' : 'START AUDIO NODE'}
               </button>
               {answers[q.id] === "AUDIO_NODE_CAPTURED" && <span className="text-emerald-500 font-black uppercase text-[9px] tracking-widest">Description Recorded</span>}
            </div>
          </div>
        );

      default:
        return <div className="p-10 bg-red-50 text-red-600 rounded-3xl text-center italic font-black uppercase text-[10px]">Protocol Bridge Fault: UI Node {q.type} Not Configured.</div>;
    }
  };

  if (loading) return <div className="p-40 text-center animate-pulse text-unicou-navy font-black uppercase tracking-[0.4em]">Establishing Secure High-Stakes Test Node...</div>;
  if (!test) return null;

  if (isFinished) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6 text-center animate-in zoom-in duration-700">
        <div className="w-24 h-24 bg-unicou-navy/5 text-unicou-orange rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
           <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={5}><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-6xl font-display font-black text-unicou-navy uppercase tracking-tighter mb-4 leading-none">TEST <span className="text-unicou-orange">COMPLETE</span></h1>
        <p className="text-slate-500 font-bold italic text-lg mb-16 max-w-xl mx-auto">"Requirement 14.X: Your responses have been committed to the UNICOU High-Stakes Analytics Cloud."</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-slate-50 p-10 rounded-[4rem] border border-slate-200">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Reading/Listening Metric</p>
             <p className="text-7xl font-display font-black text-unicou-navy">{result?.overallBand || 'SYNC'}</p>
          </div>
          <div className="bg-unicou-navy p-10 rounded-[4rem] text-white">
             <p className="text-[10px] font-black text-unicou-orange uppercase tracking-widest mb-4">Subjective Evaluation Status</p>
             <p className="text-3xl font-display font-black leading-tight uppercase">Manual Grading Required</p>
          </div>
        </div>
        
        <button onClick={() => onNavigate({ type: 'lms-dashboard' })} className="px-16 py-6 bg-unicou-navy text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-3xl hover:bg-black transition-all">EXIT ASSESSMENT NODE</button>
      </div>
    );
  }

  const section = test.sections[currentSectionIdx];
  const isLastSection = currentSectionIdx === test.sections.length - 1;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans select-none">
      <header className="bg-unicou-navy text-white px-12 py-5 flex justify-between items-center shadow-2xl sticky top-0 z-[100]">
        <div className="flex items-center gap-8">
           <div className="w-12 h-12 bg-unicou-orange rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border border-white/10">U</div>
           <div>
             <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50 mb-1">{test.title}</h1>
             <h2 className="text-xl font-display font-black uppercase tracking-tight">{section.title}</h2>
           </div>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="text-right">
             <p className="text-[9px] font-black uppercase tracking-widest text-unicou-orange mb-1">Time Remaining</p>
             <p className={`text-3xl font-mono font-black ${timeLeft < 120 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
             </p>
          </div>
          <button onClick={handleNextSection} className="bg-white text-unicou-navy px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-action active:scale-95 transition-all hover:bg-unicou-orange hover:text-white border-none">
             {isLastSection ? 'FINAL TRANSMISSION' : 'NEXT MODULE →'}
          </button>
        </div>
      </header>

      <div className="flex-grow flex h-[calc(100vh-92px)] overflow-hidden">
        {/* Context Pane (Passages/Audios) */}
        <div className="w-1/2 border-r-2 border-slate-100 overflow-y-auto no-scrollbar bg-[#fcfcfc] p-16">
           {section.passageText && (
             <div className="prose prose-slate max-w-none">
                <div className="flex items-center gap-4 mb-10">
                   <div className="h-1.5 w-16 bg-unicou-orange rounded-full" />
                   <h3 className="text-xs font-black text-unicou-navy uppercase tracking-[0.4em]">Official Case Material</h3>
                </div>
                <div className="text-xl leading-relaxed text-slate-800 font-bold italic whitespace-pre-wrap border-l-8 border-slate-100 pl-10 py-4 bg-white rounded-3xl shadow-sm">
                  {section.passageText}
                </div>
             </div>
           )}
           {section.audioUrl && (
             <div className="flex flex-col items-center justify-center h-full gap-10">
                <div className="w-40 h-40 bg-white border-4 border-slate-50 rounded-full flex items-center justify-center text-6xl shadow-3xl group">🎧</div>
                <div className="bg-unicou-navy p-10 rounded-[3rem] border border-white/10 shadow-3xl w-full max-w-md relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-unicou-orange opacity-40 animate-pulse" />
                   <div className="flex justify-between text-[10px] font-black text-white/50 uppercase tracking-widest mb-6">
                      <span>Source: Digital Audio Node</span>
                      <span>1 Play Limit</span>
                   </div>
                   <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden mb-10">
                      <div className="h-full bg-unicou-orange w-1/3 shadow-[0_0_15px_rgba(241,90,36,0.6)]" />
                   </div>
                   <button className="w-full py-5 bg-white text-unicou-navy rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-all">INITIALIZE AUDIO FEED</button>
                </div>
             </div>
           )}
           {!section.passageText && !section.audioUrl && (
             <div className="h-full flex flex-col items-center justify-center text-slate-200">
               <div className="text-9xl mb-10">🛡️</div>
               <p className="font-black uppercase tracking-widest text-[11px]">Context node not required for this module.</p>
             </div>
           )}
        </div>

        {/* Question Workspace */}
        <div className="w-1/2 overflow-y-auto no-scrollbar p-16 bg-white">
           <div className="space-y-24 max-w-2xl mx-auto">
              {section.questions.map((q, idx) => (
                <div key={q.id} className="animate-in slide-in-from-right duration-700 delay-100 border-b-2 border-slate-50 pb-20 last:border-none">
                  <div className="flex items-start gap-8 mb-12">
                     <div className="w-14 h-14 bg-unicou-navy text-white rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 shadow-lg border border-white/10">{idx + 1}</div>
                     <h3 className="text-3xl font-display font-black leading-none text-slate-900 tracking-tighter uppercase">{q.text.includes('___________________') ? 'Module Synchronization Input' : q.text}</h3>
                  </div>
                  {renderQuestionUI(q)}
                </div>
              ))}
           </div>
        </div>
      </div>

      <footer className="bg-slate-50 border-t border-slate-200 px-12 py-3 flex justify-between items-center shrink-0">
         <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
               <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Biometric Identity Active</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latency: 22ms</span>
            </div>
         </div>
         <p className="text-[10px] font-black text-unicou-navy uppercase tracking-[0.5em] font-mono">NODE SYNC: UC-PRO-2025.V4.01</p>
      </footer>
    </div>
  );
};

export default LMSPracticeTest;
