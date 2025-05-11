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
import {getDownloadURL, ref, uploadBytes,Storage} from "@angular/fire/storage";


@Component({
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
  templateUrl: `./product-dialog.component.html`,
  styleUrls: [`./product-dialog.component.css`],
})
export class ProductDialogComponent {
  form: FormGroup;
  isViewMode: boolean = false;
  imagePreview: string | ArrayBuffer | null = null;
  storage!: Storage;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { product?: any; mode: 'view' | 'edit' | 'create' ,storage: Storage  },
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductDialogComponent>,

  ) {
    this.storage = data.storage;
    this.isViewMode = this.data.mode === 'view';
    this.form = this.fb.group({
      name: [data.product?.name || '', Validators.required],
      category: [data.product?.category || '', Validators.required],
      price: [data.product?.price || 0, Validators.required],
      desc: [data.product?.desc || 0, Validators.required],
      imageUrl: [null]
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

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    if (file) {
      this.form.patchValue({ image: file });
      this.form.get('image')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
      // Upload to Firebase
      const filePath = `images/${Date.now()}_${file.name}`;
      const storageRef = ref( this.storage, filePath);

      uploadBytes(storageRef, file).then(() => {
        getDownloadURL(storageRef).then((url) => {
          this.form.patchValue({ imageUrl: url });
        });
      }).catch(error => {
        console.error('Upload failed:', error);
      });
    }
  }
}
