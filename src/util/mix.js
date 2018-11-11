'use strict';

/**
 * 多重继承的解决方案
 * 可以单独作为函数使用, 也可以作为父类被继承
 *
 * 设想一下, 如果你想编写一个协作编辑工具, 在这个工具中的所有编辑动作都被记录下来, 然后将内容序列化. 你可以使用mix函数写一个DistributedEdit类:
 * class DistributedEdit extends mix(Loggable, Serializable) {
 *   // 事件方法 
 * }
 */



/**
 * @description 混合函数, 用于实现多重继承
 * @param {...Object} mixins 需要被继承的各父类(可以是类、函数或者普通对象)
 * @return {Class} 继承各父类属性后的子类
 */
export default function mix(...mixins) {
  class Mix {}
  // 以编程方式给Mix类添加
  // mixins的所有方法和访问器
  for (let mixin of mixins) {
    copyProperties(Mix, mixin);
    copyProperties(Mix.prototype, mixin.prototype);
  }
  return Mix;
}

function copyProperties(target, source) {
  for (let key of Reflect.ownKeys(source)) {
    if (key !== "constructor" && key !== "prototype" && key !== "name") {
      let desc = Object.getOwnPropertyDescriptor(source, key);
      Object.defineProperty(target, key, desc);
    }
  }
}