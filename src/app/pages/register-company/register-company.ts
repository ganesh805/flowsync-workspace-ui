import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  HttpClient
} from '@angular/common/http';

import { Router } from '@angular/router';

@Component({
  selector: 'app-register-company',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './register-company.html',

  styleUrl:
    './register-company.css'
})

export class RegisterCompany {

  companyName = '';

  companyCode = '';

  adminName = '';

  email = '';

  password = '';

  loading = false;

  API =
    'http://localhost:8080/api/users';

  constructor(

    private http: HttpClient,

    private router: Router

  ) {}

  registerCompany() {

    console.log('BUTTON CLICKED');

    console.log(this.companyName);

    console.log(this.companyCode);

    console.log(this.adminName);

    console.log(this.email);

    const body = {

      companyName:
        this.companyName,

      companyCode:
        this.companyCode,

      adminName:
        this.adminName,

      email:
        this.email,

      password:
        this.password
    };

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

        alert(
          'Company Registered Successfully'
        );

        this.router.navigate([
          '/login'
        ]);
      },

      error: (error) => {

        console.log(error);

        this.loading = false;

        alert(
          'Company Registration Failed'
        );
      }
    });
  }
}