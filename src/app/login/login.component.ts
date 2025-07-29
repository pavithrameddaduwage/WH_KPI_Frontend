import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { AuthService } from '../Auth/auth.service';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
// import { ToastrService } from 'ngx-toastr';
// import { jwtDecode } from 'jwt-decode';
// import { IntegrationService } from '../Services/service.service';
// import { LogType } from '../Tools/Enums/logtype.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule,ReactiveFormsModule,HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  // constructor(private authService: AuthService, private router: Router,private toastr: ToastrService,private integrationService:IntegrationService){}

  formGroup: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  handleSubmit(){

  //   if (this.formGroup.controls['email'].status=='INVALID'){
  //     this.toastr.error("Please check your email")
  //   }
  //   if (this.formGroup.controls['password'].status=='INVALID'){
  //     this.toastr.error("Please enter valid password")
  //   }
  //   if (this.formGroup.valid) {
  //     console.log(this.formGroup.value)
  //     this.authService.login({ email: this.formGroup.value.email, password: this.formGroup.value.password }).subscribe(result => {
            
  //       if (result.status==200 || result.access_token){
  //         localStorage.setItem("token",result.access_token)

  //         const user:any=jwtDecode(result.access_token)
  //         this.integrationService
  //         .createLog({
  //           user: user,
  //           log_type: LogType.login,
  //           description: 'user login',
  //           old_value:'' ,
  //           new_value:user.name,
  //         })
  //         .subscribe((output: any) => {
  //           if (output.status == 201) {
  //             console.log('Log created successfully');
  //           } else {
  //             console.log('Error creating log');
  //           }
  //         });

  //         this.authService.setUser(user)
  //         this.authService.setIsLogged(true)
  //         this.router.navigate(['home'])
  //       }else{
  //         this.toastr.error("Invalid credentials")
  //       }
        
    
  //     },
  //       error => {
  //         console.log("Result", error)
  //         this.toastr.error("Invalid credentials")
  //       })
  //   }
  // }
}
}
