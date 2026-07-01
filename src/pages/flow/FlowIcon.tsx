import React from 'react';

interface FlowIconProps {
  /** Material Symbols ligature name, e.g. "location_on" */
  name: string;
  className?: string;
  /** Use the filled variant of the glyph (matches active/selected states) */
  filled?: boolean;
}

/**
 * Thin wrapper around the "Material Symbols Outlined" web font used
 * throughout the FLOW. community design (see stitch_flow_global_community
 * mockups). Keeping this as one component avoids repeating the
 * font-variation-settings inline style on every icon usage.
 */
const FlowIcon: React.FC<FlowIconProps> = ({ name, className = '', filled = false }) => (
  <span
    className={`font-flow-icons leading-none select-none align-middle ${className}`}
    style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24` }}
    aria-hidden="true"
  >
    {name}
  </span>
);

export default FlowIcon;
