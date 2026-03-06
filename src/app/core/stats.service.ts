import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ItemsService } from './items.service';
import { map } from 'rxjs/operators';

export interface StatsData {
  totalItems: number;
  pendingItems: number;
  approvedItems: number;
  rejectedItems?: number;
  totalUsers: number;
  itemsByType: {
    FOUND: number;
    LOST: number;
  };
}

export interface SummaryDto {
  days?: number;
  found30d?: number;
  lost30d?: number;
  pending?: number;
  total?: number;
  found?: number;
  lost?: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private api: ApiService, private itemsService: ItemsService) {}
  
  getStats() {
    return this.api.get<StatsData>('/stats');
  }
  
  getSummary(days: number = 30) {
    const safeDays = Math.max(Number(days) || 30, 1);
    const since = new Date();
    since.setDate(since.getDate() - safeDays);

    const parseDate = (value?: string) => {
      if (!value) return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    return this.itemsService.list().pipe(
      map((items: any[]) => {
        const found = items.filter(i => {
          if ((i?.type || '').toUpperCase() !== 'FOUND') return false;
          const d = parseDate(i?.dateFound || i?.createdAt);
          return !!d && d >= since;
        }).length;

        const lost = items.filter(i => {
          if ((i?.type || '').toUpperCase() !== 'LOST') return false;
          const d = parseDate(i?.dateLost || i?.createdAt);
          return !!d && d >= since;
        }).length;

        const pending = items.filter(i => (i?.status || '').toUpperCase() === 'PENDING').length;

        return {
          days: safeDays,
          total: items.length,
          found30d: found,
          lost30d: lost,
          pending,
          found,
          lost
        };
      })
    );
  }
  
  getCategoryStats() {
    return this.api.get('/stats/category');
  }
}
