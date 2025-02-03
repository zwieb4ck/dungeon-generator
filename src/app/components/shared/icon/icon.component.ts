import { Component } from '@angular/core';

@Component({
  selector: 'app-icon',
  imports: [],
  template: `
        <span class="material-symbols-outlined">
            <ng-content></ng-content>
        </span>
        `,
  styleUrl: './icon.component.scss'
})
export class IconComponent { }