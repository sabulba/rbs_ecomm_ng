import { Component,OnDestroy,OnInit } from '@angular/core';


import {Router, RouterModule} from '@angular/router';
import { Subscription } from 'rxjs';
import {Product} from "../../../models";
import {CartService} from "../../../shared/cart/cart.service";
import {CommonModule} from "@angular/common";
import {CartItemComponent} from "./cartitem/cartitem.component";
import {OrderSummarySheetComponent} from "../orders/app-order-summary-sheet/app-order-summary-sheet.component";
import {MatBottomSheet, MatBottomSheetModule} from "@angular/material/bottom-sheet";

@Component({
  standalone: true,
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  imports: [RouterModule, CommonModule, MatBottomSheetModule ,CartItemComponent, OrderSummarySheetComponent ,],
  styles: [
    `
    /* hide scrollbar */
  ::-webkit-scrollbar {
    width: 0px;
  }
  ::-webkit-scrollbar-thumb {
    background: rgba(136, 136, 136, 0.281);
  }
  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
    `
  ]
})
export class CartComponent implements OnInit, OnDestroy{
  cart:Product[]|any=[];
  total!:number;
  gstAmount!:number;
  estimatedTotal!:number;
  gstRate=0.18;
  shippingCost=0;
  subsTotal!:Subscription;
  subsGST!:Subscription;
  subsEstimatedTotal!:Subscription;
  showStatus=false;
  constructor(private cartService:CartService,private router:Router ,
              private bottomSheet: MatBottomSheet
              ){}

  ngOnInit(): void {
    this.getCart();
    this.getTotal();
  }

  getCart(){
    this.cartService.products.subscribe((products) => {
      this.cart = products;
    });
  }
  getTotal(){
    this.total=this.cartService.getTotal();
    this.subsTotal=this.cartService.totalAmount.subscribe(data=>this.total=parseInt(data.toFixed(2)));
    this.subsGST=this.cartService.gstAmount.subscribe(data=>this.gstAmount=parseInt(data.toFixed(2)));
    this.subsEstimatedTotal=this.cartService.estimatedTotal.subscribe(data=>this.estimatedTotal=parseInt(data.toFixed(2)));
  }
  saveOrder(){
    const bottomSheetRef = this.bottomSheet.open(OrderSummarySheetComponent, {
      height: '40vh',
      data: {user:JSON.parse(localStorage.getItem('currentUser') || ''),
        cart: this.cart,
        total: this.total,
        orderStatus: 'Pending',},
    });

    bottomSheetRef.afterDismissed().subscribe((result) => {
      if (result === 'confirmed') {
        this.cartService.saveNewOrderFromCartToFireBase();
        this.clearCart();
      }
      // if canceled, do nothing
    });
  }
  goToCheckout(){
    this.router.navigate(['/checkout']);
  }

  unsubscribeSubject(){
    this.subsTotal.unsubscribe();
    this.subsGST.unsubscribe();
    this.subsEstimatedTotal.unsubscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribeSubject();
  }

  clearCart(){
    this.cartService.clearCart();
  }
}
