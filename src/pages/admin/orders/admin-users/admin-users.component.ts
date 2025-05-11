import {Component, OnInit, ViewChild} from '@angular/core';
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {MatButtonModule} from "@angular/material/button";
import {CurrencyPipe, JsonPipe, NgForOf, NgIf, NgTemplateOutlet} from "@angular/common";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FabMenuComponent} from "../../../../layout/components/fab-menu/fab-menu.component";
import {User} from "../../../../models/User.model";
import {FirebaseService} from "../../../../shared/firebase/firebase.service";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {firstValueFrom, Observable} from "rxjs";
import {
  addDoc,
  collection, collectionData,
  deleteDoc,
  doc,
  Firestore, getDocs,
  onSnapshot,
  query,
  updateDoc,
  where
} from "@angular/fire/firestore";
import {UserDialogComponent} from "../../shared/user-dialog/user-dialog/user-dialog.component";
import {
  MatAutocompleteModule,
  MatOption
} from "@angular/material/autocomplete";
import {MatFormField} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatSelect} from "@angular/material/select";

@Component({
  selector: 'app-admin-users',
  standalone: true,
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css',
  imports: [
    MatAutocompleteModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatSlideToggleModule,
    CurrencyPipe,
    NgIf,
    NgTemplateOutlet,
    MatProgressSpinnerModule,
    FabMenuComponent,
    MatOption,
    MatFormField,
    MatInput,
    NgForOf,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelect,
    JsonPipe
  ]
})
export class AdminUsersComponent implements OnInit {
  users: MatTableDataSource<User> = new MatTableDataSource<User>();
  displayedColumns: string[] = ['email', 'firstName', 'lastName', 'cellular', 'accountNumber', 'status', 'actions'];
  isLoading = true;
  firestore!: Firestore;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private dialog: MatDialog
  ) {
  }

  async ngOnInit() {
    this.firebaseService.initFromMainConfig();
    await this.fetchUsers();
  }

  private async fetchUsers() {
    try {
      this.firestore = await firstValueFrom(this.firebaseService.getNewFirestore$()) as Firestore;
      this.getAllUsers(this.firestore).subscribe((users: User[]) => {
        this.users.data = users;
        this.isLoading = false;
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      this.isLoading = false;
    }
  }

  getAllUsers(firestore: Firestore): Observable<User[]> {
    const projectId = localStorage.getItem('firebaseConfig') ? JSON.parse(localStorage.getItem('firebaseConfig')!).projectId : null;
    if (!projectId) {
      throw new Error('No projectId found in localStorage');
    }
    const usersRef = collection(firestore, 'users');
    const usersQuery = query(usersRef, where('projectId', '==', projectId));
    return collectionData(usersQuery, {idField: 'uid'}) as Observable<User[]>;
  }

  editUser(user: any) {
    const ref = this.dialog.open(UserDialogComponent, {
      data: {user, mode: 'edit', firestore: this.firestore},
    });
    ref.afterClosed().subscribe(async (result: Partial<User>) => {
      if (result) {
        const editedUser = {
          ...user,
          ...result,
        };
        await this.updateUser(editedUser);
        await this.fetchUsers();
      }
    });
  }

  async updateUser(user: any) {
    try {
      const fs = await firstValueFrom(this.firebaseService.getNewFirestore$()) as Firestore;
      const userRef = doc(fs, 'users', user.uid!); //uid represent  the document id of the user
      await updateDoc(userRef, user);
      await this.fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }


  /*delete user from table - not implemented for now only from console*/
  // async deleteUser(user: any) {
  //   const isConfirmed = confirm(`Are you sure you want to delete the user: ${user.firstName}?`);
  //   if (isConfirmed) {
  //     try {
  //       const fs = await firstValueFrom(this.firebaseService.getNewFirestore$()) as Firestore;
  //       const userRef = doc(fs, 'users', user.id);
  //       await deleteDoc(userRef);
  //       console.log('User deleted successfully');
  //       await this.fetchUsers();
  //     } catch (error) {
  //       console.error('Error deleting user:', error);
  //       alert('Failed to delete user. Check the console for details.');
  //     }
  //   }
  // }

 /*delete user from firebase authentication---!!!not working!!!!*/
  // async deleteUser(user: any) {
  //   const confirmed = confirm(`Delete ${user.firstName}?`);
  //   if (!confirmed) return;
  //
  //   try {
  //     const result = await this.firebaseService.deleteUserAsAdmin(user.id);
  //     if ((result as any).success) {
  //       alert('User deleted.');
  //     }
  //   } catch (error) {
  //     console.error('Error deleting user:', error);
  //   }
  // }

  // async makeUserAdmin(userId: string) {
  //   try {
  //     const result = await this.authService.setAdminRole(userId);
  //     alert((result as any).message);
  //   } catch (error) {
  //     console.error('Error setting admin role:', error);
  //   }
  // }


  // only by register
  // createUser() {
  //   const ref = this.dialog.open(UserDialogComponent, {
  //     data: {mode: 'create'},
  //   });
  //   ref.afterClosed().subscribe(async (result: Partial<User>) => {
  //     if (result) {
  //       try {
  //         const fs = await firstValueFrom(this.firebaseService.getNewFirestore$()) as Firestore;
  //         const usersRef = collection(fs, 'users');
  //         const projectId = localStorage.getItem('firebaseConfig') ? JSON.parse(localStorage.getItem('firebaseConfig')!).projectId : null;
  //         const newUser = {
  //           ...result,
  //           projectId,
  //         };
  //         // Step 1: Add the user
  //         const docRef = await addDoc(usersRef, newUser);
  //
  //         // Step 2: Update the document to include its ID as user id - this will help on delete the user doc later ...
  //         await updateDoc(docRef, { id: docRef.id });
  //         await this.fetchUsers();
  //       } catch (error) {
  //         console.error('Error adding user:', error);
  //       }
  //     }
  //   });
  // }



}
