import { Component, OnInit } from '@angular/core';
import { ItemsService } from '../../core/items.service';
import { AuthService } from '../../core/auth.service';
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
  loading = false;

  constructor(private itemsService: ItemsService, private auth: AuthService) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.loading = true;
    this.itemsService.list({ owner: user.id }).subscribe({
      next: (res: any) => {
        // Handle both array and {content: array} responses
        this.items = Array.isArray(res) ? res : (res?.content || []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}

