import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { HttpClient, HttpHeaders }
from '@angular/common/http';

import { AdminSidebar }
from '../admin/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-profile',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    AdminSidebar
  ],

  templateUrl: './profile.html',

  styleUrls: ['./profile.css']
})

export class ProfileComponent
implements OnInit {

  profile:any = {

    name:'',
    designation:'',
    phone:'',
    bio:'',
    skills:'',
    profileImage:''

  };

  loading = false;

  successMessage = '';

  constructor(
    private http:HttpClient
  ){}

  ngOnInit(): void {

    this.loadProfile();
  }

  // =========================
  // TOKEN HEADERS
  // =========================

  getHeaders(){

    const token =
      localStorage.getItem('token');

    return {

      headers:new HttpHeaders({

        Authorization:
          `Bearer ${token}`

      })
    };
  }

  // =========================
  // LOAD PROFILE
  // =========================

  loadProfile(){

    this.http.get(

      'http://localhost:8080/api/profile',

      this.getHeaders()

    ).subscribe({

      next:(response:any)=>{

        this.profile = response;

        console.log(response);
      },

      error:(err)=>{

        console.log(err);
      }
    });
  }

  // =========================
  // UPDATE PROFILE
  // =========================

  updateProfile(){

    this.loading = true;

    this.http.put(

      'http://localhost:8080/api/profile',

      this.profile,

      this.getHeaders()

    ).subscribe({

      next:(response)=>{

        this.loading = false;

        this.successMessage =
          'Profile Updated Successfully';

        console.log(response);
      },

      error:(err)=>{

        this.loading = false;

        console.log(err);
      }
    });
  }
}