export class PlayerBubble {
	x: number;
	y: number;
	size: number;
	value: number;
	speed: number;

	constructor(x: number, y: number, value: number) {
		this.x = x;
		this.y = y;
		this.value = value;
		this.speed = 0.2;
		this.size = (this.value >= 100 && window.innerHeight < 431) ? Math.sqrt(value) * 6 : Math.sqrt(value) * 15;
		this.calculateSpeed();
	}

	calculateSpeed() {
		const baseSpeed = 0.2;
		const sizeFactor = 0.01; 
		this.speed = baseSpeed / (1 + sizeFactor * this.value);
	}

	draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
		ctx.beginPath();
		ctx.arc(this.x - offsetX, this.y - offsetY, this.size, 0, Math.PI * 2);
		ctx.fillStyle = 'blue';
		ctx.fill();
	
		const borderThickness = this.size * 0.06;
		ctx.beginPath();
		ctx.arc(this.x - offsetX, this.y - offsetY, this.size - borderThickness, 0, Math.PI * 2);
		ctx.lineWidth = borderThickness;
		ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
		ctx.stroke();
		ctx.closePath();
	
		ctx.fillStyle = '#000';
		ctx.font = `${Math.max(14, this.size * 0.3)}px Arial`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(`$${this.value.toFixed(2)}`, this.x - offsetX, this.y - offsetY);
	}
}