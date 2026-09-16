import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OrganizationInfo {
  id?: number;
  companyName: string;
  companyCode: string;
  companyDomain: string;
  logoUrl?: string | null;
  description?: string;
  industry?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationMetrics {
  totalEmployees: number;
  totalTeams: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
}

export interface TeamInfo {
  id?: number;
  name: string;
  description?: string;
  leadId?: number;
  leadName?: string;
  memberCount: number;
  activeTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
}

export interface TeamLeadInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  username?: string;
  memberCount: number;
  teamMembers: Array<{
    id: number;
    name: string;
    email: string;
    designation?: string;
    employeeCode?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationStateService {
  private readonly API = `${environment.apiUrl}/organization`;

  private orgSubject = new BehaviorSubject<OrganizationInfo | null>(null);
  public organization$: Observable<OrganizationInfo | null> = this.orgSubject.asObservable();
  public organizationSignal = signal<OrganizationInfo | null>(null);

  constructor(private http: HttpClient) {}

  public loadOrganization(): Observable<OrganizationInfo> {
    return this.http.get<OrganizationInfo>(this.API).pipe(
      tap((org) => {
        this.orgSubject.next(org);
        this.organizationSignal.set(org);
        if (org.logoUrl) {
          localStorage.setItem('organizationLogo', org.logoUrl);
        } else {
          localStorage.removeItem('organizationLogo');
        }
      })
    );
  }

  public getCachedLogo(): string | null {
    return localStorage.getItem('organizationLogo') || this.organizationSignal()?.logoUrl || null;
  }

  public updateOrganization(dto: Partial<OrganizationInfo>): Observable<OrganizationInfo> {
    return this.http.put<OrganizationInfo>(this.API, dto).pipe(
      tap((org) => {
        this.orgSubject.next(org);
        this.organizationSignal.set(org);
        if (org.logoUrl) {
          localStorage.setItem('organizationLogo', org.logoUrl);
        } else {
          localStorage.removeItem('organizationLogo');
        }
      })
    );
  }

  public uploadLogo(file: File): Observable<OrganizationInfo> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<OrganizationInfo>(`${this.API}/logo`, formData).pipe(
      tap((org) => {
        this.orgSubject.next(org);
        this.organizationSignal.set(org);
        if (org.logoUrl) {
          localStorage.setItem('organizationLogo', org.logoUrl);
        }
      })
    );
  }

  public removeLogo(): Observable<OrganizationInfo> {
    return this.http.delete<OrganizationInfo>(`${this.API}/logo`).pipe(
      tap((org) => {
        this.orgSubject.next(org);
        this.organizationSignal.set(org);
        localStorage.removeItem('organizationLogo');
      })
    );
  }

  public getMetrics(): Observable<OrganizationMetrics> {
    return this.http.get<OrganizationMetrics>(`${this.API}/metrics`);
  }

  public getTeams(): Observable<TeamInfo[]> {
    return this.http.get<TeamInfo[]>(`${this.API}/teams`);
  }

  public createTeam(team: { name: string; description?: string; leadId?: number }): Observable<TeamInfo> {
    return this.http.post<TeamInfo>(`${this.API}/teams`, team);
  }

  public deleteTeam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/teams/${id}`);
  }

  public getTeamLeads(): Observable<TeamLeadInfo[]> {
    return this.http.get<TeamLeadInfo[]>(`${this.API}/team-leads`);
  }

  public createTeamLead(lead: { name: string; email: string; password?: string; designation?: string; username?: string }): Observable<any> {
    return this.http.post<any>(`${this.API}/team-leads`, lead);
  }
}
