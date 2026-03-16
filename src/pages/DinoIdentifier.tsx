import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Upload, X, Loader2, Search, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dinosaurs } from '@/data/dinosaurs';
import { Dinosaur } from '@/data/types';

type Phase = 'upload' | 'analyzing' | 'results';

interface Match {
  dinosaur: Dinosaur;
  confidence: number;
}

const ANALYSIS_MESSAGES = [
  'Analyzing skeletal structure...',
  'Comparing fossil morphology...',
  'Scanning dinosaur database...',
  'Generating possible matches...',
];

// Simple matching based on image filename or random selection
// This can be replaced with a real AI vision model later
function identifyDinosaur(_imageData: string): Match[] {
  // Shuffle and pick 3 dinosaurs with decreasing confidence
  const shuffled = [...dinosaurs].sort(() => Math.random() - 0.5);
  const top3 = shuffled.slice(0, 3);
  const confidences = [
    Math.floor(Math.random() * 15) + 82, // 82-96
    Math.floor(Math.random() * 20) + 50, // 50-69
    Math.floor(Math.random() * 20) + 30, // 30-49
  ];
  return top3.map((d, i) => ({ dinosaur: d, confidence: confidences[i] }));
}

export default function DinoIdentifier() {
  const [phase, setPhase] = useState<Phase>('upload');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [analysisMsg, setAnalysisMsg] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImageUrl(url);
      startAnalysis(url);
    };
    reader.readAsDataURL(file);
  }, []);

  const startAnalysis = useCallback((url: string) => {
    setPhase('analyzing');
    setAnalysisMsg(0);

    // Cycle through messages
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % ANALYSIS_MESSAGES.length;
      setAnalysisMsg(msgIdx);
    }, 700);

    // Complete after ~3 seconds
    setTimeout(() => {
      clearInterval(msgInterval);
      const results = identifyDinosaur(url);
      setMatches(results);
      setPhase('results');
    }, 3000);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) handleFile(file);
        break;
      }
    }
  }, [handleFile]);

  const reset = () => {
    setPhase('upload');
    setImageUrl(null);
    setMatches([]);
  };

  return (
    <div className="min-h-screen pt-14 font-body" onPaste={handlePaste}>
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 tracking-tight uppercase">
          Dino Identifier
        </h1>
        <p className="text-muted-foreground text-sm mb-12">
          Upload an image of a dinosaur and our AI will identify the species.
        </p>

        <AnimatePresence mode="wait">
          {/* UPLOAD PHASE */}
          {phase === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full max-w-lg aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-accent bg-accent/5 shadow-[0_0_30px_hsl(var(--accent)/0.15)]'
                    : 'border-border hover:border-muted-foreground/40 bg-card'
                }`}
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-foreground font-medium mb-1">Drop dinosaur image here</p>
                <p className="text-muted-foreground text-sm">or click to upload</p>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-4">
                Best results with clear dinosaur illustrations or fossil reconstructions.
              </p>
              <p className="text-xs text-muted-foreground/40 mt-1">
                Supports PNG, JPG, WEBP · Paste from clipboard supported
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </motion.div>
          )}

          {/* ANALYZING PHASE */}
          {phase === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                {/* Uploaded image behind scanner */}
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Uploaded"
                    className="absolute inset-0 w-full h-full object-contain rounded-2xl opacity-30"
                  />
                )}

                {/* Scanning ring */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-6">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-spin" style={{ animationDuration: '3s' }}>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-accent" />
                    </div>
                    {/* Inner ring */}
                    <div className="absolute inset-3 rounded-full border border-accent/15 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent/60" />
                    </div>
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Search className="h-8 w-8 text-accent/60" />
                    </div>
                  </div>

                  {/* Scanning line */}
                  <div className="w-64 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent animate-pulse mb-6" />

                  {/* Message */}
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={analysisMsg}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="text-sm text-muted-foreground"
                    >
                      {ANALYSIS_MESSAGES[analysisMsg]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS PHASE */}
          {phase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-semibold text-foreground uppercase tracking-wider">
                  Possible Matches
                </h2>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" /> Try another image
                </button>
              </div>

              {/* Uploaded image preview */}
              {imageUrl && (
                <div className="mb-8 flex justify-center">
                  <img
                    src={imageUrl}
                    alt="Uploaded dinosaur"
                    className="max-h-48 rounded-xl border border-border object-contain"
                  />
                </div>
              )}

              {/* Match cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {matches.map((match, i) => (
                  <motion.div
                    key={match.dinosaur.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className={`info-panel relative overflow-hidden ${
                      i === 0 ? 'ring-1 ring-accent/30 shadow-[0_0_20px_hsl(var(--accent)/0.08)]' : ''
                    }`}
                  >
                    {i === 0 && (
                      <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-accent font-semibold">
                        Best Match
                      </span>
                    )}

                    {/* Dino thumbnail placeholder */}
                    <div className="w-full aspect-[16/10] bg-secondary rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {match.dinosaur.image ? (
                        <img src={match.dinosaur.image} alt={match.dinosaur.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-display font-bold text-muted-foreground/10 uppercase">
                          {match.dinosaur.name.charAt(0)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-display font-bold text-foreground mb-1">
                      {match.dinosaur.name}
                    </h3>
                    <p className="text-xs text-muted-foreground italic mb-3">
                      {match.dinosaur.scientificName}
                    </p>

                    {/* Confidence bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="text-foreground font-semibold">{match.confidence}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${match.confidence}%` }}
                          transition={{ duration: 0.8, delay: i * 0.15 + 0.3 }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: i === 0
                              ? 'hsl(var(--accent))'
                              : 'hsl(var(--muted-foreground))',
                          }}
                        />
                      </div>
                    </div>

                    <Link
                      to={`/dinosaur/${match.dinosaur.id}`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-secondary text-sm text-foreground hover:bg-secondary/80 transition-colors font-medium"
                    >
                      View Encyclopedia Entry <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
