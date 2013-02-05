(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Simulator = (function() {
    var format_time, lastRun, loopInterval, options, randomUpTo, time;

    loopInterval = 20;

    lastRun = null;

    options = {
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

    format_time = function(sec) {
      var str;
      str = "";
      if (sec > 60 * 60) {
        str += "" + (Math.floor(sec / (60 * 60))) + "h";
        sec = sec % (60 * 60);
      }
      if (sec > 60) {
        str += "" + (Math.floor(sec / 60)) + "m";
        sec = sec % 60;
      }
      if (sec > 0) str += "" + (sec.toFixed(0)) + "s";
      return str;
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
      this.last_data_update = options.update_data_interval;
      this.addOrbiter(new window.Orbit(options.gm).fromOrbitalElements(6780, 0.001, 51 * Math.PI / 180, 0 * Math.PI / 180, 110 * Math.PI / 180));
      this.addOrbiter(new window.Orbit(options.gm).fromOrbitalElements(20000, 0.65, 20 * Math.PI / 180, 0 * Math.PI / 180, 60 * Math.PI / 180));
      this.addOrbiter(new window.Orbit(options.gm).fromOrbitalElements(8000, 0.1, -20 * Math.PI / 180, 0 * Math.PI / 180, 40 * Math.PI / 180));
      this.addOrbiter(new window.Orbit(options.gm).fromOrbitalElements(8000, 0.1, -180 * Math.PI / 180, 0 * Math.PI / 180, 170 * Math.PI / 180));
      return this.addOrbiter(new window.Orbit(options.gm).fromOrbitalElements(6500, 0, -90 * Math.PI / 180, 0 * Math.PI / 180, 30 * Math.PI / 180));
    };

    Simulator.prototype.addOrbiter = function(orbit) {
      var orbiter;
      orbiter = this.renderer.createOrbiter();
      orbiter.orbit = orbit;
      this.orbiters.push(orbiter);
      return this.renderer.addOrbit(orbit);
    };

    Simulator.prototype.update_data = function(orbit) {
      var html;
      html = "<h2>State data:</h2><table>";
      html += "<tr><td>Orbital Velocity:</td><td>" + ((orbit.velocity().length() * 1000).toFixed(1)) + " m/s</td></tr>";
      html += "<tr><td>Orbital Velocity (x):</td><td>" + ((orbit.velocity().x * 1000).toFixed(1)) + " m/s</td></tr>";
      html += "<tr><td>Orbital Velocity (y):</td><td>" + ((orbit.velocity().y * 1000).toFixed(1)) + " m/s</td></tr>";
      html += "<tr><td>Orbital Velocity (z):</td><td>" + ((orbit.velocity().z * 1000).toFixed(1)) + " m/s</td></tr>";
      html += "<tr><td>G * M:</td><td>" + orbit.gm + " km^3 s^-2</td></tr>";
      html += "<tr><td>Altitude:</td><td>" + ((orbit.distance() - 6371).toFixed(1)) + " km</td></tr>";
      html += "</table>";
      $("#flight_data").html(html);
      html = "<h2>Orbital elements:</h2><table>";
      html += "<tr><td>Semi Major Axis:</td><td>" + (orbit.semiMajorAxis().toFixed(1)) + " km</td></tr>";
      html += "<tr><td>Eccentricity:</td><td>" + (orbit.eccentricity().toFixed(4)) + "</td></tr>";
      html += "<tr><td>Period:</td><td>" + (format_time(orbit.period())) + "</td></tr>";
      html += "<tr><td>Apoapsis:</td><td>" + ((orbit.apoapsis() - options.earth_radius).toFixed(1)) + " km</td></tr>";
      html += "<tr><td>Periapsis:</td><td>" + ((orbit.periapsis() - options.earth_radius).toFixed(1)) + " km</td></tr>";
      html += "<tr><td>Inclination:</td><td>" + (orbit.inclination().toFixed(1)) + " deg</td></tr>";
      html += "<tr><td>Time to apoapsis:</td><td>" + (format_time(orbit.time_to_apoapsis())) + "</td></tr>";
      html += "<tr><td>Time to periapsis:</td><td>" + (format_time(orbit.time_to_periapsis())) + "</td></tr>";
      html += "<tr><td>Mean Velocity:</td><td>" + (orbit.meanVelocity().toFixed(1)) + " m/s</td></tr>";
      html += "<tr><td>Longitude of the Ascending Node:</td><td>" + (orbit.ascending_node_longitude().toFixed(1)) + " deg</td></tr>";
      html += "<tr><td>Argument of periapsis:</td><td>" + (orbit.argument_of_periapsis().toFixed(1)) + " deg</td></tr>";
      html += "<tr><td>True Anomaly:</td><td>" + (orbit.trueAnomaly().toFixed(1)) + "</td></tr>";
      html += "<tr><td>Eccentric Anomaly:</td><td>" + (orbit.eccentricAnomaly().toFixed(1)) + "</td></tr>";
      html += "<tr><td>Mean Anomaly:</td><td>" + (orbit.meanAnomaly().toFixed(1)) + "</td></tr>";
      html += "</table>";
      return $("#orbit_data").html(html);
    };

    Simulator.prototype.update = function(delta) {
      var orbiter, _i, _len, _ref, _results;
      _ref = this.orbiters;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        orbiter = _ref[_i];
        orbiter.orbit.step(delta * 0.001 * options.timeAcceleration);
        orbiter.position = new THREE.Vector3(orbiter.orbit.position().x, orbiter.orbit.position().z, orbiter.orbit.position().y).divideScalar(63.71);
        orbiter.velocity = new THREE.Vector3(orbiter.orbit.v.x, orbiter.orbit.v.z, orbiter.orbit.v.y);
        this.last_data_update -= 1;
        if (this.last_data_update <= 0) {
          this.last_data_update = options.update_data_interval;
          if (this.orbiters.length > 0) {
            _results.push(this.update_data(this.orbiters[0].orbit));
          } else {
            _results.push(void 0);
          }
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
