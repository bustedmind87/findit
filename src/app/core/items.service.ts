import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Item } from '../models/item.model';
import { of, throwError, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

const LOCAL_ITEMS_KEY = 'fi_local_items';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  constructor(private api: ApiService) {}

  private readLocal(): any[] {
    const raw = localStorage.getItem(LOCAL_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveLocal(list: any[]) {
    localStorage.setItem(LOCAL_ITEMS_KEY, JSON.stringify(list));
  }

  list(params?: any) {
    return this.api.get<any>('/items', params).pipe(
      map(res => {
        // Handle both array and {content: array} formats
        return Array.isArray(res) ? res : (res?.content || []);
      }),
      catchError(() => {
        // fallback to local storage
        const all = this.readLocal();
        if (params && params.owner) {
          return of(all.filter(i => i.reporterId === params.owner));
        }
        return of(all);
      })
    );
  }

  get(id: number) { 
    return this.api.get<Item>(`/items/${id}`).pipe(
      catchError(() => {
        const all = this.readLocal();
        const found = all.find(i => i.id === String(id));
        return of(found);
      })
    );
  }

  create(formData: FormData) {
    return this.api.post<Item>('/items', formData).pipe(
      catchError(() => {
        const blob = formData.get('item') as Blob | null;
        if (!blob) return throwError(() => new Error('No item payload'));
        // read blob text and store locally
        return from(blob.text()).pipe(
          map(text => JSON.parse(text)),
          map((payload: any) => {
            const all = this.readLocal();
            const id = String(Date.now());
            const saved = { ...payload, id, status: 'PENDING', createdAt: new Date().toISOString() };
            all.push(saved);
            this.saveLocal(all);
            return saved as Item;
          })
        );
      })
    );
  }

  updateStatus(id: number, status: string) { 
    return this.api.put(`/items/${id}/status`, { status }); 
  }

  delete(id: number) {
    return this.api.delete(`/items/${id}`);
  }
}
