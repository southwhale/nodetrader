// 模拟有序Map

export default class OrderedMap {
	
	constructor() {
		this.map = {};
	}

	add(key, value) {
		this.map[key] = value;
	}

	remove(key) {
		delete this.map[key];
	}

	removeAndReturn(key) {
		var value = this.map[key];
		delete this.map[key];
		return value;
	}

	get(key) {
		return this.map[key];
	}

	// 多条件 '===' 过滤, 如map为{a: {aa: 1, bb: 1}, b: {aa: 1, bb: 2}, c: {aa: 2, bb: 1}}, 则arg可为{aa: 1} 或 {bb: 1}这样，也就是以value作为条件过滤
	filter(arg) {
		var ret = new OrderedMap();
		for (var key in this.map) {
			var value = this.map[key];
			var flag = true;

			for (var i in arg) {
				if (!value.hasOwnProperty(i)) {
					flag = false;
					break;
				}
				if (value[i] !== arg[i]) {
					flag = false;
					break;
				}
			}

			if (flag) {
				ret.add(key, value);
			}
		}

		return ret;
	}

	forEachAsc(fn) {
		var keys = this.keysAsc();
		var map = this.map;

		keys.forEach(function(key) {
			fn(map[key], key, map);
		});
	}

	forEachDesc(fn) {
		var keys = this.keysDesc();
		var map = this.map;

		keys.forEach(function(key) {
			fn(map[key], key, map);
		});
	}

	keysAsc() {
		var keys = Object.keys(this.map);
		keys.sort(function(x, y) {
			return x > y;
		});

		return keys;
	}

	keysDesc() {
		var keys = Object.keys(this.map);
		keys.sort(function(x, y) {
			return x < y;
		});

		return keys;
	}

	valuesAsc() {
		var values = [];
		this.forEachAsc(function(value) {
			values.push(value);
		});

		return values;
	}

	valuesDesc() {
		var values = [];
		this.forEachDesc(function(value) {
			values.push(value);
		});

		return values;
	}

	isEmpty() {
		var isEmpty = true;
		for (var key in this.map) {
			isEmpty = false;
			break;
		}

		return isEmpty;
	}

	forEach(...args) {
		return this.forEachAsc.apply(this, args)
	}

	keys(...args) {
		return this.keysAsc.apply(this, args);
	}

	values(...args) {
		return this.valuesAsc.apply(this, args);
	}

}
