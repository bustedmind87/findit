import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface QA {
  id?: number;
  question: string;
  answer?: string;
}

@Injectable({ providedIn: 'root' })
export class QAService {
  constructor(private api: ApiService) {}

  list() {
    return this.api.get<QA[]>('/qa');
  }

  get(id: number) {
    return this.api.get<QA>(`/qa/${id}`);
  }

  create(qa: QA) {
    return this.api.post<QA>('/qa', qa);
  }

  update(id: number, qa: QA) {
    return this.api.put<QA>(`/qa/${id}`, qa);
  }

  delete(id: number) {
    return this.api.delete(`/qa/${id}`);
  }
}
