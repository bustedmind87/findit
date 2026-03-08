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
  allFoundItems: Item[] = [];
  allLostItems: Item[] = [];
  recentFoundItems: Item[] = [];
  recentLostItems: Item[] = [];
  filteredFoundItems: Item[] = [];
  filteredLostItems: Item[] = [];
  titleSuggestions: Item[] = [];
  searchingTitles = false;

  searchQuery = '';
  selectedCategory = '';
  selectedLocation = '';
  private titleSearchTimer: ReturnType<typeof setTimeout> | null = null;

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

    const foundMatches = this.allFoundItems.filter(item => this.matchesSearch(item));
    const lostMatches = this.allLostItems.filter(item => this.matchesSearch(item));

    const hasFilters = this.hasActiveSearchFilters();
    this.filteredFoundItems = hasFilters ? foundMatches : foundMatches.slice(0, 8);
    this.filteredLostItems = hasFilters ? lostMatches : lostMatches.slice(0, 8);
  }

  onKeywordChange(value: string) {
    this.searchQuery = value;
    this.applySearch();
    this.searchTitlesFromDb();
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
    this.itemsService.list({ type: 'FOUND', syncedOnly: true }).subscribe({
      next: (items) => {
        this.allFoundItems = [...items]
          .filter(item => {
            const status = (item?.status || '').toUpperCase();
            return status === 'APPROVED' || status === 'CLAIMED';
          })
          .sort((a, b) => (b.id || 0) - (a.id || 0));
        this.recentFoundItems = [...this.allFoundItems].slice(0, 8);
        this.applySearch();
      },
      error: () => {
        this.allFoundItems = [];
        this.recentFoundItems = [];
        this.filteredFoundItems = [];
        this.applySearch();
      }
    });
  }

  loadRecentLostItems() {
    this.itemsService.list({ type: 'LOST', syncedOnly: true }).subscribe({
      next: (items) => {
        this.allLostItems = [...items]
          .filter(item => {
            const status = (item?.status || '').toUpperCase();
            return status === 'APPROVED' || status === 'CLAIMED';
          })
          .sort((a, b) => (b.id || 0) - (a.id || 0));
        this.recentLostItems = [...this.allLostItems].slice(0, 8);
        this.applySearch();
      },
      error: () => {
        this.allLostItems = [];
        this.recentLostItems = [];
        this.filteredLostItems = [];
        this.applySearch();
      }
    });
  }

  private hasActiveSearchFilters(): boolean {
    return !!(this.searchQuery.trim() || this.selectedCategory || this.selectedLocation);
  }

  onSuggestionSelected() {
    this.titleSuggestions = [];
  }

  private searchTitlesFromDb() {
    if (this.titleSearchTimer) {
      clearTimeout(this.titleSearchTimer);
    }

    const keyword = this.searchQuery.trim();
    if (keyword.length < 3) {
      this.searchingTitles = false;
      this.titleSuggestions = [];
      return;
    }

    this.titleSearchTimer = setTimeout(() => {
      this.searchingTitles = true;
      this.itemsService.list({ q: keyword, syncedOnly: true }).subscribe({
        next: (items) => {
          this.titleSuggestions = [...items]
            .filter(item => !!item?.id)
            .sort((a, b) => (b.id || 0) - (a.id || 0))
            .slice(0, 8);
          this.searchingTitles = false;
        },
        error: () => {
          this.titleSuggestions = [];
          this.searchingTitles = false;
        }
      });
    }, 250);
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

  statusLabel(item: Item): string {
    return (item?.status || 'PENDING').toUpperCase();
  }

  statusClass(item: Item): string {
    const status = this.statusLabel(item);
    if (status === 'CLAIMED') return 'status-claimed';
    if (status === 'REJECTED') return 'status-rejected';
    if (status === 'PENDING') return 'status-pending';
    return 'status-approved';
  }
}
