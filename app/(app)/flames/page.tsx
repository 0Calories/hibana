'use client';

import { Button } from '@/components/ui/button';
import { createFlame } from './actions';

export default function TestPage() {
  const handleTest = async () => {
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

  return <Button onClick={handleTest}>Test createFlame</Button>;
}
