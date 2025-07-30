import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  formGroup = new FormGroup({
    email: new FormControl('', [Validators.required]),  
    password: new FormControl('', [Validators.required]),
  });

  loading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  handleSubmit() {
    if (this.formGroup.invalid) {
      this.errorMessage = 'Please enter your username/email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.formGroup.value;

    const backendUrl = 'http://localhost:4005';

    this.http.post<{ access_token: string }>(`${backendUrl}/auth/login`, { email, password }).subscribe({
      next: (res) => {
        this.authService.setToken(res.access_token);

        
        this.authService.setUsername(email!);  
        

        this.router.navigate(['home']);
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Invalid username or password.';
        this.loading = false;
      },
    });
  }
}
