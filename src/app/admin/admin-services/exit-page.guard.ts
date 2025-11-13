import { CanDeactivateFn } from '@angular/router';
import Swal from 'sweetalert2';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Promise<boolean>;
}

export const exitPageGuard: CanDeactivateFn<CanComponentDeactivate> = async (
  component,
  currentRoute,
  currentState,
  nextState
) => {
  // Skip if no canDeactivate method
  if (!component.canDeactivate) return true;

  const canLeave = await Promise.resolve(component.canDeactivate());
  if (canLeave) return true;

  // Show SweetAlert2 confirmation
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'You have unsaved changes. Do you really want to leave this page?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, leave page',
    cancelButtonText: 'Stay here',
    reverseButtons: true,
  });

  return result.isConfirmed;
};
