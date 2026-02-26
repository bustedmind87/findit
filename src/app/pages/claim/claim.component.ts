import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClaimsService } from '../../core/claims.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

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
      claimantName: ['', Validators.required],
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
    const payload = {
      itemId: this.itemId,
      claimantName: this.form.value.claimantName,
      claimantContact: this.form.value.claimantContact,
      message: this.form.value.message,
      proofUrl: this.form.value.proofUrl
    };
    this.claims.createClaim(payload).subscribe({
      next: () => {
        alert('Claim submitted. Status: PENDING. Admin will review.');
        this.submitting = false;
        this.router.navigate(['/']); // or close modal
      },
      error: () => {
        alert('Failed to submit claim. Try again.');
        this.submitting = false;
      }
    });
  }
}
