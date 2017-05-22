var Engine = require('./engine');

var e = new Engine({
	name: 'TestStrategy',
	instrumentIDList: ['ru1709', 'rb1710', 'zn1707', 'T1709'], // 
	param: {}
});
e.setStartDate('20170522');
e.prepare();

e.start();