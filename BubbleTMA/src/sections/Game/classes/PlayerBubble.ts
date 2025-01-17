export class PlayerBubble {
		x: number;
		y: number;
		size: number;
		value: number;
		speed: number;
		color: string;

		constructor(x: number, y: number, value: number, color: string) {
				this.x = x;
				this.y = y;
				this.value = value;
				this.size = Math.sqrt(value) * 15;
				this.color = color;
				this.speed = 0.2;
		}

		calculateSpeed() {
				const baseSpeed = 0.2;
				const sizeFactor = 0.01; 
				this.speed = baseSpeed / (1 + sizeFactor * this.value);
		}



		draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number, color: string) {
				ctx.beginPath();
				ctx.arc(this.x - offsetX, this.y - offsetY, this.size, 0, Math.PI * 2);
				ctx.fillStyle = color;
				ctx.fill();
				ctx.closePath();

				const borderThickness = this.size * 0.06;
				ctx.beginPath();
				ctx.arc(this.x - offsetX, this.y - offsetY, this.size - borderThickness, 0, Math.PI * 2);
				ctx.lineWidth = borderThickness;
				ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
				ctx.stroke();
				ctx.closePath();

				const fontSize = this.size * 0.45;
				ctx.fillStyle = "#000";
				ctx.font = `${fontSize}px Arial`;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(`$${this.value.toFixed(2)}`, this.x - offsetX, this.y - offsetY);
		}
}