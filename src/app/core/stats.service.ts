import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { SummaryDto, CategoryStatsDto } from '../models/stats.model';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private api: ApiService) {}
  getSummary(days = 30) { return this.api.get<SummaryDto>(`/admin/stats/summary`, { days }); }
  getCategoryStats(days = 30) { return this.api.get<CategoryStatsDto[]>(`/admin/stats/category`, { days }); }
}
