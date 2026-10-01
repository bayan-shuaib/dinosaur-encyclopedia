import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function AmbienceControl() {
  const [enabled, setEnabled] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      if (next && typeof window !== "undefined") {
        const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (Context) {
          audioContext.current ??= new Context();
          void audioContext.current.resume();
        }
      }
      return next;
    });
  }, []);

  useEffect(() => () => { void audioContext.current?.close(); }, []);

  return (
    <button type="button" onClick={toggle} aria-pressed={enabled} aria-label={enabled ? "Disable ambience" : "Enable ambience"} className="ambience-control">
      {enabled ? <Volume2 data-icon="inline-start" /> : <VolumeX data-icon="inline-start" />}
      <span>{enabled ? "Ambience on" : "Ambience off"}</span>
    </button>
  );
}
