import { SkeletonData } from '@/data/types';

interface SkeletonViewerProps {
  skeletonData: SkeletonData;
  dinoName: string;
}

export function SkeletonViewer({ skeletonData }: SkeletonViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="section-label mb-0">Fossil Record Completeness</p>
        <span className="text-lg font-display font-bold text-foreground">
          {skeletonData.completeness}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className="h-full rounded-full bg-foreground/60 transition-all duration-1000"
          style={{ width: `${skeletonData.completeness}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-[10px] font-display uppercase tracking-wider text-foreground/50 mb-2">
            Recovered Bones
          </p>
          <div className="flex flex-wrap gap-1">
            {skeletonData.recoveredBones.map((bone) => (
              <span
                key={bone}
                className="px-2 py-0.5 text-[10px] rounded bg-secondary text-foreground/70 font-body"
              >
                {bone}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-display uppercase tracking-wider text-muted-foreground/60 mb-2">
            Missing / Reconstructed
          </p>
          <div className="flex flex-wrap gap-1">
            {skeletonData.missingBones.map((bone) => (
              <span
                key={bone}
                className="px-2 py-0.5 text-[10px] rounded bg-secondary/50 text-muted-foreground/40 font-body"
              >
                {bone}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
