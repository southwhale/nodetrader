// 默认全局参数
var GLOBAL_VAR = {
    KLineAllData      :  {},
    KLineData         :  {},
    time_type         :  "15min",
    mark_from         :  "f_usd_btc",
    contract_type     :  "this_week",
    limit             :  "1000",
    requestParam      :  "limit=1000",
    periodMap	      :  null,
    chartMgr          :  null,
    G_HTTP_REQUEST    :  null,
    TimeOutId 		  :  null,
    button_down       :  false,
    url				  :  "/v2/futures/market/klineData.do"
};
String.prototype.toFixed=function(rate){
    return Number(this).toFixed(rate);
};
GLOBAL_VAR.periodMap = {
    "01w" : "week" , "03d" : "3day", "01d" : "day" , "12h" : "12hour",
    "06h" : "6hour", "04h" : "4hour", "02h" : "2hour", "01h" : "1hour",
    "30m" : "30min" , "15m" : "15min" , "05m" : "5min" , "03m" : "3min" ,
    "01m" : "1min"
};
GLOBAL_VAR.tagMapPeriod = {
    "1w" : "01w", "3d" : "03d", "1d" : "01d", "12h" : "12h",
    "6h" : "06h", "4h" : "04h", "2h" : "02h", "1h"  : "01h",
    "30m": "30m", "15m": "15m", "5m" : "05m", "3m"  : "03m",
    "1m" : "01m"
};
var classId = 0;
/**
 * Class.
 */
function create_class() {
    var argc = arguments.length;
    var func = function () {};
    var superClass;
    if (argc) {
        superClass = arguments[0];
        for (var k in superClass.prototype)
            func.prototype[k] = superClass.prototype[k];
    }
    for (var i = 1; i < argc; i++) {
        var feature = arguments[i];
        var f = feature.prototype.__construct;
        if (f) {
            if (!func.prototype.__featureConstructors)
                func.prototype.__featureConstructors = [];
            func.prototype.__featureConstructors.push(f);
            delete feature.prototype.__construct;
        }
        for (var k in feature.prototype)
            func.prototype[k] = feature.prototype[k];
        if (f)
            feature.prototype.__construct = f;
    }
    var newClass = function () {
        if (this.__construct)
            this.__construct.apply(this, arguments);
        if (this.__featureConstructors) {
            var a = this.__featureConstructors;
            var i, c = a.length;
            for (i = 0; i < c; i++)
                a[i].apply(this, arguments);
        }
    };
    func.prototype.__classId = classId++;
    if (superClass != undefined) {
        newClass.__super = superClass.prototype;
        func.prototype.__super = superClass;
    }
    newClass.prototype = new func();
    return newClass;
}
function is_instance(obj, clazz) {
    var classId = clazz.prototype.__classId;
    if (obj.__classId == classId)
        return true;
    var __super = obj.__super;
    while (__super != undefined) {
        if (__super.prototype.__classId == classId)
            return true;
        __super = __super.prototype.__super;
    }
    return false;
}
/**
 * Class: MEvent.
 */
var MEvent = create_class();
MEvent.prototype.__construct = function () {
    this._handlers = [];
};
// obj和func相同的handle不重复添加
MEvent.prototype.addHandler = function (o, f) {
    if (this._indexOf(o, f) < 0)
        this._handlers.push({obj:o, func:f});
};
MEvent.prototype.removeHandler = function (o, f) {
    var i = this._indexOf(o, f);
    if (i >= 0)
        this._handlers.splice(i, 1);
};
// 相当于trigger
MEvent.prototype.raise = function (s, g) {
    var a = this._handlers;
    var e, i, c = a.length;
    for (i = 0; i < c; i++) {
        e = a[i];
        e.func.call(e.obj, s, g);
    }
};
// 查找obj为o, func为f的对象在_handles中的索引位置
MEvent.prototype._indexOf = function (o, f) {
    var a = this._handlers;
    var e, i, c = a.length;
    for (i = 0; i < c; i++) {
        e = a[i];
        if (o == e.obj && f == e.func)
            return i;
    }
    return -1;
};
// v=12012000, fractionDigits=0时 return 12012 这是要干嘛
String.fromFloat = function (v, fractionDigits) {
    var text = v.toFixed(fractionDigits);
    for (var i = text.length - 1; i >= 0; i--) {
        if (text[i] == '.')
            return text.substring(0, i);
        if (text[i] != '0')
            return text.substring(0, i + 1);
    }
};
var ExprEnv = create_class();
ExprEnv.get = function() { return ExprEnv.inst; };
ExprEnv.set = function(env) { ExprEnv.inst = env; };
ExprEnv.prototype.getDataSource = function() { return this._ds; };
ExprEnv.prototype.setDataSource = function(ds) { return this._ds = ds; };
ExprEnv.prototype.getFirstIndex = function() { return this._firstIndex; };
ExprEnv.prototype.setFirstIndex = function(n) { return this._firstIndex = n; };
var Expr = create_class();
Expr.prototype.__construct = function () {
    this._rid = 0;
};
Expr.prototype.execute = function (index) {};// 未实现的空函数相当于接口interface
Expr.prototype.reserve = function (rid, count) {};// 未实现的空函数相当于接口interface
Expr.prototype.clear = function () {};// 未实现的空函数相当于接口interface
var OpenExpr = create_class(Expr);//继承Expr
var HighExpr = create_class(Expr);//继承Expr
var LowExpr = create_class(Expr);//继承Expr
var CloseExpr = create_class(Expr);//继承Expr
var VolumeExpr = create_class(Expr);//继承Expr

