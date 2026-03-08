import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClaimsService } from '../../core/claims.service';
import { ItemsService } from '../../core/items.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { Item } from '../../models/item.model';

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
  checkingAvailability = false;
  claimBlockedReason = '';

  constructor(
    private fb: FormBuilder,
    private claims: ClaimsService,
    private items: ItemsService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get itemId from route params if not provided as input
    if (!this.itemId) {
      this.itemId = Number(this.route.snapshot.paramMap.get('id'));
    }
    this.form = this.fb.group({
      claimantContact: ['', Validators.required],
      message: [''],
      proofUrl: ['']
    });

    this.validateItemAvailability();
  }

  submit() {
    if (!this.itemId || Number.isNaN(Number(this.itemId))) {
      alert('This item cannot be claimed right now. Please open an approved item and try again.');
      return;
    }

    if (this.claimBlockedReason || this.checkingAvailability) {
      alert(this.claimBlockedReason || 'Checking item availability. Please try again in a moment.');
      return;
    }

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
        this.validateItemAvailability();
      }
    });
  }

  private validateItemAvailability() {
    if (!this.itemId || Number.isNaN(Number(this.itemId))) {
      this.claimBlockedReason = 'Item not found.';
      return;
    }

    this.checkingAvailability = true;
    this.claimBlockedReason = '';

    this.items.getFromBackend(Number(this.itemId)).subscribe({
      next: (item: Item) => {
        const status = (item?.status || '').toUpperCase();
        const isClaimed = status === 'CLAIMED' || item?.claimedById != null;
        const isApproved = status === 'APPROVED';

        if (!isApproved || isClaimed) {
          this.claimBlockedReason = isClaimed
            ? 'This item has already been claimed.'
            : 'This item is not available for claim.';
        }
        this.checkingAvailability = false;
      },
      error: () => {
        this.claimBlockedReason = 'Item not found.';
        this.checkingAvailability = false;
      }
    });
  }
}
