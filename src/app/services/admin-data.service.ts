import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private API = `${environment.apiUrl}/admin`;
  private ACTIVITY_API = `${environment.apiUrl}/activity`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/users`);
  }

  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/tasks`);
  }

  getPerformance(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/performance`);
  }

  getActivityLogs(): Observable<any[]> {
    return this.http.get<any[]>(this.ACTIVITY_API);
  }

  createEmployee(employee: any): Observable<any> {
    return this.http.post(`${this.API}/create-employee`, employee);
  }

  updateEmployee(id: number, user: any): Observable<any> {
    return this.http.put(`${this.API}/users/${id}`, user);
  }

  updateUserRole(id: number, role: string): Observable<any> {
    return this.http.put(`${this.API}/users/${id}/role?role=${encodeURIComponent(role)}`, {});
  }

  updateUserDesignation(id: number, designation: string): Observable<any> {
    return this.http.put(`${this.API}/users/${id}/designation`, { designation });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.API}/users/${id}`);
  }

  promoteUser(id: number): Observable<any> {
    return this.http.put(`${this.API}/users/${id}/promote`, {});
  }

  demoteUser(id: number): Observable<any> {
    return this.http.put(`${this.API}/users/${id}/demote`, {});
  }
}
