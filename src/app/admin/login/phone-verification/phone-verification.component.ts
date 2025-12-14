import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, signal } from '@angular/core';
import {
  Auth,
  ConfirmationResult,
  linkWithCredential,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  User,
} from '@angular/fire/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { WindowService } from '../window.service';

import { doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-phone-verification',
  standalone: true,
  imports: [NgbModalModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './phone-verification.component.html',
  styleUrl: './phone-verification.component.scss',
})
export class PhoneVerificationComponent implements OnInit {
  counter = signal(0);
  @Input() defaultPhone: string | null = null;
  @Input() currentUser: User | null = null;
  @Input({ required: true }) operation: 'navigate' | 'combined' = 'navigate';
  phone: string = '';
  otp: string = '';
  windowRef: any;

  constructor(
    private auth: Auth,
    private activeModal: NgbActiveModal,
    private windowService: WindowService,
    private firestore: Firestore,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.windowRef = this.windowService.windowRef;
    this.windowRef.recaptchaVerifier = new RecaptchaVerifier(
      this.auth,
      'recaptcha-container',
      {}
    );
    this.windowRef.recaptchaVerifier.render();

    if (this.defaultPhone) {
      this.phone = this.defaultPhone;
    }
  }

  async sendCode() {
    if (!this.phone.startsWith('9') || this.phone.length !== 10) {
      Swal.fire(
        'Error',
        'Invalid phone format. Enter a 10-digit number starting with 9.',
        'error'
      );
      return;
    }

    const appVerifier = this.windowRef.recaptchaVerifier;
    try {
      this.windowRef.confirmationResult = await signInWithPhoneNumber(
        this.auth,
        `+63${this.phone}`,
        appVerifier
      );
      Swal.fire('Success', `OTP has been sent to +63${this.phone}`, 'success');
      this.startCountdown(60);
    } catch (e: any) {
      console.log(e);
      Swal.fire('Error', e?.message ?? 'Failed to send OTP', 'error');
    }
  }

  async verifyCode() {
    try {
      // Step 1: confirm OTP to get verificationId
      const confirmationResult = this.windowRef.confirmationResult;
      const verificationId = confirmationResult.verificationId;

      // Step 2: build a phone credential
      const phoneCredential = PhoneAuthProvider.credential(
        verificationId,
        this.otp
      );

      if (this.operation === 'combined') {
        if (!this.currentUser) {
          throw new Error('No current user found to link credentials.');
        }

        // Step 3: link phone credential to existing email user
        await Promise.all([
          linkWithCredential(this.currentUser, phoneCredential),
          updateDoc(doc(this.firestore, 'users', this.currentUser.uid), {
            phone: this.phone,
          }),
        ]);

        Swal.fire(
          'Success',
          '2FA enabled: phone linked to email account.',
          'success'
        );
        this.activeModal.close(true);
      } else if (this.operation === 'navigate') {
        Swal.fire('Success', 'Phone verified successfully!', 'success');
        this.activeModal.close(true);
        this.router.navigate(['/administration/main']);
      }
    } catch (e: any) {
      console.error(e);
      Swal.fire('Error', e?.message ?? 'Verification failed', 'error');
    }
  }

  private startCountdown(seconds: number) {
    this.counter.set(seconds);
    const interval = setInterval(() => {
      if (this.counter() <= 1) {
        clearInterval(interval);
        this.counter.set(0);
      } else {
        this.counter.update((v) => v - 1);
      }
    }, 1000);
  }
}
