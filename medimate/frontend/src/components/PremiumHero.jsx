import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FloatingViz = () => {
  // subtle 3D parallax using framer motion transforms
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50,50], [8, -8]);
  const rotateY = useTransform(x, [-50,50], [-8, 8]);

  return (
    <motion.div className="glass-viz"
      style={{ rotateX, rotateY, x, y }}
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) - rect.width/2;
        const py = (e.clientY - rect.top) - rect.height/2;
        x.set(px/10); y.set(py/10);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      <motion.div className="viz-shape" layoutId="viz-shape"/>
    </motion.div>
  )
}

export default function PremiumHero(){
  const navigate = useNavigate();
  return (
    <section className="premium-hero-root">
      <div className="morph-bg" aria-hidden />
      <div className="floating-glow glow-1" aria-hidden />
      <div className="floating-glow glow-2" aria-hidden />

      <div className="premium-card">
        <div className="hero-left">
          <div className="eyebrow">Introducing</div>
          <h1 className="hero-title">Medimate — a future of calm, beautiful care</h1>
          <p className="hero-sub">A premium interface that blends clarity with cinematic visuals. Micro-interactions, glass surfaces, and morphing gradients give every action a gentle, tactile feeling.</p>

          <div className="cta-row">
            <button className="btn-primary" aria-label="Get started" onClick={() => navigate('/login')}>Get started</button>
            <button className="btn-ghost" aria-label="Execute Queries" onClick={() => navigate('/sql-queries')}>Execute Queries</button>
          </div>

          <div className="micro">No sign-up required • Explore the demo • Built for modern devices</div>
        </div>

        <div className="hero-right">
          <FloatingViz />
        </div>
      </div>
    </section>
  )
}
