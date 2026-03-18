export function EarlyAccessBar() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        height: 34,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(6, 8, 12, 0.88)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.045)',
      }}
    >
      <style>{`
        @keyframes earlyPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(180,140,80,0.6); }
          50% { opacity: 0.55; box-shadow: 0 0 0 4px rgba(180,140,80,0); }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'hsl(38, 60%, 56%)',
          flexShrink: 0,
          animation: 'earlyPulse 2.6s ease-in-out infinite',
        }} />
        <span style={{
          fontSize: 10.5,
          letterSpacing: '0.10em',
          color: 'rgba(255,255,255,0.38)',
          fontWeight: 500,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          Early Access Build
        </span>
        <span style={{
          fontSize: 10.5,
          color: 'rgba(255,255,255,0.18)',
          whiteSpace: 'nowrap',
        }}>
          —
        </span>
        <span style={{
          fontSize: 10.5,
          letterSpacing: '0.04em',
          color: 'rgba(255,255,255,0.26)',
          whiteSpace: 'nowrap',
        }}>
          Some systems still under reconstruction
        </span>
      </div>
    </div>
  );
}
