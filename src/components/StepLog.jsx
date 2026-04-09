import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StepLog({ currentStep, allLogs }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [allLogs]);

  return (
    <div className="log-panel">
      <div className="log-header">Step Log</div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep?.message || 'init'}
          className="current-msg"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 8 }}
          transition={{ duration: 0.18 }}
        >
          {currentStep?.message || 'Ready — press Run to start.'}
        </motion.div>
      </AnimatePresence>

      <div className="log-list" ref={listRef}>
        {allLogs.map((log, idx) => (
          <div key={idx} className="log-entry">
            <span className="log-num">#{idx + 1}</span>
            <span className="log-msg">{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
