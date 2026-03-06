import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../core/stats.service';
import { LoadingService } from '../../core/loading.service';
import { ItemsService } from '../../core/items.service';
import { Item } from '../../models/item.model';

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
  recentFoundItems: Item[] = [];
  recentLostItems: Item[] = [];
  filteredFoundItems: Item[] = [];
  filteredLostItems: Item[] = [];

  searchQuery = '';
  selectedCategory = '';
  selectedLocation = '';

  private readonly categoryMap: Record<number, string> = {
    1: 'Apparel & Outerwear',
    2: 'Technology & Accessories',
    3: 'Hydration & Food Containers'
  };

  constructor(
    private stats: StatsService,
    private loadingService: LoadingService,
    private itemsService: ItemsService
  ) {}

  ngOnInit() {
    this.loadSummary();
    this.loadRecentFoundItems();
    this.loadRecentLostItems();
  }

  applySearch(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    this.filteredFoundItems = this.recentFoundItems.filter(item => this.matchesSearch(item));
    this.filteredLostItems = this.recentLostItems.filter(item => this.matchesSearch(item));
  }

  onKeywordChange(value: string) {
    this.searchQuery = value;
    this.applySearch();
  }

  onCategoryChange(value: string) {
    this.selectedCategory = value;
    this.applySearch();
  }

  onLocationChange(value: string) {
    this.selectedLocation = value;
    this.applySearch();
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

  loadRecentFoundItems() {
    this.itemsService.listApprovedUnclaimedFound().subscribe({
      next: (items) => {
        this.recentFoundItems = [...items]
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 8);
        this.applySearch();
      },
      error: () => {
        this.recentFoundItems = [];
        this.applySearch();
      }
    });
  }

  loadRecentLostItems() {
    this.itemsService.list({ type: 'LOST', status: 'APPROVED' }).subscribe({
      next: (items) => {
        this.recentLostItems = [...items]
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 8);
        this.applySearch();
      },
      error: () => {
        this.recentLostItems = [];
        this.applySearch();
      }
    });
  }

  private matchesSearch(item: Item): boolean {
    const keyword = this.searchQuery.trim().toLowerCase();
    const itemCategory = this.getCategoryLabel(item).toLowerCase();
    const itemLocation = (item.location || '').toLowerCase();

    const keywordMatch = !keyword || [
      item.title || '',
      item.description || '',
      item.location || '',
      this.getCategoryLabel(item)
    ].some(value => value.toLowerCase().includes(keyword));

    const categoryMatch = !this.selectedCategory || itemCategory === this.selectedCategory.toLowerCase();
    const locationMatch = !this.selectedLocation || itemLocation === this.selectedLocation.toLowerCase();

    return keywordMatch && categoryMatch && locationMatch;
  }

  private getCategoryLabel(item: Item): string {
    if (item.categoryName) return item.categoryName;
    if (item.categoryId && this.categoryMap[item.categoryId]) return this.categoryMap[item.categoryId];
    return '';
  }
}
