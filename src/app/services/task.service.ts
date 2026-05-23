import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  API = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) {}

  private getHeaders() {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getTasks() {

    return this.http.get<any>(
      this.API,
      {
        headers: this.getHeaders()
      }
    );
  }

  createTask(task: any) {

    return this.http.post(
      this.API,
      task,
      {
        headers: this.getHeaders()
      }
    );
  }

  updateTask(id: number, task: any) {

    return this.http.put(
      `${this.API}/${id}`,
      task,
      {
        headers: this.getHeaders()
      }
    );
  }

  deleteTask(id: number) {

    return this.http.delete(
      `${this.API}/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  updateTaskStatus(id: number, status: string) {

    return this.http.put(
      `${this.API}/${id}/status?status=${status}`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }
}