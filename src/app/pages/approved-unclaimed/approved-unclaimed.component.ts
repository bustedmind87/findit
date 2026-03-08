import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ItemsService } from '../../core/items.service';
import { AuthService } from '../../core/auth.service';
import { Item } from '../../models/item.model';
import { ClaimsService, ClaimRecord } from '../../core/claims.service';
import { catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

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
  private claimMap = new Map<number, { status: string; claimedByName?: string; claimedAt?: string }>();

  constructor(
    private itemsService: ItemsService,
    private claimsService: ClaimsService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      items: this.itemsService.list({ syncedOnly: true }).pipe(catchError(() => of([]))),
      claims: this.claimsService.listClaims().pipe(catchError(() => of([] as ClaimRecord[])))
    }).subscribe({
      next: ({ items, claims }) => {
        const rawItems = Array.isArray(items) ? items : ((items as any)?.content || []);
        const allClaims = Array.isArray(claims) ? claims : [];
        this.claimMap = this.buildClaimMap(allClaims);

        this.items = [...rawItems]
          .map((item: Item) => {
            const claim = item?.id != null ? this.claimMap.get(Number(item.id)) : undefined;
            return {
              ...item,
              claimedAt: claim?.claimedAt,
              claimedByName: item?.claimedByName || claim?.claimedByName
            };
          })
          .sort((a, b) => this.sortTimestamp(b) - this.sortTimestamp(a));
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

  isClaimed(item?: Item): boolean {
    return (item?.status || '').toUpperCase() === 'CLAIMED' || item?.claimedById != null;
  }

  canRequestClaim(item?: Item): boolean {
    const type = (item?.type || '').toUpperCase();
    const status = (item?.status || '').toUpperCase();
    return type === 'FOUND' && status === 'APPROVED' && this.claimState(item) === 'AVAILABLE';
  }

  claimState(item?: Item): 'AVAILABLE' | 'PENDING' | 'CLAIMED' | 'REJECTED' {
    if (!item?.id) return 'AVAILABLE';
    if (this.isClaimed(item)) return 'CLAIMED';

    const claimInfo = this.claimMap.get(Number(item.id));
    const status = (claimInfo?.status || '').toUpperCase();

    if (status === 'PENDING') return 'PENDING';
    if (status === 'APPROVED') return 'CLAIMED';
    if (status === 'REJECTED') return 'REJECTED';
    return 'AVAILABLE';
  }

  claimStateLabel(item?: Item): string {
    const state = this.claimState(item);
    if (state === 'PENDING') return 'Pending approval';
    if (state === 'CLAIMED') return 'Claimed';
    if (state === 'REJECTED') return 'Rejected';
    const status = (item?.status || '').toUpperCase();
    if (status === 'PENDING') return 'Waiting for approval';
    if (status === 'REJECTED') return 'Rejected';
    if (status === 'APPROVED') return 'Approved';
    return 'Available';
  }

  claimStateClass(item?: Item): string {
    const state = this.claimState(item);
    if (state === 'PENDING') return 'state-pending';
    if (state === 'CLAIMED') return 'state-claimed';
    if (state === 'REJECTED') return 'state-rejected';
    const status = (item?.status || '').toUpperCase();
    if (status === 'PENDING') return 'state-pending';
    if (status === 'REJECTED') return 'state-rejected';
    return 'state-available';
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

  claimedByLabel(item?: Item): string {
    if (!this.isClaimed(item)) return '';
    return item?.claimedByName || `User #${item?.claimedById ?? 'Unknown'}`;
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
