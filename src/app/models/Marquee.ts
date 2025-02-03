import { Vector2 } from "three";
import { Node } from "./Node";
import { Selectable } from "./Selectable";

export class Marquee {
  /**
   * Prüft, welche Nodes sich innerhalb des Rechtecks befinden.
   * @param nodes - Die Liste der Nodes, die geprüft werden sollen.
   * @param topLeft - Die obere linke Ecke des Rechtecks (Weltkoordinaten).
   * @param bottomRight - Die untere rechte Ecke des Rechtecks (Weltkoordinaten).
   * @returns Eine Liste der Nodes, die sich innerhalb des Rechtecks befinden.
   */
  static getNodesInRectangle(nodes: Selectable[], topLeft: Vector2, bottomRight: Vector2): Selectable[] {
    return nodes.filter((node) => {
      const nodeXStart = node.worldPosition.x;
      const nodeXEnd = node.worldPosition.x + node.width;
      const nodeYStart = node.worldPosition.y;
      const nodeYEnd = node.worldPosition.y + node.height;

      return (
        nodeXStart < bottomRight.x &&
        nodeXEnd > topLeft.x &&
        nodeYStart < bottomRight.y &&
        nodeYEnd > topLeft.y
      );
    });
  }

  /**
   * Zeichnet das Rechteck auf dem Canvas.
   * @param context - Der Canvas-Rendering-Kontext.
   * @param topLeft - Die obere linke Ecke des Rechtecks (Canvas-Koordinaten).
   * @param bottomRight - Die untere rechte Ecke des Rechtecks (Canvas-Koordinaten).
   */
  static drawRectangle(
    context: CanvasRenderingContext2D,
    topLeft: Vector2,
    bottomRight: Vector2
  ): void {
    context.beginPath();
    context.strokeStyle = "rgba(0, 120, 255, 0.5)";
    context.lineWidth = 2;
    context.setLineDash([5, 5]);
    context.strokeRect(
      topLeft.x,
      topLeft.y,
      bottomRight.x - topLeft.x,
      bottomRight.y - topLeft.y
    );
    context.setLineDash([]); // Entfernt das gestrichelte Muster
  }
}