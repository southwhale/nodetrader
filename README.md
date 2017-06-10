# nodetrader #

基于nodectp的程序化交易框架

### 包含的功能? ###

* 回测及接入策略
* 行情收集
* 实盘接入策略


### 如何使用? ###

* 参考strategy目录下TestStrategy类开发自己的策略, 策略文件需放在strategy目录下
* 参考config目录下setting.json和strategy.json配置需要的参数
* 在项目根目录(nodetrade)下启动命令行或shell, 调用命令 `npm install` 安装相应包并编译生成shifctp.node
* 调用命令 `node app.js --e=f` 启动应用, --e的参数包括: f(实盘跑策略实盘交易, 这可是真金白银, 谨慎使用)、ft(使用实盘实时的tick数据但使用本地撮合测试策略)、bt(使用历史行情数据回测)