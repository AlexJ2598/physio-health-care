
import {
  Directive,
  HostListener,
  Input,
} from '@angular/core';

import { HasPendingChanges } from '../../core/guards/unsaved-changes.guard';

@Directive({
  selector: '[appPreventUnload]',
  standalone: true,
})
export class PreventUnloadDirective {

  @Input({
    alias: 'appPreventUnload',
    required: true,
  })
  formComponent!: HasPendingChanges;

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.formComponent.hasPendingChanges()) {
      return;
    }

    event.preventDefault();

    // Compatibility with browsers that still require returnValue
    event.returnValue = '';
  }
}
