import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipForward, Headphones } from 'lucide-react';

// ── Public types ────────────────────────────────────────────────────────────

export interface TranscriptSegment {
  sectionId: string;
  sectionTitle: string;
  text: string;
}

interface Props {
  segments: TranscriptSegment[];
  /** Called whenever the active global segment index changes (null = idle) */
  onSegmentChange: (idx: number | null) => void;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const WPM = 140;
const wordsIn = (t: string) => t.trim().split(/\s+/).length;
const toTime = (secs: number) => {
  const m = Math.floor(Math.abs(secs) / 60);
  const s = Math.abs(secs) % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

// ── Component ───────────────────────────────────────────────────────────────

export function NarrationPlayer({ segments, onSegmentChange }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const cancelRef = useRef(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Lazy-init so SSR doesn't crash
  if (typeof window !== 'undefined' && !synthRef.current) {
    synthRef.current = window.speechSynthesis ?? null;
  }
  const synth = synthRef.current;

  // Derived display values
  const totalWords   = segments.reduce((s, seg) => s + wordsIn(seg.text), 0);
  const totalSecs    = Math.round((totalWords / WPM) * 60);
  const elapsedWords = segments.slice(0, currentIdx).reduce((s, seg) => s + wordsIn(seg.text), 0);
  const elapsedSecs  = Math.round((elapsedWords / WPM) * 60);
  const progress     = segments.length > 0 ? currentIdx / segments.length : 0;
  const current      = segments[currentIdx] ?? null;

  // ── Speech engine ──────────────────────────────────────────────────────

  const speakFrom = useCallback((idx: number) => {
    if (!synth) return;
    if (idx >= segments.length) {
      synth.cancel();
      setIsPlaying(false);
      setCurrentIdx(0);
      onSegmentChange(null);
      return;
    }

    synth.cancel();
    cancelRef.current = false;

    const seg = segments[idx];
    onSegmentChange(idx);

    const utt = new SpeechSynthesisUtterance(seg.text);
    utt.rate  = 0.88;
    utt.pitch = 0.95;
    utt.onend = () => {
      if (!cancelRef.current) {
        const next = idx + 1;
        setCurrentIdx(next);
        speakFrom(next);
      }
    };
    synth.speak(utt);
  }, [segments, synth, onSegmentChange]);

  const play = useCallback(() => {
    cancelRef.current = false;
    setIsPlaying(true);
    speakFrom(currentIdx);
  }, [currentIdx, speakFrom]);

  const pause = useCallback(() => {
    cancelRef.current = true;
    synth?.cancel();
    setIsPlaying(false);
  }, [synth]);

  const seekTo = useCallback((raw: number) => {
    const idx = Math.max(0, Math.min(raw, segments.length - 1));
    cancelRef.current = true;
    synth?.cancel();
    setCurrentIdx(idx);
    cancelRef.current = false;
    if (isPlaying) {
      speakFrom(idx);
    } else {
      onSegmentChange(idx);
    }
  }, [segments.length, synth, isPlaying, speakFrom, onSegmentChange]);

  // Reset when the segment list changes (mode switch)
  useEffect(() => {
    cancelRef.current = true;
    synth?.cancel();
    setIsPlaying(false);
    setCurrentIdx(0);
    onSegmentChange(null);
    // Brief timeout so cancel propagates before any re-play
    const t = setTimeout(() => { cancelRef.current = false; }, 50);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  // Cleanup on unmount
  useEffect(() => () => {
    cancelRef.current = true;
    synth?.cancel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── No support guard ───────────────────────────────────────────────────

  if (!synth) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground text-center">
        Narration is not supported in this browser.
      </div>
    );
  }

  // ── UI ─────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl border border-border/70 bg-card/95 backdrop-blur-sm shadow-xl shadow-black/25 ring-1 ring-white/[0.05] overflow-hidden"
      data-testid="narration-player"
    >
      {/* Subtle top accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary/0 via-primary/60 to-primary/0" />

      <div className="p-4 md:p-5 space-y-4">

        {/* ── Header ──────────────────────────────────────────────── */}
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
                {current ? current.sectionTitle : 'Ready to play'}
              </p>
            </div>
          </div>
          <span className="flex-shrink-0 text-xs font-mono text-muted-foreground tabular-nums mt-0.5">
            {toTime(elapsedSecs)}&thinsp;/&thinsp;{toTime(totalSecs)}
          </span>
        </div>

        {/* ── Progress bar ─────────────────────────────────────────── */}
        <div
          role="slider"
          aria-valuemin={0}
          aria-valuemax={segments.length}
          aria-valuenow={currentIdx}
          className="relative h-1.5 bg-secondary rounded-full cursor-pointer group select-none"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            seekTo(Math.round(ratio * (segments.length - 1)));
          }}
          data-testid="narration-progress"
        >
          {/* Fill */}
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
          {/* Scrub handle — visible on hover */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-primary border-2 border-background shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{ left: `${progress * 100}%` }}
          />
          {/* Section markers */}
          {segments
            .filter((seg, i) => i === 0 || seg.sectionId !== segments[i - 1].sectionId)
            .map((seg) => {
              const segIdx = segments.indexOf(seg);
              const pct = (segIdx / segments.length) * 100;
              return (
                <div
                  key={seg.sectionId}
                  className="absolute top-1/2 -translate-y-1/2 h-2 w-0.5 bg-foreground/20 rounded-full"
                  style={{ left: `${pct}%` }}
                />
              );
            })}
        </div>

        {/* ── Controls + live transcript preview ───────────────────── */}
        <div className="flex items-center gap-3">
          {/* Play / pause */}
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

          {/* Skip to next paragraph */}
          <button
            onClick={() => seekTo(currentIdx + 1)}
            disabled={currentIdx >= segments.length - 1}
            className="h-7 w-7 flex-shrink-0 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-25"
            data-testid="button-narration-skip"
            aria-label="Skip to next paragraph"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>

          {/* Live sentence preview */}
          {current && (
            <div className="flex-1 min-w-0 border-l border-border/60 pl-3">
              <p className="text-[12px] leading-snug text-foreground/60 font-body line-clamp-2 italic">
                &ldquo;{current.text.slice(0, 130)}{current.text.length > 130 ? '…' : ''}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
