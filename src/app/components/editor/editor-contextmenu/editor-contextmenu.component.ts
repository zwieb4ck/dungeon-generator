import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ENodeType } from '../../../models/Node';
import { MathUtils, Vector2 } from 'three';
import { AppService } from '../../../services/app/app.service';

export type ContextMenuItem = {
  type: ENodeType
}

@Component({
  selector: 'app-editor-contextmenu',
  templateUrl: './editor-contextmenu.component.html',
  styleUrl: './editor-contextmenu.component.scss'
})
export class EditorContextmenuComponent implements OnInit {
  @Input() public rightClickVector: Vector2 | null = null;

  @Output() public createNode: EventEmitter<ContextMenuItem> = new EventEmitter();

  public get ENodeType() {
    return ENodeType;
  }

  constructor(public ref: ElementRef) { }

  ngOnInit() {
    if (this.rightClickVector) {
      const parentBounds = this.ref.nativeElement.parentElement.getBoundingClientRect();
      const menuBounds = this.ref.nativeElement.getBoundingClientRect();
      
      let posX = MathUtils.clamp(this.rightClickVector.x, 20, parentBounds.width - menuBounds.width - 20);
      let posY = MathUtils.clamp(this.rightClickVector.y, 20, parentBounds.height - menuBounds.height - 20);

      this.ref.nativeElement.style.top = `${posY}px`;
      this.ref.nativeElement.style.left = `${posX}px`;
    }
  }

  public createNodeType(type: ENodeType) {
    this.createNode.emit({ type });
  }
}
