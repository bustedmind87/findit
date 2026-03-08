import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { StatsService } from '../../../core/stats.service';
import { Chart, ChartConfiguration } from 'chart.js';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ItemsService } from '../../../core/items.service';
import { ClaimsService, ClaimRecord } from '../../../core/claims.service';
import { Item } from '../../../models/item.model';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DashboardComponent implements AfterViewInit {
  summary: any = { found30d: 0, lost30d: 0, pending: 0, days: 30 };
  periodOptions = [7, 30, 90, 180, 365];
  selectedDays = 30;
  moderationLoading = false;
  moderationItems: Item[] = [];
  hasCategoryChartData = false;
  chart: Chart | null = null;
  @ViewChild('categoryChart') canvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private stats: StatsService,
    private itemsService: ItemsService,
    private claimsService: ClaimsService,
    private router: Router
  ) {}

  ngAfterViewInit() {
    this.loadSummary();
    this.loadModerationItems();
  }

  loadSummary() {
    this.stats.getSummary(this.selectedDays).subscribe({
      next: (res: any) => {
        this.summary = res;
      },
      error: (err) => {
        console.error('Failed to load stats', err);
      }
    });
  }

  onPeriodChange(value: string) {
    const parsed = Number(value);
    this.selectedDays = Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
    this.loadSummary();
    this.loadModerationItems();
  }

  loadCategoryChart() {
    this.stats.getCategoryStats().subscribe({
      next: (data: any) => {
        const rows = Array.isArray(data) ? data : [];
        if (rows.length === 0) {
          this.hasCategoryChartData = false;
          if (this.chart) {
            this.chart.destroy();
            this.chart = null;
          }
          return;
        }

        this.hasCategoryChartData = true;
        const labels = rows.map((d: any) => `Category ${d.categoryId}`);
        const counts = rows.map((d: any) => d.count);

        const config: ChartConfiguration = {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { label: 'Items Count', data: counts, backgroundColor: '#117A65' }
            ]
          },
          options: {
            responsive: true,
            interaction: { mode: 'index', intersect: false },
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true } }
          }
        };

        const ctx = this.canvas.nativeElement.getContext('2d')!;
        if (this.chart) this.chart.destroy();
        this.chart = new Chart(ctx, config);
      },
      error: (err) => {
        this.hasCategoryChartData = false;
        console.error('Failed to load category stats', err);
      }
    });
  }

  openReports(filter: string) {
    this.router.navigate(['/admin/reports'], { queryParams: { filter } });
  }

  private loadModerationItems() {
    this.moderationLoading = true;
    forkJoin({
      items: this.itemsService.list({ syncedOnly: true }).pipe(catchError(() => of([]))),
      claims: this.claimsService.listClaims().pipe(catchError(() => of([] as ClaimRecord[])))
    }).subscribe({
      next: ({ items, claims }) => {
        const rawItems = Array.isArray(items) ? items : ((items as any)?.content || []);
        const claimMap = this.buildClaimMap(Array.isArray(claims) ? claims : []);

        this.moderationItems = rawItems
          .map((item: Item) => {
            const claimInfo = item?.id != null ? claimMap.get(Number(item.id)) : undefined;
            const status = this.resolveModerationStatus(item, claimInfo?.status);
            return {
              ...item,
              status,
              claimedAt: item?.claimedAt || claimInfo?.claimedAt,
              claimedByName: item?.claimedByName || claimInfo?.claimedByName
            };
          })
          .filter((item: Item) => {
            const status = (item?.status || '').toUpperCase();
            return status === 'APPROVED' || status === 'CLAIMED' || status === 'REJECTED';
          })
          .filter((item: Item) => this.isInSelectedPeriod(item))
          .sort((a: Item, b: Item) => this.sortTimestamp(b) - this.sortTimestamp(a));

        this.moderationLoading = false;
      },
      error: () => {
        this.moderationItems = [];
        this.moderationLoading = false;
      }
    });
  }

  moderationStatusClass(item?: Item): string {
    const status = (item?.status || '').toUpperCase();
    if (status === 'CLAIMED') return 'state-claimed';
    if (status === 'REJECTED') return 'state-rejected';
    return 'state-approved';
  }

  itemTypeLabel(item?: Item): string {
    return (item?.type || '-').toUpperCase();
  }

  eventDate(item?: Item): string {
    return item?.dateFound || item?.dateLost || '-';
  }

  claimedByLabel(item?: Item): string {
    if ((item?.status || '').toUpperCase() !== 'CLAIMED') return '-';
    return item?.claimedByName || `User #${item?.claimedById ?? 'Unknown'}`;
  }

  private resolveModerationStatus(item: Item, claimStatus?: string): Item['status'] {
    const itemStatus = (item?.status || '').toUpperCase();
    const normalizedClaimStatus = (claimStatus || '').toUpperCase();

    if (itemStatus === 'CLAIMED' || item?.claimedById != null || normalizedClaimStatus === 'APPROVED') {
      return 'CLAIMED';
    }
    if (itemStatus === 'REJECTED') {
      return 'REJECTED';
    }
    if (itemStatus === 'APPROVED') {
      return 'APPROVED';
    }
    return item.status;
  }

  private sortTimestamp(item?: Item): number {
    const candidates = [item?.claimedAt, item?.dateFound, item?.dateLost, item?.createdAt]
      .filter((d): d is string => !!d)
      .map(d => new Date(d).getTime())
      .filter(t => Number.isFinite(t));

    if (candidates.length > 0) {
      return Math.max(...candidates);
    }

    return Number(item?.id || 0);
  }

  private isInSelectedPeriod(item?: Item): boolean {
    const candidates = [item?.claimedAt, item?.dateFound, item?.dateLost, item?.createdAt]
      .filter((d): d is string => !!d)
      .map(d => new Date(d).getTime())
      .filter(t => Number.isFinite(t));

    // Keep items with no parseable date visible instead of silently hiding them.
    if (candidates.length === 0) {
      return true;
    }

    const timestamp = Math.max(...candidates);
    const cutoff = Date.now() - (this.selectedDays * 24 * 60 * 60 * 1000);
    return timestamp >= cutoff;
  }

  private buildClaimMap(claims: ClaimRecord[]): Map<number, { status: string; claimedByName?: string; claimedAt?: string }> {
    const claimMap = new Map<number, { status: string; claimedByName?: string; claimedAt?: string }>();

    for (const claim of claims) {
      if (claim?.itemId == null) continue;
      const itemId = Number(claim.itemId);
      const claimedAt = claim.updatedAt || claim.createdAt;
      const existing = claimMap.get(itemId);

      if (!existing) {
        claimMap.set(itemId, {
          status: (claim.status || '').toUpperCase(),
          claimedByName: claim.claimerName,
          claimedAt
        });
        continue;
      }

      const existingTime = existing.claimedAt ? new Date(existing.claimedAt).getTime() : 0;
      const nextTime = claimedAt ? new Date(claimedAt).getTime() : 0;
      if (nextTime >= existingTime) {
        claimMap.set(itemId, {
          status: (claim.status || '').toUpperCase(),
          claimedByName: claim.claimerName || existing.claimedByName,
          claimedAt: claimedAt || existing.claimedAt
        });
      }
    }

    return claimMap;
  }
}
