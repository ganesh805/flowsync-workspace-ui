import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-company',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
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

  private readonly API = 'https://flowsync-workspace-api-2.onrender.com/api/users';

  constructor(
    private http: HttpClient,
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
      alert('Please fill all fields');
      return;
    }

    const body = {
      companyName: this.companyName.trim(),
      companyCode: this.companyCode.trim().toUpperCase(),
      companyDomain: this.companyDomain.trim().toLowerCase(),
      adminName: this.adminName.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password
    };

    console.log('Register Company Request');
    console.log(body);

    this.loading = true;

    this.http.post(
      `${this.API}/register-company`,
      body,
      {
        responseType: 'text'
      }
    ).subscribe({

      next: (response) => {

        console.log(response);

        this.loading = false;

        alert('Company Registered Successfully');

        this.router.navigate(['/login']);
      },

      error: (error) => {

        console.error('Registration Error:', error);

        this.loading = false;

        alert(
          error?.error?.error ||
          error?.error ||
          'Company Registration Failed'
        );
      }

    });
  }
}