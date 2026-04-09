import React from 'react';
import { motion } from 'framer-motion';

export default function Visualizer({ array, currentStep, isSearch }) {
  const maxVal = Math.max(...array, 1);

  return (
    <div className="visualizer-container">
      {array.map((value, idx) => {
        let stateClass = 'default';

        if (currentStep) {
          const { type, indices, sortedIndices, range } = currentStep;

          if (sortedIndices?.includes(idx)) stateClass = 'sorted';

          if (indices?.includes(idx)) {
            if      (type === 'COMPARE')              stateClass = 'compare';
            else if (type === 'SWAP' || type === 'OVERWRITE') stateClass = 'swap';
            else if (type === 'SET')                  stateClass = 'set';
            else if (type === 'FOUND')                stateClass = 'found';
            else if (type === 'SORTED')               stateClass = 'sorted';
          }

          if (range && (idx < range[0] || idx > range[1])) stateClass = 'inactive';
        }

        const heightPct = isSearch ? 100 : (value / maxVal) * 100;

        return (
          <motion.div
            layout
            key={isSearch ? idx : `${idx}-${value}`}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className={`bar-wrapper ${isSearch ? 'search-box' : ''} ${stateClass}`}
            style={{ height: isSearch ? '44px' : `${Math.max(8, heightPct)}%` }}
          >
            <div className={`bar ${stateClass}`}>
              <span className="bar-label">{value}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
