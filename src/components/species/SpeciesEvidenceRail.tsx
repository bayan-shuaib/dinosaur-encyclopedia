import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ScanLine, Bone, ShieldHalf, Activity,
} from 'lucide-react';
import { Dinosaur } from '@/data/types';

// ── HUD panel wrapper (right-side variant) ──────────────────────────────────
function EvidencePanel({
  icon: Icon, label, tag, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tag?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-lg border border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-amber-400/25 pointer-events-none" />
      <div className="flex items-center gap-2 px-3.5 pt-3 pb-2 border-b border-border/30">
        <Icon className="h-3.5 w-3.5 text-amber-400/60 flex-shrink-0" />
        <span className="text-[9px] uppercase tracking-[0.2em] font-display text-muted-foreground/55 flex-1">{label}</span>
        {tag && <span className="text-[8px] font-mono tabular-nums text-amber-400/55">{tag}</span>}
      </div>
      <div className="px-3.5 py-3">{children}</div>
    </div>
  );
}

function StatBar({ label, value, max = 10 }: { label: string; value: number; max?: number }) {
  const w = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground/55 font-display">{label}</span>
        <span className="text-[9px] font-mono tabular-nums text-foreground/65">{value}/{max}</span>
      </div>
      <div className="h-1 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-amber-500/70 to-amber-300/70"
          initial={{ width: 0 }}
          whileInView={{ width: `${w}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

function confidenceFromCompleteness(c: number): { label: string; cls: string } {
  if (c >= 75) return { label: 'High', cls: 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10' };
  if (c >= 40) return { label: 'Moderate', cls: 'text-amber-400 border-amber-400/30 bg-amber-500/10' };
  return { label: 'Speculative', cls: 'text-violet-400 border-violet-400/30 bg-violet-500/10' };
}

export function SpeciesEvidenceRail({ dino }: { dino: Dinosaur }) {
  const skel = dino.skeletonData;
  const conf = useMemo(() => confidenceFromCompleteness(skel.completeness), [skel.completeness]);
  const cs = dino.combatStats;

  return (
    <div className="space-y-3">
      {/* Header tag */}
      <div className="flex items-center gap-2 px-1">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[9px] uppercase tracking-[0.24em] font-display text-amber-400/60">Evidence System</span>
        <div className="flex-1 h-px bg-gradient-to-r from-amber-400/25 to-transparent" />
      </div>

      {/* Reconstruction confidence */}
      <EvidencePanel icon={ScanLine} label="Reconstruction" tag={`${skel.completeness}%`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted-foreground/55 font-body">Skeletal completeness</span>
          <span className={`text-[8px] uppercase tracking-[0.16em] font-display border rounded-sm px-1.5 py-0.5 ${conf.cls}`}>
            {conf.label}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500/70 to-amber-300/70"
            initial={{ width: 0 }}
            whileInView={{ width: `${skel.completeness}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-2 text-[9px] text-muted-foreground/40 font-body leading-relaxed">
          Missing regions reconstructed via phylogenetic bracketing against close relatives.
        </p>
      </EvidencePanel>

      {/* Fossil evidence */}
      <EvidencePanel icon={Bone} label="Fossil Evidence" tag={`${skel.recoveredBones.length} ELEM`}>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="rounded-md border border-emerald-500/20 bg-emerald-500/[0.05] px-2 py-1.5">
            <p className="text-base font-display font-bold text-foreground tabular-nums leading-none">{skel.recoveredBones.length}</p>
            <p className="text-[8px] uppercase tracking-[0.14em] text-emerald-400/60 font-display mt-1">Recovered</p>
          </div>
          <div className="rounded-md border border-border/40 bg-secondary/30 px-2 py-1.5">
            <p className="text-base font-display font-bold text-muted-foreground tabular-nums leading-none">{skel.missingBones.length}</p>
            <p className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground/45 font-display mt-1">Inferred</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {skel.recoveredBones.slice(0, 5).map((b) => (
            <span key={b} className="text-[8px] font-body text-foreground/55 bg-secondary/40 border border-border/30 rounded-sm px-1.5 py-0.5">
              {b}
            </span>
          ))}
        </div>
      </EvidencePanel>

      {/* Physiology indicators */}
      <EvidencePanel icon={Activity} label="Physiology Scan" tag="EST.">
        <div className="space-y-2.5">
          <StatBar label="Size" value={cs.size} />
          <StatBar label="Speed" value={cs.speed} />
          <StatBar label="Bite Force" value={cs.biteForce} />
          <StatBar label="Defense" value={cs.defense} />
          <StatBar label="Intelligence" value={cs.intelligence} />
        </div>
      </EvidencePanel>

      {/* Diagnostic features */}
      {dino.distinctFeatures?.length > 0 && (
        <EvidencePanel icon={ShieldHalf} label="Diagnostic Features" tag={`${dino.distinctFeatures.length}`}>
          <ul className="space-y-1.5">
            {dino.distinctFeatures.map((f, i) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-0.5 font-mono text-[8px] tabular-nums text-amber-400/55 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-foreground/75 font-body leading-snug">{f}</span>
              </li>
            ))}
          </ul>
        </EvidencePanel>
      )}

    </div>
  );
}
