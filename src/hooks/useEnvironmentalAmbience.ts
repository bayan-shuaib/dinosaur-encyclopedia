import { useEffect, useMemo, useRef } from 'react';
import { Dinosaur } from '@/data/types';
import { getTaxonomyType } from '@/lib/taxonomy';

export type EnvironmentCategory = 'terrestrial' | 'aerial' | 'aquatic' | 'semi-aquatic' | 'coastal' | 'generic';

const getCategory = (dino: Dinosaur): EnvironmentCategory => {
  const habitat = dino.habitat?.toLowerCase() ?? '';
  const taxon = getTaxonomyType(dino);
  if (taxon === 'marine_reptile' || /ocean|sea|marine|underwater|lake/.test(habitat)) return 'aquatic';
  if (taxon === 'pterosaur') return 'aerial';
  if (/river|swamp|wetland|marsh/.test(habitat)) return 'semi-aquatic';
  if (/coast|shore|beach|coastal/.test(habitat)) return 'coastal';
  return 'terrestrial';
};

const TONES: Record<EnvironmentCategory, number> = {
  terrestrial: 110, aerial: 88, aquatic: 64, 'semi-aquatic': 78, coastal: 96, generic: 105,
};

export function useEnvironmentalAmbience(dino: Dinosaur | null, enabled: boolean) {
  const category = useMemo(() => dino ? getCategory(dino) : 'generic', [dino]);
  const contextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ gain: GainNode; source: AudioBufferSourceNode; filter: BiquadFilterNode } | null>(null);
  const fadeRef = useRef<number | null>(null);
  const previousCategory = useRef<EnvironmentCategory | null>(null);

  useEffect(() => {
    if (!enabled || !dino || typeof window === 'undefined') return;
    const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) return;
    const ctx = contextRef.current ?? new Context();
    contextRef.current = ctx;
    void ctx.resume();

    if (previousCategory.current === category && nodesRef.current) return;
    previousCategory.current = category;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let state = 0;
    for (let i = 0; i < data.length; i += 1) {
      state = state * 0.995 + (Math.random() * 2 - 1) * 0.005;
      data[i] = state * 0.7 + Math.sin(i / (ctx.sampleRate / TONES[category])) * 0.02;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = category === 'aquatic' ? 'lowpass' : 'bandpass';
    filter.frequency.value = category === 'aquatic' ? 500 : 900;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
    const old = nodesRef.current;
    nodesRef.current = { gain, source, filter };
    if (old) { old.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.35); window.setTimeout(() => old.source.stop(), 1400); }
    gain.gain.setTargetAtTime(0.12, ctx.currentTime, 0.55);

    return () => { source.stop(); };
  }, [category, dino, enabled]);

  useEffect(() => {
    if (!enabled && nodesRef.current && contextRef.current) {
      nodesRef.current.gain.gain.setTargetAtTime(0, contextRef.current.currentTime, 0.35);
      fadeRef.current = window.setTimeout(() => nodesRef.current?.source.stop(), 1400);
      previousCategory.current = null;
    }
  }, [enabled]);

  useEffect(() => () => {
    if (fadeRef.current) window.clearTimeout(fadeRef.current);
    nodesRef.current?.source.stop();
    void contextRef.current?.close();
  }, []);

  return { category };
}

export function getEnvironmentLabel(category: EnvironmentCategory) {
  return { terrestrial: 'Terrestrial ambience', aerial: 'Open-air ambience', aquatic: 'Aquatic ambience', 'semi-aquatic': 'River ambience', coastal: 'Coastal ambience', generic: 'Atmospheric ambience' }[category];
}
