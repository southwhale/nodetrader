'use strict';

export const logger = {
	level: {
		app: 'INFO',
    service: 'INFO',
		db: 'INFO',
		ctp: 'INFO',
	}
};

export const ctp = {
  server: {
    frontend: {
      BrokerID: '4040',// 银河期货
      MdURL: 'tcp://180.166.103.21:51213',
      TdURL: 'tcp://180.166.103.21:51205'
    }
  },
  account: {
    InvestorID: '369754',
    Password: 'iguzhi-1288'
  }
};
