import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

/**
 * Tự động filter theo channelId nếu không phải Super Admin.
 * Super Admin (channelId = null) thấy tất cả channels.
 *
 * @param qb        - QueryBuilder đang xây dựng
 * @param alias     - Table alias trong query (ví dụ: 'product', 'order')
 * @param channelId - null = Super Admin (no filter), string = Channel Admin
 */
export function applyChannelScope<T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  channelId: string | null,
): SelectQueryBuilder<T> {
  if (channelId !== null && channelId !== undefined) {
    qb.andWhere(`${alias}.channelId = :channelId`, { channelId });
  }
  return qb;
}
