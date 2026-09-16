import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.API}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.API}/register`, data);
  }

  registerCompany(data: any): Observable<any> {
    return this.http.post(`${this.API}/register-company`, data, { responseType: 'text' });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(
      `${this.API}/change-password?currentPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}`,
      {},
      { responseType: 'text' }
    );
  }
}