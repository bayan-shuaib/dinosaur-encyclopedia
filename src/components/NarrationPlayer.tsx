import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, Headphones } from 'lucide-react';

// ── Public types ─────────────────────────────────────────────────────────────

/** Transcript entry from /audio/{speciesId}/{mode}.json  */
export interface TranscriptEntry {
  sectionId:    string;
  sectionTitle: string;
  text:         string;
  start:        number; // seconds from audio start
  end:          number;
}


interface Props {
  speciesId:          string;
  mode:               'life' | 'scientific';
  /** Called with the currently narrated sectionId, or null when narration stops */
  onActiveSectionId?: (id: string | null) => void;
}

type AudioStatus = 'checking' | 'available' | 'unavailable';

// ── Optional per-species custom messages ──────────────────────────────────────
// Data-driven: add an entry here when a species' narration is in active production.
export const CUSTOM_NARRATION_MESSAGES: Record<string, Partial<Record<'life' | 'scientific', string>>> = {
  // Example:
  // 'tyrannosaurus-rex': { life: 'Narration for Tyrannosaurus rex is currently in final production.' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const toTime = (s: number) => {
  const m = Math.floor(Math.abs(s) / 60);
  const sec = Math.floor(Math.abs(s) % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

async function checkAudioExists(speciesId: string, mode: string): Promise<boolean> {
  try {
    const res = await fetch(`/audio/${speciesId}/${mode}.mp3`, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

async function loadTranscript(speciesId: string, mode: string): Promise<TranscriptEntry[] | null> {
  try {
    const res = await fetch(`/audio/${speciesId}/${mode}.json`);
    if (!res.ok) return null;
    return await res.json() as TranscriptEntry[];
  } catch {
    return null;
  }
}

// ── Premium placeholder ───────────────────────────────────────────────────────

function NarrationPlaceholder({
  speciesId,
  mode,
}: {
  speciesId: string;
  mode: 'life' | 'scientific';
}) {
  const custom = CUSTOM_NARRATION_MESSAGES[speciesId]?.[mode];

  return (
    <div className="space-y-5">
      {/* Animated icon + header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Headphones className="h-4.5 w-4.5 text-primary/70" />
          </div>
          {/* Pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-xl border border-primary/20"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-xl border border-primary/15"
            animate={{ scale: [1, 1.8, 1.8], opacity: [0.3, 0, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
          />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-display leading-none">
            Narrated Experience
          </p>
          <p className="text-xs text-foreground/50 font-body mt-1">
            {mode === 'life' ? 'Life Appearance & Behavior' : 'Anatomy & Scientific Evidence'}
          </p>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-3 text-sm font-body leading-relaxed text-foreground/60">
        {custom ? (
          <p>{custom}</p>
        ) : (
          <>
            <p>
              Audio narration for this species is currently being prepared. Our documentary
              team is carefully producing narrated content to ensure scientific accuracy
              and quality presentation.
            </p>
            <p>
              Check back soon to experience this species through guided narration — complete
              with automatic section highlighting and cinematic scrolling.
            </p>
          </>
        )}
      </div>

      {/* Status strip */}
      <div className="flex items-center gap-2.5 pt-1">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-amber-400/70"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/50 font-display">
          Narration in production
        </span>
      </div>

      {/* Fake (decorative) progress bar */}
      <div className="relative h-1.5 bg-secondary/60 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/5"
          animate={{ width: ['0%', '35%', '20%', '50%', '30%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

// ── Active audio player ───────────────────────────────────────────────────────

function NarrationActivePlayer({
  speciesId,
  mode,
  transcript,
  onActiveSectionId,
}: {
  speciesId:          string;
  mode:               'life' | 'scientific';
  transcript:         TranscriptEntry[] | null;
  onActiveSectionId?: (id: string | null) => void;
}) {
  const audioRef          = useRef<HTMLAudioElement | null>(null);
  const prevSectionRef    = useRef<string | null>(null);
  const [isPlaying, setIsPlaying]         = useState(false);
  const [currentTime, setCurrentTime]     = useState(0);
  const [duration, setDuration]           = useState(0);
  const [activeEntryIdx, setActiveEntryIdx] = useState<number | null>(null);

  const progress = duration > 0 ? currentTime / duration : 0;

  // Sync transcript on timeupdate — only fire callback on section boundary
  const handleTimeUpdate = useCallback(() => {
    const t = audioRef.current?.currentTime ?? 0;
    setCurrentTime(t);
    if (transcript) {
      const idx = transcript.findIndex(e => t >= e.start && t < e.end);
      setActiveEntryIdx(idx === -1 ? null : idx);
      const sectionId = idx === -1 ? null : transcript[idx].sectionId;
      if (sectionId !== prevSectionRef.current) {
        prevSectionRef.current = sectionId;
        onActiveSectionId?.(sectionId);
      }
    }
  }, [transcript, onActiveSectionId]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveEntryIdx(null);
    prevSectionRef.current = null;
    onActiveSectionId?.(null);
  }, [onActiveSectionId]);

  const play = useCallback(() => {
    audioRef.current?.play();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (audioRef.current) audioRef.current.currentTime = seconds;
  }, []);

  const seekByProgress = useCallback((ratio: number) => {
    seekTo(Math.max(0, Math.min(ratio, 1)) * duration);
  }, [duration, seekTo]);

  const skipToNextEntry = useCallback(() => {
    if (!transcript || activeEntryIdx === null) return;
    const next = transcript[activeEntryIdx + 1];
    if (next) seekTo(next.start);
  }, [transcript, activeEntryIdx, seekTo]);

  // Cleanup on unmount / mode change
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      prevSectionRef.current = null;
      onActiveSectionId?.(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeEntry = transcript && activeEntryIdx !== null ? transcript[activeEntryIdx] : null;

  return (
    <div className="space-y-4">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={`/audio/${speciesId}/${mode}.mp3`}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Headphones className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-display leading-none">
              Narrated Experience
            </p>
            <p className="text-xs text-foreground/55 font-body mt-1 truncate">
              {activeEntry?.sectionTitle ?? (mode === 'life' ? 'Life Appearance & Behavior' : 'Anatomy & Scientific Evidence')}
            </p>
          </div>
        </div>
        <span className="flex-shrink-0 text-xs font-mono text-muted-foreground tabular-nums mt-0.5">
          {toTime(currentTime)}&thinsp;/&thinsp;{toTime(duration)}
        </span>
      </div>

      {/* Progress bar */}
      <div
        role="slider"
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={progress}
        className="relative h-1.5 bg-secondary rounded-full cursor-pointer group select-none"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          seekByProgress((e.clientX - rect.left) / rect.width);
        }}
        data-testid="narration-progress"
      >
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-100"
          style={{ width: `${progress * 100}%` }}
        />
        {/* Section boundary markers from transcript */}
        {transcript?.filter((e, i) => i === 0 || e.sectionId !== transcript[i - 1].sectionId)
          .map(e => (
            <div
              key={e.sectionId}
              className="absolute top-1/2 -translate-y-1/2 h-2.5 w-0.5 bg-foreground/20 rounded-full"
              style={{ left: `${(e.start / duration) * 100}%` }}
            />
          ))}
        {/* Scrub handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-primary border-2 border-background shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ left: `${progress * 100}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={isPlaying ? pause : play}
          className="h-10 w-10 flex-shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md shadow-primary/25"
          data-testid="button-narration-playpause"
          aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
        >
          {isPlaying
            ? <Pause className="h-4 w-4" />
            : <Play  className="h-4 w-4 translate-x-[1px]" />}
        </button>

        {transcript && (
          <button
            onClick={skipToNextEntry}
            disabled={!activeEntry || activeEntryIdx === transcript.length - 1}
            className="h-7 w-7 flex-shrink-0 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-25"
            data-testid="button-narration-skip"
            aria-label="Skip to next section"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Live transcript preview */}
        {activeEntry && (
          <div className="flex-1 min-w-0 border-l border-border/60 pl-3">
            <p className="text-[12px] leading-snug text-foreground/60 font-body line-clamp-2 italic">
              &ldquo;{activeEntry.text.slice(0, 130)}{activeEntry.text.length > 130 ? '…' : ''}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function NarrationPlayer({ speciesId, mode, onActiveSectionId }: Props) {
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('checking');
  const [transcript, setTranscript]   = useState<TranscriptEntry[] | null>(null);

  // Auto-detect audio + transcript on every speciesId / mode change
  useEffect(() => {
    let cancelled = false;
    setAudioStatus('checking');
    setTranscript(null);
    onActiveSectionId?.(null);

    checkAudioExists(speciesId, mode).then(async (exists) => {
      if (cancelled) return;
      setAudioStatus(exists ? 'available' : 'unavailable');
      if (exists) {
        const t = await loadTranscript(speciesId, mode);
        if (!cancelled) setTranscript(t);
      }
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speciesId, mode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl border border-border/70 bg-card/95 backdrop-blur-sm shadow-xl shadow-black/20 ring-1 ring-white/[0.04] overflow-hidden"
      data-testid="narration-player"
    >
      {/* Premium top accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />

      <div className="p-4 md:p-5">
        {audioStatus === 'checking' && (
          // Skeleton while detecting
          <div className="flex items-center gap-3 py-1">
            <div className="h-8 w-8 rounded-lg bg-secondary animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <div className="h-2.5 w-32 rounded-full bg-secondary animate-pulse" />
              <div className="h-2 w-24 rounded-full bg-secondary/60 animate-pulse" />
            </div>
          </div>
        )}

        {audioStatus === 'unavailable' && (
          <NarrationPlaceholder speciesId={speciesId} mode={mode} />
        )}

        {audioStatus === 'available' && (
          <NarrationActivePlayer
            key={`${speciesId}-${mode}`}
            speciesId={speciesId}
            mode={mode}
            transcript={transcript}
            onActiveSectionId={onActiveSectionId}
          />
        )}
      </div>
    </motion.div>
  );
}
