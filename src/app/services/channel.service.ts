import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Channel {
  id: number;
  name: string;
  description?: string;
  channelType: 'PUBLIC_ORG' | 'PUBLIC_TEAM' | 'PRIVATE';
  organizationId: number;
  teamId?: number;
  teamName?: string;
  createdByName?: string;
  createdById?: number;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  memberCount: number;
  isMember?: boolean;
}

export interface ChannelMessage {
  id: number;
  channelId?: number;
  channelName?: string;
  senderId?: number;
  senderName: string;
  senderProfileImage?: string;
  senderDesignation?: string;
  content: string;
  messageType?: string;
  createdAt: string;
  editedAt?: string;
  deletedAt?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
}

export interface CreateChannelRequest {
  name: string;
  description?: string;
  channelType: 'PUBLIC_ORG' | 'PUBLIC_TEAM' | 'PRIVATE';
  teamId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private API = `${environment.apiUrl}/channels`;

  constructor(private http: HttpClient) {}

  getChannels(): Observable<Channel[]> {
    return this.http.get<Channel[]>(this.API);
  }

  getChannelById(id: number): Observable<Channel> {
    return this.http.get<Channel>(`${this.API}/${id}`);
  }

  createChannel(request: CreateChannelRequest): Observable<Channel> {
    return this.http.post<Channel>(this.API, request);
  }

  getChannelMessages(channelId: number, page: number = 0, size: number = 50): Observable<any> {
    return this.http.get<any>(`${this.API}/${channelId}/messages?page=${page}&size=${size}`);
  }

  sendChannelMessage(channelId: number, content: string): Observable<ChannelMessage> {
    return this.http.post<ChannelMessage>(`${this.API}/${channelId}/messages`, { content });
  }

  editMessage(messageId: number, content: string): Observable<ChannelMessage> {
    return this.http.put<ChannelMessage>(`${this.API}/messages/${messageId}`, { content });
  }

  deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/messages/${messageId}`);
  }

  getChannelMembers(channelId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/${channelId}/members`);
  }

  addChannelMember(channelId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.API}/${channelId}/members`, { userId });
  }

  removeChannelMember(channelId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${channelId}/members/${userId}`);
  }
}
