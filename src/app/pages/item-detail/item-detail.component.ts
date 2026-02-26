import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ItemsService } from '../../core/items.service';
import { Item } from '../../models/item.model';
import { CommonModule } from '@angular/common';

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

  constructor(private route: ActivatedRoute, private router: Router, private items: ItemsService) {}

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
    if (this.item) {
      this.router.navigate([`/items/${this.item.id}/claim`]);
    }
  }
}
