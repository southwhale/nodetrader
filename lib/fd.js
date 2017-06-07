const fs = require('fs');
/**
 * 确保路径对应的目录存在
 * @param {String} path 路径
 *
 */
function ensureDirectory(path) {
	if (fs.existsSync(path)) {
		var stat = fs.lstatSync(path);
		if (!stat.isDirectory()) {
			fs.mkdirSync(path);
		}
	}
	else {
		fs.mkdirSync(path);
	};
}


module.exports = {
	ensureDirectory: ensureDirectory
};