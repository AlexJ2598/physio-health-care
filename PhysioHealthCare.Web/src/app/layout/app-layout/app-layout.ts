import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppHeaderComponent } from '../../shared/components/app-header/app-header';
import { ToastComponent } from '../../shared/components/toast/toast';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    AppHeaderComponent,
    ToastComponent
  ],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss'
})
export class AppLayoutComponent {}