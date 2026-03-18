import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dinosaur } from '@/data/types';
import { COLORS } from '@/pages/ComparePage';
import TrueScaleComparison from '@/components/TrueScaleComparison';
import SkeletonVisualizer from '@/components/SkeletonVisualizer';
import { SpecimenOverlay } from '@/components/SpecimenOverlay';

type ViewMode = 'true-scale' | 'skeleton';
type ViewAngle = 'side' | 'dorsal' | 'face';

interface Props {
  dinosaurs: Dinosaur[];
}

export default function VisualExhibit({ dinosaurs }: Props) {
  const [mode, setMode] = useState<ViewMode>('true-scale');
  const [viewAngle, setViewAngle] = useState<ViewAngle>('side');

  const maxHeight = Math.max(...dinosaurs.map(d => d.height), 1.7);

  return (
    <div>
      <h2 className="text-2xl font-medium uppercase tracking-[0.12em] text-foreground mb-8">Visual Exhibit</h2>

      {/* Toggle bar */}
      <div className="flex items-center gap-2 mb-8">
        {(['true-scale', 'skeleton'] as ViewMode[]).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-5 py-2.5 rounded-lg text-xs uppercase tracking-[0.15em] font-medium transition-all border ${
              mode === m
                ? 'bg-card border-border text-foreground shadow-sm'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {m === 'true-scale' ? 'True Scale Comparison' : 'Skeleton Visualization'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'true-scale' && (
          <motion.div
            key="true-scale"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <section className="info-panel mb-6">
              <TrueScaleComparison dinosaurs={dinosaurs} />
            </section>

            {/* View angle options */}
            <SpecimenOverlay label="Multi-Angle Comparison View">
            <div>
            <div className="flex items-center gap-3 mb-6">
              {(['side', 'dorsal', 'face'] as ViewAngle[]).map(v => (
                <button
                  key={v}
                  onClick={() => setViewAngle(v)}
                  className={`px-4 py-2 rounded-md text-xs uppercase tracking-[0.12em] transition-all ${
                    viewAngle === v
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {v === 'side' ? 'Side View' : v === 'dorsal' ? 'Dorsal View' : 'Face-to-Face View'}
                </button>
              ))}
            </div>

            {/* Alternate views */}
            <AnimatePresence mode="wait">
              <motion.section
                key={viewAngle}
                className="info-panel"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              >
                {viewAngle === 'side' && (
                  <div className="flex items-end justify-center gap-8 h-52 pb-4">
                    <div className="flex flex-col items-center">
                      <div className="flex items-end" style={{ height: `${(1.7 / maxHeight) * 100}%` }}>
                        <svg viewBox="0 0 40 100" className="h-full w-auto opacity-40" fill="hsl(var(--muted-foreground))">
                          <ellipse cx="20" cy="8" rx="7" ry="8" />
                          <rect x="14" y="16" width="12" height="35" rx="4" />
                          <rect x="8" y="20" width="6" height="25" rx="3" />
                          <rect x="26" y="20" width="6" height="25" rx="3" />
                          <rect x="14" y="51" width="6" height="35" rx="3" />
                          <rect x="20" y="51" width="6" height="35" rx="3" />
                        </svg>
                      </div>
                      <span className="text-xs text-muted-foreground mt-2">Human</span>
                      <span className="text-[10px] text-muted-foreground/60">1.7m</span>
                    </div>
                    {dinosaurs.map((d, i) => (
                      <div key={d.id} className="flex flex-col items-center">
                        <div className="flex items-end" style={{ height: `${(d.height / maxHeight) * 100}%` }}>
                          <svg viewBox="0 0 120 60" className="h-full w-auto" fill={COLORS[i]} opacity="0.6">
                            <ellipse cx="60" cy="30" rx="35" ry="20" />
                            <ellipse cx="100" cy="20" rx="15" ry="12" />
                            <polygon points="110,15 120,12 115,18" />
                            <rect x="20" y="40" width="8" height="18" rx="2" />
                            <rect x="35" y="40" width="8" height="18" rx="2" />
                            <rect x="70" y="40" width="8" height="18" rx="2" />
                            <rect x="85" y="40" width="8" height="18" rx="2" />
                            <polygon points="15,30 0,28 5,32" />
                          </svg>
                        </div>
                        <span className="text-xs mt-2" style={{ color: COLORS[i] }}>{d.name}</span>
                        <span className="text-[10px] text-muted-foreground/60">{d.height}m tall · {d.length}m long</span>
                      </div>
                    ))}
                  </div>
                )}

                {viewAngle === 'dorsal' && (
                  <div className="flex items-center justify-center gap-10 py-10">
                    {dinosaurs.map((d, i) => {
                      const widthScale = Math.min(d.length * 8, 140);
                      return (
                        <div key={d.id} className="flex flex-col items-center">
                          <svg viewBox="0 0 80 160" width={widthScale * 0.5} height={widthScale} className="mb-2">
                            <ellipse cx="40" cy="80" rx="22" ry="60" fill={COLORS[i]} opacity="0.25" stroke={COLORS[i]} strokeWidth="1" />
                            <ellipse cx="40" cy="14" rx="12" ry="14" fill={COLORS[i]} opacity="0.35" />
                            <line x1="40" y1="28" x2="40" y2="140" stroke={COLORS[i]} strokeWidth="2" opacity="0.3" />
                            <line x1="18" y1="60" x2="10" y2="75" stroke={COLORS[i]} strokeWidth="1.5" opacity="0.3" />
                            <line x1="62" y1="60" x2="70" y2="75" stroke={COLORS[i]} strokeWidth="1.5" opacity="0.3" />
                            <line x1="18" y1="100" x2="10" y2="115" stroke={COLORS[i]} strokeWidth="1.5" opacity="0.3" />
                            <line x1="62" y1="100" x2="70" y2="115" stroke={COLORS[i]} strokeWidth="1.5" opacity="0.3" />
                          </svg>
                          <span className="text-xs" style={{ color: COLORS[i] }}>{d.name}</span>
                          <span className="text-[10px] text-muted-foreground/60">{d.length}m long</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {viewAngle === 'face' && (
                  <div className="flex items-end justify-center gap-12 py-10">
                    {dinosaurs.map((d, i) => {
                      const scale = Math.min(d.height * 20, 120);
                      return (
                        <div key={d.id} className="flex flex-col items-center">
                          <svg viewBox="0 0 100 120" width={scale} height={scale * 1.2} className="mb-2">
                            <ellipse cx="50" cy="50" rx="35" ry="40" fill={COLORS[i]} opacity="0.15" stroke={COLORS[i]} strokeWidth="1.5" />
                            <circle cx="35" cy="38" r="5" fill={COLORS[i]} opacity="0.6" />
                            <circle cx="65" cy="38" r="5" fill={COLORS[i]} opacity="0.6" />
                            <ellipse cx="50" cy="62" rx="12" ry="8" fill="none" stroke={COLORS[i]} strokeWidth="1" opacity="0.4" />
                            <line x1="50" y1="90" x2="35" y2="115" stroke={COLORS[i]} strokeWidth="2" opacity="0.3" />
                            <line x1="50" y1="90" x2="65" y2="115" stroke={COLORS[i]} strokeWidth="2" opacity="0.3" />
                          </svg>
                          <span className="text-xs" style={{ color: COLORS[i] }}>{d.name}</span>
                          <span className="text-[10px] text-muted-foreground/60">{d.height}m tall</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.section>
            </AnimatePresence>
            </div>
            </SpecimenOverlay>
          </motion.div>
        )}

        {mode === 'skeleton' && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <SpecimenOverlay label="Skeleton Comparison">
            <section className="info-panel">
              <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-4 font-medium">Skeleton Side View</p>
              <SkeletonVisualizer dinosaurs={dinosaurs} skeletonMode={true} />
            </section>
            </SpecimenOverlay>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
