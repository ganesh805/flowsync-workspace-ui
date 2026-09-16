import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DiscussionMessage {
  id: number;
  message: string;
  sender?: { id: number; name: string };
  recipient?: { id: number; name: string };
  taggedUser?: string;
  channel?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {
  private API = `${environment.apiUrl}/discussions`;

  constructor(private http: HttpClient) {}

  getMessages(channel: string = 'ORGANIZATION'): Observable<DiscussionMessage[]> {
    return this.http.get<DiscussionMessage[]>(`${this.API}?channel=${encodeURIComponent(channel)}`);
  }

  sendMessage(message: string, taggedUser?: string, channel: string = 'ORGANIZATION'): Observable<DiscussionMessage> {
    return this.http.post<DiscussionMessage>(this.API, { message, taggedUser, channel });
  }

  getDirectMessages(recipientId: number): Observable<DiscussionMessage[]> {
    return this.http.get<DiscussionMessage[]>(`${this.API}/direct/${recipientId}`);
  }

  sendDirectMessage(recipientId: number, message: string): Observable<DiscussionMessage> {
    return this.http.post<DiscussionMessage>(`${this.API}/direct`, { recipientId, message });
  }

  getColleagues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/colleagues`);
  }
}
