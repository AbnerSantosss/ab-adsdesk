import { useId } from 'react';

interface RaroPilatesIconProps {
  size?: number;
  className?: string;
  /** Texto para leitores de tela. Sem ele, o ícone é tratado como decorativo. */
  title?: string;
}

/**
 * Símbolo do Raro Pilates em SVG. Os ids dos gradientes vêm do useId, então vários
 * ícones na mesma página não disputam o mesmo id.
 */
export function RaroPilatesIcon({ size = 36, className = '', title }: RaroPilatesIconProps) {
  const uid = useId().replace(/:/g, '');
  const teal = `${uid}-teal`;
  const silverLight = `${uid}-silver-light`;
  const silverDark = `${uid}-silver-dark`;
  const shadow = `${uid}-shadow`;

  return (
    <svg
      viewBox="-12 16 364 364"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <radialGradient id={teal} cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#8CE8ED" />
          <stop offset="45%" stopColor="#56CCD3" />
          <stop offset="85%" stopColor="#3FAAB1" />
          <stop offset="100%" stopColor="#34969C" />
        </radialGradient>
        <linearGradient id={silverLight} x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#E0E5EA" />
          <stop offset="35%" stopColor="#BAC2C9" />
          <stop offset="70%" stopColor="#8E969D" />
          <stop offset="100%" stopColor="#6C7379" />
        </linearGradient>
        <linearGradient id={silverDark} x1="10%" y1="15%" x2="90%" y2="85%">
          <stop offset="0%" stopColor="#C4CBD1" />
          <stop offset="50%" stopColor="#959DA4" />
          <stop offset="85%" stopColor="#737A81" />
          <stop offset="100%" stopColor="#545B61" />
        </linearGradient>
        <filter id={shadow} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="3" stdDeviation="4" floodColor="#14262C" floodOpacity="0.25" />
        </filter>
      </defs>

      <g transform="translate(160, 160)">
        <circle cx="-5" cy="10" r="115" fill={`url(#${teal})`} filter={`url(#${shadow})`} />
        <circle cx="42" cy="-110" r="23" fill={`url(#${silverDark})`} filter={`url(#${shadow})`} />
        <path
          d="M -105 -50 C -65 -65, -15 -55, 30 -25 C 12 -42, -35 -56, -82 -44 Z"
          fill={`url(#${silverLight})`}
          filter={`url(#${shadow})`}
        />
        <path
          d="M -60 -35 C -10 -40, 28 -28, 48 10 C 75 60, 52 110, 24 135 C -12 165, -28 178, -32 205 C 12 188, 55 168, 78 135 C 112 85, 102 20, 68 -25 C 45 -55, 0 -62, -60 -35 Z"
          fill={`url(#${silverDark})`}
          filter={`url(#${shadow})`}
        />
        <path
          d="M -30 -15 C 15 -18, 42 15, 42 55 C 42 108, -8 135, -25 185 C -3 162, 28 140, 48 115 C 76 80, 78 35, 50 -5 C 28 -35, -5 -32, -30 -15 Z"
          fill={`url(#${silverLight})`}
          opacity="0.95"
        />
        <path
          d="M -15 170 C 25 185, 80 192, 142 150 C 100 178, 45 188, 5 182 Z"
          fill={`url(#${silverLight})`}
          filter={`url(#${shadow})`}
        />
      </g>
    </svg>
  );
}
