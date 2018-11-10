// 模拟有序Map

function OrderedMap() {
	this.map = {};
}

(function() {
	
	this.add = function(key, value) {
		this.map[key] = value;
	};

	this.remove = function(key) {
		delete this.map[key];
	};

	this.removeAndReturn = function(key) {
		var value = this.map[key];
		delete this.map[key];
		return value;
	};

	this.get = function(key) {
		return this.map[key];
	};

	// 多条件 '===' 过滤
	this.filter = function(o) {
		var ret = new OrderedMap();
		for (var key in this.map) {
			var value = this.map[key];
			var flag = true;

			for (var i in o) {
				if (!value.hasOwnProperty(i)) {
					flag = false;
					break;
				}
				if (value[i] !== o[i]) {
					flag = false;
					break;
				}
			}

			if (flag) {
				ret.add(key, value);
			}
		}

		return ret;
	};

	this.forEachAsc = function(fn) {
		var keys = this.keysAsc();
		var map = this.map;

		keys.forEach(function(key) {
			fn(map[key], key, map);
		});
	};

	this.forEachDesc = function(fn) {
		var keys = this.keysDesc();
		var map = this.map;

		keys.forEach(function(key) {
			fn(map[key], key, map);
		});
	};

	this.keysAsc = function() {
		var keys = Object.keys(this.map);
		keys.sort(function(x, y) {
			return x > y;
		});

		return keys;
	};

	this.keysDesc = function() {
		var keys = Object.keys(this.map);
		keys.sort(function(x, y) {
			return x < y;
		});

		return keys;
	};

	this.valuesAsc = function() {
		var values = [];
		this.forEachAsc(function(value) {
			values.push(value);
		});

		return values;
	};

	this.valuesDesc = function() {
		var values = [];
		this.forEachDesc(function(value) {
			values.push(value);
		});

		return values;
	};

	this.isEmpty = function() {
		var isEmpty = true;
		for (var key in this.map) {
			isEmpty = false;
			break;
		}

		return isEmpty;
	};

	this.forEach = this.forEachAsc;
	this.keys = this.keysAsc;
	this.values = this.valuesAsc;

}).call(OrderedMap.prototype);

module.exports = OrderedMap;