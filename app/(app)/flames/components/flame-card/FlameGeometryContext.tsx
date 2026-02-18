'use client';

import { createContext, useContext } from 'react';

interface FlameGeometry {
  xBounds?: { min: number; max: number };
}

const FlameGeometryContext = createContext<FlameGeometry>({});

export const FlameGeometryProvider = FlameGeometryContext.Provider;

export function useFlameGeometry() {
  return useContext(FlameGeometryContext);
}
