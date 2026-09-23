import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface Leaf {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  type: number;
}

const FallingLeaves: React.FC = () => {
  const [leaves, setLeaves] = useState<Leaf[]>([]);

  useEffect(() => {
    const newLeaves = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      delay: Math.random() * 15,
      duration: 12 + Math.random() * 20,
      size: 10 + Math.random() * 30,
      rotation: Math.random() * 360,
      type: Math.floor(Math.random() * 4),
    }));
    setLeaves(newLeaves);
  }, []);

  const leafColors = [
    '#fbbf24', // Amber gold
    '#f59e0b', // Deep gold
    '#d97706', // Warm amber
    '#eab308', // Royal yellow gold
    '#fde047', // Light gold shimmer
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          initial={{ 
            y: -50, 
            x: `${leaf.x}vw`, 
            rotate: leaf.rotation,
            opacity: 0 
          }}
          animate={{ 
            y: '110vh',
            x: [`${leaf.x}vw`, `${leaf.x + (Math.random() * 10 - 5)}vw`, `${leaf.x}vw`],
            rotate: leaf.rotation + 720,
            opacity: [0, 0.7, 0.7, 0]
          }}
          transition={{
            duration: leaf.duration,
            repeat: Infinity,
            delay: leaf.delay,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: leaf.size,
            height: leaf.size,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill={leafColors[leaf.type % leafColors.length]}
            className="w-full h-full opacity-40"
          >
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8.13,20C11.07,20 13.85,18.84 15.91,16.78C18.97,13.72 20.13,9.5 19.5,5.5C19.42,4.97 19.25,4.46 19,4C18.54,4.46 18.08,4.92 17.61,5.39C16.13,6.87 14.5,8.5 12.38,8.5C11.69,8.5 11.03,8.34 10.43,8.03C11.6,7.5 12.83,7 14.07,6.5C15.3,6 16.5,5.5 17.5,5C17.33,5.33 17.17,5.67 17,6C16.5,7 16,8 15.5,9C15,10 14.5,11 14,12C13.5,13 13,14 12.5,15C12,16 11.5,17 11,18C10.5,19 10,20 9.5,21C9,20 8.5,19 8,18C7.5,17 7,16 6.5,15C6,14 5.5,13 5,12C4.5,11 4,10 3.5,9C3,8 2.5,7 2,6C2.5,6.5 3,7 3.5,7.5C4,8 4.5,8.5 5,9C5.5,9.5 6,10 6.5,10.5C7,11 7.5,11.5 8,12C8.5,12.5 9,13 9.5,13.5C10,14 10.5,14.5 11,15C11.5,15.5 12,16 12.5,16.5C13,17 13.5,17.5 14,18C14.5,18.5 15,19 15.5,19.5C16,20 16.5,20.5 17,21" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default FallingLeaves;
