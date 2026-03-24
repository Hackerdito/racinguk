import React from 'react';
import { motion } from 'motion/react';
import { Car } from './types';

interface RaceTrackProps {
  cars: Car[];
  goal: number;
}

// A non-crossing path inspired by the user's image
const TRACK_PATH = "M 500,620 L 250,620 C 100,620 100,500 100,400 L 100,150 C 100,50 250,50 350,50 L 450,50 C 550,50 550,250 650,250 C 750,250 750,50 850,50 C 950,50 950,150 950,250 L 950,500 C 950,620 850,620 750,620 L 500,620 Z";

export const RaceTrack: React.FC<RaceTrackProps> = ({ cars, goal }) => {
  return (
    <div className="relative w-full aspect-[16/9] bg-emerald-600 rounded-[40px] p-4 shadow-inner overflow-hidden border-[12px] border-emerald-700">
      {/* Grass/Background details */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* The Track SVG */}
      <svg viewBox="0 0 1000 700" className="w-full h-full drop-shadow-2xl">
        {/* Outer Curb (Red/White) */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="#ef4444"
          strokeWidth="95"
          strokeDasharray="40,40"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="#fff"
          strokeWidth="95"
          strokeDasharray="40,40"
          strokeDashoffset="40"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Outer Track Border */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="#fff"
          strokeWidth="85"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Main Asphalt */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="#333"
          strokeWidth="80"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center Line (Dashed) */}
        <path
          d={TRACK_PATH}
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeDasharray="20,20"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-30"
        />
        
        {/* Start Line Area */}
        <g transform="translate(400, 620)">
          {/* Grey Border */}
          <rect x="-22" y="-42" width="44" height="84" fill="#374151" rx="2" />
          <rect x="-20" y="-40" width="40" height="80" fill="#4b5563" />
          {/* Yellow Bar */}
          <rect x="-20" y="-40" width="6" height="80" fill="#fbbf24" />
          {/* Checkered Pattern */}
          <rect x="-14" y="-40" width="34" height="80" fill="white" />
          {Array.from({ length: 8 }).map((_, i) => (
            <React.Fragment key={i}>
              <rect x="-14" y="-40 + (i * 10)" width="17" height="10" fill={i % 2 === 0 ? "black" : "transparent"} />
              <rect x="3" y="-40 + (i * 10)" width="17" height="10" fill={i % 2 === 0 ? "transparent" : "black"} />
            </React.Fragment>
          ))}
        </g>

        {/* Finish Line Area */}
        <g transform="translate(600, 620)">
          {/* Grey Border */}
          <rect x="-22" y="-42" width="44" height="84" fill="#374151" rx="2" />
          <rect x="-20" y="-40" width="40" height="80" fill="#4b5563" />
          {/* Yellow Bar */}
          <rect x="-20" y="-40" width="6" height="80" fill="#fbbf24" />
          {/* Checkered Pattern */}
          <rect x="-14" y="-40" width="34" height="80" fill="white" />
          {Array.from({ length: 8 }).map((_, i) => (
            <React.Fragment key={i}>
              <rect x="-14" y="-40 + (i * 10)" width="17" height="10" fill={i % 2 === 0 ? "black" : "transparent"} />
              <rect x="3" y="-40 + (i * 10)" width="17" height="10" fill={i % 2 === 0 ? "transparent" : "black"} />
            </React.Fragment>
          ))}
        </g>

        {/* Start/Finish Labels */}
        <text x="580" y="565" fill="white" fontSize="14" fontWeight="black" className="italic uppercase tracking-tighter select-none text-center">
          Finish
        </text>
        <text x="380" y="565" fill="white" fontSize="14" fontWeight="black" className="italic uppercase tracking-tighter select-none text-center">
          Start
        </text>

        {/* Cars on Path */}
        {cars.map((car, index) => (
          <CarMarker key={car.id} car={car} index={index} goal={goal} />
        ))}
      </svg>
    </div>
  );
};

const CarMarker: React.FC<{ car: Car, index: number, goal: number }> = ({ car, index, goal }) => {
  const pathRef = React.useRef<SVGPathElement>(null);
  const [point, setPoint] = React.useState({ x: 50, y: 250, angle: 0 });

  React.useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      // Calculate position along path (0 to 1) based on dynamic goal
      const progress = Math.min(1, car.sales / goal);
      // We want them to start at the beginning and end at the end
      const distance = length * progress;
      
      const p = pathRef.current.getPointAtLength(distance);
      // Get a point slightly ahead to calculate rotation
      const p2 = pathRef.current.getPointAtLength(Math.min(distance + 1, length));
      const angle = Math.atan2(p2.y - p.y, p2.x - p.x) * (180 / Math.PI);
      
      setPoint({ x: p.x, y: p.y, angle });
    }
  }, [car.sales, goal]);

  // Calculate a deterministic Y offset to prevent overlapping
  // We use the car's index to stagger them vertically slightly
  const yOffset = (index % 3) * 12 - 12;

  return (
    <>
      {/* Hidden path for calculation */}
      <path ref={pathRef} d={TRACK_PATH} fill="none" stroke="none" />
      
      <motion.g
        animate={{ x: point.x, y: point.y + yOffset, rotate: point.angle }}
        transition={{ type: 'spring', stiffness: 40, damping: 12 }}
      >
        {/* Car Shadow */}
        <rect x="-18" y="-10" width="36" height="20" rx="4" fill="black" opacity="0.3" transform="translate(2, 2)" />
        
        {/* Car Body */}
        <rect x="-16" y="-8" width="32" height="16" rx="4" fill={car.color} className="stroke-white/20 stroke-1" />
        
        {/* Windshield */}
        <rect x="4" y="-6" width="8" height="12" rx="1" fill="rgba(255,255,255,0.4)" />
        
        {/* Spoiler */}
        <rect x="-16" y="-8" width="4" height="16" rx="1" fill="rgba(0,0,0,0.2)" />

        {/* Car Label (Floating) */}
        <foreignObject x="-50" y="-45" width="100" height="30" transform={`rotate(${-point.angle})`}>
          <div className="flex flex-col items-center">
            <div className="bg-black/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-white/20 whitespace-nowrap">
              {car.name}
            </div>
            <div className="w-0.5 h-2 bg-black/80" />
          </div>
        </foreignObject>
      </motion.g>
    </>
  );
};
