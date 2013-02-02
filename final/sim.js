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
      useKepler: true
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
      this.orbit = {};
      this.orbiter.real_position = new THREE.Vector3();
      this.orbiter.real_position.z = 6379 + 401;
      this.orbiter.velocity = new THREE.Vector3(7.679, 0, 0);
      this.planet.mass = 5.97219 * 10000;
      return this.find_orbit();
    };

    Simulator.prototype.gravity = function(a, b) {
      var dist;
      dist = Math.pow(this.orbiter.real_position.distanceTo(this.planet.position), 2);
      return new THREE.Vector3().subVectors(this.planet.position, this.orbiter.real_position).normalize().multiplyScalar(options.gm / dist);
    };

    Simulator.prototype.update_data = function() {
      var html, key, value, _ref;
      html = "<h2>State data:</h2><table>";
      html += "<tr><td>Orbital Velocity:</td><td>" + (this.orbiter.velocity.length().toFixed(3) * 1000) + " m/s</td></tr>";
      html += "<tr><td>Orbital Velocity (x):</td><td>" + (this.orbiter.velocity.x.toFixed(3) * 1000) + " m/s</td></tr>";
      html += "<tr><td>Orbital Velocity (y):</td><td>" + (this.orbiter.velocity.y.toFixed(3) * 1000) + " m/s</td></tr>";
      html += "<tr><td>Orbital Velocity (z):</td><td>" + (this.orbiter.velocity.z.toFixed(3) * 1000) + " m/s</td></tr>";
      html += "<tr><td>Planet mass:</td><td>" + (this.planet.mass.toFixed()) + " * 10^20 kg</td></tr>";
      html += "<tr><td>Altitude:</td><td>" + (((new THREE.Vector3().subVectors(this.planet.position, this.orbiter.real_position).length()) - this.planet.radius).toFixed(2)) + " km</td></tr>";
      html += "<tr><td>Acceleration:</td><td>" + ((this.gravity().length() * 1000).toFixed(2)) + " m/s^2</td></tr>";
      html += "</table>";
      $("#flight_data").html(html);
      html = "<h2>Orbital elements:</h2><table>";
      _ref = this.orbit;
      for (key in _ref) {
        value = _ref[key];
        html += "<tr><td>" + key + ":</td><td>" + value + "</td></tr>";
      }
      return $("#orbit_data").html(html);
    };

    Simulator.prototype.atan = function(x) {
      var v;
      v = Math.atan(x);
      if (v < 0) v += 2 * Math.PI;
      return v;
    };

    Simulator.prototype.find_orbit = function() {
      var e, h, i, n, nu, r, v;
      r = new THREE.Vector3().subVectors(this.planet.position, this.orbiter.real_position);
      v = this.orbiter.velocity.clone();
      h = r.clone().cross(v.clone());
      e = v.clone().cross(h.clone()).divideScalar(options.gm).sub(r.clone().normalize());
      i = Math.PI - Math.acos(h.y / h.length());
      this.orbit.semiMajorAxis = 1 / (2 / r.length() - Math.pow(v.length(), 2) / options.gm);
      this.orbit.inclination = i * (180 / Math.PI);
      this.orbit.momentum = h.length();
      this.orbit.eccentricity = e.length();
      this.orbit.period = Math.PI * 2 * Math.sqrt(Math.pow(this.orbit.semiMajorAxis, 3) / options.gm);
      n = Math.sqrt(options.gm / Math.pow(this.orbit.semiMajorAxis, 3));
      nu = Math.acos(e.clone().dot(r) / (e.length() * r.length()));
      if (r.clone().dot(v) < 0) nu = Math.PI * 2 - nu;
      this.orbit.trueAnomaly = nu;
      this.orbit.eccentricAnomaly = this.atan(Math.tan(nu / 2) / Math.sqrt((1 + e.length()) / (1 - e.length())));
      return this.orbit.meanAnomaly = this.orbit.eccentricAnomaly - this.orbit.eccentricity * Math.sin(this.orbit.eccentricAnomaly);
    };

    Simulator.prototype.update = function(delta) {
      var dt, e, m, nu, r;
      if (options.useKepler) {
        dt = delta * 0.001 * options.timeAcceleration;
        this.orbit.meanAnomaly += dt * Math.sqrt(options.gm / (Math.pow(this.orbit.semiMajorAxis, 3)));
        if (this.orbit.meanAnomaly > Math.PI * 2) {
          this.orbit.meanAnomaly -= Math.PI * 2;
        }
        m = this.orbit.meanAnomaly;
        e = this.orbit.eccentricity;
        this.orbit.trueAnomaly = m + 2 * e * Math.sin(m) + 1.25 * Math.pow(e, 2) * Math.sin(2 * m);
        nu = this.orbit.trueAnomaly;
        this.orbit.eccentricAnomaly = Math.acos((e + Math.cos(nu)) / (1 + e * Math.cos(nu)));
        r = this.orbit.semiMajorAxis * (1 - e * Math.cos(this.orbit.eccentricAnomaly));
        this.orbiter.real_position = new THREE.Vector3(Math.cos(nu) * r, 0, Math.sin(nu) * r);
        this.orbiter.velocity = new THREE.Vector3(-Math.sin(this.orbit.eccentricAnomaly), Math.sqrt(1 - Math.pow(e, 2)) * Math.cos(this.orbit.eccentricAnomaly)).multiplyScalar(Math.sqrt(this.orbit.semiMajorAxis * options.gm) / r);
      } else {
        this.orbiter.velocity.add(this.gravity().clone().multiplyScalar(0.001 * delta * options.timeAcceleration));
        if (options.thrust) this.orbiter.velocity.multiplyScalar(1.001);
        this.orbiter.real_position.add(this.orbiter.velocity.clone().multiplyScalar(0.001 * delta * options.timeAcceleration));
        this.find_orbit();
      }
      this.orbiter.position = this.orbiter.real_position.clone().divideScalar(63.79);
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
