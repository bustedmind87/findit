import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ItemsService } from '../../core/items.service';
import { Item } from '../../models/item.model';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ItemDetailComponent implements OnInit {
  item?: Item;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private items: ItemsService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.items.get(id).subscribe({
        next: i => { this.item = i; this.loading = false; },
        error: () => { this.loading = false; }
      });
    } else {
      this.loading = false;
    }
  }

  openClaim() {
    if (this.item && this.canClaim(this.item)) {
      if (!this.auth.isAuthenticated()) {
        this.router.navigate(['/login']);
        return;
      }
      this.router.navigate([`/items/${this.item.id}/claim`]);
    }
  }

  canClaim(item: Item): boolean {
    return item.status === 'APPROVED' && !item.claimedById && !this.auth.isAdmin();
  }

  claimedByLabel(item: Item): string {
    if (item.status !== 'CLAIMED') return '';
    return item.claimedByName || `User #${item.claimedById ?? 'Unknown'}`;
  }
}
