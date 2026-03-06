import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { StatsService } from '../../../core/stats.service';
import { Chart, ChartConfiguration } from 'chart.js';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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
  chart: Chart | null = null;
  @ViewChild('categoryChart') canvas!: ElementRef<HTMLCanvasElement>;

  constructor(private stats: StatsService, private router: Router) {}

  ngAfterViewInit() {
    this.loadSummary();
    this.loadCategoryChart();
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
  }

  loadCategoryChart() {
    this.stats.getCategoryStats().subscribe({
      next: (data: any) => {
        const labels = data.map((d: any) => `Category ${d.categoryId}`);
        const counts = data.map((d: any) => d.count);

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
        console.error('Failed to load category stats', err);
      }
    });
  }

  openReports(filter: string) {
    this.router.navigate(['/admin/reports'], { queryParams: { filter } });
  }
}
