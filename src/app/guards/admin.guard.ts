import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { UserType } from '../models/Users';
import { AuthService } from '../services/auth.service';
import { ToastrService } from '../services/toastr.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);
  return authService.getCurrentUser().pipe(
    take(1),
    map((user) => {
      if (user?.type === UserType.ADMIN) return true;
      console.log(user);
      return router.createUrlTree(['/landing-page'], {
        queryParams: { returnUrl: state.url },
      });
    })
  );
};
