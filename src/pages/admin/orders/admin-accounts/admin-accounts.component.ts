import {Component, OnInit, ViewChild} from '@angular/core';
import {FabMenuComponent} from "../../../../layout/components/fab-menu/fab-menu.component";
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {MatSort} from "@angular/material/sort";
import {FirebaseService} from "../../../../shared/firebase/firebase.service";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {firstValueFrom, Observable} from "rxjs";
import {
  addDoc,
  collection, collectionData,
  deleteDoc,
  doc,
  Firestore,
  onSnapshot,
  query,
  updateDoc,
  where
} from "@angular/fire/firestore";
import {Account} from "../../../../models/Account.model";
import {AccountDialogComponent} from "../../shared/account-dialog/account-dialog.component";
import {CommonModule, CurrencyPipe} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import * as Papa from 'papaparse';
import {getStorage, ref, uploadBytes} from "@angular/fire/storage";

@Component({
  selector: 'app-admin-accounts',
  standalone: true,
  imports: [
    CommonModule,
    FabMenuComponent,
    CurrencyPipe,
    MatProgressSpinnerModule,
    MatButton,
    MatSort,
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef
  ],
  templateUrl: './admin-accounts.component.html',
  styleUrl: './admin-accounts.component.css'
})
export class AdminAccountsComponent implements OnInit{
  accounts: MatTableDataSource<Account> = new MatTableDataSource<Account>();
  displayedColumns: string[] = ['firstName', 'lastName', 'accountNumber', 'actions'];
  isLoading = true;
  firestore!: Firestore;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.firebaseService.initFromMainConfig();
    await this.fetchAccounts();
  }

  private async fetchAccounts() {
    try {
      this.firestore = await firstValueFrom(this.firebaseService.getNewFirestore$()) as Firestore;
      this.getAccounts(this.firestore).subscribe((accounts: Account[]) => {
        this.accounts.data = accounts;
        if (this.sort) {
          this.accounts.sort = this.sort;
        }
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
  editAccount(account: any) {
    const ref = this.dialog.open(AccountDialogComponent, {
      data: { account, mode: 'edit' },
    });

    ref.afterClosed().subscribe(async (result: Partial<Account>) => {
      if (result) {
        try {
          const fs = await firstValueFrom(this.firebaseService.getNewFirestore$()) as Firestore;
          const accountRef = doc(fs, 'accounts', account.id!);
          await updateDoc(accountRef, result);
          await this.fetchAccounts();
        } catch (error) {
          console.error('Error updating account:', error);
        }
      }
    });
  }

  async deleteAccount(account: any) {
    const isConfirmed = confirm(`Are you sure you want to delete the account: ${account.name}?`);
    if (isConfirmed) {
      try {
        const fs = await firstValueFrom(this.firebaseService.getNewFirestore$()) as Firestore;
        const accountRef = doc(fs, 'accounts', account.id!);
        await deleteDoc(accountRef);
        await this.fetchAccounts();
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  }

  createAccount() {
    const ref = this.dialog.open(AccountDialogComponent, {
      data: { mode: 'create' },
    });
    ref.afterClosed().subscribe(async (result: Partial<Account>) => {
      if (result) {
        try {
          const fs = await firstValueFrom(this.firebaseService.getNewFirestore$()) as Firestore;
          const accountsRef = collection(fs, 'accounts');
          const projectId = localStorage.getItem('firebaseConfig') ? JSON.parse(localStorage.getItem('firebaseConfig')!).projectId : null;
          const newAccount = {
            ...result,
            projectId,
          };
          await addDoc(accountsRef, newAccount);
          await this.fetchAccounts();
        } catch (error) {
          console.error('Error adding account:', error);
        }
      }
    });
  }
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a valid CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const csvText = reader.result as string;
      const json = this.parseCSV(csvText);
      await this.uploadToFirestore(json);
    };
    reader.readAsText(file);
  }

  parseCSV(csv: string): any[] {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(r => r.trim());
      if (row.length === headers.length) {
        const item: any = {};
        headers.forEach((header, idx) => {
          item[header] = row[idx];
        });
        data.push(item);
      }
    }
    return data;
  }

  async uploadToFirestore(data: any[]) {
    const projectId = localStorage.getItem('firebaseConfig') ? JSON.parse(localStorage.getItem('firebaseConfig')!).projectId : null;
    if (!projectId) {
      throw new Error('No projectId found in localStorage');
    }
    const colRef = collection(this.firestore, 'accounts');

    for (const record of data) {
      const { firstName, lastName, accountNumber} = record;
      if (firstName && lastName && accountNumber) {
        await addDoc(colRef, { firstName, lastName, accountNumber , projectId});
      }
    }
    await this.fetchAccounts();
    alert('Upload completed successfully!');
  }
}
