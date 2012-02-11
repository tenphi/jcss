module.exports = {
    '@media (max-width: 800px)': {
        '#hello': {
            color: 'blue'
        }
    },
	'#hello': {
		fontSize: '13px',
		borderRadius: '4px',
		' .gray': {
			color: '#999'
		}
	},
    '#mydiv': {
        color: '#333',
        ' div': { // #mydiv div
            color: '#666'
        },
        '.highlight': { // #mydiv.highlight
            backgroundColor: '#fff'
        }
    },
    '.button-|.big-button-': {
        'red': { // .button-red
            color: 'red'
        },
        'blue': { // .button-blue
            color: 'blue'
        },
        'red|blue': { // .button-red, .button-blue
            backgroundColor: '#fff'
        }
    }
}