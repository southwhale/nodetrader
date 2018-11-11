import { ee } from 'edonctp';

class DataEngine {

  constructor() {
    ee.on('tick', (tick) => {
      this.onTick(tick);
    });

    ee.on('bar', (bar) => {
      this.onBar(bar);
    });

    ee.on('bar_tick', ({ bar, tick }) => {
      this.onBarTick({ bar, tick });
    });
  }

  onTick(tick) {
    
  }

  onBar(bar) {
    
  }

  onBarTick({ bar, tick }) {
    
  }

}