export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number,
  offsetX: number,
  offsetY: number,
  scale: number
) => {
  const scaledGridSize = gridSize / scale; 
  const startX = -offsetX % scaledGridSize;
  const startY = -offsetY % scaledGridSize;

  ctx.save();
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 1 / scale;

  for (let x = startX; x < width; x += scaledGridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = startY; y < height; y += scaledGridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();
};
