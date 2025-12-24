import { createClient } from '@/utils/supabase/server';

export default async function Notes() {
  const supabase = await createClient();

  const { data: notes } = await supabase.from('notes').select();

  return (
    <ul>
      {notes?.map((note) => (
        <li key={note.id}>{JSON.stringify(note)}</li>
      ))}
    </ul>
  );
}
