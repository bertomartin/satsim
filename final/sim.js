(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.Simulator = (function() {
    var lastRun, loopInterval, options, randomUpTo, time;

    loopInterval = 20;

    lastRun = null;

    options = {
      simulationSpeed: 15,
      thrust: false,
      speed: 0.1,
      gm: 398524.239,
      update_data_interval: 10,
      timeAcceleration: 100,
      useKepler: true,
      initialSpeed: 7.6
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
      this.last_data_update = options.update_data_interval;
      this.orbit = new window.Orbit(options.gm);
      this.orbit.fromStateVectors(new THREE.Vector3(0, 6379 + 401, 0), new THREE.Vector3(options.initialSpeed, 0, 0));
      return this.renderer.addOrbit(this.orbit);
    };

    Simulator.prototype.update_data = function() {
      var html;
      html = "<h2>State data:</h2><table>";
      html += "<tr><td>Orbital Velocity:</td><td>" + (this.orbit.velocity().length().toFixed(3) * 1000) + " m/s</td></tr>";
      html += "<tr><td>Orbital Velocity (x):</td><td>" + (this.orbit.velocity().x.toFixed(3) * 1000) + " m/s</td></tr>";
      html += "<tr><td>Orbital Velocity (y):</td><td>" + (this.orbit.velocity().y.toFixed(3) * 1000) + " m/s</td></tr>";
      html += "<tr><td>Orbital Velocity (z):</td><td>" + (this.orbit.velocity().z.toFixed(3) * 1000) + " m/s</td></tr>";
      html += "<tr><td>G * M:</td><td>" + this.orbit.gm + " km^3 s^-2</td></tr>";
      html += "<tr><td>Altitude:</td><td>" + (this.orbit.distance() - 6379) + " km</td></tr>";
      html += "</table>";
      $("#flight_data").html(html);
      html = "<h2>Orbital elements:</h2><table>";
      html += "<tr><td>Semi Major Axis:</td><td>" + (this.orbit.semiMajorAxis()) + "</td></tr>";
      html += "<tr><td>Inclination:</td><td>" + (this.orbit.inclination()) + "</td></tr>";
      html += "<tr><td>Momentum:</td><td>" + (this.orbit.momentum()) + "</td></tr>";
      html += "<tr><td>Eccentricity:</td><td>" + (this.orbit.eccentricity()) + "</td></tr>";
      html += "<tr><td>Period:</td><td>" + (this.orbit.period()) + "</td></tr>";
      html += "<tr><td>Mean Velocity:</td><td>" + (this.orbit.meanVelocity()) + "</td></tr>";
      html += "<tr><td>True Anomaly:</td><td>" + (this.orbit.trueAnomaly()) + "</td></tr>";
      html += "<tr><td>Eccentric Anomaly:</td><td>" + (this.orbit.eccentricAnomaly()) + "</td></tr>";
      html += "<tr><td>Mean Anomaly:</td><td>" + (this.orbit.meanAnomaly()) + "</td></tr>";
      html += "</table>";
      return $("#orbit_data").html(html);
    };

    Simulator.prototype.update = function(delta) {
      this.orbit.step(delta * 0.001 * options.timeAcceleration);
      this.orbiter.position = new THREE.Vector3(this.orbit.position().x, this.orbit.position().z, this.orbit.position().y).divideScalar(63.79);
      this.last_data_update -= 1;
      if (this.last_data_update <= 0) {
        this.last_data_update = options.update_data_interval;
        return this.update_data();
      }
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
