import OrderedMap from 'util/orderedmap';

let map = new OrderedMap();

map.add('a2b1', {a: 2, b: 1});
map.add('a2b2', {a: 2, b: 2});
map.add('a1b1', {a: 1, b: 1});
map.add('a1b2', {a: 1, b: 2});

console.log(map.filter({b:2}))
console.log(map.filter({b:2, a: 1}))