(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Simulator = (function() {
    var default_options, inBetween, lastRun, loopInterval, randomUpTo, time;

    loopInterval = 20;

    lastRun = null;

    default_options = {
      simulationSpeed: 15,
      thrust: false,
      speed: 0.1,
      gm: 398524.239,
      update_ui_interval: 10,
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
      this.selected = null;
      this.addOrbiter(new window.Orbit(this.options.gm).fromOrbitalElements(6780, 0.001, 45 * Math.PI / 180, 0 * Math.PI / 180, 270 * Math.PI / 180));
      this.selectOrbiter(0);
      return this.updateUI(true);
    };

    Simulator.prototype.addOrbiter = function(orbit) {
      var orbiter;
      orbiter = this.renderer.createOrbiter();
      orbiter.orbit = orbit;
      orbiter.maneuver = null;
      orbiter.id = this.orbiters.length;
      orbiter.line = this.renderer.addOrbit(orbit);
      this.orbiters.push(orbiter);
      return this.updateUI(true);
    };

    Simulator.prototype.circulizeHigh = function() {
      var newOrbit, oldOrbit;
      oldOrbit = this.orbiters[this.selected].orbit;
      newOrbit = jQuery.extend(true, {}, oldOrbit);
      newOrbit.a = oldOrbit.apoapsis();
      newOrbit.e = new THREE.Vector3();
      newOrbit.calculateOrbit();
      newOrbit.m = Math.PI;
      return this.orbiters[this.selected].maneuver = {
        status: "planned",
        at: 180,
        dV: newOrbit.maxSpeed() - oldOrbit.minSpeed(),
        orbit: newOrbit,
        line: this.renderer.addOrbit(newOrbit, 1000, 0x3587DE)
      };
    };

    Simulator.prototype.circulizeLow = function() {
      var newOrbit, oldOrbit;
      oldOrbit = this.orbiters[this.selected].orbit;
      newOrbit = jQuery.extend(true, {}, oldOrbit);
      newOrbit.a = oldOrbit.periapsis();
      newOrbit.e = new THREE.Vector3();
      newOrbit.calculateOrbit();
      return this.orbiters[this.selected].maneuver = {
        status: "planned",
        at: 0,
        dV: newOrbit.maxSpeed() - oldOrbit.maxSpeed(),
        orbit: newOrbit,
        line: this.renderer.addOrbit(newOrbit, 1000, 0x3587DE)
      };
    };

    Simulator.prototype.cancelManeuver = function() {
      if (!this.orbiters[this.selected].maneuver) return;
      if (this.orbiters[this.selected].maneuver.status !== "completed") {
        this.renderer.removeOrbit(this.orbiters[this.selected].maneuver.line);
      }
      return this.orbiters[this.selected].maneuver = null;
    };

    Simulator.prototype.selectOrbiter = function(id, callback) {
      if (id < 0 || id >= this.orbiters.length) return;
      if (this.selected !== null) {
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

    inBetween = function(x, lo, hi) {
      if (lo > hi) {
        return inBetween(x, lo, 360) || inBetween(x, 0, hi);
      } else {
        return x >= lo && x <= hi;
      }
    };

    Simulator.prototype.update = function(delta) {
      var orbiter, _i, _len, _ref;
      _ref = this.orbiters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        orbiter = _ref[_i];
        if (orbiter.maneuver && orbiter.maneuver.status === "planned") {
          if (inBetween(orbiter.maneuver.at, orbiter.orbit.meanAnomaly(), orbiter.orbit.futureMeanAnomaly(delta * 0.001 * this.options.timeAcceleration))) {
            orbiter.orbit = orbiter.maneuver.orbit;
            orbiter.maneuver.status = "completed";
            this.renderer.removeOrbit(orbiter.maneuver.line);
            this.renderer.removeOrbit(orbiter.line);
            orbiter.line = this.renderer.addOrbit(orbiter.orbit);
          }
        }
        orbiter.orbit.step(delta * 0.001 * this.options.timeAcceleration);
        orbiter.position = new THREE.Vector3(orbiter.orbit.position().x, orbiter.orbit.position().z, orbiter.orbit.position().y).divideScalar(63.71);
        orbiter.velocity = new THREE.Vector3(orbiter.orbit.v.x, orbiter.orbit.v.z, orbiter.orbit.v.y);
      }
      this.last_ui_update -= 1;
      if (this.last_ui_update <= 0) {
        this.updateUI(false);
        return this.last_ui_update = this.options.update_ui_interval;
      }
    };

    Simulator.prototype.run = function() {
      var delta;
      delta = time() - lastRun;
      lastRun = time();
      if (this.status === "running") this.update(delta);
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
      return this.status = "paused";
    };

    Simulator.prototype.stop = function() {
      var orbiter, _i, _len, _ref;
      _ref = this.orbiters;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        orbiter = _ref[_i];
        this.renderer.removeOrbiter(orbiter);
        this.renderer.removeOrbit(orbiter.line);
        if (orbiter.maneuver) this.renderer.removeOrbit(orbiter.maneuver.line);
      }
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
