'use client';

import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  ChevronLeftIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Flame } from '@/utils/supabase/rows';
import { archiveFlame } from '../../actions/flame-actions';
import { CreateFlameDialog } from '../../components/CreateFlameDialog';
import { StaticFlameIcon } from '../../components/StaticFlameIcon';
import { getFlameColors } from '../../utils/colors';
import { DeleteFlameDialog } from './DeleteFlameDialog';

type FilterValue = 'all' | 'active' | 'archived';
type SortValue = 'name' | 'newest' | 'oldest';

interface ManageFlamesListProps {
  flames: Flame[];
}

export function ManageFlamesList({ flames }: ManageFlamesListProps) {
  const t = useTranslations('flames.manage');

  const [filter, setFilter] = useState<FilterValue>('all');
  const [sort, setSort] = useState<SortValue>('newest');
  const [createOpen, setCreateOpen] = useState(false);
  const [editFlame, setEditFlame] = useState<Flame | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Flame | null>(null);

  const filteredAndSorted = useMemo(() => {
    let result = [...flames];

    if (filter === 'active') {
      result = result.filter((f) => !f.is_archived);
    } else if (filter === 'archived') {
      result = result.filter((f) => f.is_archived);
    }

    switch (sort) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      case 'oldest':
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        break;
    }

    return result;
  }, [flames, filter, sort]);

  const handleArchive = async (flame: Flame) => {
    const newArchived = !flame.is_archived;
    const result = await archiveFlame(flame.id, newArchived);
    if (result.success) {
      toast.success(newArchived ? t('archiveSuccess') : t('unarchiveSuccess'), {
        position: 'top-center',
      });
    } else {
      toast.error(t('archiveError'), { position: 'top-center' });
    }
  };

  const filters: { value: FilterValue; label: string }[] = [
    { value: 'all', label: t('filterAll') },
    { value: 'active', label: t('filterActive') },
    { value: 'archived', label: t('filterArchived') },
  ];

  const sorts: { value: SortValue; label: string }[] = [
    { value: 'newest', label: t('sortNewest') },
    { value: 'oldest', label: t('sortOldest') },
    { value: 'name', label: t('sortName') },
  ];

  return (
    <>
      {/* Page header */}
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/flames"
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1"
          aria-label={t('backToFlames')}
        >
          <ChevronLeftIcon className="size-5" />
        </Link>
        <h1 className="flex-1 text-lg font-semibold">{t('pageTitle')}</h1>
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <PlusIcon className="size-4" />
          {t('create')}
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-muted p-0.5">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  filter === f.value
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                {sorts.find((s) => s.value === sort)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {sorts.map((s) => (
                <DropdownMenuItem
                  key={s.value}
                  onClick={() => setSort(s.value)}
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* List */}
      {filteredAndSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm">
          {t('empty')}
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {filteredAndSorted.map((flame) => {
            const colors = getFlameColors(flame.color);
            return (
              <div
                key={flame.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/50 transition-colors"
              >
                {/* Mini flame icon */}
                <StaticFlameIcon
                  level={1}
                  colors={colors}
                  className="size-7 shrink-0"
                />

                {/* Name */}
                <span className="flex-1 text-sm font-medium truncate min-w-0">
                  {flame.name}
                </span>

                {/* Badges — fixed width area so they align */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {flame.is_archived && (
                    <Badge variant="destructive" className="text-xs">
                      {t('archived')}
                    </Badge>
                  )}
                  {flame.tracking_type === 'time' &&
                    flame.time_budget_minutes && (
                      <Badge variant="outline" className="text-xs tabular-nums">
                        {t('budgetMinutes', {
                          count: String(flame.time_budget_minutes),
                        })}
                      </Badge>
                    )}
                </div>

                {/* Actions menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      aria-label={t('actionsMenu')}
                    >
                      <EllipsisVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditFlame(flame)}>
                      <PencilIcon className="size-4" />
                      {t('edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchive(flame)}>
                      {flame.is_archived ? (
                        <ArchiveRestoreIcon className="size-4" />
                      ) : (
                        <ArchiveIcon className="size-4" />
                      )}
                      {flame.is_archived ? t('unarchive') : t('archive')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteTarget(flame)}
                    >
                      <TrashIcon className="size-4" />
                      {t('delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit dialog */}
      <CreateFlameDialog
        open={createOpen || !!editFlame}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            setEditFlame(undefined);
          }
        }}
        flame={editFlame}
      />

      {/* Delete dialog */}
      <DeleteFlameDialog
        flame={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </>
  );
}
