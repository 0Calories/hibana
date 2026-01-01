import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  const todos = await supabase.from('todos').select();
  console.dir(todos);

  return (
    <div className="size-full p-4">
      <Image src={'/ember.png'} alt={'Ember'} width={64} height={64} />
      {todos.data?.map((todo) => (
        <Card key={todo.id}>{todo.content}</Card>
      ))}
    </div>
  );
}
