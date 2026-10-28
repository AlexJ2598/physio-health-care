import { CanDeactivateFn } from '@angular/router';

/**
 * Contract for components that need to protect
 * unsaved changes before navigation.
 */
export interface HasUnsavedChanges {
  canDeactivate(): boolean;
}

/**
 * Prevents leaving a component when the user
 * has unsaved changes and rejects confirmation.
 */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (
  component
) => {
  return component.canDeactivate();
};
