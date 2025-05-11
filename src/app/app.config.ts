import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {provideFirebaseApp ,initializeApp} from "@angular/fire/app";
import {provideFirestore ,getFirestore} from "@angular/fire/firestore";
import {environment} from "../environments/environment";
import {getAuth, provideAuth} from "@angular/fire/auth";
import {getFunctions, provideFunctions} from "@angular/fire/functions";
import {getStorage, provideStorage} from "@angular/fire/storage";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideFunctions(() => getFunctions()),
      provideFirestore(() => getFirestore()),
      provideAuth(() => getAuth()),
      provideStorage(() => getStorage()),
    ),
  ],
};
