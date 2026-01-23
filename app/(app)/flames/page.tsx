'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  createFlame,
  deleteFlame,
  getFlamesForDay,
  setFlameSchedule,
} from './actions';
import { setFuelBudget } from './fuel-actions';

const SAMPLE_FLAME_ID = 'ae3a55e2-46e0-40d8-8885-cd2f7a98685a';

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
    const result = await setFlameSchedule(SAMPLE_FLAME_ID, [1, 2, 4, 5]);

    if (result.success) {
      toast.success(`Flame schedule set successfully!`, {
        position: 'top-center',
      });
    }
  };

  const handleGetFlamesForThursday = async () => {
    const result = await getFlamesForDay('2026-01-22');
    console.dir(result);
    if (result.success) {
      toast.success(
        `Flame data for Thurs: ${result.data?.map((entry) => `${entry.name}, `)}`,
        {
          position: 'top-center',
        },
      );
    } else {
      toast.error(result.error?.message, {
        position: 'top-center',
      });
    }
  };

  const handleDeleteFlame = async () => {
    const result = await deleteFlame(SAMPLE_FLAME_ID);
    console.dir(result);
    if (result.success) {
      toast.success(`Deleted sucessfully`, {
        position: 'top-center',
      });
    } else {
      toast.error(result.error?.message, {
        position: 'top-center',
      });
    }
  };

  const handleSetFuelBudget = async () => {
    const result = await setFuelBudget(4, 90);
    console.dir(result);
    if (result.success) {
      toast.success(`Set budget sucessfully`, {
        position: 'top-center',
      });
    } else {
      toast.error(result.error?.message, {
        position: 'top-center',
      });
    }
  };

  return (
    <div>
      <Button onClick={handleCreateFlame}>createFlame</Button>
      <Button onClick={handleSetFlameSchedule}>setFlameSchedule</Button>
      <Button onClick={handleGetFlamesForThursday}>getFlamesForThursday</Button>
      <Button onClick={handleDeleteFlame}>deleteFlame</Button>
      <Button onClick={handleSetFuelBudget}>setFuelBudget</Button>
    </div>
  );
}
