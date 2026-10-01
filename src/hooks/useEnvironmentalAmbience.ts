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

const VIDEO_IDS: Record<EnvironmentCategory, string> = {
  terrestrial: 'xNN7iTA57jM', aerial: 'oy0jX_I1CIU', aquatic: 'la_AEFO8m7U',
  'semi-aquatic': 'la_AEFO8m7U', coastal: 'la_AEFO8m7U', generic: 'xNN7iTA57jM',
};

export function useEnvironmentalAmbience(dino: Dinosaur | null, enabled: boolean, volume = 35) {
  const category = useMemo(() => dino ? getCategory(dino) : 'generic', [dino]);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const currentVideo = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const videoId = VIDEO_IDS[category];
    const autoplay = enabled ? 1 : 0;
    if (!iframeRef.current) {
      const iframe = document.createElement('iframe');
      iframe.setAttribute('title', 'Environmental ambience');
      iframe.setAttribute('allow', 'autoplay; encrypted-media');
      iframe.setAttribute('aria-hidden', 'true');
      iframe.tabIndex = -1;
      iframe.className = 'environmental-ambience-player';
      document.body.appendChild(iframe);
      iframeRef.current = iframe;
    }
    if (currentVideo.current !== videoId) {
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=${autoplay}&controls=0&loop=1&playlist=${videoId}&playsinline=1&rel=0`;
      currentVideo.current = videoId;
    }
  }, [category]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    const command = (func: string, args: unknown[] = []) => iframe.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*');
    command('setVolume', [volume]);
    if (enabled) command('playVideo');
    else command('pauseVideo');
  }, [enabled, volume, category]);

  useEffect(() => () => { iframeRef.current?.remove(); iframeRef.current = null; }, []);

  return { category };
}

export function getEnvironmentLabel(category: EnvironmentCategory) {
  return { terrestrial: 'Terrestrial ambience', aerial: 'Open-air ambience', aquatic: 'Aquatic ambience', 'semi-aquatic': 'River ambience', coastal: 'Coastal ambience', generic: 'Atmospheric ambience' }[category];
}

