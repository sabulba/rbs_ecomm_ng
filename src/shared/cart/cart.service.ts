import { Injectable } from '@angular/core';
import {BehaviorSubject, take} from 'rxjs';
import { Product } from '../../models';
import { FirebaseService } from '../firebase/firebase.service';
import { addDoc, collection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: Product[] = [];
  private cartSubject = new BehaviorSubject<Product[]>([]); // already used
  public products = new BehaviorSubject<Product[]>([]);
  public totalAmount = new BehaviorSubject<number>(0);
  public gstAmount = new BehaviorSubject<number>(0);
  public estimatedTotal = new BehaviorSubject<number>(0);
  public productCounts$ = new BehaviorSubject<{ [productId: string]: number }>({});
  public user: any = JSON.parse(localStorage.getItem('currentUser') || '{}');
  public isLoading = false;

  constructor(private firebaseService: FirebaseService) {
    this.restoreCartFromStorage();
  }

  private saveCart(): void {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.products.next([...this.cart]);
    this.updateProductCounts();
    this.getTotal();
  }

  public get getCart(): Product[] {
    return [...this.cart]; // return copy
  }

  public add(product: Product): void {
    const index = this.cart.findIndex((p) => p.id === product.id);
    const price = Number(product.price) || 0;

    if (index !== -1) {
      const existing = this.cart[index];
      existing.qty = (existing.qty || 1) + 1;
      existing.totalprice = price * existing.qty;
    } else {
      product.qty = 1;
      product.totalprice = price;
      this.cart.push({ ...product });
    }

    this.saveCart();
  }

  public remove(product: Product): void {
    const index = this.cart.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      this.cart.splice(index, 1);
      this.saveCart();
    }
  }

  public addQty(product: Product): void {
    const index = this.cart.findIndex((p) => p.id === product.id);
    if (index !== -1) {
      const item = this.cart[index];
      item.qty = (item.qty || 0) + 1;
      item.totalprice = item.qty * (item.price || 0);
      this.saveCart();
    }
  }

  public lessQty(product: Product): void {
    const index = this.cart.findIndex((p) => p.id === product.id);
    if (index !== -1 && this.cart[index].qty! > 1) {
      const item = this.cart[index];
      item.qty!--;
      item.totalprice = item.qty! * (item.price || 0);
      this.saveCart();
    }
  }

  private updateProductCounts(): void {
    const counts: { [id: string]: number } = {};
    for (const item of this.cart) {
      counts[item.id!] = item.qty ?? 1;
    }
    localStorage.setItem('productCounts', JSON.stringify(counts));
    this.productCounts$.next({ ...counts });
  }

  private restoreCartFromStorage(): void {
    try {
      const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (Array.isArray(storedCart)) {
        this.cart = storedCart;
        this.products.next([...this.cart]); // emit cart without calling saveCart
        this.updateProductCounts();
        this.getTotal();
      }
    } catch (e) {
      console.error('Error restoring cart from storage:', e);
      this.cart = [];
    }
  }

  public getTotal(): number {
    const total = this.cart.reduce((sum, item) => {
      const price = Number(item.totalprice);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    const gstRate = 0.18;
    const gst = total * gstRate;
    const estimated = total + gst;

    this.totalAmount.next(total);
    this.gstAmount.next(gst);
    this.estimatedTotal.next(estimated);

    return total;
  }

  public saveNewOrderFromCartToFireBase(): void {
    const orderData = {
      cartItems: this.cart.map((p) => this.convertProduct(p)),
      totalAmount: this.totalAmount.value,
      status: 'pending',
      email: this.user?.email || '',
      firstName: this.user?.firstName || '',
      lastName: this.user?.lastName || '',
      date: new Date().toISOString(),
    };
    this.firebaseService.getNewFirestore$()
      .pipe(take(1))
      .subscribe(async (firestore) => {
        if (!firestore) return;
        try {
          this.isLoading = true;
          const ordersCollection = collection(firestore, 'orders');
          await addDoc(ordersCollection, orderData);
        } catch (error) {
          console.error('Error saving order:', error);
        } finally {
          this.isLoading = false;
        }
      });

    // this.firebaseService.getNewFirestore$().subscribe(async (firestore) => {
    //   if (!firestore) return;
    //   try {
    //     this.isLoading = true;
    //     const ordersCollection = collection(firestore, 'orders');
    //     await addDoc(ordersCollection, orderData);
    //     // Optional: clear cart
    //     // this.cart = [];
    //     // this.saveCart();
    //   } catch (error) {
    //     console.error('Error saving order:', error);
    //   } finally {
    //     this.isLoading = false;
    //   }
    // });

  }

  private convertProduct(product: Product): any {
    return {
      id: String(product.id),
      name: product.title ?? '',
      desc: product.desc ?? '',
      category: product.category ?? '',
      brand: product.type ?? '',
      imageUrl: product.images ?? '',
      price: product.price ?? 0,
      cartQuantity: product.qty ?? 1,
      createdAt: new Date().toISOString(),
      editedAt: {
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
      },
    };
  }
  clearCart() {
    this.cart = []; // clear the internal cart array
    this.products.next([]); // emit empty list
    this.totalAmount.next(0);
    this.gstAmount.next(0);
    this.estimatedTotal.next(0);
    localStorage.removeItem('cart');
    localStorage.removeItem('productCounts');
    this.productCounts$.next({});
  }
}
