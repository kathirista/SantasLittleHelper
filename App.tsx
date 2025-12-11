
import React, { useState, useEffect, useRef } from 'react';
import { RadialScore } from './components/RadialScore';
import { parseProfile, analyzeMatch, generateApplicationMaterials, findDirectMatches } from './services/geminiService';
import { ProfileSEM, MatchAnalysis, GeneratedContent, ApplicationEntry, JobOpening, SavedProfile, CoverLetterTone } from './types';

// Icons
const CheckCircle = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-6 h-6 text-green-500 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const Sparkles = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-5 h-5 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214z" /></svg>;
const Search = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-6 h-6 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const ArrowRight = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>;
const MapPin = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const CurrencyDollar = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrendingUp = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const LightBulb = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const Heart = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const Download = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const ArrowLeft = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const Edit = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const Eye = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const MagicWand = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const Clock = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const SadFace = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const HappyFace = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AlertCircle = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const Refresh = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => <svg className={`w-4 h-4 ${className || ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;

enum Step {
  UPLOAD = 0,
  JOB_BOARD = 1,
  APPLICATION_STUDIO = 2,
  TRACKER = 3
}

const HISTORY_KEY = 'slh_profiles';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.UPLOAD);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Data State
  const [resumeText, setResumeText] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profileSem, setProfileSem] = useState<ProfileSEM | null>(null);
  
  // Location
  const [locationInput, setLocationInput] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [radius, setRadius] = useState("25");

  // History State
  const [history, setHistory] = useState<SavedProfile[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>("");

  // Jobs
  const [matches, setMatches] = useState<JobOpening[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null);
  
  // Application Data
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [applications, setApplications] = useState<ApplicationEntry[]>([]);

  // Editing State for Docs
  const [resumeContent, setResumeContent] = useState("");
  const [coverLetterContent, setCoverLetterContent] = useState("");
  const [coverLetterTone, setCoverLetterTone] = useState<CoverLetterTone>('Professional');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'resume' | 'cover-letter'>('resume');

  // Refs
  const bottomRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Load History on Mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed: SavedProfile[] = JSON.parse(stored);
        setHistory(parsed);
        if (parsed.length > 0) {
          loadProfile(parsed[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentStep, matches]);

  const loadProfile = (profile: SavedProfile) => {
    setResumeText(profile.resumeText);
    setEmail(profile.email);
    setPassword(profile.password || "");
    setLocationInput(profile.location);
    setPostalCode(profile.postalCode);
    setRadius(profile.radius);
    setSelectedHistoryId(profile.id);
  };

  const handleHistorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const profile = history.find(p => p.id === id);
    if (profile) {
      loadProfile(profile);
    }
  };

  const saveCurrentProfile = () => {
    const newProfile: SavedProfile = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      label: `${locationInput || postalCode || 'Unknown'} - ${new Date().toLocaleDateString()}`,
      resumeText,
      email,
      password,
      location: locationInput,
      postalCode,
      radius
    };

    const updatedHistory = [newProfile, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const executeSearch = async (sem: ProfileSEM) => {
      setIsLoading(true);
      setLoadingMessage(`Finding 10 ACTIVE openings in ${locationInput || postalCode}...`);
      setError(null);
      
      try {
        const foundMatches = await findDirectMatches(sem, locationInput, postalCode, radius);
        const sorted = foundMatches.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setMatches(sorted);
        setCurrentStep(Step.JOB_BOARD);
      } catch (e) {
        setError("Failed to find jobs. Please try again.");
      } finally {
        setIsLoading(false);
        setLoadingMessage("");
      }
  };

  const handleInitialization = async () => {
    if (!resumeText.trim()) return;
    if (!locationInput && !postalCode) {
        setError("Please enter a location or postal code.");
        return;
    }

    saveCurrentProfile();

    setIsLoading(true);
    setLoadingMessage("Analyzing profile and scouting active, real-world matches...");
    setError(null);

    try {
      const sem = await parseProfile(resumeText);
      setProfileSem(sem);
      
      if (sem.contact?.email && !email) setEmail(sem.contact.email);
      
      await executeSearch(sem);

    } catch (e) {
      setError("Failed to analyze profile. Please try again.");
      console.error(e);
      setIsLoading(false);
    }
  };

  const handleApplyWithAI = async (job: JobOpening) => {
    setSelectedJob(job);
    setIsLoading(true);
    setLoadingMessage("Analyzing fit and tailoring application materials...");
    setGeneratedContent(null);
    setResumeContent("");
    setCoverLetterContent("");
    setIsEditing(false);
    setActiveTab('resume');
    setCoverLetterTone('Professional'); // Reset to default
    
    try {
        const jdContext = `
            Title: ${job.title}
            Company: ${job.company}
            Snippet: ${job.snippet}
            Description: ${job.description || job.snippet}
            Mission: ${job.mission || ''}
        `;
        
        const analysisResult = await analyzeMatch(profileSem!, jdContext);
        setAnalysis(analysisResult);
        
        const content = await generateApplicationMaterials(profileSem!, jdContext, analysisResult, 'Professional');
        setGeneratedContent(content);
        setResumeContent(content.resumeSnippet);
        setCoverLetterContent(content.coverLetter);
        
        const newEntry: ApplicationEntry = {
            id: Date.now().toString(),
            jobTitle: job.title,
            company: job.company,
            dateSent: new Date().toLocaleDateString(),
            score: analysisResult.score,
            status: 'Draft'
        };
        setApplications(prev => [...prev, newEntry]);
        
        setCurrentStep(Step.APPLICATION_STUDIO);

    } catch (e) {
        setError("Failed to prepare application studio.");
    } finally {
        setIsLoading(false);
        setLoadingMessage("");
    }
  };

  const handleRegenerateCoverLetter = async (newTone: CoverLetterTone) => {
    if (!selectedJob || !profileSem || !analysis) return;
    setCoverLetterTone(newTone);
    setIsLoading(true);
    setLoadingMessage(`Regenerating cover letter with ${newTone} tone...`);
    
    try {
        const jdContext = `
            Title: ${selectedJob.title}
            Company: ${selectedJob.company}
            Snippet: ${selectedJob.snippet}
            Description: ${selectedJob.description || selectedJob.snippet}
            Mission: ${selectedJob.mission || ''}
        `;
        
        const content = await generateApplicationMaterials(profileSem, jdContext, analysis, newTone);
        // Only update cover letter to preserve resume edits
        setCoverLetterContent(content.coverLetter);
        setGeneratedContent(prev => prev ? { ...prev, coverLetter: content.coverLetter } : content);
    } catch (e) {
        setError("Failed to regenerate cover letter.");
    } finally {
        setIsLoading(false);
    }
  };

  const handlePrint = () => {
    const contentToPrint = activeTab === 'resume' ? resumeContent : coverLetterContent;
    const docTitle = activeTab === 'resume' ? `Resume - ${selectedJob?.company}` : `Cover Letter - ${selectedJob?.company}`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>${docTitle}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                        @page { 
                            margin: 0.5in; 
                            size: auto; 
                        }
                        body { 
                            font-family: 'Inter', sans-serif; 
                            line-height: 1.35; 
                            color: #111827; 
                            font-size: 10pt; 
                            margin: 0;
                            padding: 0.5in;
                        }
                        h1 { 
                            font-size: 22pt; 
                            font-weight: 700; 
                            margin-bottom: 2px; 
                            color: #111827;
                            text-transform: uppercase;
                            letter-spacing: -0.5px;
                            line-height: 1.1;
                        }
                        h2 { 
                            font-size: 11pt; 
                            font-weight: 700; 
                            text-transform: uppercase; 
                            border-bottom: 1px solid #d1d5db; 
                            padding-bottom: 2px; 
                            margin-top: 14px; 
                            margin-bottom: 6px;
                            color: #374151;
                            letter-spacing: 0.5px;
                        }
                        h3 {
                            font-size: 10pt;
                            font-weight: 700;
                            margin-top: 6px;
                            margin-bottom: 1px;
                            color: #111827;
                        }
                        p { margin-bottom: 4px; font-size: 10pt; }
                        ul { padding-left: 14px; margin-top: 2px; margin-bottom: 4px; }
                        li { margin-bottom: 2px; font-size: 10pt; }
                        strong { font-weight: 600; }
                        
                        /* Header Contact Info handling */
                        h1 + p, h1 + strong {
                            font-size: 9pt;
                            color: #4b5563;
                            margin-bottom: 16px;
                            display: block;
                        }

                        @media print {
                            body { -webkit-print-color-adjust: exact; padding: 0; }
                            html, body { height: auto; }
                        }
                    </style>
                </head>
                <body>
                    <div class="resume-content">
                        ${contentToPrint
                            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                            .replace(/^\* (.*$)/gim, '<li>$1</li>')
                            .replace(/^- (.*$)/gim, '<li>$1</li>')
                            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                            .replace(/\n\n/gim, '<p></p>')
                            .replace(/\n/gim, '<br />')
                        }
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250); 
    }
  };

  const getSmartPortalLink = () => {
    if (!selectedJob) return '#';
    // If we have a direct ATS link, prefer it.
    if (selectedJob.url && !selectedJob.url.includes('google.com/search')) {
        return selectedJob.url;
    }
    // Fallback: Construct a smart search URL that targets the company careers page with location.
    const query = `site:careers.${selectedJob.company.toLowerCase().replace(/\s/g, '')}.com OR site:${selectedJob.company.toLowerCase().replace(/\s/g, '')}.com/careers "${selectedJob.title}" "${selectedJob.location || locationInput}"`;
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-primary-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentStep(Step.UPLOAD)}>
            <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Sparkles />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              SLH <span className="text-xs font-medium text-slate-500 tracking-wider">v5.0</span>
            </h1>
          </div>
          <nav className="flex space-x-4">
             {currentStep > Step.UPLOAD && (
                 <button onClick={() => setCurrentStep(Step.JOB_BOARD)} className="text-sm font-medium hover:text-primary-400 transition-colors">Job Board</button>
             )}
             <button onClick={() => setCurrentStep(Step.TRACKER)} className="text-sm font-medium text-slate-400 hover:text-white">
                Tracker ({applications.length})
             </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 pb-32">
        {/* Step 0: Initialization */}
        {currentStep === Step.UPLOAD && (
          <div className="space-y-6 animate-fade-in max-w-3xl mx-auto mt-12">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-bold mb-4">Your AI Career Agent</h2>
              <p className="text-slate-400 text-lg">Enter your details once. We find real jobs, tailor your resume, and prepare you to apply instantly.</p>
            </div>
            
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-purple-500"></div>

               {/* Profile History Loader */}
               {history.length > 0 && (
                 <div className="flex justify-end">
                    <div className="relative inline-flex items-center">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                        <select 
                            value={selectedHistoryId} 
                            onChange={handleHistorySelect}
                            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg pl-9 pr-4 py-1.5 outline-none focus:border-primary-500 appearance-none hover:bg-slate-900 cursor-pointer"
                        >
                            <option value="" disabled>Load Saved Profile</option>
                            {history.map(h => (
                                <option key={h.id} value={h.id}>
                                    {h.label}
                                </option>
                            ))}
                        </select>
                    </div>
                 </div>
               )}
               
               {/* Location */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                       <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Target Location</label>
                       <div className="relative group">
                          <MapPin className="absolute left-4 top-3.5 text-slate-500 w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                          <input 
                            type="text" 
                            value={locationInput}
                            onChange={(e) => setLocationInput(e.target.value)}
                            placeholder="e.g. San Francisco, CA"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 pl-12 text-base text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-inner"
                          />
                       </div>
                   </div>
                   <div>
                       <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Postal Code</label>
                       <input 
                          type="text" 
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="94105"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-base text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-inner"
                       />
                   </div>
                   <div>
                       <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Radius: {radius} mi</label>
                       <input 
                          type="range" 
                          min="10" 
                          max="100" 
                          step="10"
                          value={radius}
                          onChange={(e) => setRadius(e.target.value)}
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500 mt-4"
                       />
                   </div>
               </div>

               {/* Credentials */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800/50">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="For applications..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-base text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="For account creation..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-base text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-inner"
                    />
                  </div>
               </div>

               {/* Resume */}
               <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider">Resume Text</label>
                <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your full resume text here..."
                    className="w-full h-48 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-inner font-mono"
                />
               </div>
               
              <button
                onClick={handleInitialization}
                disabled={isLoading || !resumeText.trim()}
                className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary-900/30 flex items-center justify-center transform hover:scale-[1.01]"
              >
                {isLoading ? 'Processing...' : 'Find Active Jobs'}
                {!isLoading && <ArrowRight className="ml-2 w-6 h-6" />}
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Job Board */}
        {currentStep === Step.JOB_BOARD && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Job Board</h2>
                <p className="text-slate-400">Top 10 active matches found for your profile in {locationInput || postalCode}.</p>
              </div>
              <button onClick={() => setCurrentStep(Step.UPLOAD)} className="text-sm text-slate-500 hover:text-white border-b border-transparent hover:border-white transition-all pb-0.5">
                Refine Search
              </button>
            </div>

            {matches.length === 0 && !isLoading && (
                 <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-dashed border-slate-800 flex flex-col items-center">
                     <p className="text-slate-500 mb-4">No jobs found in this area. Try expanding your radius.</p>
                     <button 
                        onClick={() => profileSem && executeSearch(profileSem)} 
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
                     >
                        <Refresh className="mr-2 w-4 h-4" /> Retry Search
                     </button>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {matches.map((job, idx) => (
                <div key={idx} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-slate-600 transition-all shadow-lg flex flex-col md:flex-row gap-6 group relative overflow-hidden">
                  {idx < 3 && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-primary-600/20 to-transparent w-32 h-full pointer-events-none"></div>
                  )}
                  {idx < 3 && <div className="absolute top-4 right-4 text-2xl animate-pulse">🔥</div>}
                  
                  <div className="flex-grow space-y-3 z-10">
                       <div className="flex items-start justify-between">
                            <div>
                                <h4 className="font-bold text-2xl text-white flex items-center gap-3">
                                    {job.title}
                                    {job.matchScore && job.matchScore > 85 && (
                                        <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-md border border-green-500/20 font-mono">
                                            {job.matchScore}% Match
                                        </span>
                                    )}
                                </h4>
                                <div className="flex items-center text-primary-400 font-medium text-sm mt-1">
                                    {job.company}
                                    <span className="text-slate-600 mx-2">•</span>
                                    <span className="text-slate-400">{job.location || locationInput}</span>
                                    {job.postingDate && (
                                        <>
                                            <span className="text-slate-600 mx-2">•</span>
                                            <span className="text-slate-500 text-xs uppercase tracking-wide">Posted {job.postingDate}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                       </div>
                       
                       <div className="flex flex-wrap gap-2 mt-2">
                           {job.isHighPaying && (
                               <span className="bg-yellow-500/10 text-yellow-400 text-xs px-2 py-1 rounded border border-yellow-500/20 flex items-center">
                                   <CurrencyDollar className="w-3 h-3 mr-1"/> High Pay
                               </span>
                           )}
                           {job.greenFlag && (
                               <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/20 flex items-center">
                                   <Heart className="w-3 h-3 mr-1"/> {job.greenFlag}
                               </span>
                           )}
                           {job.salary && (
                               <span className="text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                   {job.salary}
                               </span>
                           )}
                       </div>

                       <p className="text-sm text-primary-200/80 italic border-l-2 border-primary-500/50 pl-3">
                           "{job.matchReason}"
                       </p>

                       <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">{job.snippet}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center min-w-[160px] border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 z-10">
                       <button
                         onClick={() => handleApplyWithAI(job)}
                         className="w-full px-4 py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center justify-center mb-3"
                       >
                         Apply with AI <ArrowRight className="ml-2 w-4 h-4" />
                       </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Application Studio */}
        {currentStep === Step.APPLICATION_STUDIO && selectedJob && (
          <div className="animate-slide-up h-[calc(100vh-140px)] flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                 <button onClick={() => setCurrentStep(Step.JOB_BOARD)} className="flex items-center text-slate-400 hover:text-white transition-colors">
                     <ArrowLeft className="mr-2 w-4 h-4" /> Back to Board
                 </button>
                 <h2 className="text-xl font-bold text-white hidden md:block">{selectedJob.company} Application</h2>
                 <div className="flex items-center gap-3">
                     
                     {/* Tone Buttons - Only visible when Cover Letter is active */}
                     {activeTab === 'cover-letter' && (
                         <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 mr-2 gap-1">
                             <span className="text-[10px] text-slate-500 uppercase font-bold px-2">Tone:</span>
                             {(['Professional', 'Casual', 'Tech-Friendly', 'Enthusiastic'] as CoverLetterTone[]).map((t) => (
                                 <button
                                    key={t}
                                    onClick={() => handleRegenerateCoverLetter(t)}
                                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${coverLetterTone === t ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                                 >
                                     {t.replace('-', ' ')}
                                 </button>
                             ))}
                         </div>
                     )}

                     {/* Toggle Tabs */}
                     <div className="bg-slate-900 border border-slate-700 p-0.5 rounded-lg flex">
                         <button 
                            onClick={() => setActiveTab('resume')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'resume' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                         >
                            Resume
                         </button>
                         <button 
                            onClick={() => setActiveTab('cover-letter')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'cover-letter' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                         >
                            Cover Letter
                         </button>
                     </div>

                     <button 
                        onClick={() => setIsEditing(!isEditing)} 
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium border transition-all ${isEditing ? 'bg-primary-600 border-primary-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'}`}
                     >
                         {isEditing ? <Eye className="mr-2 w-4 h-4" /> : <Edit className="mr-2 w-4 h-4" />}
                         {isEditing ? 'Preview' : 'Edit'}
                     </button>
                     <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium border border-slate-700 transition-all">
                         <Download className="mr-2 w-4 h-4" /> PDF {activeTab === 'resume' ? 'Resume' : 'Cover Letter'}
                     </button>
                     <a href={getSmartPortalLink()} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-green-500/20 transition-all">
                         Go to Portal &rarr;
                     </a>
                 </div>
              </div>

              {/* Split View */}
              <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                  
                  {/* Left: Job Details & Analysis */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-slate-800 bg-slate-800/30">
                          <h1 className="text-2xl font-bold text-white mb-1">{selectedJob.title}</h1>
                          <div className="flex items-center text-sm text-slate-400">
                              <span className="font-semibold text-primary-400 mr-2">{selectedJob.company}</span>
                              <span>• {selectedJob.location}</span>
                              <span className="ml-auto text-xs opacity-70">Posted: {selectedJob.postingDate || 'Recently'}</span>
                          </div>
                      </div>
                      <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                           
                           {/* AI Change Summary */}
                           {generatedContent?.changeSummary && (
                               <div className="bg-indigo-900/10 border border-indigo-500/20 p-4 rounded-xl">
                                   <div className="flex items-center gap-2 mb-2">
                                       <MagicWand className="w-4 h-4 text-indigo-400" />
                                       <h4 className="text-xs font-bold text-indigo-300 uppercase">AI Tailoring Report</h4>
                                   </div>
                                   <div className="text-sm text-indigo-100/80 leading-relaxed whitespace-pre-wrap">
                                       {generatedContent.changeSummary}
                                   </div>
                               </div>
                           )}
                           
                           {/* New Insights Section */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {/* Glassdoor Sentiment */}
                               <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center text-center">
                                   <span className="text-xs text-slate-500 uppercase font-bold mb-2">Employee Sentiment</span>
                                   <div className="flex items-center gap-2 mb-1">
                                       {selectedJob.glassdoorSentiment === 'Positive' ? (
                                           <HappyFace className="w-6 h-6 text-green-500" />
                                       ) : selectedJob.glassdoorSentiment === 'Negative' ? (
                                           <SadFace className="w-6 h-6 text-red-500" />
                                       ) : (
                                           <div className="w-6 h-6 rounded-full border-2 border-slate-600"></div>
                                       )}
                                       <span className="text-xl font-bold text-white">{selectedJob.glassdoorRating || 'N/A'}</span>
                                   </div>
                                   <span className="text-xs text-slate-400">{selectedJob.glassdoorSentiment || 'Neutral'} on Glassdoor</span>
                               </div>

                               {/* Layoff Alert */}
                               <div className={`bg-slate-950 p-4 rounded-xl border ${selectedJob.recentLayoffs && selectedJob.recentLayoffs.toLowerCase().includes('yes') ? 'border-red-500/30' : 'border-green-500/30'} flex flex-col justify-center`}>
                                   <span className="text-xs text-slate-500 uppercase font-bold mb-1">Layoff Radar</span>
                                   <div className="flex items-center gap-2">
                                       <AlertCircle className={`w-4 h-4 ${selectedJob.recentLayoffs && selectedJob.recentLayoffs.toLowerCase().includes('yes') ? 'text-red-500' : 'text-green-500'}`} />
                                       <span className="text-sm font-medium text-slate-300 line-clamp-2">
                                           {selectedJob.recentLayoffs || "No major layoffs reported recently."}
                                       </span>
                                   </div>
                               </div>
                           </div>

                           {/* Key Data */}
                           <div className="grid grid-cols-2 gap-4">
                               <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                   <span className="text-xs text-slate-500 uppercase">Salary</span>
                                   <div className="text-green-400 font-mono text-sm">{selectedJob.salary || 'Not listed'}</div>
                               </div>
                               <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                   <span className="text-xs text-slate-500 uppercase">Stock</span>
                                   <div className="text-purple-400 font-mono text-sm">{selectedJob.stockPrice || 'Private/N/A'}</div>
                               </div>
                           </div>

                           {selectedJob.mission && (
                               <div className="bg-primary-900/10 border border-primary-500/20 p-4 rounded-xl">
                                   <h4 className="text-xs font-bold text-primary-400 uppercase mb-1">Company Mission</h4>
                                   <p className="text-sm text-primary-100/80 italic">"{selectedJob.mission}"</p>
                               </div>
                           )}

                           <div>
                               <h3 className="text-lg font-bold text-white mb-2">Job Description</h3>
                               <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                   {selectedJob.description || selectedJob.snippet}
                               </div>
                           </div>
                      </div>
                  </div>

                  {/* Right: Resume/Cover Letter View */}
                  <div className="bg-slate-800/50 rounded-2xl flex flex-col shadow-inner overflow-hidden relative">
                      <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-2">
                             {isEditing ? `Editing ${activeTab === 'resume' ? 'Resume' : 'Cover Letter'}` : `Preview ${activeTab === 'resume' ? 'Resume' : 'Cover Letter'}`}
                          </span>
                          {!isEditing && (
                             <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Ready to Download</span>
                          )}
                      </div>
                      
                      {/* Document Container */}
                      <div className="flex-grow p-4 md:p-8 overflow-y-auto bg-slate-700/30 flex justify-center" ref={printRef}>
                          <div className={`w-full max-w-[210mm] bg-white shadow-2xl transition-all ${isEditing ? 'min-h-[500px]' : 'min-h-[297mm]'} p-8 md:p-12 text-slate-900`}>
                             {isEditing ? (
                                <textarea 
                                    value={activeTab === 'resume' ? resumeContent : coverLetterContent}
                                    onChange={(e) => activeTab === 'resume' ? setResumeContent(e.target.value) : setCoverLetterContent(e.target.value)}
                                    className="w-full h-full min-h-[600px] bg-transparent outline-none font-mono text-sm text-slate-800 resize-none"
                                    placeholder={`${activeTab === 'resume' ? 'Resume' : 'Cover Letter'} content...`}
                                />
                             ) : (
                                generatedContent ? (
                                    <div className="prose prose-sm max-w-none font-sans text-slate-800">
                                        {(activeTab === 'resume' ? resumeContent : coverLetterContent).split('\n').map((line, i) => {
                                            // Render Markdown-ish content
                                            if (line.startsWith('# ')) {
                                                return <h1 key={i} className="text-2xl font-bold text-slate-900 uppercase tracking-tight mb-1 border-b-2 border-slate-900 pb-2">{line.replace('# ', '')}</h1>;
                                            }
                                            if (line.startsWith('## ')) {
                                                return <h2 key={i} className="text-sm font-bold text-slate-700 uppercase tracking-widest border-b border-slate-300 pb-1 mt-6 mb-2">{line.replace('## ', '')}</h2>;
                                            }
                                            if (line.startsWith('### ')) {
                                                return <h3 key={i} className="text-xs font-bold text-slate-900 mt-3 mb-0.5">{line.replace('### ', '')}</h3>;
                                            }
                                            if (line.startsWith('- ') || line.startsWith('* ')) {
                                                return <div key={i} className="flex items-start mb-0.5 ml-1">
                                                    <span className="mr-2 text-slate-400 text-[10px] mt-1.5">•</span>
                                                    <span className="text-xs leading-snug" dangerouslySetInnerHTML={{ __html: line.replace(/[-*] /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></span>
                                                </div>;
                                            }
                                            if (!line.trim()) return <div key={i} className="h-1"></div>;

                                            return <p key={i} className="mb-0.5 text-xs text-slate-600" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
                                        })}
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
                                            <span>Tailoring your {activeTab}...</span>
                                        </div>
                                    </div>
                                )
                             )}
                          </div>
                      </div>
                      
                      {/* Credentials Helper */}
                      <div className="bg-slate-900 p-4 border-t border-slate-800 grid grid-cols-2 gap-4 z-10 relative">
                          <div className="relative group cursor-pointer" onClick={() => navigator.clipboard.writeText(email)}>
                              <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Email (Click to copy)</div>
                              <div className="text-sm font-mono font-medium text-slate-300 truncate group-hover:text-primary-400 transition-colors">{email}</div>
                          </div>
                          <div className="relative group cursor-pointer" onClick={() => navigator.clipboard.writeText(password)}>
                              <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Password (Click to copy)</div>
                              <div className="text-sm font-mono font-medium text-slate-300 truncate group-hover:text-primary-400 transition-colors">{password ? '••••••••' : 'Not set'}</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        )}

        {/* Global Loading */}
        {isLoading && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md">
              <div className="flex flex-col items-center">
                 <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white animate-pulse" />
                    </div>
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2 text-center">Working Magic</h3>
                 <p className="text-primary-200/80 font-medium animate-pulse text-center max-w-md">{loadingMessage}</p>
              </div>
           </div>
        )}

        {/* Tracker View */}
        {currentStep === Step.TRACKER && (
           <div className="space-y-6 animate-fade-in max-w-4xl mx-auto mt-8">
             <div className="flex items-center justify-between">
               <h2 className="text-2xl font-bold">Application Tracker</h2>
               <button onClick={() => setCurrentStep(Step.JOB_BOARD)} className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Find More Jobs</button>
             </div>
             <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50 text-xs uppercase text-slate-400">
                    <tr><th className="px-6 py-4">Role</th><th className="px-6 py-4">Company</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Suitability</th><th className="px-6 py-4">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {applications.map((app) => (
                      <tr key={app.id}>
                        <td className="px-6 py-4 text-white font-medium">{app.jobTitle}</td>
                        <td className="px-6 py-4 text-slate-400">{app.company}</td>
                        <td className="px-6 py-4 text-slate-500 text-sm">{app.dateSent}</td>
                        <td className="px-6 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${app.score > 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                {app.score}%
                            </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-sm">{app.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {applications.length === 0 && <div className="p-8 text-center text-slate-500">No applications tracked yet.</div>}
             </div>
           </div>
        )}

        <div ref={bottomRef} />
      </main>
    </div>
  );
};

export default App;
