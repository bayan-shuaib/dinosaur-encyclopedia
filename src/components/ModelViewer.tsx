import { useState, useRef, useCallback } from 'react';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface ModelViewerProps {
  image: string;
  dinoName: string;
  sketchfabUrl?: string;
}

export function ModelViewer({ image, dinoName, sketchfabUrl }: ModelViewerProps) {
  const [mode, setMode] = useState<'skin' | 'skeleton'>('skin');
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - lastX.current;
    setRotation(r => r + delta * 0.5);
    lastX.current = e.clientX;
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    lastX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].clientX - lastX.current;
    setRotation(r => r + delta * 0.5);
    lastX.current = e.touches[0].clientX;
  }, []);

  const hasSketchfab = mode === 'skin' && !!sketchfabUrl;

  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
          <button
            onClick={() => setMode('skin')}
            className={`px-3 py-1.5 rounded-md text-xs font-display tracking-wider transition-all ${mode === 'skin' ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            SKIN
          </button>
          <button
            onClick={() => setMode('skeleton')}
            className={`px-3 py-1.5 rounded-md text-xs font-display tracking-wider transition-all ${mode === 'skeleton' ? 'bg-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            SKELETON
          </button>
        </div>
        {!hasSketchfab && (
          <div className="flex gap-1">
            <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <ZoomIn className="h-4 w-4" />
            </button>
            <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <ZoomOut className="h-4 w-4" />
            </button>
            <button onClick={() => { setRotation(0); setZoom(1); }} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {/* Viewer */}
      {hasSketchfab ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-background">
          <iframe
            title={dinoName}
            className="absolute inset-0 w-full h-full"
            src={sketchfabUrl}
            frameBorder="0"
            allow="autoplay; fullscreen; xr-spatial-tracking"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          className="relative aspect-[16/10] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden select-none bg-background"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <div className="text-6xl font-display font-bold text-muted-foreground/10 uppercase tracking-wider">
            360° VIEW
          </div>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50 font-body">
            Drag to rotate · Buttons to zoom
          </p>
        </div>
      )}
    </div>
  );
}
