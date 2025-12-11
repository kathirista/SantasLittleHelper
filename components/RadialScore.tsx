import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface RadialScoreProps {
  score: number;
}

export const RadialScore: React.FC<RadialScoreProps> = ({ score }) => {
  const data = [{ name: 'Score', value: score, fill: score > 75 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444' }];

  return (
    <div className="w-full h-64 relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="70%" 
          outerRadius="90%" 
          barSize={20} 
          data={data} 
          startAngle={90} 
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            clockWise
            dataKey="value"
            cornerRadius={10}
            label={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-5xl font-bold text-white">{score}</span>
        <span className="text-sm text-slate-400 uppercase tracking-widest mt-2">Suitability</span>
      </div>
    </div>
  );
};