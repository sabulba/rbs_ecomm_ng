import {Auth, createUserWithEmailAndPassword} from "@angular/fire/auth";
import {doc, Firestore, setDoc} from "@angular/fire/firestore";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterModule} from "@angular/router";
import {Component, OnInit} from "@angular/core";

import {Project} from "../../models/project";
import {ProjectSelectComponent} from "../../layout/components/auth/project-select/project-select.component";
import {FirebaseService} from "../../shared/firebase/firebase.service";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {MatSlideToggle} from "@angular/material/slide-toggle";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, ProjectSelectComponent, MatButtonToggleGroup, MatButtonToggle, MatSlideToggle,],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',

})

export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  selectedProject!: Project;
  isAdmin: boolean = false; // default to 'משתמש'
  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private firebaseService: FirebaseService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      repeatPassword: ['', Validators.required],
      cellular: ['', Validators.required],
      role: [this.isAdmin, Validators.required],
    });
  }

  onProjectPicked(project: Project) {
    this.selectedProject = project;
  }

  async onSubmit() {
    if (this.registerForm.invalid || !this.selectedProject) return;

    const {firstName, lastName, email, password, cellular , role} = this.registerForm.value;

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const newUser = {
        id:userCredential.user.uid,
        firstName: firstName,
        lastName:lastName,
        email: email,
        cellular: cellular,
        projectId: this.selectedProject.projectId,
        createdAt: new Date().toISOString(),
        accountNumber: "",
        displayName: firstName + " " + lastName,
        status: "pending",
        photoUrl: "",
        role: role,
      };
      // Store user data in Firestore
      await this.firebaseService.addDocument('users', newUser );
       // Store user data in Firestore
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Registration error:', error);
    }
  }
}
