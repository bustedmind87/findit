import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
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
  found30d?: number;
  lost30d?: number;
  pending?: number;
  total?: number;
  found?: number;
  lost?: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private api: ApiService) {}
  
  getStats() {
    return this.api.get<StatsData>('/stats');
  }
  
  getSummary(days: number = 30) {
    return this.api.get<any>('/stats/summary').pipe(
      map(data => ({
        total: data.total,
        found30d: data.found,
        lost30d: data.lost,
        pending: 0
      }))
    );
  }
  
  getCategoryStats() {
    return this.api.get('/stats/category');
  }
}
