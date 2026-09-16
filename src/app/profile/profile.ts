import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthStateService } from '../services/auth-state.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  private readonly API = `${environment.apiUrl}/profile`;

  profile: any = {
    name: '',
    email: '',
    designation: '',
    phone: '',
    bio: '',
    skills: '',
    profileImage: ''
  };

  loading = false;
  saving = false;
  isAdmin = false;

  constructor(
    private http: HttpClient,
    public authState: AuthStateService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authState.isAdmin();
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.http.get<any>(this.API).subscribe({
      next: (res) => {
        this.loading = false;
        this.profile = res || {};
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error('Profile Error', 'Failed to load profile details.');
      }
    });
  }

  updateProfile(): void {
    if (!this.profile.name?.trim()) {
      this.toastService.warning('Required', 'Full Name is required.');
      return;
    }

    this.saving = true;
    this.http.put<any>(this.API, this.profile).subscribe({
      next: (res) => {
        this.saving = false;
        this.profile = res;
        this.toastService.success('Profile Saved', 'Your profile details have been updated.');
      },
      error: (err) => {
        this.saving = false;
        this.toastService.error('Error', err?.error?.message || 'Failed to update profile.');
      }
    });
  }

  goBack(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}