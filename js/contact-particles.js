// Adapted from the supplied particle canvas for the contact section.
(() => {
  const section = document.getElementById('contact');
  const canvas = section.querySelector('.contact-particles');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let particles = [];
  let pointer = null;
  let visible = false;
  let frame = 0;
  let previousTime = 0;
  let elapsed = 0;
  let width, height;

  function draw(step) {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.x += p.vx * step;
      p.y += p.vy * step;
      if (pointer) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0 && distance < 100) {
          const push = (1 - distance / 100) * step / distance;
          p.x += dx * push;
          p.y += dy * push;
        }
      }
      p.x = (p.x + width) % width;
      p.y = (p.y + height) % height;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220,248,244,' + (0.42 + 0.13 * Math.sin(elapsed + p.phase)) + ')';
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (const b of particles.slice(i + 1)) {
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance >= 145) continue;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(173,221,224,' + (0.29 * (1 - distance / 145)) + ')';
        ctx.stroke();
      }
    }
  }

  function animate(now) {
    const step = previousTime ? Math.min(2, (now - previousTime) / 16.67) : 0;
    previousTime = now;
    elapsed += step * 0.014;
    draw(step);
    frame = requestAnimationFrame(animate);
  }

  function syncMotion() {
    cancelAnimationFrame(frame);
    previousTime = 0;
    if (visible && !document.hidden && !reduced.matches &&
        !document.documentElement.classList.contains('motion-paused')) {
      frame = requestAnimationFrame(animate);
    }
  }

  function resize() {
    width = section.clientWidth;
    height = section.clientHeight;
    if (!width || !height) return;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    particles = Array.from({length: Math.min(85, Math.ceil(width * height / 6500))}, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.55, vy: (Math.random() - 0.5) * 0.55,
      radius: 1 + Math.random() * 1.6, phase: Math.random() * 2 * Math.PI
    }));
    draw(0);
  }

  section.addEventListener('pointermove', event => {
    const bounds = section.getBoundingClientRect();
    pointer = {x: event.clientX - bounds.left, y: event.clientY - bounds.top};
  });
  section.addEventListener('pointerleave', () => { pointer = null; });
  resize();
  new ResizeObserver(resize).observe(section);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncMotion();
  }).observe(section);
  new MutationObserver(syncMotion).observe(document.documentElement, {
    attributes: true, attributeFilter: ['class']
  });
  document.addEventListener('visibilitychange', syncMotion);
  reduced.addEventListener('change', syncMotion);
})();
