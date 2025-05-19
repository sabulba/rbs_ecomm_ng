import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import {CurrencyPipe, NgFor, NgIf, NgTemplateOutlet} from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { addDoc, collection, deleteDoc, doc, Firestore, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

import { FirebaseService } from '../../../../shared/firebase/firebase.service';
import { Product } from '../../../../models';
import { ProductDialogComponent } from '../../shared/product-dialog/product-dialog.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FabMenuComponent} from "../../../../layout/components/fab-menu/fab-menu.component";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from "@angular/material/expansion";

@Component({
  standalone: true,
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css'],
  imports: [
    NgFor,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    CurrencyPipe,
    NgIf,
    NgTemplateOutlet,
    MatProgressSpinnerModule,
    FabMenuComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription
  ]
})
export class AdminProductsComponent implements OnInit {
  products: MatTableDataSource<any> = new MatTableDataSource<Product>();
  displayedColumns: string[] = ['imageUrl','name', 'category', 'price', 'actions'];
  isLoading = true;
  firestore!: Firestore;
  isMobile = false;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private dialog: MatDialog,
    private breakpointObserver: BreakpointObserver,
  ) {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  async ngOnInit() {
    try {
      this.firebaseService.initFromLocalStorage();
      this.firestore = await firstValueFrom(this.firebaseService.getNewFirestore$()) as Firestore;
      const productsRef = collection(this.firestore, 'products');

      onSnapshot(productsRef, (snapshot) => {
        this.products.data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any), //Partial<Product>
        })) as Product[];

        this.isLoading = false;
        if (this.sort) {
          this.products.sort = this.sort;
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      this.isLoading = false;
    }
  }

  editProduct(product: any) {
    const ref = this.dialog.open(ProductDialogComponent, {
      data: { product, mode: 'edit', storage: this.firebaseService.getStorageInstance() },
    });

    ref.afterClosed().subscribe(async (result: any) => {  //TBD:Partial<Product>
      if (result) {
        try {
          const fs = await firstValueFrom(this.firebaseService.getNewFirestore$()) as Firestore;
          const productRef = doc(fs, 'products', product.id!);
          await updateDoc(productRef, result);
        } catch (error) {
          console.error('Error updating product:', error);
        }
      }
    });
  }

  async deleteProduct(product: any) {
    const isConfirmed = confirm(`Are you sure you want to delete the product: ${product.name}?`);
    if (isConfirmed) {
      try {
        const fs = await firstValueFrom(this.firebaseService.getNewFirestore$()) as Firestore;
        const productRef = doc(fs, 'products', product.id!);
        await deleteDoc(productRef);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  }

  createProduct() {
    const ref = this.dialog.open(ProductDialogComponent, {
      data: { mode: 'create' ,  storage: this.firebaseService.getStorageInstance()},
    });

    ref.afterClosed().subscribe(async (result: any) => {//Partial<Product>
      if (result) {
        try {
          const fs = await firstValueFrom(this.firebaseService.getNewFirestore$()) as Firestore;
          const productsRef = collection(fs, 'products');
          await addDoc(productsRef, result);
        } catch (error) {
          console.error('Error adding product:', error);
        }
      }
    });
  }


}
