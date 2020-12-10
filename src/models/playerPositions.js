export function getPlayerPositions (config) {
	return [
		{
			name: 'DOWN',
			x: config.width/2 - 35, 
	    	y: config.height - 50, 
	    	angle: 0
	    },
	    {
	    	name: 'RIGHT',
	    	x: config.width - 35, 
	    	y: config.height/2 + 35, 
	    	angle: 270
	    },
	    {
	    	name: 'UP',
	    	x: config.width/2 + 35, 
	    	y: 35, 
	    	angle: 180
	    },
	    {
	    	name: 'LEFT',
	    	x: 35, 
	    	y: config.height/2 - 35, 
	    	angle: 90
	    }
	];
}

export function getPlayerHandPosition (name, handPosition, config) {
	const handPositions = [
		{
			name: 'DOWN',
			x: config.width/2 - 50 + (handPosition*35), 
	    	y: config.height - 35*3,
	    	angle: 0,
		},
		{
			name: 'RIGHT',
			x: config.width - 35*3, 
	    	y: config.height/2 + 50 - (handPosition*35),
	    	angle: 270, 
		},
		{
			name: 'UP',
			x: config.width/2 + 50 - (handPosition*35), 
	    	y: 35*3,
	    	angle: 180,
		},
		{
			name: 'LEFT',
			x: 35*3, 
	    	y: config.height/2 - 50 + (handPosition*35),
	    	angle: 90,
		},
	];
	return handPositions.find(hp => hp.name === name);
}


export default getPlayerPositions