// src/app/shared/header/header.component.ts
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { ItemsService } from '../../core/items.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

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
  navSub?: Subscription;
  menuOpen = false;

  constructor(private router: Router, private authService: AuthService, private itemsService: ItemsService) {
    this.currentUser$ = this.authService.currentUser$;
    this.sub = this.currentUser$.subscribe((u: any) => {
      if (u) {
        this.refreshMyCount(u.id);
      } else {
        this.myCount = 0;
      }
    });

    this.navSub = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        const user = this.authService.getCurrentUser();
        if (user) {
          this.refreshMyCount(user.id);
        }
      });
  }

  logout(): void {
    this.menuOpen = false;
    this.authService.logout();
    this.router.navigate(['/']);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  private refreshMyCount(userId: string): void {
    this.itemsService.list({ owner: userId }).subscribe({
      next: (items: any) => {
        const arr = Array.isArray(items) ? items : (items?.content || []);
        this.myCount = arr.length;
      },
      error: () => {
        this.myCount = 0;
      }
    });
  }
}
