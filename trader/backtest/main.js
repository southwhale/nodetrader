var Engine = require('./engine');

var e = new Engine({
	name: 'TestStrategy',
	instrumentIDList: ['ru1709', 'rb1710', 'zn1707', 'T1709'], // 
	param: {}
});
e.setStartDate('20170522');
e.addInstrumentID('zn1707', 'T1709');
e.prepare();

e.start();