import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChannelMessage } from './channel.service';

@Injectable({
  providedIn: 'root'
})
export class DirectMessageService {
  private API = `${environment.apiUrl}/direct-messages`;

  constructor(private http: HttpClient) {}

  getDirectContacts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/contacts`);
  }

  getDirectMessages(recipientId: number, page: number = 0, size: number = 50): Observable<any> {
    return this.http.get<any>(`${this.API}/${recipientId}?page=${page}&size=${size}`);
  }

  sendDirectMessage(recipientId: number, content: string): Observable<ChannelMessage> {
    return this.http.post<ChannelMessage>(`${this.API}/${recipientId}`, { content });
  }
}
