export class BackgroundRenderer {
  constructor() {
  }

  drawBackground(context, currentImage) {
    context.drawImage(currentImage, 0, 0);
  }
}
