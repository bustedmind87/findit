import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ItemsService } from '../../core/items.service';
import { AuthService } from '../../core/auth.service';
import { Item } from '../../models/item.model';

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
    this.itemsService.listApprovedUnclaimedFound().subscribe({
      next: (items) => {
        this.items = [...items].sort((a, b) => (b.id || 0) - (a.id || 0));
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.loading = false;
      }
    });
  }

  requestClaim(itemId?: number) {
    if (!itemId) return;
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
}
