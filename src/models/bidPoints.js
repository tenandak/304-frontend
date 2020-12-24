export default function getBidPoints (bid) {
	var bidPoints = {
		170: {
			win: 1,
			lose: 2
		},
		180: {
			win: 1,
			lose: 2
		},
		190: {
			win: 1,
			lose: 2
		},
		200: {
			win: 2,
			lose: 3
		},
		210: {
			win: 2,
			lose: 3
		},
		220: {
			win: 2,
			lose: 3
		},
		230: {
			win: 2,
			lose: 3
		},
		240: {
			win: 2,
			lose: 3
		},
		250: {
			win: 3,
			lose: 4
		},
		260: {
			win: 3,
			lose: 4
		},
		270: {
			win: 3,
			lose: 4
		},
		280: {
			win: 3,
			lose: 4
		},
		290: {
			win: 3,
			lose: 4
		},
		300: {
			win: 4,
			lose: 5
		},
	}
	return bidPoints[bid];
}