import {Component, Inject, Output, EventEmitter} from '@angular/core';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {MatButton, MatIconButton} from "@angular/material/button";
import { FormsModule,ReactiveFormsModule ,FormControl} from '@angular/forms';
import {MatFormField, MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {MatAutocomplete, MatAutocompleteModule, MatOption} from "@angular/material/autocomplete";
import {MatFormFieldModule} from "@angular/material/form-field";
import {Account} from "../../../../models/Account.model";
import {FirebaseService} from "../../../../shared/firebase/firebase.service";
import {firstValueFrom, Observable} from "rxjs";
import {collection, collectionData, Firestore, query, where} from "@angular/fire/firestore";
@Component({
  selector: 'app-app-order-manual-sheet',
  standalone: true,
  templateUrl: './app-order-manual-sheet.component.html',
  styleUrl: './app-order-manual-sheet.component.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule ,MatFormFieldModule,
            MatButton, MatInput, MatFormField, MatIconButton, MatIcon, MatAutocomplete, MatOption]
})
export class AppOrderManualSheetComponent {
  accounts: Account[] = [];
  filteredUsers: any[] = [];
  selectedUser: any = null;
  lastPaymentUser: any = null;
  remark: string = '';
  firestore!: Firestore;
  isLoading = true;
  searchControl = new FormControl('');
  orderStatus: string = '';
  readonly = true;
  constructor( private firebaseService: FirebaseService,private bottomSheetRef: MatBottomSheetRef<AppOrderManualSheetComponent>) {
    this.searchControl.valueChanges.subscribe((value : any) => {
      this.filteredUsers = this._filter(value);
    });
    const saved = localStorage.getItem('setLastPaymentUser');
    if (saved) {
      this.lastPaymentUser = JSON.parse(saved);
      this.searchControl.setValue(this.lastPaymentUser);
    }
  }
  async ngOnInit() {
    this.firebaseService.initFromMainConfig();
    await this.fetchAccounts();
  }

  private async fetchAccounts() {
    try {
      this.firestore = await firstValueFrom(this.firebaseService.getNewFirestore$()) as Firestore;
      this.getAccounts(this.firestore).subscribe((accounts: Account[]) => {
        this.accounts = accounts;
        this.isLoading = false;
      });
    } catch (error) {
      console.error('Error fetching accounts:', error);
      this.isLoading = false;
    }
  }
  getAccounts(firestore: Firestore): Observable<Account[]> {
    const projectId = localStorage.getItem('firebaseConfig') ? JSON.parse(localStorage.getItem('firebaseConfig')!).projectId : null;
    if (!projectId) {
      throw new Error('No projectId found in localStorage');
    }
    const accountsRef = collection(firestore, 'accounts');
    const accountsQuery = query(accountsRef, where('projectId', '==',  projectId));
    return collectionData(accountsQuery, { idField: 'id' }) as Observable<Account[]>;
  }
  displayUser(user: any): string {
    return user ? `${user.firstName} ${user.lastName} - ${user.accountNumber}` : '';
  }

  selectUser(user: any) {
    this.lastPaymentUser = user;
    localStorage.setItem('setLastPaymentUser', JSON.stringify(user));
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

  private _filter(value: string | any): any[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.accounts.filter((account) =>
      `${account.firstName} ${account.lastName} ${account.accountNumber}`
        .toLowerCase()
        .includes(filterValue)
    );
  }

  confirmOrder() {
    this.orderStatus = 'הוזמן בהצלחה';
    this.bottomSheetRef.dismiss({status:'confirmed' , remark: this.remark, user: this.lastPaymentUser});
  }

  cancelOrder() {
      this.bottomSheetRef.dismiss('canceled');
  }
}
