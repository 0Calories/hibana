import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatTimer } from '@/lib/time';
import { getFlameLevel } from '../utils/levels';

type FlameState = 'paused' | 'burning' | 'completed';

type FlameColor = string;

type FlameCardProps = {
  name: string;
  level: number;
  color: string;
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
  const progress = Math.round(burnSeconds / burnTargetSeconds) * 100;
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col items-center text-center">
        <CardTitle>{name}</CardTitle>
        <CardDescription>{`Lv. ${level} - ${flameLevel.name}`}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>

      <CardFooter className="flex flex-col items-center text-center">
        <p>{durationLabel}</p>
        <Progress value={progress} />
        <p>{`Burning ...`}</p>
      </CardFooter>
    </Card>
  );
}
