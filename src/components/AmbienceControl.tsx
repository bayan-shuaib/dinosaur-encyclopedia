import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AmbienceControl() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(window.sessionStorage.getItem('dinopedia-ambience') === 'on');
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    window.sessionStorage.setItem('dinopedia-ambience', next ? 'on' : 'off');
  };

  return (
    <button type="button" onClick={toggle} className="inline-flex items-center gap-2 rounded-md border border-border/60 bg-card/60 px-3 py-2 text-xs font-display text-muted-foreground transition-colors hover:border-amber-400/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-pressed={enabled} aria-label={enabled ? 'Turn environmental ambience off' : 'Turn environmental ambience on'}>
      {enabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
      <span>Ambience {enabled ? 'on' : 'off'}</span>
    </button>
  );
}
