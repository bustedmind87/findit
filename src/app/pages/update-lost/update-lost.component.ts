// src/app/pages/update-lost/update-lost.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ItemsService } from '../../core/items.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-update-lost',
  templateUrl: './update-lost.component.html',
  styleUrls: ['./update-lost.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class UpdateLostComponent implements OnInit {
  form!: FormGroup;
  files: File[] = [];
  lostItems: any[] = [];
  selectedItemId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private items: ItemsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLostItems();
    this.form = this.fb.group({
      itemId: ['', Validators.required],
      description: [''],
      location: ['', Validators.required],
      dateLost: ['', Validators.required],
      photos: [null],
      reporterContact: ['']
    });
  }

  loadLostItems() {
    this.items.getLost().subscribe({
      next: (data: any) => {
        this.lostItems = data || [];
      },
      error: () => {
        alert('Failed to load lost items');
      }
    });
  }

  onItemSelected() {
    const itemId = this.form.get('itemId')?.value;
    const item = this.lostItems.find(i => i.id === itemId);
    if (item) {
      this.selectedItemId = itemId;
      this.form.patchValue({
        description: item.description || '',
        location: item.location || '',
        dateLost: item.dateLost || ''
      });
    }
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    for (let i = 0; i < input.files.length; i++) {
      const f = input.files.item(i);
      if (f) this.files.push(f);
    }
  }

  submit() {
    if (this.form.invalid) {
      alert('Please fill required fields');
      return;
    }

    const itemId = this.form.get('itemId')?.value;
    const fd = new FormData();
    fd.append('item', new Blob([JSON.stringify({
      description: this.form.value.description,
      location: this.form.value.location,
      dateLost: this.form.value.dateLost,
      reporterContact: this.form.value.reporterContact
    })], { type: 'application/json' }));

    this.files.forEach(f => fd.append('photos', f, f.name));

    this.items.update(itemId, fd).subscribe({
      next: () => { alert('Item updated successfully'); this.router.navigate(['/']); },
      error: () => alert('Update failed. Try again.')
    });
  }
}
