import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  base = environment.apiBaseUrl;
  
  constructor(private http: HttpClient) {
    console.log('API Base URL:', this.base);
  }
  
  get<T>(path: string, params?: any) {
    let p = new HttpParams();
    if (params) {
      Object.keys(params).forEach(k => p = p.set(k, params[k]));
    }
    const url = `${this.base}${path}`;
    console.log('GET Request:', url);
    return this.http.get<T>(url, { params: p });
  }
  
  post<T>(path: string, body: any) { 
    const url = `${this.base}${path}`;
    console.log('POST Request:', url);
    return this.http.post<T>(url, body);
  }
  
  put<T>(path: string, body: any) { 
    const url = `${this.base}${path}`;
    console.log('PUT Request:', url);
    return this.http.put<T>(url, body);
  }
  
  delete<T>(path: string) { 
    const url = `${this.base}${path}`;
    console.log('DELETE Request:', url);
    return this.http.delete<T>(url);
  }
}

