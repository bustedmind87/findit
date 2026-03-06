import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface ClaimPayload {
  itemId: number;
  claimerId: number;
  claimerName: string;
  claimerContact?: string;
  description?: string;
}

export interface ClaimRecord {
  id: number;
  itemId: number;
  claimerId: number;
  claimerName?: string;
  claimerContact?: string;
  description?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ClaimsService {
  constructor(private api: ApiService) {}

  createClaim(payload: ClaimPayload): Observable<ClaimRecord> {
    return this.api.post('/claims', payload);
  }

  // Admin: update claim status
  updateClaimStatus(claimId: number, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
    return this.api.put(`/claims/${claimId}/status`, { status });
  }

  listClaims(params?: any): Observable<ClaimRecord[]> {
    return this.api.get<ClaimRecord[]>('/claims', params);
  }
}
