import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ObjectsService } from '../../services/objects/objects.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Room, { EPropertiesType, TProperty, TRoom } from '../../models/Room';
import { StringComponent } from './string/string.component';
import { BooleanComponent } from './boolean/boolean.component';
import { ButtonComponent } from './button/button.component';
import { NumberComponent } from './number/number.component';
import { TextComponent } from './text/text.component';
import { RangeComponent } from './range/range.component';
import { EPinType, Pin } from '../../models/Pin';
import { TDungeonTile } from '../../services/generator/generator.service';
import { Vector2 } from 'three';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StringComponent,
    BooleanComponent,
    ButtonComponent,
    NumberComponent,
    TextComponent,
    RangeComponent,
  ],
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],
})
export class PropertiesComponent implements OnInit, OnDestroy {
  public selectedNode: Room | null = null;
  public EPropertiesType = EPropertiesType;

  public room: TRoom | null = null;

  public context: CanvasRenderingContext2D | null = null;

  public get inputPins(): Pin[] {
    if (!this.selectedNode) return [];
    return this.selectedNode.pins.filter((p) => p.type === EPinType.In);
  }

  public get outputPins(): Pin[] {
    if (!this.selectedNode) return [];
    return this.selectedNode.pins.filter((p) => p.type === EPinType.Out);
  }

  constructor(public objectService: ObjectsService, public ref: ElementRef) {
    this.objectService.SelectionSubject.subscribe((s) => {
      this.resetCanvas();
      if (s === null) {
        setTimeout(() => {
          this.selectedNode = s;
        }, 50);
      } else {
        this.selectedNode = s;
        const connections = this.objectService.getConnectionsById(s.id);
        s.updateConnections(connections);
        s.generateRoom();
        this.room = s.Room;
        s.roomUpdater.subscribe((room) => {
          this.resetCanvas();
          this.drawRoomPreview(room, new Vector2(50, 50), 200, 200); // Skaliert auf 200x200 Pixel
        });
      }
      s?.updateCache();
    });
  }

  public ngOnInit(): void {
    const canvas = this.ref.nativeElement.querySelector('#room-preview');
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;
    this.context = canvas.getContext('2d');
  }

  public ngOnDestroy(): void {
    this.resetCanvas();
  }

  private resetCanvas() {
    this.context?.clearRect(
      0,
      0,
      this.context.canvas.height,
      this.context.canvas.width
    );
  }

  public camelCaseToWordsCapitalized(input: string): string {
    return input
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, (s) => s.toUpperCase());
  }

  public handleChange(property: TProperty | null) {
    if (this.selectedNode && property) {
      this.selectedNode.updateProperty(property);
    }
    if (!this.selectedNode || !property) return;
    if (
      property.type === EPropertiesType.Boolean &&
      property.propName === 'isStart'
    ) {
      this.objectService.updateStartNode(this.selectedNode);
    }
  }
  private drawRoomPreview(room: TRoom, position: Vector2, maxWidth: number, maxHeight: number): void {
    const { width, height, connections, type } = room;
console.log("Drawing", room);
    // Definiere Farben
    const colors: Record<number, string> = {
      0: "#37946e", // Grün für Räume
      1: "#37946e", // Grün für Pfade
    };
    const connectionColor = "#ac3232"; // Rot für Verbindungen
    const wallColor = "#2c3e50"; // Dunkles Blau für Wände
    const gridLineColor = "#555"; // Graue Linien für Sub-Tiles

    // Berechnung des besten Skalierungsfaktors
    const scaleX = maxWidth / (width * 3);
    const scaleY = maxHeight / (height * 3);
    const scale = Math.min(scaleX, scaleY); // Stelle sicher, dass das Verhältnis erhalten bleibt

    // Berechnung der tatsächlichen Größe
    const actualWidth = width * 3 * scale;
    const actualHeight = height * 3 * scale;

    // Berechnung der zentrierten Position
    const xOffset = position.x + (maxWidth - actualWidth) / 2;
    const yOffset = position.y + (maxHeight - actualHeight) / 2;

    // Zeichne das Grid mit deutlicheren Unterteilungen
    for (let i = 0; i < width * 3; i++) {
      for (let j = 0; j < height * 3; j++) {
        const cellX = xOffset + i * scale;
        const cellY = yOffset + j * scale;

        // Prüfen, ob diese Subzelle eine Verbindung ist
        const isConnection = connections?.some((conn: any) => {
          const { dir } = conn;
          const connX = conn.x * 3 + (dir === 1 ? 2 : dir === 3 ? 0 : 1);
          const connY = conn.y * 3 + (dir === 0 ? 0 : dir === 2 ? 2 : 1);
          return connX === i && connY === j;
        });

        // Prüfen, ob diese Subzelle eine Wand ist (äußere Begrenzung)
        const isWall = i === 0 || j === 0 || i === width * 3 - 1 || j === height * 3 - 1;

        if (isConnection) {
          this.context!.fillStyle = connectionColor;
        } else if (isWall) {
          this.context!.fillStyle = wallColor;
        } else {
          this.context!.fillStyle = "#95a5a6"; // Standardfarbe falls unbekannt
        }

        // Subzelle füllen
        this.context!.fillRect(cellX, cellY, scale, scale);

        // Optional: Gitterlinien für Subzellen zeichnen (feineres Grid)
        this.context!.strokeStyle = gridLineColor;
        this.context!.lineWidth = 0.5;
        this.context!.strokeRect(cellX, cellY, scale, scale);
      }
    }

    // **Hauptgitter für 1x1 Tiles hervorheben** (fette Linien)
    this.context!.strokeStyle = "rgba(0,0,0,0.5)"; // Dunkler für Hauptgitter
    this.context!.lineWidth = 2;
    for (let i = 0; i <= width; i++) {
      const lineX = xOffset + i * scale * 3;
      this.context!.beginPath();
      this.context!.moveTo(lineX, yOffset);
      this.context!.lineTo(lineX, yOffset + actualHeight);
      this.context!.stroke();
    }
    for (let j = 0; j <= height; j++) {
      const lineY = yOffset + j * scale * 3;
      this.context!.beginPath();
      this.context!.moveTo(xOffset, lineY);
      this.context!.lineTo(xOffset + actualWidth, lineY);
      this.context!.stroke();
    }
}

}
