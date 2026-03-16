interface SizeComparisonProps {
  dinoName: string;
  dinoHeight: number;
  dinoLength: number;
}

export function SizeComparison({ dinoName, dinoHeight, dinoLength }: SizeComparisonProps) {
  const humanHeight = 1.7;
  const maxHeight = Math.max(dinoHeight, humanHeight);
  const humanScale = (humanHeight / maxHeight) * 100;
  const dinoScale = (dinoHeight / maxHeight) * 100;

  return (
    <div className="info-panel">
      <p className="section-label">Size Comparison</p>
      <div className="flex items-end justify-center gap-12 h-40 mt-4">
        {/* Human */}
        <div className="flex flex-col items-center">
          <div className="flex items-end" style={{ height: `${humanScale}%` }}>
            <svg viewBox="0 0 40 100" className="h-full w-auto opacity-40" fill="hsl(var(--muted-foreground))">
              <ellipse cx="20" cy="8" rx="7" ry="8" />
              <rect x="14" y="16" width="12" height="35" rx="4" />
              <rect x="8" y="20" width="6" height="25" rx="3" />
              <rect x="26" y="20" width="6" height="25" rx="3" />
              <rect x="14" y="51" width="6" height="35" rx="3" />
              <rect x="20" y="51" width="6" height="35" rx="3" />
            </svg>
          </div>
          <span className="text-xs text-muted-foreground mt-2 font-body">Human</span>
          <span className="text-[10px] text-muted-foreground/60">{humanHeight}m</span>
        </div>
        {/* Dinosaur */}
        <div className="flex flex-col items-center">
          <div className="flex items-end" style={{ height: `${dinoScale}%` }}>
            <svg viewBox="0 0 120 60" className="h-full w-auto" fill="hsl(var(--foreground))" opacity="0.5">
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
          <span className="text-xs text-foreground/60 mt-2 font-body">{dinoName}</span>
          <span className="text-[10px] text-muted-foreground/60">{dinoHeight}m tall · {dinoLength}m long</span>
        </div>
      </div>
    </div>
  );
}
