import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FirebaseService} from "../../shared/firebase/firebase.service";
import {collection, doc, Firestore, getDoc, getDocs} from "@angular/fire/firestore";
import {CommonModule} from "@angular/common";
import {CartService} from "../../shared/cart/cart.service";
import {Router} from "@angular/router";
import {filter, firstValueFrom, from, Observable} from "rxjs";
import {LayoutService} from "../../shared/layout/layout.service";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit  {
  products: any[] = [];
  animate = false;
  isLoading = true;
  firestore!: Firestore;
  productCounts: { [id: string]: number } = {};
  constructor(private firebaseService: FirebaseService ,private cartService:CartService ,private cdRef: ChangeDetectorRef , private layoutService:LayoutService) {}
  async ngOnInit() {
    try {
      this.isLoading = true;
      this.animate = true;
      this.firebaseService.initFromLocalStorage();
      this.firestore = await firstValueFrom(
        this.firebaseService.getNewFirestore$().pipe(filter((f) => !!f))
      ) as Firestore;

      await this.fetchProducts();
      this.cartService.productCounts$.subscribe(counts => {
        this.productCounts = counts;
        this.cdRef.markForCheck();
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async addToCart(product: any) {
    const p = {
      id: product.id,
      title: product.name,
      price: product.price,
      images: product.imageUrl,
      description:product.desc,
      qty: 1,
      category: product.category,
    };
    this.cartService.add(p);
  }

  private async fetchProducts() {
    const snapshot = await getDocs(collection(this.firestore!, 'products'));
    this.products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
}

