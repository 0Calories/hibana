import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Flame } from '@/lib/supabase/rows';
import { formatTimer } from '@/lib/time';
import { getFlameLevel } from '../../flames/utils/levels';
import { FlameRenderer } from './flame-renderer';

type FlameState = 'paused' | 'burning' | 'completed';

type FlameCardProps = Pick<Flame, 'id' | 'name' | 'color' | 'level'> & {
  flameState: FlameState;
  burnSeconds: number;
  burnTargetSeconds: number;
};

export function FlameCard({
  name,
  level,
  color,
  flameState,
  burnSeconds,
  burnTargetSeconds,
}: FlameCardProps) {
  const flameLevel = getFlameLevel(level);
  const durationLabel = `${formatTimer(burnSeconds)} / ${formatTimer(burnTargetSeconds)}`;

  const progress =
    burnTargetSeconds > 0
      ? Math.round((burnSeconds / burnTargetSeconds) * 100)
      : 100;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col items-center text-center">
        <CardTitle>{name}</CardTitle>
        <CardDescription>{`Lv. ${level} - ${flameLevel.name}`}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <FlameRenderer state={flameState} level={0} colors={color} />
      </CardContent>

      <CardFooter className="flex flex-col items-center text-center gap-2">
        <p>{durationLabel}</p>
        <Progress value={progress} />
        <p>{`Burning ...`}</p>
      </CardFooter>
    </Card>
  );
}
