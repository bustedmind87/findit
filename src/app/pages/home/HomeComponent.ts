import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../core/stats.service';
import { LoadingService } from '../../core/loading.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class HomeComponent implements OnInit {
  summary: any = { totalItems: 0, found30d: 0, lost30d: 0, pending: 0 };
  displayValues: any = { found30d: 0, lost30d: 0, pending: 0 };
  isAnimating = false;

  constructor(private stats: StatsService, private loadingService: LoadingService) {}

  ngOnInit() {
    this.loadSummary();
  }

  loadSummary() {
    this.loadingService.show();
    this.stats.getSummary(30).subscribe(res => {
      this.summary = res;
      this.animateCounters();
      this.loadingService.hide();
    }, error => {
      this.loadingService.hide();
    });
  }

  animateCounters() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const duration = 1000; // 1 second animation
    const steps = 60; // 60 frames
    const stepDuration = duration / steps;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

      this.displayValues = {
        found30d: Math.floor(this.summary.found30d * easeProgress),
        lost30d: Math.floor(this.summary.lost30d * easeProgress),
        pending: Math.floor(this.summary.pending * easeProgress)
      };

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure final values are set correctly
        this.displayValues = {
          found30d: this.summary.found30d,
          lost30d: this.summary.lost30d,
          pending: this.summary.pending
        };
        this.isAnimating = false;
      }
    };

    requestAnimationFrame(animate);
  }
}
