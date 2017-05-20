const object = require('7hoo/object');

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

		ctp.ReqUserLogout({
			BrokerID: ctp.setting.BrokerID,
			UserID: accountID
		});

		ctp.md && ctp.md.Release();
		ctp.td && ctp.td.Release();

		delete this.map[accountID];
	};

	this.disposeAll = function() {
		var me = this;
		object.forEach(this.map, function(ctp, accountID) {
			me.dispose(accountID);
		});
	};
}).call(CtpManager.prototype);

module.exports = new CtpManager();