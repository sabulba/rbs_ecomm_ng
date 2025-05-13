// layout.service.ts
import { Injectable } from '@angular/core';
import {BehaviorSubject, from, Observable} from 'rxjs';
import {doc, Firestore, getDoc} from "@angular/fire/firestore";

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private logoSubject = new BehaviorSubject<string>('');
  public logo$ = this.logoSubject.asObservable();
  private showHeaderSubject = new BehaviorSubject<boolean>(true);
  constructor() {
    const config = JSON.parse(localStorage.getItem('firebaseConfig') || '{}');
    if (config.logo) {
      this.logoSubject.next(config.logo);
    }
  }
  showHeader$ = this.showHeaderSubject.asObservable();

  setShowHeader(value: boolean) {
    this.showHeaderSubject.next(value);
  }

  setLogo(url: string) {
    this.logoSubject.next(url);
  }

  get logo(): string {
    return this.logoSubject.value;
  }
}
