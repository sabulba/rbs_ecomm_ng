import {Injectable} from '@angular/core';
import {FirebaseApp, initializeApp} from '@angular/fire/app';
import {
  Firestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  CollectionReference,
  DocumentData,
  query, where, getFirestore
} from '@angular/fire/firestore';
import {BehaviorSubject, from, Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {Functions, getFunctions, httpsCallable} from "@angular/fire/functions";
import {getStorage} from "@angular/fire/storage";

@Injectable({providedIn: 'root'})
export class FirebaseService {
  private firebaseApp: FirebaseApp | null = null;
  public newFirestore: Firestore | null = null;
  public firestoreReady = new BehaviorSubject<Firestore | null>(null);

  constructor(private firestore: Firestore ,private functions: Functions) {
    this.initFromLocalStorage();
  }
  // Init Firebase app and Firestore from main firebase config for projects or users data only
  initFromMainConfig() {
    const config = JSON.parse(JSON.stringify(environment.firebaseConfig));
    if (!config) return;
    try {
      this.firebaseApp = initializeApp(config, environment.firebaseConfig.projectId);
      this.newFirestore = getFirestore(this.firebaseApp);
      this.firestoreReady.next(this.newFirestore);
    } catch (error) {
      console.error('Failed to initialize Firebase from main firebase:', error);
    }
  }

  // Init Firebase app and Firestore from saved config
  initFromLocalStorage() {
    const config = JSON.parse(localStorage.getItem('firebaseConfig') || JSON.stringify(environment.firebaseConfig));
    if (!config) return;
    try {
      this.firebaseApp = initializeApp(config, (config.projectId || environment.firebaseConfig.projectId));
      this.newFirestore = getFirestore(this.firebaseApp);
      this.firestoreReady.next(this.newFirestore);
    } catch (error) {
      console.error('Failed to initialize Firebase from localStorage:', error);
    }
  }

  // ✅ Initialize Firebase app with default config
  async switchToUserApplication(userId: string) {
    const projectId = await this.getUserProjectId(userId);
    if (!projectId) throw new Error('No projectId found for the user');
    const userAppConfig = await this.getUserAppConfig(projectId);
    if (!userAppConfig) throw new Error('No Firebase config found for this projectId');
    // Initialize Firebase app with the user's config
    this.firebaseApp = initializeApp(userAppConfig, Date.now().toString());
    this.newFirestore = getFirestore(this.firebaseApp);
    localStorage.setItem('firebaseConfig', JSON.stringify(userAppConfig));
    this.firestoreReady.next(this.newFirestore); // Notify subscribers that Firestore is ready
  }

  // ✅ Get user's projectId
  async getUserProjectId(userId: string): Promise<string | null> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('id', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data() as any;
    return data?.projectId ?? null;
  }

  // ✅ Get app config by projectId
  private async getUserAppConfig(projectId: string): Promise<any | null> {
    const projectsRef = collection(this.firestore, 'projects');
    const q = query(projectsRef, where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) return null;

    // Assuming only one config per projectId
    const docSnap = querySnapshot.docs[0];
    return {id: docSnap.id, ...docSnap.data()};
  }

  //Firestore getter
  getNewFirestore(): Firestore | null {
    return this.newFirestore;
  }

  getNewFirestore$() {
    return this.firestoreReady.asObservable(); // This returns an observable for components to subscribe
  }

  // ✅ Add a new document
  async addDocument(collectionName: string, data: any): Promise<void> {
    const newDocRef = doc(collection(this.firestore, collectionName));
    await setDoc(newDocRef, data);
  }

  // ✅ Get all documents from a collection
  async getDocuments(collectionName: string): Promise<any[]> {
    const colRef = collection(this.firestore, collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  }

  // ✅ Update a document
  async updateDocument(collectionName: string, id: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, collectionName, id);
    await updateDoc(docRef, data);
  }

  // ✅ Delete a document
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    const docRef = doc(this.firestore, collectionName, id);
    await deleteDoc(docRef);
  }

  // ✅ Get a document by ID
  async getDocumentById(collectionName: string, id: string): Promise<any> {
    const q = query(
      collection(this.firestore, collectionName),
      where('id', '==', id)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return {id: docSnap.id, ...docSnap.data()};
    } else {
      return null;
    }
  }

  // ✅ Add new document with auto ID
  async addNewDocument(collectionName: string, data: any): Promise<void> {
    const colRef = collection(this.firestore, collectionName);
    const docRef = doc(colRef); // Auto-generated ID
    await setDoc(docRef, data);
  }
  deleteUserAsAdmin(uid: string) {
    const fn = httpsCallable(this.functions, 'deleteUser');
    return from(fn({ uid })); // 🔁 Convert Promise to Observable
  }

  getStorageInstance() {
    if (!this.firebaseApp) throw new Error('Firebase app not initialized');
    return getStorage(this.firebaseApp);
  }
}
