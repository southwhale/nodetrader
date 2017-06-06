var argv = require('yargs').argv;

var engine = argv.e || argv.engine;

if (!engine) {
	console.error('缺少参数: --e 或 --engine');
}

switch(engine) {
	case 'f':
		engine = 'firm';
		break;
	case 'ft':
		engine = 'firmtest';
		break;
	case 'bt':
		engine = 'backtest';
		break;
}

require('./trader/' + engine + '/main');