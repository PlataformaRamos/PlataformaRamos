'use client'

import React from 'react'

interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = '', size = 40 }: LogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <style>
          {`
            @keyframes float-main {
              0%, 100% { transform: translateY(0px) scale(1); }
              50% { transform: translateY(-3px) scale(1.02); }
            }
            @keyframes float-left {
              0%, 100% { transform: translateY(0px) rotate(-2deg); }
              50% { transform: translateY(2px) rotate(2deg); }
            }
            @keyframes float-right {
              0%, 100% { transform: translateY(0px) rotate(3deg); }
              50% { transform: translateY(-2px) rotate(-3deg); }
            }
            @keyframes pulse-stroke {
              0%, 100% { stroke-opacity: 0.3; stroke-dashoffset: 0; }
              50% { stroke-opacity: 0.8; stroke-dashoffset: 20; }
            }
            .animate-main-diamond {
              transform-origin: 50px 45px;
              animation: float-main 4s ease-in-out infinite;
            }
            .animate-left-diamond {
              transform-origin: 28px 62px;
              animation: float-left 3.5s ease-in-out infinite;
            }
            .animate-right-diamond {
              transform-origin: 72px 32px;
              animation: float-right 4.5s ease-in-out infinite;
            }
            .animate-trace {
              stroke-dasharray: 40;
              animation: pulse-stroke 6s linear infinite;
            }
          `}
        </style>

        {/* Halo / Líneas de trazos elegantes de fondo */}
        <path
          d="M 50 12 C 67 15, 83 30, 83 48"
          stroke="url(#gradient-trace)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="animate-trace"
        />
        <path
          d="M 17 52 C 17 70, 33 85, 50 88"
          stroke="url(#gradient-trace)"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="animate-trace"
          style={{ animationDelay: '-3s' }}
        />

        {/* Rombo Izquierdo Abajo (Azul) */}
        <polygon
          points="28,50 35,62 28,74 21,62"
          fill="url(#gradient-blue)"
          className="animate-left-diamond shadow-lg"
          filter="url(#glow-blue)"
        />
        {/* Trazo del Rombo Izquierdo */}
        <path
          d="M 21 62 L 28 50 L 35 62"
          stroke="#3B82F6"
          strokeWidth="1"
          strokeLinecap="round"
          className="animate-left-diamond"
          opacity="0.5"
        />

        {/* Rombo Derecho Arriba (Azul) */}
        <polygon
          points="72,21 78,32 72,43 66,32"
          fill="url(#gradient-blue)"
          className="animate-right-diamond"
          filter="url(#glow-blue)"
        />
        {/* Trazo del Rombo Derecho */}
        <path
          d="M 72 43 L 66 32 L 72 21"
          stroke="#3B82F6"
          strokeWidth="1"
          strokeLinecap="round"
          className="animate-right-diamond"
          opacity="0.5"
        />

        {/* Rombo Central Grande (Rojo) */}
        <polygon
          points="50,22 61,45 50,68 39,45"
          fill="url(#gradient-red)"
          className="animate-main-diamond"
          filter="url(#glow-red)"
        />
        {/* Contorno sutil del Rombo Central */}
        <path
          d="M 39 45 L 50 22 L 61 45 L 50 68 Z"
          stroke="#EF4444"
          strokeWidth="1"
          strokeLinejoin="round"
          className="animate-main-diamond"
          opacity="0.3"
        />

        {/* GRADIENTES Y FILTROS */}
        <defs>
          {/* Degradado Rojo */}
          <linearGradient id="gradient-red" x1="50" y1="22" x2="50" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>

          {/* Degradado Azul */}
          <linearGradient id="gradient-blue" x1="28" y1="21" x2="72" y2="74" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Degradado para los trazos de fondo */}
          <linearGradient id="gradient-trace" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#64748B" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#F1F5F9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#64748B" stopOpacity="0" />
          </linearGradient>

          {/* Filtros de brillo (Glow) */}
          <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#EF4444" floodOpacity="0.3" />
          </filter>
          <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#3B82F6" floodOpacity="0.25" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}
