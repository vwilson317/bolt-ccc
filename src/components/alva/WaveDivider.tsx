import React from 'react';

/** Gentle dune/wave shape used to transition the sunrise gradient into a solid sand section. */
const WaveDivider: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 1440 100"
    preserveAspectRatio="none"
    className={className}
    aria-hidden="true"
  >
    <path d="M0,56 C320,110 1120,0 1440,56 L1440,100 L0,100 Z" fill="currentColor" />
  </svg>
);

export default WaveDivider;
