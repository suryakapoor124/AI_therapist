import React, { useRef, useEffect } from "react";
export default function AnimatedBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const PARTICLE_COUNT = 50;
        const MAX_DISTANCE = 150;

        const particles = [];

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const size = Math.random() * 3 + 1;
            const angle = Math.random() * Math.PI * 2;
            const orbitRadius = Math.random() * 50 + 20;
            const speed = (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1);

            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                baseX: Math.random() * width,
                baseY: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                radius: size,
                colorPhase: Math.random() * 360,
                angle,
                orbitRadius,
                orbitSpeed: speed,
            });
        }

        const draw = () => {
            const bgGradient = ctx.createLinearGradient(0, 0, width, height);
            bgGradient.addColorStop(0, "#0f0c29");
            bgGradient.addColorStop(0.5, "#302b63");
            bgGradient.addColorStop(1, "#24243e");
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, width, height);

            particles.forEach(p => {
                p.angle += p.orbitSpeed;
                const ox = Math.cos(p.angle) * p.orbitRadius;
                const oy = Math.sin(p.angle) * p.orbitRadius;

                const drawX = p.baseX + ox;
                const drawY = p.baseY + oy;

                p.colorPhase += 0.3;
                const color = `hsla(${p.colorPhase % 360}, 80%, 60%, 0.6)`;

                ctx.beginPath();
                ctx.arc(drawX, drawY, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 8;
                ctx.fill();

                p.baseX += p.vx;
                p.baseY += p.vy;
                if (p.baseX < 0 || p.baseX > width) p.vx *= -1;
                if (p.baseY < 0 || p.baseY > height) p.vy *= -1;

                p.drawX = drawX;
                p.drawY = drawY;
            });

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                for (let j = i + 1; j < PARTICLE_COUNT; j++) {
                    const dx = particles[i].drawX - particles[j].drawX;
                    const dy = particles[i].drawY - particles[j].drawY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MAX_DISTANCE) {
                        const alpha = 0.25 * (1 - dist / MAX_DISTANCE);
                        const lineColor = `hsla(${(particles[i].colorPhase + particles[j].colorPhase) / 2 % 360}, 80%, 60%, ${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].drawX, particles[i].drawY);
                        ctx.lineTo(particles[j].drawX, particles[j].drawY);
                        ctx.strokeStyle = lineColor;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
}