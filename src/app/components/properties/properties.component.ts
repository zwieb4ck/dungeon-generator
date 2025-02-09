import { Component } from '@angular/core';
import { ObjectsService } from '../../services/objects/objects.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Room, { EPropertiesType, TProperty } from '../../models/Room';
import { StringComponent } from "./string/string.component";
import { BooleanComponent } from "./boolean/boolean.component";
import { ButtonComponent } from "./button/button.component";
import { NumberComponent } from './number/number.component';
import { TextComponent } from './text/text.component';
import { RangeComponent } from './range/range.component';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, StringComponent, BooleanComponent, ButtonComponent, NumberComponent, TextComponent, RangeComponent],
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent {
  public selectedNode: Room | null = null;

  public EPropertiesType = EPropertiesType;

  constructor(public objectService: ObjectsService) {
    this.objectService.SelectionSubject.subscribe(s => {
      if (s === null) {
        setTimeout(()=> {
          this.selectedNode = s;
        }, 50);
      } else {
        this.selectedNode = s;
      }
      s?.updateCache();
    });
  }

  public camelCaseToWordsCapitalized(input: string): string {
    return input.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, s => s.toUpperCase());
  }

  public handleChange(property: TProperty | null) {
    if(this.selectedNode && property) {
      this.selectedNode.updateProperty(property);
    }
    if (!this.selectedNode ||  !property) return;
    if (property.type === EPropertiesType.Boolean && property.propName === "isStart") {
      this.objectService.updateStartNode(this.selectedNode);
    }
  }

}
