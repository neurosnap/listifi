import { db } from '../knex';

export async function backfillActivity() {
  const listsWithoutActivity = await db('lists')
    .select('lists.id', 'lists.created_at', 'lists.owner_id')
    .whereNotExists(function () {
      this.select('activity_feed.id')
        .from('activity_feed')
        .whereRaw('activity_feed.subject_id = lists.id');
    });

  console.log(`${listsWithoutActivity.length} lists without activity`);

  for (let i = 0; i < listsWithoutActivity.length; i += 1) {
    const { id, created_at, owner_id } = listsWithoutActivity[i];
    console.log(`backfilling activity feed from ${created_at}`);
    await db('activity_feed').insert({
      activity_type: 'list',
      subject_type: 'list',
      subject_id: id,
      creator_id: owner_id,
      created_at,
    });
  }
}

backfillActivity().then(() => db.destroy());
