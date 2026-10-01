import { useEffect, useRef } from 'react';

export function useInteractionSounds(enabled = true) {
  const contextRef = useRef<AudioContext | null>(null);
  const lastHover = useRef<Element | null>(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const play = (frequency: number, duration: number, volume: number) => {
      const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Context) return;
      const ctx = contextRef.current ?? new Context();
      contextRef.current = ctx;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    };
    const onOver = (event: Event) => {
      const target = (event.target as Element).closest('button, a, [role="button"], [data-audio-interactive]');
      if (target && target !== lastHover.current) { lastHover.current = target; play(520, 0.045, 0.025); }
    };
    const onOut = (event: Event) => {
      if (!(event.relatedTarget as Element | null)?.closest?.('button, a, [role="button"], [data-audio-interactive]')) lastHover.current = null;
    };
    const onClick = (event: Event) => {
      if ((event.target as Element).closest('button, a, [role="button"], [data-audio-interactive]')) play(660, 0.06, 0.04);
    };
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('click', onClick);
      void contextRef.current?.close();
    };
  }, [enabled]);
}
