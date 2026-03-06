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

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });
  }

  private normalizeBackendItem(item: any): any {
    return {
      ...item,
      syncStatus: 'SYNCED'
    };
  }

  private normalizeLocalItem(item: any): any {
    return {
      ...item,
      syncStatus: item?.syncStatus || 'LOCAL_PENDING_SYNC'
    };
  }

  private applyFilters(items: any[], params?: any): any[] {
    let filtered = [...items];
    if (params?.owner != null) {
      filtered = filtered.filter(i => String(i.reporterId) === String(params.owner));
    }
    if (params?.type) {
      filtered = filtered.filter(i => (i.type || '').toUpperCase() === String(params.type).toUpperCase());
    }
    if (params?.status) {
      filtered = filtered.filter(i => (i.status || '').toUpperCase() === String(params.status).toUpperCase());
    }
    if (params?.unclaimed === true || params?.unclaimed === 'true') {
      filtered = filtered.filter(i => !i.claimedById);
    }
    return filtered;
  }

  private mergeBackendAndLocal(backendItems: any[], localItems: any[]): any[] {
    const merged = backendItems.map(i => this.normalizeBackendItem(i));
    // Keep local fallback items visible; avoid duplicates by id.
    localItems.map(i => this.normalizeLocalItem(i)).forEach(local => {
      const exists = merged.some(remote => String(remote?.id) === String(local?.id));
      if (!exists) {
        merged.push(local);
      }
    });
    return merged;
  }

  list(params?: any) {
    return this.api.get<any>('/items', params).pipe(
      map(res => {
        const backendItems = Array.isArray(res) ? res : (res?.content || []);
        const localItems = this.readLocal();

        const merged = this.mergeBackendAndLocal(backendItems, localItems);
        return this.applyFilters(merged, params);
      }),
      catchError(() => {
        const normalizedLocal = this.readLocal().map(i => this.normalizeLocalItem(i));
        return of(this.applyFilters(normalizedLocal, params));
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
          switchMap((payload: any) => {
            const files = formData.getAll('photos').filter((p): p is File => p instanceof File);
            return from(Promise.all(files.map(file => this.fileToDataUrl(file)))).pipe(
              map((photos: string[]) => {
                const all = this.readLocal();
                const id = String(Date.now());
                const saved = {
                  ...payload,
                  id,
                  photos,
                  status: 'PENDING',
                  syncStatus: 'LOCAL_PENDING_SYNC',
                  createdAt: new Date().toISOString()
                };
                all.push(saved);
                this.saveLocal(all);
                return saved as Item;
              })
            );
          })
        );
      })
    );
  }

  updateStatus(id: number, status: string) {
    return this.api.put(`/items/${id}/status`, { status }).pipe(
      catchError((apiErr) => {
        const all = this.readLocal();
        const idx = all.findIndex(i => String(i.id) === String(id));
        if (idx >= 0) {
          const current = (all[idx].status || 'PENDING').toUpperCase();
          const next = (status || '').toUpperCase();
          if (current !== 'PENDING') {
            return throwError(() => new Error('Only pending items can be approved or rejected'));
          }
          all[idx] = { ...all[idx], status: next };
          this.saveLocal(all);
          return of(all[idx]);
        }
        return throwError(() => apiErr);
      })
    );
  }

  listApprovedUnclaimedFound() {
    return this.list({ type: 'FOUND', status: 'APPROVED', unclaimed: true });
  }

  delete(id: number) {
    return this.api.delete(`/items/${id}`);
  }
}