// 获得datasource中index位置的数据的open字段
OpenExpr.prototype.execute = function(index) {
    return ExprEnv.get()._ds.getDataAt(index).open;
};
// 获得datasource中index位置的数据的high字段
HighExpr.prototype.execute = function(index) {
    return ExprEnv.get()._ds.getDataAt(index).high;
};
// 获得datasource中index位置的数据的low字段
LowExpr.prototype.execute = function(index) {
    return ExprEnv.get()._ds.getDataAt(index).low;
};
// 获得datasource中index位置的数据的close字段
CloseExpr.prototype.execute = function(index) {
    return ExprEnv.get()._ds.getDataAt(index).close;
};
// 获得datasource中index位置的数据的volume字段
VolumeExpr.prototype.execute = function(index) {
    return ExprEnv.get()._ds.getDataAt(index).volume;
};
var ConstExpr = create_class(Expr);//继承Expr
ConstExpr.prototype.__construct = function(v) {
    ConstExpr.__super.__construct.call(this);
    this._value = v;
};
// 返回构造函数中赋给_value的v
ConstExpr.prototype.execute = function(index) {
    return this._value;
};
var ParameterExpr = create_class(Expr);//继承Expr
ParameterExpr.prototype.__construct = function(name, minValue, maxValue, defaultValue) {
    ParameterExpr.__super.__construct.call(this);
    this._name = name;
    this._minValue = minValue;
    this._maxValue = maxValue;
    this._value = this._defaultValue = defaultValue;
};
// 返回构造函数中赋给_value的v
ParameterExpr.prototype.execute = function(index) {
    return this._value;
};
// 返回构造函数中赋给_minValue的minValue
ParameterExpr.prototype.getMinValue = function() {
    return this._minValue;
};
// 返回构造函数中赋给_maxValue的maxValue
ParameterExpr.prototype.getMaxValue = function() {
    return this._maxValue;
};
// 返回构造函数中赋给_defaultValue的defaultValue
ParameterExpr.prototype.getDefaultValue = function() {
    return this._defaultValue;
};
// 返回_value，_value在对象初始化时被设置为默认值defaultValue，后续会被setValue函数改变
ParameterExpr.prototype.getValue = function() {
    return this._value;
};
// _value的值必然要介于minValue和maxValue之间：[minValue, maxValue]
ParameterExpr.prototype.setValue = function(v) {
    if (v == 0)
        this._value = 0;
    else if (v < this._minValue)
        this._value = this._minValue;
    else if (v > this._maxValue)
        this._value = this._maxValue;
    else
        this._value = v;
};
var OpAExpr = create_class(Expr);//继承Expr
var OpABExpr = create_class(Expr);//继承Expr
var OpABCExpr = create_class(Expr);//继承Expr
var OpABCDExpr = create_class(Expr);//继承Expr
//_exprA是类的一个实例啊
OpAExpr.prototype.__construct = function(a) {
    OpAExpr.__super.__construct.call(this);
    this._exprA = a;
};
// 这里的count好像没用到啊
OpAExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        this._rid = rid;
        this._exprA.reserve(rid, count);
    }
};
OpAExpr.prototype.clear = function() {
    this._exprA.clear();
};
OpABExpr.prototype.__construct = function(a, b) {
    OpABExpr.__super.__construct.call(this);
    this._exprA = a;
    this._exprB = b;
};
// reserve干嘛用？字面意思：保留？
OpABExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        this._rid = rid;
        this._exprA.reserve(rid, count);
        this._exprB.reserve(rid, count);
    }
};
OpABExpr.prototype.clear = function() {
    this._exprA.clear();
    this._exprB.clear();
};
OpABCExpr.prototype.__construct = function(a, b, c) {
    OpABCExpr.__super.__construct.call(this);
    this._exprA = a;
    this._exprB = b;
    this._exprC = c;
};
OpABCExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        this._rid = rid;
        this._exprA.reserve(rid, count);
        this._exprB.reserve(rid, count);
        this._exprC.reserve(rid, count);
    }
};
OpABCExpr.prototype.clear = function() {
    this._exprA.clear();
    this._exprB.clear();
    this._exprC.clear();
};
OpABCDExpr.prototype.__construct = function(a, b, c, d) {
    OpABCDExpr.__super.__construct.call(this);
    this._exprA = a;
    this._exprB = b;
    this._exprC = c;
    this._exprD = d;
};
OpABCDExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        this._rid = rid;
        this._exprA.reserve(rid, count);
        this._exprB.reserve(rid, count);
        this._exprC.reserve(rid, count);
        this._exprD.reserve(rid, count);
    }
};
OpABCDExpr.prototype.clear = function() {
    this._exprA.clear();
    this._exprB.clear();
    this._exprC.clear();
    this._exprD.clear();
};
var NegExpr = create_class(OpAExpr);//继承OpAExpr
NegExpr.prototype.__construct = function(a) {
    NegExpr.__super.__construct.call(this, a);
};
// 这是干什么？取负？
NegExpr.prototype.execute = function(index) {
    return -(this._exprA.execute(index));
};
var AddExpr = create_class(OpABExpr);
var SubExpr = create_class(OpABExpr);
var MulExpr = create_class(OpABExpr);
var DivExpr = create_class(OpABExpr);
// 加法表达式
AddExpr.prototype.__construct = function(a, b) {
    AddExpr.__super.__construct.call(this, a, b);
};
// 减法表达式
SubExpr.prototype.__construct = function(a, b) {
    SubExpr.__super.__construct.call(this, a, b);
};
// 乘法表达式
MulExpr.prototype.__construct = function(a, b) {
    MulExpr.__super.__construct.call(this, a, b);
};
// 除法表达式
DivExpr.prototype.__construct = function(a, b) {
    DivExpr.__super.__construct.call(this, a, b);
};
// datasource中index位置的两个数据相加？
AddExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) + this._exprB.execute(index);
};
SubExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) - this._exprB.execute(index);
};
MulExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) * this._exprB.execute(index);
};
DivExpr.prototype.execute = function(index) {
    var a = this._exprA.execute(index);
    var b = this._exprB.execute(index);
    if (a == 0)
        return a;
    if (b == 0)// b为0时根据a的正负方向取正负极限值？居然把极限值的绝对值定为1000000，够用了吗？
        return (a > 0) ? 1000000 : -1000000;
    return a / b;
};
var GtExpr = create_class(OpABExpr);//大于表达式
var GeExpr = create_class(OpABExpr);//大于等于表达式
var LtExpr = create_class(OpABExpr);//小于表达式
var LeExpr = create_class(OpABExpr);//小于等于表达式
var EqExpr = create_class(OpABExpr);//等于表达式
GtExpr.prototype.__construct = function(a, b) {
    GtExpr.__super.__construct.call(this, a, b);
};
GeExpr.prototype.__construct = function(a, b) {
    GeExpr.__super.__construct.call(this, a, b);
};
LtExpr.prototype.__construct = function(a, b) {
    LtExpr.__super.__construct.call(this, a, b);
};
LeExpr.prototype.__construct = function(a, b) {
    LeExpr.__super.__construct.call(this, a, b);
};
EqExpr.prototype.__construct = function(a, b) {
    EqExpr.__super.__construct.call(this, a, b);
};
// datasource中index位置的两个数据比较大小？true返回1，false返回0
GtExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) > this._exprB.execute(index) ? 1 : 0;
};
GeExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) >= this._exprB.execute(index) ? 1 : 0;
};
LtExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) < this._exprB.execute(index) ? 1 : 0;
};
LeExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) <= this._exprB.execute(index) ? 1 : 0;
};
EqExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) == this._exprB.execute(index) ? 1 : 0;
};
var MaxExpr = create_class(OpABExpr);// 取最大值表达式
MaxExpr.prototype.__construct = function(a, b) {
    MaxExpr.__super.__construct.call(this, a, b);
};
// 取datasource中index位置的两个数据的最大值
MaxExpr.prototype.execute = function(index) {
    return Math.max(this._exprA.execute(index), this._exprB.execute(index));
};
var AbsExpr = create_class(OpAExpr);// 绝对值表达式
AbsExpr.prototype.__construct = function(a) {
    AbsExpr.__super.__construct.call(this, a);
};
// 取datasource中index位置的数据的绝对值
AbsExpr.prototype.execute = function(index) {
    return Math.abs(this._exprA.execute(index));
};
var RefExpr = create_class(OpABExpr);
RefExpr.prototype.__construct = function(a, b) {
    RefExpr.__super.__construct.call(this, a, b);
    this._offset = -1;
};
// _offset不小于0时，并且index减去index后仍然是有效索引（>=0），则返回datasource中index位置的数据
RefExpr.prototype.execute = function(index) {
    if (this._offset < 0) {
        this._offset = this._exprB.execute(index);
        if (this._offset < 0)
            throw "offset < 0";
    }
    index -= this._offset;
    if (index < 0)
        throw "index < 0";
    var result = this._exprA.execute(index);
    if (isNaN(result))
        throw "NaN";
    return result;
};
var AndExpr = create_class(OpABExpr);// 与表达式
var OrExpr = create_class(OpABExpr);// 或表达式
AndExpr.prototype.__construct = function(a, b) {
    AndExpr.__super.__construct.call(this, a, b);
};
OrExpr.prototype.__construct = function(a, b) {
    OrExpr.__super.__construct.call(this, a, b);
};
AndExpr.prototype.execute = function(index) {
    return (this._exprA.execute(index) != 0) && (this._exprB.execute(index) != 0) ? 1 : 0;
};
OrExpr.prototype.execute = function(index) {
    return (this._exprA.execute(index) != 0) || (this._exprB.execute(index) != 0) ? 1 : 0;
};
var IfExpr = create_class(OpABCExpr);// a ? b : c表达式
IfExpr.prototype.__construct = function(a, b, c) {
    IfExpr.__super.__construct.call(this, a, b, c);
};
// 根据_exprA在index位置数据的值是否为0来决定最终返回值是_exprB还是_exprC在index位置的数据
IfExpr.prototype.execute = function(index) {
    return this._exprA.execute(index) != 0 ? this._exprB.execute(index) : this._exprC.execute(index);
};
var AssignExpr = create_class(OpAExpr);// 继承opAExpr
AssignExpr.prototype.__construct = function(name, a) {
    AssignExpr.__super.__construct.call(this, a);
    this._name = name;
    this._buf = [];
};
AssignExpr.prototype.getName = function() {
    return this._name;
};
// 返回_buf中index位置的数据
AssignExpr.prototype.execute = function(index) {
    return this._buf[index];
};
// 为_buf赋值index位置的数据为_exprA在index位置的数据
AssignExpr.prototype.assign = function(index) {
    this._buf[index] = this._exprA.execute(index);
    if (ExprEnv.get()._firstIndex >= 0)
        if (isNaN(this._buf[index]) && !isNaN(this._buf[index - 1]))
            throw this._name + ".assign(" + index + "): NaN";
};
AssignExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        for (var c = count; c > 0; c--)
            this._buf.push(NaN);
    }
    AssignExpr.__super.reserve.call(this, rid, count);
};
AssignExpr.prototype.clear = function() {
    AssignExpr.__super.clear.call(this);
    this._buf = [];
};
var OutputStyle = {
    None: 0, Line: 1, VolumeStick: 2, MACDStick: 3, SARPoint: 4
};
var OutputExpr = create_class(AssignExpr);// 继承AssignExpr
OutputExpr.prototype.__construct = function(name, a, style, color) {
    OutputExpr.__super.__construct.call(this, name, a);
    this._style = (style === undefined) ? OutputStyle.Line : style;// 默认style为Line
    this._color = color;
};
OutputExpr.prototype.getStyle = function() {
    return this._style;
};
OutputExpr.prototype.getColor = function() {
    return this._color;
};
var RangeOutputExpr = create_class(OutputExpr);
RangeOutputExpr.prototype.__construct = function(name, a, style, color) {
    RangeOutputExpr.__super.__construct.call(this, name, a, style, color);
};
RangeOutputExpr.prototype.getName = function() {
    return this._name + this._exprA.getRange();
};
var RangeExpr = create_class(OpABExpr);
RangeExpr.prototype.__construct = function(a, b) {
    RangeExpr.__super.__construct.call(this, a, b);
    this._range = -1;
    this._buf = [];
};
RangeExpr.prototype.getRange = function() {
    return this._range;
};
RangeExpr.prototype.initRange = function() {
    this._range = this._exprB.execute(0);
};
RangeExpr.prototype.execute = function(index) {
    if (this._range < 0)
        this.initRange();
    var rA = this._buf[index].resultA = this._exprA.execute(index);
    var r  = this._buf[index].result  = this.calcResult(index, rA);
    return r;
};
RangeExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        for (var c = count; c > 0; c--)
            this._buf.push({resultA:NaN, result:NaN});
    }
    RangeExpr.__super.reserve.call(this, rid, count);
};
RangeExpr.prototype.clear = function() {
    RangeExpr.__super.clear.call(this);
    this._range = -1;
    this._buf = [];
};
var HhvExpr = create_class(RangeExpr);
var LlvExpr = create_class(RangeExpr);
HhvExpr.prototype.__construct = function(a, b) {
    HhvExpr.__super.__construct.call(this, a, b);
};
LlvExpr.prototype.__construct = function(a, b) {
    LlvExpr.__super.__construct.call(this, a, b);
};
HhvExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var n = this._range;
        var result = resultA;
        var start = index - n + 1;
        var i = Math.max(first, start);
        for (; i < index; i++) {
            var p = this._buf[i];
            if (result < p.resultA)
                result = p.resultA;
        }
        return result;
    } else {
        return resultA;
    }
};
LlvExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var n = this._range;
        var result = resultA;
        var start = index - n + 1;
        var i = Math.max(first, start);
        for (; i < index; i++) {
            var p = this._buf[i];
            if (result > p.resultA)
                result = p.resultA;
        }
        return result;
    } else {
        return resultA;
    }
};
var CountExpr = create_class(RangeExpr);
CountExpr.prototype.__construct = function(a, b) {
    CountExpr.__super.__construct.call(this, a, b);
};
CountExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return 0;
    if (index >= first) {
        var n = this._range - 1;
        if (n > index - first)
            n = index - first;
        var count = 0;
        for (; n >= 0; n--) {
            if (this._buf[index - n].resultA != 0.0)
                count++;
        }
        return count;
    } else {
        return 0;
    }
};
var SumExpr = create_class(RangeExpr);
SumExpr.prototype.__construct = function(a, b) {
    SumExpr.__super.__construct.call(this, a, b);
};
SumExpr.prototype.calcResult = function(index, resultA) {
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var n = this._range;
        if (n == 0 || n >= index + 1 - first) {
            return this._buf[index - 1].result + resultA;
        }
        return this._buf[index - 1].result + resultA - this._buf[index - n].resultA;
    } else {
        return resultA;
    }
};
var StdExpr = create_class(RangeExpr);
StdExpr.prototype.__construct = function(a, b) {
    StdExpr.__super.__construct.call(this, a, b);
};
StdExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var stdData = this._stdBuf[index];
    var first = ExprEnv.get()._firstIndex;
    if (first < 0) {
        stdData.resultMA = resultA;
        return 0.0;
    }
    if (index > first) {
        var n = this._range;
        if (n >= index + 1 - first) {
            n = index + 1 - first;
            stdData.resultMA = this._stdBuf[index - 1].resultMA * (1.0 - 1.0 / n) + (resultA / n);
        } else {
            stdData.resultMA = this._stdBuf[index - 1].resultMA + (resultA - this._buf[index - n].resultA) / n;
        }
        var sum = 0;
        for (var i = index - n + 1; i <= index; i++)
            sum += Math.pow(this._buf[i].resultA - stdData.resultMA, 2);
        return Math.sqrt(sum / n);
    }
    stdData.resultMA = resultA;
    return 0.0;
};
StdExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        for (var c = count; c > 0; c--)
            this._stdBuf.push({resultMA:NaN});
    }
    StdExpr.__super.reserve.call(this, rid, count);
};
StdExpr.prototype.clear = function() {
    StdExpr.__super.clear.call(this);
    this._stdBuf = [];
};
var MaExpr = create_class(RangeExpr);
MaExpr.prototype.__construct = function(a, b) {
    MaExpr.__super.__construct.call(this, a, b);
};
MaExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var n = this._range;
        if (n >= index + 1 - first) {
            n = index + 1 - first;
            return this._buf[index - 1].result * (1.0 - 1.0 / n) + (resultA / n);
        }
        return this._buf[index - 1].result + (resultA - this._buf[index - n].resultA) / n;
    } else {
        return resultA;
    }
};
var EmaExpr = create_class(RangeExpr);
EmaExpr.prototype.__construct = function(a, b) {
    EmaExpr.__super.__construct.call(this, a, b);
};
EmaExpr.prototype.initRange = function() {
    EmaExpr.__super.initRange.call(this);
    this._alpha = 2.0 / (this._range + 1);
};
EmaExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var prev = this._buf[index - 1];
        return this._alpha * (resultA - prev.result) + prev.result;
    }
    return resultA;
};
var ExpmemaExpr = create_class(EmaExpr);
ExpmemaExpr.prototype.__construct = function(a, b) {
    ExpmemaExpr.__super.__construct.call(this, a, b);
};
ExpmemaExpr.prototype.calcResult = function(index, resultA) {
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var n = this._range;
        var prev = this._buf[index - 1];
        if (n >= index + 1 - first) {
            n = index + 1 - first;
            return prev.result * (1.0 - 1.0 / n) + (resultA / n);
        }
        return this._alpha * (resultA - prev.result) + prev.result;
    }
    return resultA;
};
var SmaExpr = create_class(RangeExpr);
SmaExpr.prototype.__construct = function(a, b, c) {
    SmaExpr.__super.__construct.call(this, a, b);
    this._exprC = c;
    this._mul;
};
SmaExpr.prototype.initRange = function() {
    SmaExpr.__super.initRange.call(this);
    this._mul = this._exprC.execute(0);
};
SmaExpr.prototype.calcResult = function(index, resultA) {
    if (this._range == 0)
        return NaN;
    var first = ExprEnv.get()._firstIndex;
    if (first < 0)
        return resultA;
    if (index > first) {
        var n = this._range;
        if (n > index + 1 - first)
            n = index + 1 - first;
        return ((n - 1) * this._buf[index - 1].result + resultA * this._mul) / n;
    }
    return resultA;
};
var SarExpr = create_class(OpABCDExpr);
SarExpr.prototype.__construct = function(a, b, c, d) {
    SarExpr.__super.__construct.call(this, a, b, c, d);
    this._buf = [];
    this._range = -1;
    this._min;
    this._step;
    this._max;
};
SarExpr.prototype.execute = function(index) {
    if (this._range < 0) {
        this._range = this._exprA.execute(0);
        this._min = this._exprB.execute(0) / 100.0;
        this._step = this._exprC.execute(0) / 100.0;
        this._max = this._exprD.execute(0) / 100.0;
    }
    var data = this._buf[index];
    var exprEnv = ExprEnv.get();
    var first = exprEnv._firstIndex;
    if (first < 0) {
        data.longPos = true;
        data.sar = exprEnv._ds.getDataAt(index).low;
        data.ep = exprEnv._ds.getDataAt(index).high;
        data.af = 0.02;
    } else {
        var high = exprEnv._ds.getDataAt(index).high;
        var low = exprEnv._ds.getDataAt(index).low;
        var prev = this._buf[index - 1];
        data.sar = prev.sar + prev.af * (prev.ep - prev.sar);
        if (prev.longPos) {
            data.longPos = true;
            if (high > prev.ep) {
                data.ep = high;
                data.af = Math.min(prev.af + this._step, this._max);
            } else {
                data.ep = prev.ep;
                data.af = prev.af;
            }
            if (data.sar > low) {
                data.longPos = false;
                var i = index - this._range + 1;
                for (i = Math.max(i, first); i < index; i++) {
                    var h = exprEnv._ds.getDataAt(i).high;
                    if (high < h) high = h;
                }
                data.sar = high;
                data.ep = low;
                data.af = 0.02;
            }
        }
        else {
            data.longPos = false;
            if (low < prev.ep) {
                data.ep = low;
                data.af = Math.min(prev.af + this._step, this._max);
            } else {
                data.ep = prev.ep;
                data.af = prev.af;
            }
            if (data.sar < high) {
                data.longPos = true;
                var i = index - this._range + 1;
                for (i = Math.max(i, first); i < index; i++) {
                    var l = exprEnv._ds.getDataAt(i).low;
                    if (low > l) low = l;
                }
                data.sar = low;
                data.ep = high;
                data.af = 0.02;
            }
        }
    }
    return data.sar;
};
SarExpr.prototype.reserve = function(rid, count) {
    if (this._rid < rid) {
        for (var c = count; c > 0; c--)
            this._buf.push({longPos:true, sar:NaN, ep:NaN, af:NaN});
    }
    SarExpr.__super.reserve.call(this, rid, count);
};
SarExpr.prototype.clear = function() {
    SarExpr.__super.clear.call(this);
    this._range = -1;
};
var Indicator = create_class();
Indicator.prototype.__construct = function() {
    this._exprEnv = new ExprEnv();
    this._rid = 0;
    this._params = [];
    this._assigns = [];
    this._outputs = [];
};
Indicator.prototype.addParameter = function(expr) {
    this._params.push(expr);
};
Indicator.prototype.addAssign = function(expr) {
    this._assigns.push(expr);
};
Indicator.prototype.addOutput = function(expr) {
    this._outputs.push(expr);
};
Indicator.prototype.getParameterCount = function() {
    return this._params.length;
};
Indicator.prototype.getParameterAt = function(index) {
    return this._params[index];
};
Indicator.prototype.getOutputCount = function() {
    return this._outputs.length;
};
Indicator.prototype.getOutputAt = function(index) {
    return this._outputs[index];
};
Indicator.prototype.clear = function() {
    this._exprEnv.setFirstIndex(-1);
    var i, cnt;
    cnt = this._assigns.length;
    for (i = 0; i < cnt; i++) {
        this._assigns[i].clear();
    }
    cnt = this._outputs.length;
    for (i = 0; i < cnt; i++) {
        this._outputs[i].clear();
    }
};
Indicator.prototype.reserve = function(count) {
    this._rid++;
    var i, cnt;
    cnt = this._assigns.length;
    for (i = 0; i < cnt; i++) {
        this._assigns[i].reserve(this._rid, count);
    }
    cnt = this._outputs.length;
    for (i = 0; i < cnt; i++) {
        this._outputs[i].reserve(this._rid, count);
    }
};
Indicator.prototype.execute = function(ds, index) {
    if (index < 0)
        return;
    this._exprEnv.setDataSource(ds);
    ExprEnv.set(this._exprEnv);
    try {
        var i, cnt;
        cnt = this._assigns.length;
        for (i = 0; i < cnt; i++) {
            this._assigns[i].assign(index);
        }
        cnt = this._outputs.length;
        for (i = 0; i < cnt; i++) {
            this._outputs[i].assign(index);
        }
        if (this._exprEnv.getFirstIndex() < 0)
            this._exprEnv.setFirstIndex(index);
    } catch (e) {
        if (this._exprEnv.getFirstIndex() >= 0) {
            alert(e);
            throw e;
        }
    }
};
Indicator.prototype.getParameters = function() {
    var params = [];
    var i, cnt = this._params.length;
    for (i = 0; i < cnt; i++)
        params.push(this._params[i].getValue());
    return params;
};
Indicator.prototype.setParameters = function(params) {
    if ((params instanceof Array) && params.length == this._params.length) {
        for (var i in this._params)
            this._params[i].setValue(params[i]);
    }
};
var HLCIndicator = create_class(Indicator);
HLCIndicator.prototype.__construct = function() {
    HLCIndicator.__super.__construct.call(this);
    var M1 = new ParameterExpr("M1", 2, 1000, 60);
    this.addParameter(M1);
    this.addOutput(new OutputExpr("HIGH",
        new HighExpr(),
        OutputStyle.None
    ));
    this.addOutput(new OutputExpr("LOW",
        new LowExpr(),
        OutputStyle.None
    ));
    this.addOutput(new OutputExpr("CLOSE",
        new CloseExpr(),
        OutputStyle.Line,
        Theme.Color.Indicator0
    ));
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(new CloseExpr(), M1),
        OutputStyle.Line,
        Theme.Color.Indicator1
    ));
};
HLCIndicator.prototype.getName = function() {
    return "CLOSE";
};
var MAIndicator = create_class(Indicator);
MAIndicator.prototype.__construct = function() {
    MAIndicator.__super.__construct.call(this);
    var M1 = new ParameterExpr("M1", 2, 1000, 7);
    var M2 = new ParameterExpr("M2", 2, 1000, 30);
    var M3 = new ParameterExpr("M3", 2, 1000, 0);
    var M4 = new ParameterExpr("M4", 2, 1000, 0);
    this.addParameter(M1);
    this.addParameter(M2);
    this.addParameter(M3);
    this.addParameter(M4);
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(new CloseExpr(), M1)
    ));
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(new CloseExpr(), M2)
    ));
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(new CloseExpr(), M3)
    ));
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(new CloseExpr(), M4)
    ));
};
MAIndicator.prototype.getName = function() {
    return "MA";
};
var EMAIndicator = create_class(Indicator);
EMAIndicator.prototype.__construct = function() {
    EMAIndicator.__super.__construct.call(this);
    var M1 = new ParameterExpr("M1", 2, 1000, 7);
    var M2 = new ParameterExpr("M2", 2, 1000, 30);
    var M3 = new ParameterExpr("M3", 2, 1000, 0);
    var M4 = new ParameterExpr("M4", 2, 1000, 0);
    this.addParameter(M1);
    this.addParameter(M2);
    this.addParameter(M3);
    this.addParameter(M4);
    this.addOutput(new RangeOutputExpr("EMA",
        new EmaExpr(new CloseExpr(), M1)
    ));
    this.addOutput(new RangeOutputExpr("EMA",
        new EmaExpr(new CloseExpr(), M2)
    ));
    this.addOutput(new RangeOutputExpr("EMA",
        new EmaExpr(new CloseExpr(), M3)
    ));
    this.addOutput(new RangeOutputExpr("EMA",
        new EmaExpr(new CloseExpr(), M4)
    ));
};
EMAIndicator.prototype.getName = function() {
    return "EMA";
};
var VOLUMEIndicator = create_class(Indicator);
VOLUMEIndicator.prototype.__construct = function() {
    VOLUMEIndicator.__super.__construct.call(this);
    var M1 = new ParameterExpr("M1", 2, 500, 5);
    var M2 = new ParameterExpr("M2", 2, 500, 10);
    this.addParameter(M1);
    this.addParameter(M2);
    var VOLUME = new OutputExpr("VOLUME",
        new VolumeExpr(),
        OutputStyle.VolumeStick,
        Theme.Color.Text4
    );
    this.addOutput(VOLUME);
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(VOLUME, M1),
        OutputStyle.Line,
        Theme.Color.Indicator0
    ));
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(VOLUME, M2),
        OutputStyle.Line,
        Theme.Color.Indicator1
    ));
};
VOLUMEIndicator.prototype.getName = function() {
    return "VOLUME";
};
var MACDIndicator = create_class(Indicator);
MACDIndicator.prototype.__construct = function() {
    MACDIndicator.__super.__construct.call(this);
    var SHORT = new ParameterExpr("SHORT", 2, 200, 12);
    var LONG = new ParameterExpr("LONG", 2, 200, 26);
    var MID = new ParameterExpr("MID", 2, 200, 9);
    this.addParameter(SHORT);
    this.addParameter(LONG);
    this.addParameter(MID);
    var DIF = new OutputExpr("DIF",
        new SubExpr(
            new EmaExpr(new CloseExpr(), SHORT),
            new EmaExpr(new CloseExpr(), LONG)
        )
    );
    this.addOutput(DIF);
    var DEA = new OutputExpr("DEA",
        new EmaExpr(DIF, MID)
    );
    this.addOutput(DEA);
    var MACD = new OutputExpr("MACD",
        new MulExpr(
            new SubExpr(DIF, DEA),
            new ConstExpr(2)
        ),
        OutputStyle.MACDStick
    );
    this.addOutput(MACD);
};
MACDIndicator.prototype.getName = function() {
    return "MACD";
};
var DMIIndicator = create_class(Indicator);
DMIIndicator.prototype.__construct = function() {
    DMIIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 90, 14);
    var MM = new ParameterExpr("MM", 2, 60, 6);
    this.addParameter(N);
    this.addParameter(MM);
    var MTR = new AssignExpr("MTR",
        new ExpmemaExpr(
            new MaxExpr(
                new MaxExpr(
                    new SubExpr(new HighExpr(), new LowExpr()),
                    new AbsExpr(
                        new SubExpr(
                            new HighExpr(),
                            new RefExpr(new CloseExpr(), new ConstExpr(1))
                        )
                    )
                ),
                new AbsExpr(
                    new SubExpr(
                        new RefExpr(new CloseExpr(), new ConstExpr(1)),
                        new LowExpr()
                    )
                )
            ),
            N
        )
    );
    this.addAssign(MTR);
    var HD = new AssignExpr("HD",
        new SubExpr(
            new HighExpr(),
            new RefExpr(new HighExpr(), new ConstExpr(1))
        )
    );
    this.addAssign(HD);
    var LD = new AssignExpr("LD",
        new SubExpr(
            new RefExpr(new LowExpr(), new ConstExpr(1)),
            new LowExpr()
        )
    );
    this.addAssign(LD);
    var DMP = new AssignExpr("DMP",
        new ExpmemaExpr(
            new IfExpr(
                new AndExpr(
                    new GtExpr(HD, new ConstExpr(0)),
                    new GtExpr(HD, LD)
                ),
                HD,
                new ConstExpr(0)
            ),
            N
        )
    );
    this.addAssign(DMP);
    var DMM = new AssignExpr("DMM",
        new ExpmemaExpr(
            new IfExpr(
                new AndExpr(
                    new GtExpr(LD, new ConstExpr(0)),
                    new GtExpr(LD, HD)
                ),
                LD,
                new ConstExpr(0)
            ),
            N
        )
    );
    this.addAssign(DMM);
    var PDI = new OutputExpr("PDI",
        new MulExpr(
            new DivExpr(DMP, MTR),
            new ConstExpr(100)
        )
    );
    this.addOutput(PDI);
    var MDI = new OutputExpr("MDI",
        new MulExpr(
            new DivExpr(DMM, MTR),
            new ConstExpr(100)
        )
    );
    this.addOutput(MDI);
    var ADX = new OutputExpr("ADX",
        new ExpmemaExpr(
            new MulExpr(
                new DivExpr(
                    new AbsExpr(
                        new SubExpr(MDI, PDI)
                    ),
                    new AddExpr(MDI, PDI)
                ),
                new ConstExpr(100)
            ),
            MM
        )
    );
    this.addOutput(ADX);
    var ADXR = new OutputExpr("ADXR",
        new ExpmemaExpr(ADX, MM)
    );
    this.addOutput(ADXR);
};
DMIIndicator.prototype.getName = function() {
    return "DMI";
};
var DMAIndicator = create_class(Indicator);
DMAIndicator.prototype.__construct = function() {
    DMAIndicator.__super.__construct.call(this);
    var N1 = new ParameterExpr("N1", 2, 60, 10);
    var N2 = new ParameterExpr("N2", 2, 250, 50);
    var M = new ParameterExpr("M", 2, 100, 10);
    this.addParameter(N1);
    this.addParameter(N2);
    this.addParameter(M);
    var DIF = new OutputExpr("DIF",
        new SubExpr(
            new MaExpr(new CloseExpr(), N1),
            new MaExpr(new CloseExpr(), N2)
        )
    );
    this.addOutput(DIF);
    var DIFMA = new OutputExpr("DIFMA",
        new MaExpr(DIF, M)
    );
    this.addOutput(DIFMA);
};
DMAIndicator.prototype.getName = function() {
    return "DMA";
};
var TRIXIndicator = create_class(Indicator);
TRIXIndicator.prototype.__construct = function() {
    TRIXIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 100, 12);
    var M = new ParameterExpr("M", 2, 100, 9);
    this.addParameter(N);
    this.addParameter(M);
    var MTR = new AssignExpr("MTR",
        new EmaExpr(
            new EmaExpr(
                new EmaExpr(new CloseExpr(), N), N), N)
    );
    this.addAssign(MTR);
    var TRIX = new OutputExpr("TRIX",
        new MulExpr(
            new DivExpr(
                new SubExpr(
                    MTR,
                    new RefExpr(
                        MTR,
                        new ConstExpr(1)
                    )
                ),
                new RefExpr(
                    MTR,
                    new ConstExpr(1)
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(TRIX);
    var MATRIX = new OutputExpr("MATRIX",
        new MaExpr(TRIX, M)
    );
    this.addOutput(MATRIX);
};
TRIXIndicator.prototype.getName = function() {
    return "TRIX";
};
var BRARIndicator = create_class(Indicator);
BRARIndicator.prototype.__construct = function() {
    BRARIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 120, 26);
    this.addParameter(N);
    var REF_CLOSE_1 = new AssignExpr("REF_CLOSE_1",
        new RefExpr(new CloseExpr(), new ConstExpr(1))
    );
    this.addAssign(REF_CLOSE_1);
    var BR = new OutputExpr("BR",
        new MulExpr(
            new DivExpr(
                new SumExpr(
                    new MaxExpr(
                        new ConstExpr(0),
                        new SubExpr(
                            new HighExpr(),
                            REF_CLOSE_1
                        )
                    ),
                    N
                ),
                new SumExpr(
                    new MaxExpr(
                        new ConstExpr(0),
                        new SubExpr(
                            REF_CLOSE_1,
                            new LowExpr()
                        )
                    ),
                    N
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(BR);
    var AR = new OutputExpr("AR",
        new MulExpr(
            new DivExpr(
                new SumExpr(
                    new SubExpr(
                        new HighExpr(),
                        new OpenExpr()
                    ),
                    N
                ),
                new SumExpr(
                    new SubExpr(
                        new OpenExpr(),
                        new LowExpr()
                    ),
                    N
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(AR);
};
BRARIndicator.prototype.getName = function() {
    return "BRAR";
};
var VRIndicator = create_class(Indicator);
VRIndicator.prototype.__construct = function() {
    VRIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 100, 26);
    var M = new ParameterExpr("M", 2, 100, 6);
    this.addParameter(N);
    this.addParameter(M);
    var REF_CLOSE_1 = new AssignExpr("REF_CLOSE_1",
        new RefExpr(new CloseExpr(), new ConstExpr(1))
    );
    this.addAssign(REF_CLOSE_1);
    var TH = new AssignExpr("TH",
        new SumExpr(
            new IfExpr(
                new GtExpr(
                    new CloseExpr(),
                    REF_CLOSE_1
                ),
                new VolumeExpr(),
                new ConstExpr(0)
            ),
            N
        )
    );
    this.addAssign(TH);
    var TL = new AssignExpr("TL",
        new SumExpr(
            new IfExpr(
                new LtExpr(
                    new CloseExpr(),
                    REF_CLOSE_1
                ),
                new VolumeExpr(),
                new ConstExpr(0)
            ),
            N
        )
    );
    this.addAssign(TL);
    var TQ = new AssignExpr("TQ",
        new SumExpr(
            new IfExpr(
                new EqExpr(
                    new CloseExpr(),
                    REF_CLOSE_1
                ),
                new VolumeExpr(),
                new ConstExpr(0)
            ),
            N
        )
    );
    this.addAssign(TQ);
    var VR = new OutputExpr("VR",
        new MulExpr(
            new DivExpr(
                new AddExpr(
                    new MulExpr(
                        TH,
                        new ConstExpr(2)
                    ),
                    TQ
                ),
                new AddExpr(
                    new MulExpr(
                        TL,
                        new ConstExpr(2)
                    ),
                    TQ
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(VR);
    var MAVR = new OutputExpr("MAVR",
        new MaExpr(VR, M)
    );
    this.addOutput(MAVR);
};
VRIndicator.prototype.getName = function() {
    return "VR";
};
var OBVIndicator = create_class(Indicator);
OBVIndicator.prototype.__construct = function() {
    OBVIndicator.__super.__construct.call(this);
    var M = new ParameterExpr("M", 2, 100, 30);
    this.addParameter(M);
    var REF_CLOSE_1 = new AssignExpr("REF_CLOSE_1",
        new RefExpr(new CloseExpr(), new ConstExpr(1))
    );
    this.addAssign(REF_CLOSE_1);
    var VA = new AssignExpr("VA",
        new IfExpr(
            new GtExpr(new CloseExpr(), REF_CLOSE_1),
            new VolumeExpr(),
            new NegExpr(new VolumeExpr())
        )
    );
    this.addAssign(VA);
    var OBV = new OutputExpr("OBV",
        new SumExpr(
            new IfExpr(
                new EqExpr(new CloseExpr(), REF_CLOSE_1),
                new ConstExpr(0),
                VA
            ),
            new ConstExpr(0)
        )
    );
    this.addOutput(OBV);
    var MAOBV = new OutputExpr("MAOBV",
        new MaExpr(OBV, M)
    );
    this.addOutput(MAOBV);
};
OBVIndicator.prototype.getName = function() {
    return "OBV";
};
var EMVIndicator = create_class(Indicator);
EMVIndicator.prototype.__construct = function() {
    EMVIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 90, 14);
    var M = new ParameterExpr("M", 2, 60, 9);
    this.addParameter(N);
    this.addParameter(M);
    var VOLUME = new AssignExpr("VOLUME",
        new DivExpr(
            new MaExpr(new VolumeExpr(), N),
            new VolumeExpr()
        )
    );
    this.addAssign(VOLUME);
    var MID = new AssignExpr("MID",
        new MulExpr(
            new DivExpr(
                new SubExpr(
                    new AddExpr(new HighExpr(), new LowExpr()),
                    new RefExpr(
                        new AddExpr(new HighExpr(), new LowExpr()),
                        new ConstExpr(1)
                    )
                ),
                new AddExpr(new HighExpr(), new LowExpr())
            ),
            new ConstExpr(100)
        )
    );
    this.addAssign(MID);
    var EMV = new OutputExpr("EMV",
        new MaExpr(
            new DivExpr(
                new MulExpr(
                    MID,
                    new MulExpr(
                        VOLUME,
                        new SubExpr(new HighExpr(), new LowExpr())
                    )
                ),
                new MaExpr(
                    new SubExpr(new HighExpr(), new LowExpr()),
                    N
                )
            ),
            N
        )
    );
    this.addOutput(EMV);
    var MAEMV = new OutputExpr("MAEMV",
        new MaExpr(EMV, M)
    );
    this.addOutput(MAEMV);
};
EMVIndicator.prototype.getName = function() {
    return "EMV";
};
var RSIIndicator = create_class(Indicator);
RSIIndicator.prototype.__construct = function() {
    RSIIndicator.__super.__construct.call(this);
    var N1 = new ParameterExpr("N1", 2, 120, 6);
    var N2 = new ParameterExpr("N2", 2, 250, 12);
    var N3 = new ParameterExpr("N3", 2, 500, 24);
    this.addParameter(N1);
    this.addParameter(N2);
    this.addParameter(N3);
    var LC = new AssignExpr("LC",
        new RefExpr(new CloseExpr(), new ConstExpr(1))
    );
    this.addAssign(LC);
    var CLOSE_LC = new AssignExpr("CLOSE_LC",
        new SubExpr(new CloseExpr(), LC)
    );
    this.addAssign(CLOSE_LC);
    this.addOutput(new OutputExpr("RSI1",
        new MulExpr(
            new DivExpr(
                new SmaExpr(new MaxExpr(CLOSE_LC, new ConstExpr(0)), N1, new ConstExpr(1)),
                new SmaExpr(new AbsExpr(CLOSE_LC), N1, new ConstExpr(1))
            ),
            new ConstExpr(100)
        )
    ));
    this.addOutput(new OutputExpr("RSI2",
        new MulExpr(
            new DivExpr(
                new SmaExpr(new MaxExpr(CLOSE_LC, new ConstExpr(0)), N2, new ConstExpr(1)),
                new SmaExpr(new AbsExpr(CLOSE_LC), N2, new ConstExpr(1))
            ),
            new ConstExpr(100)
        )
    ));
    this.addOutput(new OutputExpr("RSI3",
        new MulExpr(
            new DivExpr(
                new SmaExpr(new MaxExpr(CLOSE_LC, new ConstExpr(0)), N3, new ConstExpr(1)),
                new SmaExpr(new AbsExpr(CLOSE_LC), N3, new ConstExpr(1))
            ),
            new ConstExpr(100)
        )
    ));
};
RSIIndicator.prototype.getName = function() {
    return "RSI";
};
var WRIndicator = create_class(Indicator);
WRIndicator.prototype.__construct = function() {
    WRIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 100, 10);
    var N1 = new ParameterExpr("N1", 2, 100, 6);
    this.addParameter(N);
    this.addParameter(N1);
    var HHV = new AssignExpr("HHV",
        new HhvExpr(new HighExpr(), N)
    );
    this.addAssign(HHV);
    var HHV1 = new AssignExpr("HHV1",
        new HhvExpr(new HighExpr(), N1)
    );
    this.addAssign(HHV1);
    var LLV = new AssignExpr("LLV",
        new LlvExpr(new LowExpr(), N)
    );
    this.addAssign(LLV);
    var LLV1 = new AssignExpr("LLV1",
        new LlvExpr(new LowExpr(), N1)
    );
    this.addAssign(LLV1);
    var WR1 = new OutputExpr("WR1",
        new MulExpr(
            new DivExpr(
                new SubExpr(
                    HHV,
                    new CloseExpr()
                ),
                new SubExpr(
                    HHV,
                    LLV
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(WR1);
    var WR2 = new OutputExpr("WR2",
        new MulExpr(
            new DivExpr(
                new SubExpr(
                    HHV1,
                    new CloseExpr()
                ),
                new SubExpr(
                    HHV1,
                    LLV1
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(WR2);
};
WRIndicator.prototype.getName = function() {
    return "WR";
};
var SARIndicator = create_class(Indicator);
SARIndicator.prototype.__construct = function() {
    SARIndicator.__super.__construct.call(this);
    var N = new ConstExpr(4);
    var MIN = new ConstExpr(2);
    var STEP = new ConstExpr(2);
    var MAX = new ConstExpr(20);
    this.addOutput(new OutputExpr("SAR",
        new SarExpr(N, MIN, STEP, MAX),
        OutputStyle.SARPoint
    ));
};
SARIndicator.prototype.getName = function() {
    return "SAR";
};
var KDJIndicator = create_class(Indicator);
KDJIndicator.prototype.__construct = function() {
    KDJIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 90, 9);
    var M1 = new ParameterExpr("M1", 2, 30, 3);
    var M2 = new ParameterExpr("M2", 2, 30, 3);
    this.addParameter(N);
    this.addParameter(M1);
    this.addParameter(M2);
    var HHV = new AssignExpr("HHV",
        new HhvExpr(new HighExpr(), N)
    );
    this.addAssign(HHV);
    var LLV = new AssignExpr("LLV",
        new LlvExpr(new LowExpr(), N)
    );
    this.addAssign(LLV);
    var RSV = new AssignExpr("RSV",
        new MulExpr(
            new DivExpr(
                new SubExpr(
                    new CloseExpr(),
                    LLV
                ),
                new SubExpr(
                    HHV,
                    LLV
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addAssign(RSV);
    var K = new OutputExpr("K",
        new SmaExpr(RSV, M1, new ConstExpr(1))
    );
    this.addOutput(K);
    var D = new OutputExpr("D",
        new SmaExpr(K, M2, new ConstExpr(1))
    );
    this.addOutput(D);
    var J = new OutputExpr("J",
        new SubExpr(
            new MulExpr(
                K,
                new ConstExpr(3)
            ),
            new MulExpr(
                D,
                new ConstExpr(2)
            )
        )
    );
    this.addOutput(J);
};
KDJIndicator.prototype.getName = function() {
    return "KDJ";
};
var ROCIndicator = create_class(Indicator);
ROCIndicator.prototype.__construct = function() {
    ROCIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 120, 12);
    var M = new ParameterExpr("M", 2, 60, 6);
    this.addParameter(N);
    this.addParameter(M);
    var REF_CLOSE_N = new AssignExpr("REF_CLOSE_N",
        new RefExpr(new CloseExpr(), N)
    );
    this.addAssign(REF_CLOSE_N);
    var ROC = new OutputExpr("ROC",
        new MulExpr(
            new DivExpr(
                new SubExpr(
                    new CloseExpr(),
                    REF_CLOSE_N
                ),
                REF_CLOSE_N
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(ROC);
    var MAROC = new OutputExpr("MAROC",
        new MaExpr(ROC, M)
    );
    this.addOutput(MAROC);
};
ROCIndicator.prototype.getName = function() {
    return "ROC";
};
var MTMIndicator = create_class(Indicator);
MTMIndicator.prototype.__construct = function() {
    MTMIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 120, 12);
    var M = new ParameterExpr("M", 2, 60, 6);
    this.addParameter(N);
    this.addParameter(M);
    var MTM = new OutputExpr("MTM",
        new SubExpr(
            new CloseExpr(),
            new RefExpr(new CloseExpr(), N)
        )
    );
    this.addOutput(MTM);
    var MTMMA = new OutputExpr("MTMMA",
        new MaExpr(MTM, M)
    );
    this.addOutput(MTMMA);
};
MTMIndicator.prototype.getName = function() {
    return "MTM";
};
var BOLLIndicator = create_class(Indicator);
BOLLIndicator.prototype.__construct = function() {
    BOLLIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 120, 20);
    this.addParameter(N);
    var STD_CLOSE_N = new AssignExpr("STD_CLOSE_N",
        new StdExpr(new CloseExpr(), N)
    );
    this.addAssign(STD_CLOSE_N);
    var BOLL = new OutputExpr("BOLL",
        new MaExpr(new CloseExpr(), N)
    );
    this.addOutput(BOLL);
    var UB = new OutputExpr("UB",
        new AddExpr(
            BOLL,
            new MulExpr(
                new ConstExpr(2),
                STD_CLOSE_N
            )
        )
    );
    this.addOutput(UB);
    var LB = new OutputExpr("LB",
        new SubExpr(
            BOLL,
            new MulExpr(
                new ConstExpr(2),
                STD_CLOSE_N
            )
        )
    );
    this.addOutput(LB);
};
BOLLIndicator.prototype.getName = function() {
    return "BOLL";
};
var PSYIndicator = create_class(Indicator);
PSYIndicator.prototype.__construct = function() {
    PSYIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 2, 100, 12);
    var M = new ParameterExpr("M", 2, 100, 6);
    this.addParameter(N);
    this.addParameter(M);
    var PSY = new OutputExpr("PSY",
        new MulExpr(
            new DivExpr(
                new CountExpr(
                    new GtExpr(
                        new CloseExpr(),
                        new RefExpr(new CloseExpr(), new ConstExpr(1))
                    ),
                    N
                ),
                N
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(PSY);
    var PSYMA = new OutputExpr("PSYMA",
        new MaExpr(PSY, M)
    );
    this.addOutput(PSYMA);
};
PSYIndicator.prototype.getName = function() {
    return "PSY";
};
var STOCHRSIIndicator = create_class(Indicator);
STOCHRSIIndicator.prototype.__construct = function() {
    STOCHRSIIndicator.__super.__construct.call(this);
    var N = new ParameterExpr("N", 3, 100, 14);
    var M = new ParameterExpr("M", 3, 100, 14);
    var P1 = new ParameterExpr("P1", 2, 50, 3);
    var P2 = new ParameterExpr("P2", 2, 50, 3);
    this.addParameter(N);
    this.addParameter(M);
    this.addParameter(P1);
    this.addParameter(P2);
    var LC = new AssignExpr("LC",
        new RefExpr(new CloseExpr(), new ConstExpr(1))
    );
    this.addAssign(LC);
    var CLOSE_LC = new AssignExpr("CLOSE_LC",
        new SubExpr(new CloseExpr(), LC)
    );
    this.addAssign(CLOSE_LC);
    var RSI = new AssignExpr("RSI",
        new MulExpr(
            new DivExpr(
                new SmaExpr(new MaxExpr(CLOSE_LC, new ConstExpr(0)), N, new ConstExpr(1)),
                new SmaExpr(new AbsExpr(CLOSE_LC), N, new ConstExpr(1))
            ),
            new ConstExpr(100)
        )
    );
    this.addAssign(RSI);
    var STOCHRSI = new OutputExpr("STOCHRSI",
        new MulExpr(
            new DivExpr(
                new MaExpr(
                    new SubExpr(
                        RSI,
                        new LlvExpr(RSI, M)
                    ),
                    P1
                ),
                new MaExpr(
                    new SubExpr(
                        new HhvExpr(RSI, M),
                        new LlvExpr(RSI, M)
                    ),
                    P1
                )
            ),
            new ConstExpr(100)
        )
    );
    this.addOutput(STOCHRSI);
    this.addOutput(new RangeOutputExpr("MA",
        new MaExpr(STOCHRSI, P2)
    ));
};
STOCHRSIIndicator.prototype.getName = function() {
    return "StochRSI";
};