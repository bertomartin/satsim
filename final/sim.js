(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Simulator = (function() {
    var default_options, lastRun, loopInterval, randomUpTo, time;

    loopInterval = 20;

    lastRun = null;

    default_options = {
      simulationSpeed: 15,
      thrust: false,
      speed: 0.1,
      gm: 398524.239,
      update_data_interval: 3,
      timeAcceleration: 100,
      useKepler: true,
      earth_radius: 6371,
      initialSpeed: 7.7
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
      this.orbiters = [];
      this.last_ui_update = this.options.update_ui_interval;
      this.addOrbiter(new window.Orbit(this.options.gm).fromOrbitalElements(6780, 0.001, 51 * Math.PI / 180, 0 * Math.PI / 180, 110 * Math.PI / 180));
      this.addOrbiter(new window.Orbit(this.options.gm).fromOrbitalElements(20000, 0.65, 20 * Math.PI / 180, 0 * Math.PI / 180, 60 * Math.PI / 180));
      this.addOrbiter(new window.Orbit(this.options.gm).fromOrbitalElements(8000, 0.1, -20 * Math.PI / 180, 0 * Math.PI / 180, 40 * Math.PI / 180));
      this.addOrbiter(new window.Orbit(this.options.gm).fromOrbitalElements(8000, 0.1, -180 * Math.PI / 180, 0 * Math.PI / 180, 170 * Math.PI / 180));
      this.addOrbiter(new window.Orbit(this.options.gm).fromOrbitalElements(6500, 0, -90 * Math.PI / 180, 0 * Math.PI / 180, 30 * Math.PI / 180));
      this.selectOrbiter(0);
      return this.updateUI(true);
    };

    Simulator.prototype.addOrbiter = function(orbit) {
      var orbiter;
      orbiter = this.renderer.createOrbiter();
      orbiter.orbit = orbit;
      orbiter.id = this.orbiters.length;
      this.orbiters.push(orbiter);
      return this.renderer.addOrbit(orbit);
    };

    Simulator.prototype.selectOrbiter = function(id, callback) {
      if (id < 0 || id >= this.orbiters.length) return;
      if (!isNaN(this.selected)) {
        this.renderer.unselect(this.orbiters[this.selected]);
      }
      this.renderer.select(this.orbiters[id]);
      this.selected = id;
      this.updateUI(true);
      if (typeof callback === "function") return callback();
    };

    Simulator.prototype.updateUI = function(update_table) {
      if (typeof this.options.ui_updater === "function") {
        return this.options.ui_updater(this.orbiters, this.selected, update_table);
      }
    };

    Simulator.prototype.update = function(delta) {
      var orbiter, _i, _len, _ref, _results;
      _ref = this.orbiters;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        orbiter = _ref[_i];
        orbiter.orbit.step(delta * 0.001 * this.options.timeAcceleration);
        orbiter.position = new THREE.Vector3(orbiter.orbit.position().x, orbiter.orbit.position().z, orbiter.orbit.position().y).divideScalar(63.71);
        orbiter.velocity = new THREE.Vector3(orbiter.orbit.v.x, orbiter.orbit.v.z, orbiter.orbit.v.y);
        this.last_data_update -= 1;
        if (this.last_data_update <= 0) {
          _results.push(this.updateUI(false));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Simulator.prototype.run = function() {
      var delta;
      delta = time() - lastRun;
      lastRun = time();
      this.update(delta);
      return this.renderer.render(delta);
    };

    function Simulator(renderer) {
      this.run = __bind(this.run, this);      this.renderer = renderer;
      this.status = "stopped";
      this.options = default_options;
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
      return this.options[option];
    };

    Simulator.prototype.set = function(option, value) {
      return this.options[option] = value;
    };

    return Simulator;

  })();

}).call(this);
