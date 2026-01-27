import { Card, CardHeader } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/server';

export default async function FlamesPage() {
  const supabase = await createClient();
  const result = await supabase.from('flames').select();

  if (!result) {
    return 'Loading ...';
  }

  const flames = result.data;

  return (
    <div className="size-full p-4 pb-24">
      Your Flames
      {flames?.map((flame) => (
        <Card key={flame.id}>
          <CardHeader>{flame.name}</CardHeader>
        </Card>
      ))}
    </div>
  );
}
