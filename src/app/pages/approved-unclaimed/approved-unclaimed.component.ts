import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ItemsService } from '../../core/items.service';
import { AuthService } from '../../core/auth.service';
import { Item } from '../../models/item.model';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-approved-unclaimed',
  templateUrl: './approved-unclaimed.component.html',
  styleUrls: ['./approved-unclaimed.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ApprovedUnclaimedComponent implements OnInit {
  items: Item[] = [];
  loading = false;

  constructor(
    private itemsService: ItemsService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.itemsService.list({ status: 'APPROVED', syncedOnly: true }).pipe(
      catchError(() => of([]))
    ).subscribe({
      next: (items) => {
        const rawItems = Array.isArray(items) ? items : ((items as any)?.content || []);

        this.items = [...rawItems]
          .filter((item: Item) => (item?.status || '').toUpperCase() === 'APPROVED')
          .sort((a: Item, b: Item) => this.sortTimestamp(b) - this.sortTimestamp(a));
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      }
    });
  }

  requestClaim(item?: Item) {
    const itemId = item?.id;
    if (!itemId) return;
    if (!this.canRequestClaim(item)) return;

    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/items/${itemId}/claim` } });
      return;
    }

    if (this.auth.isAdmin()) {
      alert('Admin cannot claim items. Admin can only approve or reject claims.');
      return;
    }

    this.router.navigate([`/items/${itemId}/claim`]);
  }

  canRequestClaim(item?: Item): boolean {
    const type = (item?.type || '').toUpperCase();
    return type === 'FOUND';
  }

  statusClass(item?: Item): string {
    return (item?.status || '').toUpperCase() === 'APPROVED' ? 'state-approved' : 'state-rejected';
  }

  itemTypeLabel(item?: Item): string {
    return (item?.type || '-').toUpperCase();
  }

  eventDate(item?: Item): string {
    return item?.dateFound || item?.dateLost || '-';
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
}
