import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  FileText, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  RefreshCw,
  ArrowRight,
  Database,
  Search,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { cn } from '../types';
import { fmtMoney, fmtNum } from '../lib/calculations';

// --- Types ---

interface ParsedShow {
  id: string;
  date: string;
  city: string;
  country: string;
  venue: string;
  capacity: number;
  sold: number;
  gross: number;
  lat?: number;
  lng?: number;
}

interface DiffItem {
  showId: string;
  showName: string;
  field: string;
  currentValue: any;
  newValue: any;
  status: 'new' | 'updated' | 'conflict' | 'unchanged';
  message?: string;
}

// --- Components ---

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { id: 1, label: 'Context' },
    { id: 2, label: 'Ingest' },
    { id: 3, label: 'Review' },
    { id: 4, label: 'Publish' }
  ];

  return (
    <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto relative">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#242A35] -translate-y-1/2 z-0" />
      {steps.map((step) => (
        <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
            currentStep === step.id 
              ? "bg-[#2E66FF] border-[#2E66FF] text-white shadow-[0_0_15px_rgba(46,102,255,0.4)]" 
              : currentStep > step.id 
                ? "bg-[#10B981] border-[#10B981] text-white" 
                : "bg-[#12151C] border-[#242A35] text-[#475569]"
          )}>
            {currentStep > step.id ? <CheckCircle2 size={20} /> : step.id}
          </div>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            currentStep === step.id ? "text-white" : "text-[#475569]"
          )}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AdminPortal() {
  const navigate = useNavigate();
  const { selectedArtistId, setSelectedArtistId, selectedTourId, setSelectedTourId } = useAppContext();
  
  const [step, setStep] = useState(1);
  const [artists, setArtists] = useState<any[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [newTourName, setNewTourName] = useState('');
  
  const [ingestMethod, setIngestMethod] = useState<'paste' | 'csv' | 'manual'>('paste');
  const [rawData, setRawData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [parsedData, setParsedData] = useState<{ shows: ParsedShow[], ledger: any[] } | null>(null);
  const [existingShows, setExistingShows] = useState<any[]>([]);
  const [diffs, setDiffs] = useState<DiffItem[]>([]);
  
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // --- Data Fetching ---

  useEffect(() => {
    fetch('/api/artists')
      .then(res => res.json())
      .then(data => setArtists(data));
  }, []);

  useEffect(() => {
    if (selectedArtistId) {
      fetch(`/api/artist/${selectedArtistId}/tours`)
        .then(res => res.json())
        .then(data => setTours(data));
    }
  }, [selectedArtistId]);

  useEffect(() => {
    if (selectedTourId && selectedTourId !== 'new') {
      fetch(`/api/tour/${selectedTourId}/shows`)
        .then(res => res.json())
        .then(data => setExistingShows(data));
    } else {
      setExistingShows([]);
    }
  }, [selectedTourId]);

  // --- Logic ---

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/process-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawData })
      });
      const data = await res.json();
      setParsedData(data);
      
      // Generate Diffs
      const newDiffs: DiffItem[] = [];
      data.shows.forEach((newShow: ParsedShow) => {
        const existing = existingShows.find(s => s.date === newShow.date && s.city === newShow.city);
        
        if (!existing) {
          newDiffs.push({
            showId: newShow.id,
            showName: `${newShow.city} (${newShow.date})`,
            field: 'All',
            currentValue: '-',
            newValue: 'New Show',
            status: 'new'
          });
        } else {
          // Check fields
          const fields = ['venue', 'capacity', 'sold', 'gross'];
          fields.forEach(field => {
            const curVal = existing[field];
            const newVal = (newShow as any)[field];
            
            if (curVal !== newVal) {
              const isConflict = field === 'sold' && newVal > newShow.capacity;
              newDiffs.push({
                showId: newShow.id,
                showName: `${newShow.city} (${newShow.date})`,
                field: field.charAt(0).toUpperCase() + field.slice(1),
                currentValue: curVal,
                newValue: newVal,
                status: isConflict ? 'conflict' : 'updated',
                message: isConflict ? 'Sold exceeds capacity' : undefined
              });
            }
          });
        }
      });
      
      setDiffs(newDiffs);
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const tourId = selectedTourId === 'new' ? `tour-${Date.now()}` : selectedTourId;
      const tourName = selectedTourId === 'new' ? newTourName : tours.find(t => t.id === selectedTourId)?.name;

      const res = await fetch('/api/admin/publish-tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: selectedArtistId,
          tourId,
          tourName,
          shows: parsedData?.shows,
          ledger: parsedData?.ledger
        })
      });
      
      if (res.ok) {
        setPublishSuccess(true);
        setStep(4);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  const hasConflicts = diffs.some(d => d.status === 'conflict');

  // --- Render Steps ---

  const renderStep1 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 max-w-xl mx-auto"
    >
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-[#475569] uppercase tracking-widest block">Select Artist</label>
        <div className="grid grid-cols-1 gap-2">
          {artists.map(artist => (
            <button
              key={artist.id}
              onClick={() => setSelectedArtistId(artist.id)}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-all",
                selectedArtistId === artist.id 
                  ? "bg-[#2E66FF]/10 border-[#2E66FF] text-white" 
                  : "bg-[#12151C] border-[#242A35] text-[#94A3B8] hover:border-[#475569]"
              )}
            >
              <span className="font-bold">{artist.name}</span>
              {selectedArtistId === artist.id && <CheckCircle2 size={16} className="text-[#2E66FF]" />}
            </button>
          ))}
        </div>
      </div>

      {selectedArtistId && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <label className="text-[10px] font-bold text-[#475569] uppercase tracking-widest block">Select Tour</label>
          <select 
            value={selectedTourId || ''}
            onChange={(e) => setSelectedTourId(e.target.value)}
            className="w-full bg-[#12151C] border border-[#242A35] rounded-lg p-4 text-white outline-none focus:border-[#2E66FF]"
          >
            <option value="" disabled>Choose a tour...</option>
            {tours.map(tour => (
              <option key={tour.id} value={tour.id}>{tour.name}</option>
            ))}
            <option value="new">+ Create New Tour</option>
          </select>

          {selectedTourId === 'new' && (
            <input 
              type="text"
              placeholder="Enter new tour name..."
              value={newTourName}
              onChange={(e) => setNewTourName(e.target.value)}
              className="w-full bg-[#12151C] border border-[#242A35] rounded-lg p-4 text-white outline-none focus:border-[#2E66FF]"
            />
          )}
        </motion.div>
      )}

      <div className="pt-8 flex justify-end">
        <button
          disabled={!selectedArtistId || (!selectedTourId && !newTourName)}
          onClick={() => setStep(2)}
          className="flex items-center gap-2 px-8 py-3 bg-[#2E66FF] text-white rounded-lg font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2E66FF]/90 transition-all"
        >
          Next Step <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 max-w-3xl mx-auto"
    >
      <div className="flex gap-4 border-b border-[#242A35]">
        {['paste', 'csv', 'manual'].map((method) => (
          <button
            key={method}
            onClick={() => setIngestMethod(method as any)}
            className={cn(
              "px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2",
              ingestMethod === method 
                ? "border-[#2E66FF] text-white" 
                : "border-transparent text-[#475569] hover:text-[#94A3B8]"
            )}
          >
            {method === 'paste' ? 'Paste Settlement' : method === 'csv' ? 'CSV Upload' : 'Manual Notes'}
          </button>
        ))}
      </div>

      <div className="min-h-[300px]">
        {ingestMethod === 'paste' && (
          <textarea 
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder="Paste raw settlement text here (e.g. from emails, PDFs, or spreadsheets)..."
            className="w-full h-[300px] bg-[#12151C] border border-[#242A35] rounded-lg p-6 text-white font-mono text-sm outline-none focus:border-[#2E66FF] resize-none"
          />
        )}

        {ingestMethod === 'csv' && (
          <label className="w-full h-[300px] border-2 border-dashed border-[#242A35] rounded-lg flex flex-col items-center justify-center gap-4 hover:border-[#2E66FF]/50 transition-all cursor-pointer group relative">
            <input 
              type="file" 
              accept=".csv"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const text = await file.text();
                  setRawData(text);
                }
              }}
            />
            <div className="w-16 h-16 rounded-full bg-[#1C212B] flex items-center justify-center text-[#475569] group-hover:text-[#2E66FF] transition-all">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <p className="text-white font-bold">{rawData && ingestMethod === 'csv' ? 'File Loaded' : 'Drag & drop CSV file'}</p>
              <p className="text-[#475569] text-xs">{rawData && ingestMethod === 'csv' ? 'Click to change file' : 'or click to browse from your computer'}</p>
            </div>
          </label>
        )}

        {ingestMethod === 'manual' && (
          <textarea 
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder="Enter qualitative notes or manual show adjustments..."
            className="w-full h-[300px] bg-[#12151C] border border-[#242A35] rounded-lg p-6 text-white text-sm outline-none focus:border-[#2E66FF] resize-none"
          />
        )}
      </div>

      <div className="flex justify-between items-center pt-8">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-2 px-6 py-3 text-[#475569] font-bold uppercase tracking-widest text-xs hover:text-white transition-all"
        >
          <ChevronLeft size={16} /> Back
        </button>
        
        <button
          disabled={!rawData && ingestMethod !== 'csv'}
          onClick={handleProcess}
          className="flex items-center gap-2 px-8 py-3 bg-[#2E66FF] text-white rounded-lg font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2E66FF]/90 transition-all"
        >
          {isProcessing ? (
            <>
              <RefreshCw size={16} className="animate-spin" /> Processing...
            </>
          ) : (
            <>
              Process Data <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-[#0A0C10]/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-6">
          <div className="w-64 h-1 bg-[#242A35] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#2E66FF]"
              animate={{ x: [-256, 256] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-white tracking-tight">AI Processing...</h3>
            <p className="text-[#475569] text-sm">Analyzing settlement data and calculating splits</p>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">Review AI-Parsed Data</h3>
          <p className="text-sm text-[#475569]">Verify changes before publishing to the tour profile.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/10 border border-[#10B981]/20 rounded text-[#10B981] text-[10px] font-bold uppercase tracking-widest">
            <Plus size={12} /> {diffs.filter(d => d.status === 'new').length} New
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded text-[#F59E0B] text-[10px] font-bold uppercase tracking-widest">
            Δ {diffs.filter(d => d.status === 'updated').length} Updates
          </div>
          {hasConflicts && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded text-[#EF4444] text-[10px] font-bold uppercase tracking-widest">
              ! {diffs.filter(d => d.status === 'conflict').length} Conflicts
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#12151C] border border-[#242A35] rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0A0C10] border-b border-[#242A35]">
              <th className="px-6 py-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest">Show</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest">Field</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest">Current</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest">New Value</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {diffs.map((diff, i) => (
              <tr key={i} className="border-b border-[#242A35]/30 last:border-0 hover:bg-[#1C212B] transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-white">{diff.showName}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">{diff.field}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-mono text-[#475569]">
                    {typeof diff.currentValue === 'number' ? fmtNum(diff.currentValue) : diff.currentValue}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-mono font-bold",
                      diff.status === 'new' ? "text-[#10B981]" : diff.status === 'conflict' ? "text-[#EF4444]" : "text-[#F59E0B]"
                    )}>
                      {typeof diff.newValue === 'number' ? fmtNum(diff.newValue) : diff.newValue}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 p-1 text-[#475569] hover:text-white transition-all">
                      <Edit3 size={12} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    {diff.status === 'new' && <Plus size={16} className="text-[#10B981]" />}
                    {diff.status === 'updated' && <span className="text-[#F59E0B] font-bold">Δ</span>}
                    {diff.status === 'conflict' && (
                      <div className="relative group/err">
                        <AlertCircle size={16} className="text-[#EF4444]" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#EF4444] text-white text-[10px] rounded opacity-0 group-hover/err:opacity-100 pointer-events-none transition-all z-50 text-center">
                          {diff.message}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-8">
        <button
          onClick={() => setStep(2)}
          className="flex items-center gap-2 px-6 py-3 text-[#475569] font-bold uppercase tracking-widest text-xs hover:text-white transition-all"
        >
          <ChevronLeft size={16} /> Back
        </button>
        
        <button
          disabled={hasConflicts}
          onClick={() => setStep(4)}
          className="flex items-center gap-2 px-8 py-3 bg-[#2E66FF] text-white rounded-lg font-bold uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2E66FF]/90 transition-all"
        >
          Final Review <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      {!publishSuccess ? (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">Ready to Publish</h3>
            <p className="text-[#475569]">The following changes will be applied to the tour profile.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#12151C] border border-[#242A35] p-6 rounded-lg text-center">
              <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">Shows to Add</p>
              <p className="text-4xl font-black text-white">{diffs.filter(d => d.status === 'new').length}</p>
            </div>
            <div className="bg-[#12151C] border border-[#242A35] p-6 rounded-lg text-center">
              <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-2">Data Updates</p>
              <p className="text-4xl font-black text-[#F59E0B]">{diffs.filter(d => d.status === 'updated').length}</p>
            </div>
          </div>

          <div className="bg-[#12151C] border border-[#242A35] p-6 rounded-lg space-y-4">
            <h4 className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Audit Trail Metadata</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#475569]">Admin User</span>
                <span className="text-white font-mono">admin@gti.io</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#475569]">Source</span>
                <span className="text-white font-mono">{ingestMethod.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#475569]">Timestamp</span>
                <span className="text-white font-mono">{new Date().toISOString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full py-4 bg-[#10B981] text-white rounded-lg font-bold uppercase tracking-widest text-sm hover:bg-[#10B981]/90 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3"
            >
              {isPublishing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} /> Publish to Profile
                </>
              )}
            </button>
            <button
              onClick={() => setStep(3)}
              className="w-full py-4 text-[#475569] font-bold uppercase tracking-widest text-xs hover:text-white transition-all"
            >
              Cancel & Review
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-8 py-12">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-[#10B981] rounded-full flex items-center justify-center text-white mx-auto shadow-[0_0_40px_rgba(16,185,129,0.4)]"
          >
            <CheckCircle2 size={48} />
          </motion.div>
          
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-white tracking-tight">Tour Published Successfully</h3>
            <p className="text-[#475569]">The tour profile has been updated and audit logs have been recorded.</p>
          </div>

          <div className="bg-[#12151C] border border-[#242A35] p-6 rounded-lg max-w-sm mx-auto">
            <div className="flex items-center gap-3 text-left">
              <FileText size={20} className="text-[#2E66FF]" />
              <div>
                <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Audit Log ID</p>
                <p className="text-xs font-mono text-white">AUDIT-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/app/health')}
              className="px-8 py-3 bg-[#2E66FF] text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#2E66FF]/90 transition-all"
            >
              View Dashboard
            </button>
            <button
              onClick={() => {
                setStep(1);
                setPublishSuccess(false);
                setParsedData(null);
                setRawData('');
              }}
              className="px-8 py-3 border border-[#242A35] text-white rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-[#1C212B] transition-all"
            >
              Ingest More Data
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen pb-20">
      <StepIndicator currentStep={step} />
      
      <AnimatePresence mode="wait">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </AnimatePresence>
    </div>
  );
}
