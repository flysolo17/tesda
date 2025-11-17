import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from '../../services/toastr.service';
import { AuthService } from '../../services/auth.service';
import { UserType } from '../../models/Users';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ForgotPasswordDialogComponent } from '../../common/forgot-password-dialog/forgot-password-dialog.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading$ = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.loginForm = fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.initUser();
  }

  initUser() {
    this.loading$ = true;
    this.authService.getUser().then((data) => {
      console.log(data);
      this.loading$ = false;
      if (data?.type === UserType.ADMIN) {
        this.router.navigate(['/administration/main']);
      }
    });
  }

  submit() {
    if (this.loginForm.invalid) {
      Swal.fire('Error', 'Invalid Form', 'error');
      return;
    }

    this.loading$ = true;
    const { email, password } = this.loginForm.value;

    this.authService
      .loginWithEmailAndPassword(email, password)
      .then((data) => {
        if (data.type === UserType.ADMIN) {
          Swal.fire('Success', 'Successfully Login!', 'success');
          this.router.navigate(['/administration/main']);
        } else {
          Swal.fire('Error', 'Invalid User', 'error');
          this.authService.logout();
        }
      })
      .catch((e) => {
        Swal.fire('Error', e['message'] ?? 'Unknown Error', 'error');
      })
      .finally(() => (this.loading$ = false));
  }
  forgotPassword() {
    this.modalService.open(ForgotPasswordDialogComponent);
  }
}
