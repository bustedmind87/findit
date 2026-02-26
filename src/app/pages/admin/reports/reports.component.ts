import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  template: `
    <main class="container">
      <h1>Reports</h1>
      <p *ngIf="category">Filtered by category: <strong>{{category}}</strong> (last 30 days)</p>
      <p>Report UI and CSV/Excel export will appear here.</p>
    </main>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class ReportsComponent implements OnInit {
  category?: string;
  constructor(private route: ActivatedRoute) {}
  ngOnInit() { this.route.queryParamMap.subscribe(q => this.category = q.get('category') || undefined); }
}
