class timmer {
    constructor(label){
        this.label=label
        var d = new Date();
        this.startTime = d.getTime();
        console.log(`${this.label} - Started`);
    }
    lapTime(lapComment){
        var dd = new Date();
        var lapTimeMS =  dd.getTime() - this.startTime;
        console.log(`${this.label} - ${lapComment} - ${lapTimeMS}ms`)
    }
  }
  module.exports = timmer
  
  