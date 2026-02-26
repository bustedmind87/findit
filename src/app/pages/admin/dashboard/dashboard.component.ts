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
  summary: any = { totalItems:0, found30d:0, lost30d:0, pending:0 };
  chart: Chart | null = null;
  @ViewChild('categoryChart') canvas!: ElementRef<HTMLCanvasElement>;

  constructor(private stats: StatsService, private router: Router) {}

  ngAfterViewInit() {
    this.loadSummary();
    this.loadCategoryChart();
  }

  loadSummary() {
    this.stats.getSummary(30).subscribe(res => this.summary = res);
  }

  loadCategoryChart() {
    this.stats.getCategoryStats(30).subscribe(data => {
      const labels = data.map((d:any) => d.category);
      const found = data.map((d:any) => d.foundCount);
      const lost  = data.map((d:any) => d.lostCount);

      const config: ChartConfiguration = {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Found', data: found, backgroundColor: '#117A65' },
            { label: 'Lost',  data: lost,  backgroundColor: '#D68910' }
          ]
        },
        options: {
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { position: 'top' } },
          onClick: (evt, elements) => {
            if (elements.length) {
              const idx = (elements[0] as any).index;
              const category = labels[idx];
              this.router.navigate(['/admin/reports'], { queryParams: { category, days: 30 }});
            }
          },
          scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
        }
      };

      const ctx = this.canvas.nativeElement.getContext('2d')!;
      if (this.chart) this.chart.destroy();
      this.chart = new Chart(ctx, config);
    });
  }

  openReports(filter: string) {
    this.router.navigate(['/admin/reports'], { queryParams: { filter }});
  }
}
