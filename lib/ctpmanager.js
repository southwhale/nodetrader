const _ = require('lodash');

function CtpManager() {
	this.map = {};
}

(function() {
	this.put = function(accountID, ctp) {
		this.map[accountID] = ctp;
	};

	this.get = function(accountID) {
		return this.map[accountID];
	};

	this.remove = function(accountID) {
		delete this.map[accountID];
	};

	this.dispose = function(accountID) {
		var ctp = this.map[accountID];
		if (!ctp) {
			return;
		}

		var account = ctp.getAccountByUserID(accountID);
	
		ctp.td && ctp.td.ReqUserLogout(account, ctp.nRequestID());
		ctp.md && ctp.md.ReqUserLogout(account, ctp.nRequestID());

		ctp.md && ctp.md.Release();
		ctp.td && ctp.td.Release();

		delete this.map[accountID];
	};

	this.disposeAll = function() {
		var me = this;
		_.forEach(this.map, function(ctp, accountID) {
			me.dispose(accountID);
		});
	};
}).call(CtpManager.prototype);

module.exports = new CtpManager();