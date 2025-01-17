export class Bubble {
		value: number;
		size: number;
		x: number;
		y: number;
		color: string;
		dx: number;
		dy: number;
		speed: number;
	
		constructor(x: number, y: number, value: number, color?: string) {
			this.value = value;
			this.size = Math.sqrt(value) * 15;
			this.x = x;
			this.y = y;
			this.speed = 0.2;
			this.color = color || this.getRandomColor();
			this.dx = Math.random() * 2 - 1;
			this.dy = Math.random() * 2 - 1;
			this.calculateSpeed();
		}
	
		calculateSpeed() {
			const baseSpeed = 0.2;
			const sizeFactor = 0.01; 
			this.speed = baseSpeed / (1 + sizeFactor * this.value);
		}
	
		private getRandomColor() {
			const colors = ['#00C100', '#0098E0', '#ED1B24', '#EADD00', '#6B00EB', '#FF7F00', '#B6E51D'];
			return colors[Math.floor(Math.random() * colors.length)];
		}
	
		moveRandom() {
			this.x += this.dx * this.speed;
			this.y += this.dy * this.speed;
	
			if (this.x - this.size < 0 || this.x + this.size > 4000) {
				this.dx *= -1;
			}
			if (this.y - this.size < 0 || this.y + this.size > 4000) {
				this.dy *= -1;
			}
		}
	
		draw(ctx: CanvasRenderingContext2D, offsetX: number, offsetY: number) {
			ctx.beginPath();
			ctx.arc(this.x - offsetX, this.y - offsetY, this.size, 0, Math.PI * 2);
			ctx.fillStyle = this.color;
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