import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register-company',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './register-company.html',
  styleUrl: './register-company.css'
})
export class RegisterCompany {
  companyName = '';
  companyCode = '';
  companyDomain = '';
  adminName = '';
  email = '';
  password = '';

  loading = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  registerCompany() {
    if (
      !this.companyName.trim() ||
      !this.companyCode.trim() ||
      !this.companyDomain.trim() ||
      !this.adminName.trim() ||
      !this.email.trim() ||
      !this.password.trim()
    ) {
      this.toastService.warning('Required Fields', 'Please fill in all fields to create your company workspace.');
      return;
    }

    const domain = this.companyDomain.trim().toLowerCase().replace(/^@/, '');
    const adminEmail = this.email.trim().toLowerCase();

    if (!adminEmail.endsWith('@' + domain)) {
      this.toastService.warning(
        'Email Domain Mismatch',
        `Admin email must end with @${domain} (e.g., admin@${domain}).`
      );
      return;
    }

    const body = {
      companyName: this.companyName.trim(),
      companyCode: this.companyCode.trim().toUpperCase(),
      companyDomain: domain,
      adminName: this.adminName.trim(),
      email: adminEmail,
      password: this.password
    };

    this.loading = true;

    this.authService.registerCompany(body).subscribe({
      next: (response) => {
        this.loading = false;
        this.toastService.success('Company Workspace Created', 'Your workspace and Admin account have been registered.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Register Company Error:', error);
        let msg = 'Company registration failed.';
        if (typeof error?.error === 'string' && error.error.trim()) {
          msg = error.error;
        } else if (error?.error?.message) {
          msg = error.error.message;
        } else if (error?.message) {
          msg = error.message;
        }
        this.toastService.error('Workspace Creation Failed', msg);
      }
    });
  }
}