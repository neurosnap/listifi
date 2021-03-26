import { dbTypes } from '@app/types';
import { db } from '../knex';
import { extractOgData } from './og-data';

export async function createItems(
  listId: string,
  lastOrder: number,
  items: string[],
) {
  const transactions = [];
  let curOrder = lastOrder;
  for (let i = 0; i < items.length; i += 1) {
    const itemText = items[i];
    const ogData: any = await extractOgData(itemText);

    curOrder += 1;
    const order = curOrder;
    const data = {
      list_id: listId,
      text: itemText,
      order,
      metadata: {
        ogData,
      },
    };

    transactions.push(data);
  }

  if (transactions.length === 0) {
    return [];
  }

  const trx = await db.transaction();
  const results = await trx('list_items').insert(transactions, '*');
  await trx.commit();
  return results;
}

export function getLastOrder(items: dbTypes.list_items[]) {
  return items.reduce((highest, item) => {
    if (item.order && item.order > highest) {
      return item.order;
    }
    return highest;
  }, 0);
}
