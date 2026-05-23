import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  login(data: any): Observable<any> {
    return this.http.post(`${this.API}/login`, data);
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.API}/register`, data);
  }
}