import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResignationItem {
  id: number;
  reason: string;
  letter?: string;
  proposedLastDay?: string;
  approvedLastDay?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminFeedback?: string;
  createdAt: string;
  updatedAt?: string;
  employee?: {
    id: number;
    name: string;
    email: string;
    designation?: string;
    employeeCode?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ResignationService {
  private readonly API = `${environment.apiUrl}/resignation`;

  constructor(private http: HttpClient) {}

  submitResignation(payload: { reason: string; letter?: string; proposedLastDay?: string }): Observable<ResignationItem> {
    return this.http.post<ResignationItem>(this.API, payload);
  }

  getMyResignations(): Observable<ResignationItem[]> {
    return this.http.get<ResignationItem[]>(`${this.API}/my`);
  }

  getOrganizationResignations(): Observable<ResignationItem[]> {
    return this.http.get<ResignationItem[]>(this.API);
  }

  updateResignationStatus(id: number, status: 'APPROVED' | 'REJECTED', feedback?: string, approvedLastDay?: string): Observable<ResignationItem> {
    return this.http.put<ResignationItem>(`${this.API}/${id}/status`, { status, feedback, approvedLastDay });
  }
}
