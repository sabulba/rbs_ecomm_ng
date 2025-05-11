
import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential
} from '@angular/fire/auth';
import {BehaviorSubject} from "rxjs";
import {Functions, httpsCallable} from "@angular/fire/functions";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  constructor(private auth: Auth , private functions: Functions) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    this.currentUserSubject.next(null);
    return this.auth.signOut();
  }

  get currentUser() {
    return this.auth.currentUser;
  }
  setCurrentUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  async getCurrentUser() {
    return this.auth.currentUser;
  }
  setAdminRole(uid: string) {
    const fn = httpsCallable(this.functions, 'setAdminRole');
    return fn({ uid }); // This already returns a Promise
  }

  deleteUserAsAdmin(uid: string) {
    const fn = httpsCallable(this.functions, 'deleteUser');
    return fn({ uid }); // This already returns a Promise
  }

}
