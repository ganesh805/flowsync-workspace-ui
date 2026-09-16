import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private API = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.API);
  }

  getTaskById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API}/${id}`);
  }

  createTask(task: any): Observable<any> {
    return this.http.post(this.API, task);
  }

  updateTask(id: number, task: any): Observable<any> {
    return this.http.put(`${this.API}/${id}`, task);
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.API}/${id}`);
  }

  updateTaskStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.API}/${id}/status?status=${encodeURIComponent(status)}`, {});
  }

  getTaskComments(taskId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/${taskId}/comments`);
  }

  addTaskComment(taskId: number, message: string): Observable<any> {
    return this.http.post<any>(`${this.API}/${taskId}/comments`, { message });
  }
}