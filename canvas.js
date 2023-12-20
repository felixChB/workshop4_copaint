export class Canvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.width = null;
    this.height = null;

    this.adaptSize = this.adaptSize.bind(this);
    window.addEventListener("resize", this.adaptCanvas);
  }

  stroke(startX, startY, endX, endY, color) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const context = this.context;

    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.lineWidth = 5;
    context.strokeStyle = color;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();
}

  adaptSize() {
    const rect = document.body.getBoundingClientRect();
    this.width = this.canvas.width = rect.width;
    this.height = this.canvas.height = rect.height;
  }
}
