import React from 'react';

type FeatureCardProps = {
  title: string;
  description: string;
};

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="glass-card rounded-[2rem] border border-white/10 p-8 shadow-glow transition duration-300 hover:-translate-y-1 hover:border-brand-400/30">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
    </div>
  );
}
