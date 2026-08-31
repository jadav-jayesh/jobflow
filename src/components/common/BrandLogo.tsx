import React from 'react';
import { Box } from '@mui/material';

interface BrandLogoProps {
  size?: number;
  showShadow?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 36, showShadow = true }) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        filter: showShadow ? 'drop-shadow(0 2px 4px rgba(37, 99, 235, 0.25))' : 'none',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cp-grad-comp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Rounded Outer Tile */}
        <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#cp-grad-comp)" />

        {/* Briefcase Handle */}
        <path
          d="M18 15C18 13.3431 19.3431 12 21 12H27C28.6569 12 30 13.3431 30 15V17H18V15Z"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />

        {/* Dynamic Career Pulse Line */}
        <path
          d="M10 26H17L20.5 19L24.5 32L28 23.5L31 26H38"
          stroke="#ffffff"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulse Status Node */}
        <circle cx="38" cy="26" r="2.2" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.2" />
      </svg>
    </Box>
  );
};
