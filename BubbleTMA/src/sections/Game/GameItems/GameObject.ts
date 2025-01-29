export const generateParticles = (count: number, mapWidth: number, mapHeight: number) => {
	const colors = ["#ff5733", "#33ff57", "#3357ff", "#f7ff33", "#ff33f6"];
	const newParticles = Array.from({ length: count }, () => ({
			x: Math.random() * mapWidth,
			y: Math.random() * mapHeight,
			size: Math.random() * 5 + 2,
			color: colors[Math.floor(Math.random() * colors.length)],
	}));
	return newParticles;
};

export const generateBinoculars = (count: number, mapWidth: number, mapHeight: number) => {
	const newBinoculars = Array.from({ length: count }, () => ({
			x: Math.random() * mapWidth,
			y: Math.random() * mapHeight,
			size: 20,
	}));
	return newBinoculars;
};

export const generateMagnets = (count: number, mapWidth: number, mapHeight: number) => {
	const newMagnets = Array.from({ length: count }, () => ({
			x: Math.random() * mapWidth,
			y: Math.random() * mapHeight,
			strength: Math.random() * 5 + 1,
			isActive: false,
	}));
	return newMagnets;
};
