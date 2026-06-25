"use client";

import React, { useState, useEffect } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
}

export default function ClickAnimation() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const timestamp = Date.now();

      const newParticles: Particle[] = Array.from(
        { length: 16 },
        (_, index) => ({
          id: timestamp + index,
          x: e.clientX,
          y: e.clientY,
          angle: (360 / 16) * index,
        }),
      );

      setParticles((prev) => [...prev, ...newParticles]);

      setTimeout(() => {
        setParticles((prev) =>
          prev.filter(
            (particle) =>
              !newParticles.some(
                (newParticle) => newParticle.id === particle.id,
              ),
          ),
        );
      }, 800);
    };

    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  return (
    <>
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="spark-particle"
          style={
            {
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              "--angle": `${particle.angle}deg`,
            } as React.CSSProperties
          }
        />
      ))}

      <style jsx>{`
        .spark-particle {
          position: fixed;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;

          background: #0095ff;
          box-shadow:
            0 0 8px #00d9ff,
            0 0 16px #fff,
            0 0 24px #ff00bf;

          animation: sparkBurst 0.8s ease-out forwards;
        }

        .spark-particle:nth-child(3n) {
          background: #ffffff;
        }

        .spark-particle:nth-child(3n + 1) {
          background: #ff008c;
        }

        .spark-particle:nth-child(3n + 2) {
          background: #15ff00;
        }

        @keyframes sparkBurst {
          0% {
            transform: translate(-50%, -50%) rotate(var(--angle))
              translateX(0px) scale(1);
            opacity: 1;
          }

          100% {
            transform: translate(-50%, -50%) rotate(var(--angle))
              translateX(90px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
