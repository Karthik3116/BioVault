import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ScanLine } from 'lucide-react';

// A dictionary of user-facing messages for different states
const statusMessages = {
  idle: 'Position your face within the circle',
  scanning: 'Scanning... Please hold still',
  success: 'Verified!',
  error: 'Verification Failed',
};

// Main FaceScanner Component
export function FaceScanner({ status = 'idle' }) {
  const isFinalState = status === 'success' || status === 'error';

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
      <div className="relative w-72 h-72">
        {/* AnimatePresence handles the smooth transition between different states */}
        <AnimatePresence>
          {!isFinalState && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              {/* Rotating Arcs for a high-tech feel */}
              <motion.svg
                viewBox="0 0 200 200"
                className="absolute inset-0 w-full h-full"
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: status === 'scanning' ? 4 : 10,
                  ease: 'linear',
                }}
              >
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d="M 50, 100 a 50,50 0 1,1 100,0"
                  stroke="rgba(0, 255, 135, 0.5)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 50, 100 a 50,50 0 0,0 100,0"
                  stroke="rgba(0, 255, 135, 0.2)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </motion.svg>

              {/* Main "breathing" circle */}
              <motion.div
                className="w-full h-full rounded-full border-4 border-dashed border-green-400"
                animate={{
                  borderColor: status === 'scanning' ? 'rgba(52, 211, 153, 1)' : 'rgba(52, 211, 153, 0.4)',
                  scale: status === 'idle' ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: status === 'idle' ? 2.5 : 0.5,
                  repeat: status === 'idle' ? Infinity : 0,
                }}
              />

              {/* The Scanning Line - only visible when status is 'scanning' */}
              {status === 'scanning' && (
                <motion.div
                  className="absolute inset-x-0 top-0 w-full h-1.5 bg-cyan-300"
                  style={{ filter: 'url(#glow)' }}
                  initial={{ y: -10 }}
                  animate={{ y: '100%' }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.div>
          )}

          {/* Success State (Checkmark) */}
          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ scale: 0 }}
              animate={{ scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className="w-full h-full rounded-full bg-green-500 flex items-center justify-center"
            >
              <motion.svg width="120" height="120" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5" fill="none">
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                />
              </motion.svg>
            </motion.div>
          )}

          {/* Error State (X Mark) */}
          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              // Shake animation on error
              variants={{
                animate: { rotate: [0, -5, 5, -5, 5, 0] },
              }}
              className="w-full h-full rounded-full bg-red-500 flex items-center justify-center"
            >
              <motion.svg width="120" height="120" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5" fill="none">
                <motion.path d="M18 6L6 18" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                <motion.path d="M6 6l12 12" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
              </motion.svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Informative Text Message */}
      <div className="mt-6 text-center h-8">
        <AnimatePresence mode="wait">
          <motion.p
            key={status} // Use status as key to trigger animation on change
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className={`text-xl font-semibold ${
              status === 'success' ? 'text-green-500' : status === 'error' ? 'text-red-500' : 'text-gray-200'
            }`}
          >
            {statusMessages[status]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}