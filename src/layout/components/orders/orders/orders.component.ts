import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, RouterModule} from "@angular/router";
import {CommonModule} from "@angular/common";
import {FirebaseService} from "../../../../shared/firebase/firebase.service";
import {collection, onSnapshot, updateDoc, deleteDoc, doc} from "@angular/fire/firestore";
import {filter, firstValueFrom, Subscription} from "rxjs";
import {Order} from "../../../../models/Order.model";
import {MatIconButton} from "@angular/material/button";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatMenuModule} from "@angular/material/menu";
import {MatIcon} from "@angular/material/icon";
import {AppOrderManualSheetComponent} from "../app-order-manual-sheet/app-order-manual-sheet.component";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {DateSelectorSheetComponent} from "../../../../shared/date-selector-sheet/date-selector-sheet.component";


@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterModule, CommonModule, MatTooltipModule, MatIconButton, MatMenuModule, MatIcon],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  isLoading = true;

  selectedStatus: 'pending' | 'confirmed' = 'pending';
  selectedMonth: string = '';
  selectedTab: string = 'pending'; // ברירת מחדל
  unsubscribe: () => void = () => {
  };

  constructor(private firebaseService: FirebaseService,
              private router: Router ,
              private bottomSheet: MatBottomSheet) {}

  async ngOnInit() {
    try {
      this.firebaseService.initFromLocalStorage();
      const firestore = await firstValueFrom(
        this.firebaseService.getNewFirestore$().pipe(filter((f) => !!f))
      );

      const ordersRef = collection(firestore!, 'orders');

      // ✅ Real-time listener
      this.unsubscribe = onSnapshot(ordersRef, snapshot => {
        this.orders = snapshot.docs.map(doc => {
          const data = doc.data() as Omit<Order, 'id' | 'date'> & { date: any };
          data.firstName = data.firstName || '';
          data.lastName = data.lastName || '';
          return {
            id: doc.id,
            ...data,
            date: data.date?.toDate?.() ?? new Date(),
          };
        });
        this.applyFilters();
        this.isLoading = false;
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    this.unsubscribe?.(); // ✅ Stop listening when component is destroyed
  }

  applyFilters() {
    this.filteredOrders = this.orders
      .filter(order => {
        const dateStr = new Date(order.date).toISOString().slice(0, 7);
        const matchesStatus = order.status?.toLowerCase() === this.selectedStatus;
        const matchesMonth = this.selectedMonth ? dateStr === this.selectedMonth : true;

        console.log(`Order ${order.id} | Status: ${order.status} | Date: ${dateStr} | Match: ${matchesStatus && matchesMonth}`);

        return matchesStatus && matchesMonth;
      });

    this.filteredOrders.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Descending: newest first
    });
  }

  onStatusChange(status: 'pending' | 'confirmed') {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onMonthChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedMonth = input.value;
    this.applyFilters();
  }

  async confirmOrder(id: string) {
    try {
      const firestore = await firstValueFrom(
        this.firebaseService.getNewFirestore$().pipe(filter((f) => !!f))
      );
      const orderRef = doc(firestore!, 'orders', id);
      await updateDoc(orderRef, {
        status: 'confirmed',
      });
      console.log(`Order ${id} confirmed.`);
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  }

  async cancelOrder(id: string) {
    try {
      const firestore = await firstValueFrom(
        this.firebaseService.getNewFirestore$().pipe(filter((f) => !!f))
      );
      const orderRef = doc(firestore!, 'orders', id);
      await deleteDoc(orderRef);
      console.log(`Order ${id} deleted.`);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  }

  selectMonth() {
    const bottomSheetRef = this.bottomSheet.open(DateSelectorSheetComponent, {
      height: '28vh',
    });

    bottomSheetRef.afterDismissed().subscribe((result) => {
      if (!result || result.status === 'canceled') return; // prevent duplicate
      this.selectedMonth = result.selectedDate;
      this.applyFilters();
    });
  }
}
