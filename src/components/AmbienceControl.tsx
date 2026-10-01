import { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Dinosaur } from '@/data/types';
import { useEnvironmentalAmbience, getEnvironmentLabel } from '@/hooks/useEnvironmentalAmbience';

export function AmbienceControl({ dino }: { dino: Dinosaur }) {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(35);
  const { category } = useEnvironmentalAmbience(dino, enabled, volume);

  useEffect(() => {
    const stored = sessionStorage.getItem('dinopedia-ambience');
    if (stored === 'off') setEnabled(false);
    const storedVolume = Number(sessionStorage.getItem('dinopedia-ambience-volume'));
    if (storedVolume > 0) setVolume(storedVolume);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    sessionStorage.setItem('dinopedia-ambience', next ? 'on' : 'off');
  };

  const changeVolume = (next: number) => {
    setVolume(next);
    sessionStorage.setItem('dinopedia-ambience-volume', String(next));
  };

  return (
    <div className="ambience-control-wrap">
      <button type="button" onClick={toggle} aria-pressed={enabled} aria-label={enabled ? 'Disable environmental ambience' : 'Enable environmental ambience'} title={getEnvironmentLabel(category)} className="ambience-control">
        {enabled ? <Volume2 data-icon="inline-start" /> : <VolumeX data-icon="inline-start" />}
        <span>{enabled ? 'Ambience on' : 'Ambience off'}</span>
      </button>
      <label className="ambience-volume" title={`Ambience volume: ${volume}%`}>
        <span className="sr-only">Ambience volume: {volume}%</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          onChange={(event) => changeVolume(Number(event.target.value))}
          aria-label={`Ambience volume: ${volume}%`}
        />
        <output aria-hidden="true">{volume}%</output>
      </label>
    </div>
  );
}
