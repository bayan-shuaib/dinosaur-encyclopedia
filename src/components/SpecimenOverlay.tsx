import { useState } from 'react';

interface SpecimenOverlayProps {
  children: React.ReactNode;
  label?: string;
}

function HexIcon() {
  return (
    <div style={{ position: 'relative', width: 48, height: 48, marginBottom: 18 }}>
      <style>{`
        @keyframes specimenSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes specimenPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0.3; }
        }
      `}</style>
      <svg
        viewBox="0 0 48 48"
        width="48"
        height="48"
        style={{ animation: 'specimenSpin 12s linear infinite', opacity: 0.65 }}
      >
        <polygon
          points="24,4 42,14 42,34 24,44 6,34 6,14"
          fill="none"
          stroke="hsl(38,55%,52%)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <polygon
          points="24,12 36,19 36,33 24,40 12,33 12,19"
          fill="none"
          stroke="hsl(38,55%,52%)"
          strokeWidth="0.7"
          strokeLinejoin="round"
          opacity="0.5"
        />
        <line x1="24" y1="4" x2="24" y2="44" stroke="hsl(38,55%,52%)" strokeWidth="0.4" opacity="0.3" />
        <line x1="6" y1="14" x2="42" y2="34" stroke="hsl(38,55%,52%)" strokeWidth="0.4" opacity="0.3" />
        <line x1="42" y1="14" x2="6" y2="34" stroke="hsl(38,55%,52%)" strokeWidth="0.4" opacity="0.3" />
        <circle cx="24" cy="24" r="2.5" fill="hsl(38,55%,52%)" opacity="0.7" style={{ animation: 'specimenPulse 2.4s ease-in-out infinite' }} />
      </svg>
    </div>
  );
}

export function SpecimenOverlay({ children, label }: SpecimenOverlayProps) {
  const [previewMode, setPreviewMode] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {children}

      {!previewMode && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(5, 7, 11, 0.80)',
            backdropFilter: 'blur(3.5px)',
            WebkitBackdropFilter: 'blur(3.5px)',
            borderRadius: 'inherit',
            animation: 'specimenFadeIn 0.22s ease-out forwards',
          }}
        >
          <style>{`
            @keyframes specimenFadeIn {
              from { opacity: 0; transform: scale(0.96); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>

          <HexIcon />

          <p style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.75)',
            marginBottom: 10,
            textAlign: 'center',
          }}>
            Specimen Under Reconstruction
          </p>

          {label && (
            <p style={{
              fontSize: 9.5,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'hsl(38,55%,52%)',
              marginBottom: 10,
              textAlign: 'center',
            }}>
              {label}
            </p>
          )}

          <p style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.35)',
            textAlign: 'center',
            maxWidth: 260,
            lineHeight: 1.65,
            marginBottom: 16,
            padding: '0 16px',
          }}>
            This module is currently being refined for scientific accuracy and precision.
          </p>

          <p style={{
            fontSize: 9.5,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.18)',
            marginBottom: 20,
          }}>
            Available in a future update
          </p>

          <button
            onClick={() => setPreviewMode(true)}
            style={{
              fontSize: 9.5,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.38)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 6,
              padding: '6px 14px',
              background: 'rgba(255,255,255,0.04)',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.38)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            Preview Mode
          </button>
        </div>
      )}

      {previewMode && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            zIndex: 30,
          }}
        >
          <button
            onClick={() => setPreviewMode(false)}
            style={{
              fontSize: 9,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.32)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 5,
              padding: '4px 10px',
              background: 'rgba(5,7,11,0.72)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              cursor: 'pointer',
            }}
          >
            Exit Preview
          </button>
        </div>
      )}
    </div>
  );
}
