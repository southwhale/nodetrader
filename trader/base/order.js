// 订单类

var dict = {
	Direction_Buy: '0',
	Direction_Sell: '1',

	PriceType_AnyPrice: '1', // 市价
	PriceType_LimitPrice: '2', // 限价/条件单
	PriceType_BestPrice: '3', // 最优价
	PriceType_LastPrice: '4', // 最新价
	PriceType_LastPricePlusOneTicks: '5', // 最新价浮动上浮1个ticks
	PriceType_LastPricePlusTwoTicks: '6', // 最新价浮动上浮2个ticks
	PriceType_LastPricePlusThreeTicks: '7', // 最新价浮动上浮3个ticks
	PriceType_AskPrice1: '8', // 卖一价
	PriceType_AskPrice1PlusOneTicks: '9', // 卖一价浮动上浮1个ticks
	PriceType_AskPrice1PlusTwoTicks: 'A', // 卖一价浮动上浮2个ticks
	PriceType_AskPrice1PlusThreeTicks: 'B', // 卖一价浮动上浮3个ticks
	PriceType_BidPrice1: 'C', // 买一价
	PriceType_BidPrice1PlusOneTicks: 'D', // 买一价浮动上浮1个ticks
	PriceType_BidPrice1PlusTwoTicks: 'E', // 买一价浮动上浮2个ticks
	PriceType_BidPrice1PlusThreeTicks: 'F', // 买一价浮动上浮3个ticks

	OffsetFlag_Open: '0', // 开仓
	OffsetFlag_Close: '1', // 平仓
	OffsetFlag_ForceClose: '2', // 强平
	OffsetFlag_CloseToday: '3', // 平今
	OffsetFlag_CloseYesterday: '4', // 平昨
	OffsetFlag_ForceOff: '5', // 强减
	OffsetFlag_LocalForceClose: '6', // 本地强平

	HedgeFlag_Speculation: '1', // 投机
	HedgeFlag_Arbitrage: '1', // 套利
	HedgeFlag_Hedge: '1',// 套保

	TimeCondition_IOC: '1', // 市价, 立即完成，否则撤销
	TimeCondition_GFS: '2', // 本节有效
	TimeCondition_GFD: '3', // 限价、条件单, 当日有效
	TimeCondition_GTD: '4', // 指定日期前有效
	TimeCondition_GTC: '5', // 撤销前有效
	TimeCondition_GFA: '6', // 集合竞价有效

	VolumeCondition_AV: '1', // 任意数量
	VolumeCondition_MV: '2', // 最小数量
	VolumeCondition_CV: '3' // 全部数量
};

function Order() {
	this.InstrumentID = null;
	this.OrderPriceType = null; // 价格类型
	this.Direction = null; // 买卖方向
	this.CombOffsetFlag[0] = null; // 开平方向
	this.CombHedgeFlag[0] = null; // 套保标志
	this.LimitPrice = null; // 价格
	this.VolumeTotalOriginal = null; // 数量
	this.TimeCondition = null; // 有效期类型
	this.VolumeCondition = null; // 成交量类型 
}