'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createFlame, setFlameSchedule } from './actions';

export default function TestPage() {
  const handleCreateFlame = async () => {
    const result = await createFlame({
      name: 'Test Flame',
      tracking_type: 'time',
      is_daily: true,
      color: null,
      count_target: null,
      count_unit: null,
      icon: null,
      time_budget_minutes: null,
    });
    console.log(result);
  };

  const handleSetFlameSchedule = async () => {
    const result = await setFlameSchedule(
      'ae3a55e2-46e0-40d8-8885-cd2f7a98685a',
      [1, 2, 4, 5],
    );

    if (result.success) {
      toast.success(`Flame schedule set successfully!`, {
        position: 'top-center',
      });
    }
  };

  return (
    <div>
      <Button onClick={handleCreateFlame}>createFlame</Button>
      <Button onClick={handleSetFlameSchedule}>setFlameSchedule</Button>
    </div>
  );
}
