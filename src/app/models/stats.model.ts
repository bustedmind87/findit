export interface SummaryDto {
  totalItems: number;
  found30d: number;
  lost30d: number;
  pending: number;
}
export interface CategoryStatsDto {
  category: string;
  foundCount: number;
  lostCount: number;
}
