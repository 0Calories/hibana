import { parseLocalDate } from '@/lib/utils';
import { getWeeklySchedule } from './actions';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { getWeekStartDate } from './utils';

function formatWeekRange(weekStart: string) {
  const start = parseLocalDate(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const fmt = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  });

  // If same month, show "Feb 8 – 14", otherwise "Feb 28 – Mar 6"
  if (start.getMonth() === end.getMonth()) {
    const startStr = fmt.format(start);
    return `${startStr} – ${end.getDate()}`;
  }

  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export default async function SchedulePage() {
  const weekStart = getWeekStartDate();

  const scheduleResult = await getWeeklySchedule(weekStart);

  if (!scheduleResult.success) {
    return (
      <div className="size-full p-4 pb-24">
        <p className="text-muted-foreground">Failed to load schedule.</p>
      </div>
    );
  }

  const weekRange = formatWeekRange(weekStart);

  return (
    <div className="size-full p-4 pb-24 sm:p-6 lg:p-8 lg:pb-24">
      <div className="mb-4 flex items-center">
        <span className="text-sm text-muted-foreground">{weekRange}</span>
      </div>
      <WeeklyPlanner
        initialSchedule={scheduleResult.data}
        weekStart={weekStart}
      />
    </div>
  );
}
