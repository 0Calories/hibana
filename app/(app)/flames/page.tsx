'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getLocalDateString } from '@/lib/utils';
import {
  createFlame,
  deleteFlame,
  getFlamesForDay,
  setFlameCompletion,
  setFlameSchedule,
} from './flame-actions';
import {
  getFuelBudget,
  getRemainingFuelBudget,
  setFuelBudget,
} from './fuel-actions';
import { endSession, startSession } from './session-actions';

const SAMPLE_FLAME_ID = '92fe4034-3d8e-490c-aa1b-fb1ad41fc6a6';

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
      toast.success(`Deleted successfully`, {
        position: 'top-center',
      });
    } else {
      toast.error(result.error?.message, {
        position: 'top-center',
      });
    }
  };

  const handleSetFuelBudget = async () => {
    const result = await setFuelBudget(5, 90);
    console.dir(result);
    if (result.success) {
      toast.success(`Set budget successfully`, {
        position: 'top-center',
      });
    } else {
      toast.error(result.error?.message, {
        position: 'top-center',
      });
    }
  };

  const handleGetFuelBudget = async () => {
    const result = await getFuelBudget();
    console.dir(result);
    if (result.success) {
      toast.success(JSON.stringify(result.data), {
        position: 'top-center',
      });
    } else {
      toast.error(result.error?.message, {
        position: 'top-center',
      });
    }
  };

  const handleGetRemainingFuel = async () => {
    const result = await getRemainingFuelBudget('2026-01-23');
    console.dir(result);
    if (result.success) {
      toast.success(JSON.stringify(result.data), {
        position: 'top-center',
      });
    } else {
      toast.error(result.error?.message, {
        position: 'top-center',
      });
    }
  };

  const handleStartFlameSession = async () => {
    const dateString = getLocalDateString();
    const result = await startSession(SAMPLE_FLAME_ID, dateString);

    console.dir(result);
    if (result.success) {
      toast.success(JSON.stringify(result.data), {
        position: 'top-center',
      });
    } else {
      toast.error(result.error?.message, {
        position: 'top-center',
      });
    }
  };

  const handleEndFlameSession = async () => {
    const dateString = getLocalDateString();
    const result = await endSession(SAMPLE_FLAME_ID, dateString);

    console.dir(result);
    if (result.success) {
      toast.success(JSON.stringify(result.data), {
        position: 'top-center',
      });
    } else {
      toast.error(result.error?.message, {
        position: 'top-center',
      });
    }
  };

  const handleMarkFlameComplete = async () => {
    const dateString = getLocalDateString();
    const result = await setFlameCompletion(SAMPLE_FLAME_ID, dateString, true);

    console.dir(result);
    if (result.success) {
      toast.success(JSON.stringify(result.data), {
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
      <Button onClick={handleGetFuelBudget}>getFuelBudget</Button>
      <Button onClick={handleGetRemainingFuel}>getRemainingFuelBudget</Button>

      <div className="flex flex-row gap-2">
        <Button onClick={handleStartFlameSession}>Start Flame Sesh 🔥</Button>
        <Button onClick={handleEndFlameSession}>End Flame Sesh 🧯</Button>
        <Button onClick={handleMarkFlameComplete}>
          Mark Flame Complete ✅
        </Button>
      </div>
    </div>
  );
}
