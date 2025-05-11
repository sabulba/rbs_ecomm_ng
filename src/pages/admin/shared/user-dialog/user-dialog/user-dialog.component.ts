import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatCell, MatColumnDef, MatHeaderCell} from "@angular/material/table";
import {User} from "../../../../../models/User.model";
import {collection, Firestore, getDocs, query, where} from "@angular/fire/firestore";
import {map, startWith} from "rxjs";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatAutocompleteModule,
    MatSlideToggleModule,
    MatColumnDef,
    MatHeaderCell,
    MatCell
  ],
  templateUrl: `./user-dialog.component.html`,
  styleUrls: [`./user-dialog.component.css`],
})
export class UserDialogComponent {
  form: FormGroup;
  isViewMode: boolean = false;
  accountOptions: { firstName: string; lastName: string; accountNumber: string }[] = [];
  filteredOptions: { firstName: string; lastName: string; accountNumber: string }[] = [];
  isLoading = true;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { user?: any; mode: 'view' | 'edit' | 'create' , firestore: Firestore},
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserDialogComponent>
  ) {
    this.isViewMode = this.data.mode === 'view';
    this.form = this.fb.group({
      firstName: [data.user?.firstName || '', Validators.required],
      lastName: [data.user?.lastName || '', Validators.required],
      email: [data.user?.email || 0, Validators.required],
      cellular: [data.user?.cellular || 0, Validators.required],
      accountNumber: [data.user?.accountNumber || 0, Validators.required],
      status: [data.user?.status === 'confirmed'], // true or false
    });

    if (this.isViewMode) {
      this.form.disable();
    }
    this.populateListAccounts(this.data.firestore).then(() => {
      this.isLoading = false;
    });
    this.form.get('accountNumber')?.valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value?.accountNumber || ''),
        map(value => this._filterAccounts(value))
      )
      .subscribe(filtered => this.filteredOptions = filtered);
  }

  save() {
    if (this.form.valid) {
      const updatedUser = {
        ...this.data.user,
        ...this.form.value,
        status: this.form.value.status ? 'confirmed' : 'pending'
      };
      this.dialogRef.close(updatedUser); // Close dialog and send form data to parent
    }
  }

  onAccountChange(user: any) {
    const input = user.accountNumber?.toLowerCase() || '';
    this.filteredOptions = this.accountOptions.filter(acc =>
      `${acc.accountNumber} ${acc.firstName} ${acc.lastName}`.toLowerCase().includes(input)
    );
  }

  onAccountSelected(accountNumber: string, user: User) {
    user.accountNumber = accountNumber;
  }

  onToggleStatus(checked: boolean) {
    this.form.get('status')?.setValue(checked ? 'confirmed' : 'pending');
  }

  async populateListAccounts(firestore: Firestore) {
    try {
      const projectId = localStorage.getItem('firebaseConfig') ? JSON.parse(localStorage.getItem('firebaseConfig')!).projectId : null;
      if (!projectId) {
        throw new Error('No projectId found in localStorage');
      }

      const accountsRef = collection(firestore, 'accounts');
      const accountsQuery = query(accountsRef, where('projectId', '==', projectId));
      const accountsSnapshot = await getDocs(accountsQuery);

      let arr = accountsSnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          accountNumber: data.accountNumber ?? '',  // Ensure string
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? ''
        };
      });
      this.accountOptions =
      arr.filter(opt => !!opt.accountNumber && !!opt.firstName && !!opt.lastName)
        .map(opt => ({
          firstName: opt.firstName,
          lastName: opt.lastName,
          accountNumber: opt.accountNumber!
        }));

    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  }

  private _filterAccounts(value: string): any[] {
    const filterValue = value.toLowerCase();

    return this.accountOptions.filter(option =>
      String(option.accountNumber).toLowerCase().includes(filterValue) ||
      `${option.firstName} ${option.lastName}`.toLowerCase().includes(filterValue)
    );
  }
}

