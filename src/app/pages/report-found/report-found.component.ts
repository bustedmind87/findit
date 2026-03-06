// src/app/pages/report-found/report-found.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ItemsService } from '../../core/items.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-report-found',
  templateUrl: './report-found.component.html',
  styleUrls: ['./report-found.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class ReportFoundComponent implements OnInit {
  form!: FormGroup;
  files: File[] = [];

  constructor(
    private fb: FormBuilder,
    private items: ItemsService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      categoryId: [null, Validators.required],
      location: ['', Validators.required],
      dateFound: ['', Validators.required],
      photos: [null],
      reporterContact: ['']
    });
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
    if (this.form.invalid || this.files.length === 0) {
      alert('Please fill required fields and upload at least one photo.');
      return;
    }
    const user = this.auth.getCurrentUser();
    const fd = new FormData();
    fd.append('item', new Blob([JSON.stringify({
      title: this.form.value.title,
      description: this.form.value.description,
      categoryId: this.form.value.categoryId,
      location: this.form.value.location,
      dateFound: this.form.value.dateFound,
      reporterContact: this.form.value.reporterContact,
      type: 'FOUND',
      reporterId: user?.id ? Number(user.id) : null
    })], { type: 'application/json' }));
    this.files.forEach(f => fd.append('photos', f, f.name));
    this.items.create(fd).subscribe({
      next: () => { alert('Item submitted. Admin will review.'); this.router.navigate(['/']); },
      error: () => alert('Submission failed. Try again.')
    });
  }
}
