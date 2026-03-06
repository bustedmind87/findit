import { Component, OnInit } from '@angular/core';
import { ItemsService } from '../../core/items.service';
import { AuthService } from '../../core/auth.service';
import { ClaimsService, ClaimRecord } from '../../core/claims.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-items',
  templateUrl: './my-items.component.html',
  styleUrls: ['./my-items.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class MyItemsComponent implements OnInit {
  items: any[] = [];
  pendingClaims: ClaimRecord[] = [];
  itemTitleMap: Record<number, string> = {};
  loading = false;
  processingItemIds: number[] = [];
  processingClaimIds: number[] = [];
  isAdmin = false;

  constructor(
    private itemsService: ItemsService,
    private claimsService: ClaimsService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.isAdmin = user.role === 'admin';

    this.loading = true;
    const params = this.isAdmin ? undefined : { owner: user.id };
    this.itemsService.list(params).subscribe({
      next: (res: any) => {
        // Handle both array and {content: array} responses
        this.items = Array.isArray(res) ? res : (res?.content || []);
        this.itemTitleMap = this.items.reduce((acc: Record<number, string>, item: any) => {
          if (item?.id != null) {
            acc[Number(item.id)] = item.title || `Item #${item.id}`;
          }
          return acc;
        }, {});

        if (this.isAdmin) {
          this.loadPendingClaims();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  approveItem(itemId?: number | string) {
    const normalizedId = Number(itemId);
    if (!normalizedId) return;
    if (!this.processingItemIds.includes(normalizedId)) {
      this.processingItemIds.push(normalizedId);
    }
    this.itemsService.updateStatus(normalizedId, 'APPROVED').subscribe({
      next: () => this.refreshItemsAfterAction(normalizedId),
      error: (err) => {
        this.processingItemIds = this.processingItemIds.filter(id => id !== normalizedId);
        alert(err?.error?.error || err?.message || 'Failed to approve item.');
      }
    });
  }

  rejectItem(itemId?: number | string) {
    const normalizedId = Number(itemId);
    if (!normalizedId) return;
    if (!this.processingItemIds.includes(normalizedId)) {
      this.processingItemIds.push(normalizedId);
    }
    this.itemsService.updateStatus(normalizedId, 'REJECTED').subscribe({
      next: () => this.refreshItemsAfterAction(normalizedId),
      error: (err) => {
        this.processingItemIds = this.processingItemIds.filter(id => id !== normalizedId);
        alert(err?.error?.error || err?.message || 'Failed to reject item.');
      }
    });
  }

  reviewClaim(claimId: number, status: 'APPROVED' | 'REJECTED') {
    if (!this.processingClaimIds.includes(claimId)) {
      this.processingClaimIds.push(claimId);
    }
    this.claimsService.updateClaimStatus(claimId, status).subscribe({
      next: () => {
        this.processingClaimIds = this.processingClaimIds.filter(id => id !== claimId);
        this.ngOnInit();
      },
      error: () => {
        this.processingClaimIds = this.processingClaimIds.filter(id => id !== claimId);
      }
    });
  }

  isItemProcessing(itemId?: number) {
    return itemId != null && this.processingItemIds.includes(itemId);
  }

  isClaimProcessing(claimId: number) {
    return this.processingClaimIds.includes(claimId);
  }

  private loadPendingClaims() {
    this.claimsService.listClaims({ status: 'PENDING' }).subscribe({
      next: (claims) => {
        this.pendingClaims = claims || [];
      },
      error: () => {
        this.pendingClaims = [];
      }
    });
  }

  private refreshItemsAfterAction(itemId: number) {
    this.processingItemIds = this.processingItemIds.filter(id => id !== itemId);
    const idx = this.items.findIndex(i => Number(i.id) === itemId);
    if (idx >= 0) {
      const item = this.items[idx];
      this.items[idx] = { ...item };
    }
    this.ngOnInit();
  }

  canManageItem(item: any): boolean {
    if (!this.isAdmin) return false;
    return (item?.status || 'PENDING').toUpperCase() === 'PENDING';
  }

  showClaimedBy(item: any): string {
    if ((item?.status || '').toUpperCase() !== 'CLAIMED') return '';
    return item?.claimedByName || `User #${item?.claimedById ?? 'Unknown'}`;
  }

  categoryLabel(item: any): string {
    if (item?.categoryName) return item.categoryName;
    if (item?.categoryId != null) return `Category ${item.categoryId}`;
    return 'Uncategorized';
  }

  thumbnail(item: any): string {
    if (Array.isArray(item?.photos) && item.photos.length > 0) {
      return item.photos[0];
    }
    return '';
  }

  syncLabel(item: any): string {
    return item?.syncStatus === 'LOCAL_PENDING_SYNC' ? 'Local pending sync' : 'Synced';
  }

  syncBadgeClass(item: any): string {
    return item?.syncStatus === 'LOCAL_PENDING_SYNC' ? 'sync-local' : 'sync-ok';
  }
}

