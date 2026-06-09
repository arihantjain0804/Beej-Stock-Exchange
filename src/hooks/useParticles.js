import { useEffect } from 'react';

// Animates floating dust/pollen particles on a canvas element.
// Pass a ref to the <canvas> element you want to draw on.
export function useParticles(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles = [], raf;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(true); }

      reset(init) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H * 0.7 : -10;
        this.vy = 0.15 + Math.random() * 0.35;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.size = 0.8 + Math.random() * 1.4;
        this.opacity = 0.1 + Math.random() * 0.35;
        this.drift = Math.random() * Math.PI * 2;
        this.driftSpeed = 0.004 + Math.random() * 0.006;
      }

      update() {
        this.drift += this.driftSpeed;
        this.x += this.vx + Math.sin(this.drift) * 0.12;
        this.y += this.vy;
        if (this.y > H * 0.72) this.reset(false);
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,200,122,${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 120; i++) particles.push(new Particle());

    function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      raf = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
}