export function getPlayerPositions (config) {
	return [
		{
			name: 'DOWN',
			x: config.width/2 - 85, 
	    	y: config.height - 35,
	    	trump: {
	    		x: config.width/2 - 200, 
	    		y: config.height - 120,
	    	},
	    	play: {
	    		x: config.width/2, 
	    		y: config.height/2 + 50,
	    	}, 
	    	angle: 0
	    },
	    {
	    	name: 'RIGHT',
	    	x: config.width - 35, 
	    	y: config.height/2 + 35,
	    	trump: {
	    		x: config.width - 30*6, 
	    		y: config.height/2 + 100 + 30,
	    	},
	    	play: {
	    		x: config.width/2 + 50, 
	    		y: config.height/2,
	    	}, 
	    	angle: 270
	    },
	    {
	    	name: 'UP',
	    	x: config.width/2 + 35, 
	    	y: 35,
	    	trump: {
	    		x: config.width/2 + 100 + 30, 
	    		y: 30*6,
	    	},
	    	play: {
	    		x: config.width/2, 
	    		y: config.height/2 - 50,
	    	},   
	    	angle: 180
	    },
	    {
	    	name: 'LEFT',
	    	x: 35, 
	    	y: config.height/2 - 35,
	    	trump: {
	    		x: 30*6, 
	    		y: config.height/2 - 100 - 30,
	    	},
	    	play: {
	    		x: config.width/2 - 50, 
	    		y: config.height/2,
	    	},  
	    	angle: 90
	    }
	];
}

export function getPlayerHandPosition (name, handPosition, config) {
	const handPositions = [
		{
			name: 'DOWN',
			x: config.width/2 - 100 + (handPosition*30), 
	    	y: config.height - 30*3,
	    	angle: 0,
		},
		{
			name: 'RIGHT',
			x: config.width - 30*3, 
	    	y: config.height/2 + 100 - (handPosition*30),
	    	angle: 270, 
		},
		{
			name: 'UP',
			x: config.width/2 + 100 - (handPosition*30), 
	    	y: 30*3,
	    	angle: 180,
		},
		{
			name: 'LEFT',
			x: 30*3, 
	    	y: config.height/2 - 100 + (handPosition*30),
	    	angle: 90,
		},
	];
	return handPositions.find(hp => hp.name === name);
}


export default getPlayerPositions