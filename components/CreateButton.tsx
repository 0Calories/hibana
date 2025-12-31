import {
  CalendarCheckIcon,
  ListTodoIcon,
  NotebookPenIcon,
  PlusIcon,
  SparklesIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';

export function CreateButton() {
  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="radius-lg size-10">
            <PlusIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="m-4 md:m-0 md:mb-2">
          <DropdownMenuLabel>Create new</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <CreateTodoButton />
          <CreateNoteButton />
          <CreateHabitButton />
          <CreateScheduleButton />
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create a new Todo item</DialogTitle>
          <DialogDescription>
            Fill out the form to keep track of something you need to do
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="What needs to be done?" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Description</Label>
            <Textarea
              id="content"
              placeholder="Add more optional details about this task ..."
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input id="due_date" type="date" />
          </div>
        </form>

        <div className="flex-col gap-2 sm:flex-row sm:justify-end mt-2">
          <Button type="submit" className="mr-2">
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateTodoButton() {
  return (
    <DialogTrigger asChild>
      <DropdownMenuItem>
        <ListTodoIcon /> Todo
      </DropdownMenuItem>
    </DialogTrigger>
  );
}

function CreateNoteButton() {
  return (
    <DropdownMenuItem>
      <NotebookPenIcon /> Note
    </DropdownMenuItem>
  );
}

function CreateHabitButton() {
  return (
    <DropdownMenuItem>
      <SparklesIcon />
      Habit
    </DropdownMenuItem>
  );
}

function CreateScheduleButton() {
  return (
    <DropdownMenuItem>
      <CalendarCheckIcon /> Schedule
    </DropdownMenuItem>
  );
}
