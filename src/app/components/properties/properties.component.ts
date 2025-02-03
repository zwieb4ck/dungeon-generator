import { Component } from '@angular/core';
import { ObjectsService } from '../../services/objects/objects.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Room from '../../models/Room';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent {
  public selectedNode: Room | null = null;

  constructor(public objectService: ObjectsService) {
    this.objectService.SelectionSubject.subscribe(s => {
      setTimeout(()=>{
        this.selectedNode = s;
      },20)
    });
  }

  public camelCaseToWordsCapitalized(input: string): string {
    return input.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, s => s.toUpperCase());
  }

}
