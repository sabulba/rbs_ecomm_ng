import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../shared/auth/auth.service";
import {Router, RouterModule} from "@angular/router";
import {FirebaseService} from "../../shared/firebase/firebase.service";



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule , ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',

})
export class LoginComponent implements OnInit  {
  isLogin=false;
  loginForm!:FormGroup;
  constructor(private router:Router,private formBuilder:FormBuilder, private authService:AuthService ,private fbService:FirebaseService){
    this.loginForm=this.formBuilder.group({
      email:new FormControl('',[Validators.required,Validators.email]),
      password:new FormControl('',[Validators.required,Validators.min(6),Validators.max(16)])
    })
  }

  ngOnInit(): void {
    const currentEmail = JSON.parse(localStorage.getItem('currentUser') || '[]').email;
    if (currentEmail) {
      this.loginForm.patchValue({
        email: currentEmail
      });
    }
  }
  onSubmit() {
    const email = this.loginForm.value.email;
    const password = this.loginForm.value.password;
    this.authService.login(email, password).then(async userCredential => {
      if (userCredential.user) {
        const userData = await this.fbService.getDocumentById('users', userCredential.user.uid);
        this.authService.setCurrentUser(userData);
        this.isLogin = true;
        await this.switchToUserApplication(userCredential.user.uid);
      }
      this.loginForm.reset();
    }).catch(err => {
      console.error('Login error:', err.message);
    });
  }
  async switchToUserApplication(userId: string) {
    await this.fbService.switchToUserApplication(userId).then(() => {
      localStorage.setItem('isLogged', 'true');
      this.router.navigate(['/']);
    }, (error) => {
      console.error('Error switching to user application:', error);
      alert('Error switching to user application');
    });
  }
}
