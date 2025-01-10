export const drawGrid = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  baseCellSize: number,
  offsetX: number,
  offsetY: number,
  scale: number
) => {
  ctx.save();

  ctx.strokeStyle = "rgba(192, 192, 192, 0.5)";
  ctx.lineWidth = 1;
  
  const adjustedCellSize = Math.max(baseCellSize / (scale), 10);

  const startX = -offsetX % adjustedCellSize;
  const startY = -offsetY % adjustedCellSize;

  for (let y = startY; y < canvasHeight; y += adjustedCellSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }

  for (let x = startX; x < canvasWidth; x += adjustedCellSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }

  ctx.restore();
};
