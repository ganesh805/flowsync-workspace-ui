import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthStateService } from '../../services/auth-state.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private authState: AuthStateService,
    private toastService: ToastService,
    private router: Router
  ) {}

  login() {
    if (!this.email.trim() || !this.password.trim()) {
      this.toastService.warning('Required Fields', 'Please enter your email and password.');
      return;
    }

    this.loading = true;

    const data = {
      email: this.email.trim(),
      password: this.password
    };

    this.authService.login(data).subscribe({
      next: (response) => {
        this.loading = false;
        this.authState.setSession(response);
        this.toastService.success('Welcome Back', `Logged in as ${response.name}`);

        if (response.role === 'OWNER') {
          this.router.navigate(['/owner']);
        } else if (response.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: any) => {
        this.loading = false;
        const msg = error?.error?.message || error?.error?.error || 'Invalid email or password.';
        this.toastService.error('Authentication Failed', msg);
      }
    });
  }
}