
import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  canDeactivate(): boolean;
}

export interface HasPendingChanges {
  hasPendingChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (
  component
) => {
  return component.canDeactivate();
};
