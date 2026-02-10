import type { FlameDefinition } from '../effects/types';
import { Blaze } from './Blaze';
import { Bonfire } from './Bonfire';
import { Candle } from './Candle';
import { Inferno } from './Inferno';
import { Star } from './Star';
import { Supernova } from './Supernova';
import { Torch } from './Torch';
import { Wisp } from './Wisp';

export const FLAME_REGISTRY: Record<number, FlameDefinition> = {
  1: Wisp,
  2: Candle,
  3: Torch,
  4: Bonfire,
  5: Blaze,
  6: Inferno,
  7: Star,
  8: Supernova,
};

export { Wisp, Candle, Torch, Bonfire, Blaze, Inferno, Star, Supernova };
