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
	
	ctx.strokeStyle = "#ff0000"; // Красные границы карты
	ctx.lineWidth = 4;

	// Границы карты (не двигаются)
	ctx.beginPath();
	ctx.rect(-offsetX, -offsetY, mapWidth, mapHeight);
	ctx.stroke();

	// Затемненная область за картой
	ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
	ctx.beginPath();
	
	// Закрашиваем весь экран
	ctx.rect(0, 0, canvasWidth, canvasHeight);
	
	// Вырезаем центр, чтобы осталась только темная область за картой
	ctx.rect(-offsetX, -offsetY, mapWidth, mapHeight);
	ctx.fill("evenodd");

	ctx.restore();
};
