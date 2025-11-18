import { Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  linkWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  UserCredential,
} from '@angular/fire/auth';
import {
  collection,
  collectionCountSnap,
  collectionData,
  doc,
  docData,
  Firestore,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { map, Observable, of, switchMap } from 'rxjs';
import { User, UserConverter, UserType } from '../models/Users';
import { Router } from '@angular/router';
import { em } from '@fullcalendar/core/internal-common';
import Swal from 'sweetalert2';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USER_COLLECTION = 'users';

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storage: Storage
  ) {}

  async uploadProfile(id: string, profile: File): Promise<void> {
    try {
      // Create a unique path for the profile image
      const timestamp = Date.now();
      const extension = profile.name.split('.').pop();
      const filePath = `profiles/${id}_${timestamp}.${extension}`;
      const storageRef = ref(this.storage, filePath);

      // Upload the file
      await uploadBytes(storageRef, profile);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update the user document with the new profile URL
      const userRef = doc(this.firestore, 'users', id);
      await updateDoc(userRef, {
        profile: downloadURL,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Profile upload failed:', error);
      throw error;
    }
  }

  async registerWithEmailAndPassword(
    name: string,
    age: number,
    gender: string,
    email: string,
    password: string
  ): Promise<User> {
    const cred = await createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );

    const userData: User = {
      id: cred.user.uid,
      name,
      age,
      gender,
      email,
      profile: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      type: UserType.USER,
    };

    const userRef = doc(
      collection(this.firestore, this.USER_COLLECTION).withConverter(
        UserConverter
      ),
      userData.id
    );

    await setDoc(userRef, userData);

    const returnUrl = 'https://tesda-system.web.app/';
    await sendEmailVerification(cred.user, { url: returnUrl });

    await signOut(this.auth);

    return userData;
  }
  updateUser(user: User): Promise<void> {
    const userRef = doc(this.firestore, this.USER_COLLECTION, user.id);
    const { id, ...userData } = user;
    return updateDoc(userRef, userData);
  }

  async loginWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      if (!result.user.emailVerified) {
        await sendEmailVerification(result.user);
        await signOut(this.auth);

        await Swal.fire({
          icon: 'warning',
          title: 'Email Not Verified',
          text: 'A verification email has been sent to your inbox. Please verify your email before logging in.',
          confirmButtonText: 'OK',
        });

        throw new Error('Email not verified');
      }

      return this.getOrThrowUserFromFirestore(result.user.uid);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // --- HELPER: Fetch Firestore user ---
  private async getOrThrowUserFromFirestore(uid: string): Promise<User> {
    const userDocRef = doc(
      collection(this.firestore, this.USER_COLLECTION).withConverter(
        UserConverter
      ),
      uid
    );
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      await signOut(this.auth);
      throw new Error('User not found in Firestore.');
    }

    return userSnapshot.data()!;
  }
  async registerWithGoogle(): Promise<User> {
    const cred = await signInWithPopup(this.auth, new GoogleAuthProvider());
    const uid = cred.user.uid;
    const email = cred.user.email || '';

    const userRef = doc(
      collection(this.firestore, this.USER_COLLECTION).withConverter(
        UserConverter
      ),
      uid
    );
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return snap.data()!;
    }
    const user: User = {
      id: '',
      type: UserType.ADMIN,
      name: '',
      email: '',
      gender: '',
      age: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return user;
  }

  // --- LOGOUT ---
  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  // --- OBSERVABLE USER STREAM ---
  getCurrentUser(): Observable<User | null> {
    return authState(this.auth).pipe(
      switchMap((firebaseUser) => {
        if (!firebaseUser) return of(null);
        const userDoc = doc(
          collection(this.firestore, this.USER_COLLECTION).withConverter(
            UserConverter
          ),
          firebaseUser.uid
        );
        return docData(userDoc).pipe(map((data) => data ?? null));
      })
    );
  }

  // --- DIRECT GET USER ---
  async getUser(): Promise<User | null> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return null;

    const result = await getDoc(
      doc(
        collection(this.firestore, this.USER_COLLECTION).withConverter(
          UserConverter
        ),
        currentUser.uid
      )
    );

    return result.exists() ? result.data()! : null;
  }

  getAllUsers(): Observable<User[]> {
    const q = query(
      collection(this.firestore, this.USER_COLLECTION).withConverter(
        UserConverter
      ),
      where('type', '==', UserType.USER)
    );
    return collectionData(q);
  }

  async loginWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(this.auth, provider);
      const googleUser = result.user;

      if (!googleUser.email) {
        await signOut(this.auth);
        throw new Error('Google account does not have an email address.');
      }

      const email = googleUser.email;

      // Check if user exists in Firestore
      const userQuery = query(
        collection(this.firestore, this.USER_COLLECTION).withConverter(
          UserConverter
        ),
        where('email', '==', email),
        limit(1)
      );
      const snapshot = await getDocs(userQuery);

      if (snapshot.empty) {
        await signOut(this.auth);
        throw new Error('No user found with this Google account.');
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();

      // Optional: check if provider is Google
      const isGoogleProvider = googleUser.providerData.some(
        (p) => p.providerId === 'google.com'
      );

      if (!isGoogleProvider) {
        await signOut(this.auth);
        throw new Error('This email is registered with a different provider.');
      }

      return userData;
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        const pendingCred = GoogleAuthProvider.credentialFromError(error);
        const email = error.customData?.email;

        const methods = await fetchSignInMethodsForEmail(this.auth, email);

        await signOut(this.auth);

        throw new Error(
          `This email is registered with a different provider: ${methods.join(
            ', '
          )}. Please sign in using that method.`
        );
      }

      console.error('Google login failed:', error);
      throw new Error(error.message || 'Google login failed.');
    }
  }

  forgotPassword(email: string) {
    const returnUrl = 'https://tesda-system.web.app/';
    return sendPasswordResetEmail(this.auth, email, { url: returnUrl });
  }
}
