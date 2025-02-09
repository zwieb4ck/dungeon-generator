import { Component, Input } from '@angular/core';
import { IconButtonComponent } from "../icon-button/icon-button.component";
import { Pin } from '../../../models/Pin';
import { CommonModule } from '@angular/common';
import { Node } from '../../../models/Node';

@Component({
  selector: 'app-pin-preview',
  imports: [IconButtonComponent, CommonModule],
  templateUrl: './pin-preview.component.html',
  styleUrl: './pin-preview.component.scss'
})
export class PinPreviewComponent {
  @Input() node: Node | null = null;
}
