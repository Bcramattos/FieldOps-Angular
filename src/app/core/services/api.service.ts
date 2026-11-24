import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';

// dados fictícios embutidos (fallback quando a API não responde — ex.: Pages estático)
import fallbackData from '../../core/data/fallback.json';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  listar<T>(recurso: string, filtros?: Record<string, string>): Observable<T[]> {
    return this.http
      .get<T[]>(`${this.base}/${recurso}`, { params: filtros })
      .pipe(
        catchError(() => of((fallbackData as any)[recurso] ?? []))
      );
  }

  obter<T>(recurso: string, id: number): Observable<T> {
    return this.http
      .get<T>(`${this.base}/${recurso}/${id}`)
      .pipe(
        catchError(() => of((fallbackData as any)[recurso]?.find((x: any) => x.id === id) as T))
      );
  }

  criar<T>(recurso: string, obj: Omit<T, 'id'>): Observable<T> {
    return this.http.post<T>(`${this.base}/${recurso}`, obj).pipe(
      catchError(() => of(obj as T))
    );
  }

  editar<T>(recurso: string, id: number, obj: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.base}/${recurso}/${id}`, obj).pipe(
      catchError(() => of(obj as T))
    );
  }

  excluir(recurso: string, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${recurso}/${id}`).pipe(
      catchError(() => of(undefined))
    );
  }
}
