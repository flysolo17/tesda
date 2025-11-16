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

  // Await the component's own confirmation logic
  return await Promise.resolve(component.canDeactivate());
};
