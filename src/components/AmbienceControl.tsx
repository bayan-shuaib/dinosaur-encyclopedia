import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Dinosaur } from '@/data/types';
import { useEnvironmentalAmbience, getEnvironmentLabel } from '@/hooks/useEnvironmentalAmbience';

export function AmbienceControl({ dino }: { dino: Dinosaur }) {
  const [enabled, setEnabled] = useState(false);
  const { category } = useEnvironmentalAmbience(dino, enabled);

  useEffect(() => {
    const stored = sessionStorage.getItem('dinopedia-ambience');
    if (stored === 'on') setEnabled(true);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    sessionStorage.setItem('dinopedia-ambience', next ? 'on' : 'off');
  };

  return (
    <button type="button" onClick={toggle} aria-pressed={enabled} aria-label={enabled ? 'Disable environmental ambience' : 'Enable environmental ambience'} title={getEnvironmentLabel(category)} className="ambience-control">
      {enabled ? <Volume2 data-icon="inline-start" /> : <VolumeX data-icon="inline-start" />}
      <span>{enabled ? 'Ambience on' : 'Ambience off'}</span>
    </button>
  );
}
