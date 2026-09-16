import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  name = '';
  username = '';
  designation = '';
  email = '';
  password = '';
  role = 'MEMBER';
  companyCode = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  register() {
    if (!this.name.trim() || !this.email.trim() || !this.password || !this.companyCode.trim()) {
      this.toastService.warning('Required Fields', 'Please fill in all mandatory registration fields.');
      return;
    }

    this.loading = true;

    const data = {
      name: this.name.trim(),
      username: this.username.trim(),
      designation: this.designation.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.role,
      companyCode: this.companyCode.trim().toUpperCase()
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success('Registration Successful', 'Your account has been created. Please log in.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        const msg = error?.error?.message || error?.error?.error || 'Registration failed. Please check your company code and email domain.';
        this.toastService.error('Registration Error', msg);
      }
    });
  }
}