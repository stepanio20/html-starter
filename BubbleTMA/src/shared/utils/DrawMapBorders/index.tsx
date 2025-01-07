export const drawMapBorders = (
	ctx: CanvasRenderingContext2D,
	mapWidth: number,
	mapHeight: number,
	offsetX: number,
	offsetY: number,
	canvasWidth: number,
	canvasHeight: number
) => {
	ctx.save();

	ctx.strokeStyle = "#ff0000";
	ctx.lineWidth = 4;

	const borderX = -offsetX;
	const borderY = -offsetY;

	ctx.beginPath();
	ctx.rect(borderX, borderY, mapWidth, mapHeight);
	ctx.stroke();

	ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
	ctx.beginPath();
	ctx.rect(0, 0, canvasWidth, canvasHeight);
	ctx.rect(borderX, borderY, mapWidth, mapHeight);
	ctx.fill("evenodd");

	ctx.restore();
};
