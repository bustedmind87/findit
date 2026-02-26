import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Item } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  constructor(private api: ApiService) {}
  list(params?: any) { return this.api.get<{content: Item[]}>('/items', params); }
  get(id: number) { return this.api.get<Item>(`/items/${id}`); }
  create(formData: FormData) { return this.api.post<Item>('/items', formData); }
  updateStatus(id: number, status: string) { return this.api.put(`/items/${id}/status`, { status }); }
}
