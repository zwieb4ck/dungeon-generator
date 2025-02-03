import { Component } from '@angular/core';
import { IconComponent } from "../icon/icon.component";

@Component({
  selector: 'app-icon-button',
  imports: [IconComponent],
  template: `
    <button class="icon-button">
      <app-icon>
        <ng-content></ng-content>
      </app-icon>
    </button>
  `,
  styleUrl: './icon-button.component.scss'
})
export class IconButtonComponent { }
