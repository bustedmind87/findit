import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClaimsService } from '../../core/claims.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html',
  styleUrls: ['./claim.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class ClaimComponent implements OnInit {
  @Input() itemId!: number; // set when used as a child or route param
  form!: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private claims: ClaimsService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get itemId from route params if not provided as input
    if (!this.itemId) {
      this.route.paramMap.subscribe(params => {
        this.itemId = Number(params.get('id'));
      });
    }
    this.form = this.fb.group({
      claimantContact: ['', Validators.required],
      message: [''],
      proofUrl: ['']
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting = true;
    const user = this.auth.getCurrentUser();
    if (!user) {
      alert('Please sign in first.');
      this.submitting = false;
      this.router.navigate(['/login']);
      return;
    }

    if (this.auth.isAdmin()) {
      alert('Admin cannot claim items.');
      this.submitting = false;
      this.router.navigate(['/my-items']);
      return;
    }

    const payload = {
      itemId: this.itemId,
      claimerId: Number(user.id),
      claimerName: user.username,
      claimerContact: this.form.value.claimantContact,
      description: [this.form.value.message, this.form.value.proofUrl].filter(Boolean).join(' | ')
    };
    this.claims.createClaim(payload).subscribe({
      next: () => {
        alert('Claim submitted. Status: PENDING. Admin will review.');
        this.submitting = false;
        this.router.navigate(['/']); // or close modal
      },
      error: (err) => {
        alert(err?.error?.error || 'Failed to submit claim. Try again.');
        this.submitting = false;
      }
    });
  }
}
