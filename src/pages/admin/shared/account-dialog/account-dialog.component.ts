import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef, MatDialogTitle
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'הוספה' : data.mode === 'edit' ? 'עריכה' : 'פרטים' }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content>
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>שם פרטי</mat-label>
        <input matInput formControlName="firstName" [readonly]="isViewMode">
      </mat-form-field>

      <mat-form-field appearance="fill" class="w-full">
        <mat-label>שם משפחה</mat-label>
        <input matInput formControlName="lastName" [readonly]="isViewMode">
      </mat-form-field>

      <mat-form-field appearance="fill" class="w-full">
        <mat-label>מספר חשבון</mat-label>
        <input matInput formControlName="accountNumber" type="number" [readonly]="isViewMode">
      </mat-form-field>

      <div mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" type="submit" *ngIf="!isViewMode">Save</button>
      </div>
    </form>
  `
})

export class AccountDialogComponent {
  form: FormGroup;
  isViewMode: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { account?: any; mode: 'view' | 'edit' | 'create' },
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AccountDialogComponent>
  ) {
    this.isViewMode = this.data.mode === 'view';
    this.form = this.fb.group({
      firstName: [data.account?.firstName || '', Validators.required],
      lastName: [data.account?.lastName || '', Validators.required],
      accountNumber: [data.account?.accountNumber || 0, Validators.required],
    });

    if (this.isViewMode) {
      this.form.disable();
    }
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value); // Close dialog and send form data to parent
    }
  }
}
