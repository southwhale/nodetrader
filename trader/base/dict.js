// 所有可能用到的字典

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
	HedgeFlag_Arbitrage: '2', // 套利
	HedgeFlag_Hedge: '3',// 套保
	HedgeFlag_MarketMaker: '5',// 做市商

	TimeCondition_IOC: '1', // 市价, 立即完成，否则撤销
	TimeCondition_GFS: '2', // 本节有效
	TimeCondition_GFD: '3', // 限价、条件单, 当日有效
	TimeCondition_GTD: '4', // 指定日期前有效
	TimeCondition_GTC: '5', // 撤销前有效
	TimeCondition_GFA: '6', // 集合竞价有效

	VolumeCondition_AV: '1', // 任意数量, 普遍用这个
	VolumeCondition_MV: '2', // 最小数量
	VolumeCondition_CV: '3', // 全部数量

	ContingentCondition_Immediately: '1', // 立即
	ContingentCondition_Touch: '2', // 止损
	ContingentCondition_TouchProfit: '3', // 止盈
	ContingentCondition_ParkedOrder: '4', // 预埋单
	ContingentCondition_LastPriceGreaterThanStopPrice: '5', // 最新价大于条件价
	ContingentCondition_LastPriceGreaterEqualStopPrice: '6', // 最新价大于等于条件价
	ContingentCondition_LastPriceLesserThanStopPrice: '7', // 最新价小于条件价
	ContingentCondition_LastPriceLesserEqualStopPrice: '8', // 最新价小于等于条件价
	ContingentCondition_AskPriceGreaterThanStopPrice: '9', // 卖一价大于条件价
	ContingentCondition_AskPriceGreaterEqualStopPrice: 'A', // 卖一价大于等于条件价
	ContingentCondition_AskPriceLesserThanStopPrice: 'B', // 卖一价小于条件价
	ContingentCondition_AskPriceLesserEqualStopPrice: 'C', // 卖一价小于等于条件价
	ContingentCondition_BidPriceGreaterThanStopPrice: 'D', // 买一价大于条件价
	ContingentCondition_BidPriceGreaterEqualStopPrice: 'E', // 买一价大于等于条件价
	ContingentCondition_BidPriceLesserThanStopPrice: 'F', // 买一价小于条件价
	ContingentCondition_BidPriceLesserEqualStopPrice: 'H', // 买一价小于等于条件价

	ForceCloseReason_NotForceClose: '0', // 非强平, 正常交易选这个
	ForceCloseReason_LackDeposit: '1', // 资金不足
	ForceCloseReason_ClientOverPositionLimit: '2', // 客户超仓
	ForceCloseReason_MemberOverPositionLimit: '3', // 会员超仓
	ForceCloseReason_NotMultiple: '4', // 持仓非整数倍
	ForceCloseReason_Violation: '5', // 违规
	ForceCloseReason_Other: '6', // 其它
	ForceCloseReason_PersonDeliv: '7', // 自然人临近交割

	IsAutoSuspend_No: '0', // 一般选0
	IsAutoSuspend_Yes: '1',

	UserForceClose_No: '0', // 一般选0
	UserForceClose_Yes: '1',

	OrderStatus_Unknown: 'a', // 未知
	OrderStatus_NotTouched: 'b', // 尚未触发(预埋单)
	OrderStatus_Touched: 'c', // 已触发(预埋单)
	OrderStatus_Canceled: '5', // 已全部撤单
	OrderStatus_NoTradeNotQueueing: '4', // 报单还未发往交易所
	OrderStatus_NoTradeQueueing: '3', // 报单已发往交易所, 正在等待成交
	OrderStatus_PartTradedNotQueueing: '2', // 部分成交, 剩余部分已撤单
	OrderStatus_PartTradedQueueing: '1', // 部分成交, 剩余部分在等待成交
	OrderStatus_AllTraded: '0', // 已全部成交

	ActionFlag_Delete: '0', // 删除订单, 撤单
	ActionFlag_Modify: '3', // 修改订单

	PosiDirection_Net: '1', // 净
	PosiDirection_Long: '2', // 多头
	PosiDirection_Short: '3', // 空头

	PositionType_Net: '1', // 净持仓
	PositionType_Gross: '2', // 综合持仓

	PositionDate_Today: '1', // 今日持仓
	PositionDate_History: '2', // 历史持仓

	OrderActionStatus_Submitted: 'a', // 已提交
	OrderActionStatus_Accepted: 'a', // 已接受
	OrderActionStatus_Rejected: 'c', // 已被拒绝

	TradeCode_BankBankToFuture: '102001', // 银行发起银行资金转期货
	TradeCode_BankFutureToBank: '102002', // 银行发起期货资金转银行
	TradeCode_FutureBankToFuture: '202001', // 期货发起银行资金转期货
	TradeCode_FutureFutureToBank: '202002', // 期货发起期货资金转银行

	ExchangeID_SHFE: 'SHFE', // 上期所
	ExchangeID_DCE: 'DCE', // 大商所
	ExchangeID_CZCE: 'CZCE', // 郑商所
	ExchangeID_CFFEX: 'CFFEX' // 中金所
};

module.exports = dict;