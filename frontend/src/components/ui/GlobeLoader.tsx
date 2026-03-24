'use client'

import React, { useEffect, useRef } from 'react'

export function GlobeLoader() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number;
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        const handleResize = () => {
             w = canvas.width = window.innerWidth;
             h = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', handleResize);

        // Animation state setup
        const stars = Array.from({ length: 250 }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            s: Math.random() * 1.5, a: Math.random() * Math.PI * 2
        }));

        const nodes = Array.from({ length: 50 }, () => ({
            theta: Math.random() * Math.PI * 2,
            phi: Math.acos((Math.random() * 2) - 1),
            r: 160
        }));

        const flightPaths = Array.from({ length: 25 }, () => {
            const startNode = nodes[Math.floor(Math.random() * nodes.length)];
            const endNode = nodes[Math.floor(Math.random() * nodes.length)];
            return {
                start: startNode,
                end: endNode,
                progress: Math.random(),
                speed: 0.003 + Math.random() * 0.006,
                delay: Math.random() * 150
            };
        });

        const particles: Array<{x: number, y: number, vx: number, vy: number, life: number, maxLife: number}> = [];

        let time = 0;

        const draw = () => {
            time += 0.002;
            
            // Background
            const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
            bgGrad.addColorStop(0, '#02040a');
            bgGrad.addColorStop(1, '#050b1a');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, w, h);

            // Draw drifting stars
            stars.forEach(star => {
                star.y -= 0.1;
                if (star.y < 0) star.y = h;
                const alpha = Math.sin(time * 10 + star.a) * 0.3 + 0.3;
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.s, 0, Math.PI * 2);
                ctx.fill();
            });

            const cx = w / 2;
            const cy = h / 2 - 20;

            // Earth Glow Layer
            ctx.filter = 'blur(30px)';
            const radGrad = ctx.createRadialGradient(cx, cy, 80, cx, cy, 220);
            radGrad.addColorStop(0, 'rgba(0, 150, 255, 0.25)');
            radGrad.addColorStop(1, 'rgba(0, 50, 150, 0)');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, 220, 0, Math.PI * 2);
            ctx.fill();
            ctx.filter = 'none';

            // Earth Base Sphere
            const earthGrad = ctx.createRadialGradient(cx - 50, cy - 50, 20, cx, cy, 160);
            earthGrad.addColorStop(0, '#0a1d3a');
            earthGrad.addColorStop(1, '#010613');
            ctx.fillStyle = earthGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, 160, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(0, 200, 255, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 3D projection function turning spherical to screen coords
            const project = (theta: number, phi: number, r: number) => {
                const x = r * Math.sin(phi) * Math.cos(theta + time * 5);
                const y = r * Math.sin(phi) * Math.sin(theta + time * 5);
                const z = r * Math.cos(phi);
                // Perspective projection
                const fz = 400 / (400 + z);
                return { x: cx + x * fz, y: cy - z * fz, z, fz };
            };

            // Nodes (Cities)
            nodes.forEach(n => {
                const p = project(n.theta, n.phi, n.r);
                if (p.z > 0) return; // Hide behind earth
                ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5 * p.fz, 0, Math.PI*2);
                ctx.fill();
            });

            // Arcs / Flight paths & Airplanes
            flightPaths.forEach(path => {
                if (path.delay > 0) {
                    path.delay--;
                    return;
                }
                const p1 = project(path.start.theta, path.start.phi, path.start.r + 2);
                const p2 = project(path.end.theta, path.end.phi, path.end.r + 2);
                
                // Only draw if front-facing
                if (p1.z > 0 || p2.z > 0) return; 

                const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
                const midX = (p1.x + p2.x) / 2;
                const midY = (p1.y + p2.y) / 2 - (dist * 0.3); // Arc height relative to distance

                // Draw path line
                ctx.strokeStyle = 'rgba(0, 210, 255, 0.1)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
                ctx.stroke();

                // Airplane moving
                path.progress += path.speed;
                if(path.progress >= 1) {
                    path.progress = 0;
                    path.delay = Math.random() * 200;
                } else {
                    const t = path.progress;
                    const ax = (1-t)*(1-t)*p1.x + 2*(1-t)*t*midX + t*t*p2.x;
                    const ay = (1-t)*(1-t)*p1.y + 2*(1-t)*t*midY + t*t*p2.y;

                    // Airplane glow
                    ctx.shadowColor = '#00ffff';
                    ctx.shadowBlur = 12;
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(ax, ay, 2.5, 0, Math.PI*2);
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    // Emit particles behind the plane
                    if (Math.random() > 0.5) {
                        particles.push({
                            x: ax, y: ay,
                            vx: (Math.random() - 0.5) * 0.5,
                            vy: (Math.random() - 0.5) * 0.5 + 0.5,
                            life: 0,
                            maxLife: 30 + Math.random() * 20
                        });
                    }
                }
            });

            // Update and draw magical particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.life++;
                p.x += p.vx;
                p.y += p.vy;
                if (p.life >= p.maxLife) {
                    particles.splice(i, 1);
                    continue;
                }
                const alpha = 1 - (p.life / p.maxLife);
                ctx.fillStyle = `rgba(0, 230, 255, ${alpha * 0.5})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1, 0, Math.PI*2);
                ctx.fill();
            }
            
            // Text overlay - pulsing cinematic text
            const pulse = Math.sin(time * 10) * 0.2 + 0.8;
            ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
            ctx.font = '300 20px "Outfit", system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.letterSpacing = '8px';
            ctx.fillText('PREPARING JOURNEY', cx, cy + 240);
            
            const dots = ['.', '..', '...'][Math.floor(time * 20) % 3];
            ctx.fillStyle = 'rgba(0, 200, 255, 0.8)';
            ctx.fillText(dots, cx + 130, cy + 240);

            animationFrameId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        }
    }, [])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02040a] overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
        </div>
    )
}
