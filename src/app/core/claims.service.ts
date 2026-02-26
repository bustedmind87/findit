import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface ClaimPayload {
  itemId: number;
  claimantName: string;
  claimantContact?: string;
  message?: string;
  proofUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ClaimsService {
  constructor(private api: ApiService) {}

  createClaim(payload: ClaimPayload): Observable<any> {
    return this.api.post('/claims', payload);
  }

  // Admin: update claim status
  updateClaimStatus(claimId: number, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
    return this.api.put(`/claims/${claimId}/status`, { status });
  }

  listClaims(params?: any) {
    return this.api.get<any>('/claims', params);
  }
}
