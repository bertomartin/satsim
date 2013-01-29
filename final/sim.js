(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Simulator = (function() {
    var lastRun, loopInterval, options, randomUpTo, time;

    loopInterval = 20;

    lastRun = null;

    options = {
      simulationSpeed: 15,
      thrust: false
    };

    randomUpTo = function(limit) {
      return Math.floor(Math.random() * limit) + 1;
    };

    time = function() {
      return new Date().getTime();
    };

    Simulator.prototype.direction = function(from, to) {
      var goal;
      goal = new Vector2(to.x(), to.y());
      return goal.substract(from);
    };

    Simulator.prototype.initialize = function() {
      lastRun = time();
      this.planet = this.renderer.getPlanet();
      this.orbiter = this.renderer.getOrbiter();
      this.orbiter.position.z = 100;
      return this.orbiter.velocity = new THREE.Vector3(1.1, 0.2, 0);
    };

    Simulator.prototype.gravity = function(a, b) {
      var o, p;
      p = this.planet.position.clone();
      o = this.orbiter.position.clone();
      return new THREE.Vector3().subVectors(this.planet.position, this.orbiter.position).normalize().multiplyScalar(100).divideScalar(this.orbiter.position.distanceToSquared(this.planet.position));
    };

    Simulator.prototype.update = function(delta) {
      this.orbiter.velocity.add(this.gravity());
      if (options.thrust) this.orbiter.velocity.multiplyScalar(1.001);
      return this.orbiter.position.add(this.orbiter.velocity);
    };

    Simulator.prototype.run = function() {
      var delta;
      delta = time() - lastRun;
      lastRun = time();
      this.update(delta);
      return this.renderer.render(this.orbiter);
    };

    function Simulator(renderer) {
      this.run = __bind(this.run, this);      this.renderer = renderer;
      this.status = "stopped";
    }

    Simulator.prototype.start = function() {
      if (this.status === "paused") lastRun = time();
      if (this.status === "stopped") this.initialize();
      this.intervalHandle = setInterval(this.run, loopInterval);
      return this.status = "running";
    };

    Simulator.prototype.pause = function() {
      window.clearInterval(this.intervalHandle);
      return this.status = "paused";
    };

    Simulator.prototype.stop = function() {
      window.clearInterval(this.intervalHandle);
      return this.status = "stopped";
    };

    Simulator.prototype.get = function(option) {
      return options[option];
    };

    Simulator.prototype.set = function(option, value) {
      return options[option] = value;
    };

    return Simulator;

  })();

}).call(this);
