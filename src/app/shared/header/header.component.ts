// src/app/shared/header/header.component.ts
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { ItemsService } from '../../core/items.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [RouterModule, CommonModule]
})
export class HeaderComponent {
  currentUser$;
  myCount = 0;
  sub?: Subscription;

  constructor(private router: Router, private authService: AuthService, private itemsService: ItemsService) {
    this.currentUser$ = this.authService.currentUser$;
    this.sub = this.currentUser$.subscribe((u: any) => {
      if (u) {
        this.itemsService.list({ owner: u.id }).subscribe({ next: (res: any) => {
          const arr = res?.content || res || [];
          this.myCount = arr.length;
        }, error: () => { this.myCount = 0; } });
      } else {
        this.myCount = 0;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
