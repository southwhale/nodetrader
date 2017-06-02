// 订单类

function Order() {
	this.InstrumentID = null; // 必填
	this.OrderPriceType = null; // 价格类型, 必填
	this.Direction = null; // 买卖方向, 必填
	this.CombOffsetFlag = null; // 开平方向, 必填
	this.CombHedgeFlag = null; // 套保标志, 必填
	this.LimitPrice = null; // 价格, 必填
	this.VolumeTotalOriginal = null; // 数量, 必填
	this.TimeCondition = null; // 有效期类型
	this.VolumeCondition = null; // 成交量类型
	this.MinVolume = null; // 最小成交量
	this.ContingentCondition = null; // 触发条件
	this.ForceCloseReason = null; // 强平原因
	this.IsAutoSuspend = null; // 自动挂起标志
	this.UserForceClose = null; // 用户强平标志
}

module.exports = Order;