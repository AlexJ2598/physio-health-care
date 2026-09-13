import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './loading.html',
  styleUrl: './loading.scss'
})
export class LoadingComponent {

  @Input() message = '';

  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  @Input() fullPage = false;

  @Input() inline = false;
}