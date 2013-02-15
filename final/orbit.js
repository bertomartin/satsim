(function() {

  this.Orbit = (function() {
    var atan;

    atan = function(x) {
      var v;
      v = Math.atan(x);
      return v;
    };

    function Orbit(gm) {
      if (gm == null) gm = 398524.239;
      this.gm = gm;
      this.v = new THREE.Vector3();
      this.r = new THREE.Vector3();
    }

    Orbit.prototype.fromOrbitalElements = function(a, e, i, o, omega) {
      this.a = a;
      this.e = new THREE.Vector3(e, 0, 0);
      this.i = i;
      this.o = o;
      this.omega = omega;
      return this.calculateOrbit();
    };

    Orbit.prototype.calculateOrbit = function() {
      this.ea = 0;
      this.n = 0;
      this.m = 0;
      this.p = 2 * Math.PI * Math.sqrt(Math.pow(this.a, 3) / this.gm);
      this.n = Math.sqrt(this.gm / Math.pow(this.a, 3));
      return this;
    };

    Orbit.prototype.fromStateVectors = function(r, v) {
      if (r == null) r = new THREE.Vector3();
      if (v == null) v = new THREE.Vector3();
      this.r = r.clone();
      this.v = v.clone();
      this.d = r.length();
      console.log("Position: " + this.r.x + ", " + this.r.y + ", " + this.r.z + " (" + this.d + ") - Velocity: " + this.v.x + ", " + this.v.y + ", " + this.v.z + " (" + (this.v.length()) + ")");
      this.h = this.r.clone().cross(this.v);
      this.e = this.v.clone().cross(this.h).divideScalar(this.gm).sub(this.r.clone().normalize());
      this.i = Math.PI - Math.acos(this.h.z / this.h.length());
      this.a = 1 / (2 / this.r.length() - Math.pow(this.v.length(), 2) / this.gm);
      this.nu = Math.acos(this.e.clone().dot(this.r) / (this.e.length() * this.r.length()));
      if (this.r.clone().dot(this.v) < 0) this.nu = 2 * Math.PI - this.nu;
      this.ea = atan(Math.tan(this.nu / 2) / Math.sqrt((1 + this.e.length()) / (1 - this.e.length())));
      this.m = this.ea - this.e.length() * Math.sin(this.ea);
      this.p = 2 * Math.PI * Math.sqrt(Math.pow(this.a, 3) / this.gm);
      this.n = Math.sqrt(this.gm / Math.pow(this.a, 3));
      this.node = new THREE.Vector3(-this.h.y, this.h.x, 0);
      console.log("h: " + this.h.x + ", " + this.h.y + ", " + this.h.z);
      if (this.node.length() !== 0) {
        this.omega = Math.acos(this.node.x / this.node.length());
        if (this.node.y < 0) this.omega = 2 * Math.PI - this.omega;
        this.o = Math.acos(this.node.clone().dot(this.e) / (this.node.length() * this.e.length()));
        if (this.e.z < 0) return this.o = 2 * Math.PI - this.o;
      } else {
        this.omega = 0;
        return this.o = 0;
      }
    };

    Orbit.prototype.step = function(dt, iterations) {
      var i, x1, x2, y1, y2, z1, z2;
      if (iterations == null) iterations = 100;
      this.m += dt * Math.sqrt(this.gm / Math.pow(this.a, 3));
      if (this.m > 2 * Math.PI) this.m -= 2 * Math.PI;
      this.ea = this.m;
      for (i = 1; 1 <= iterations ? i <= iterations : i >= iterations; 1 <= iterations ? i++ : i--) {
        this.ea -= (this.ea - this.e.length() * Math.sin(this.ea) - this.m) / (1 - this.e.length() * Math.cos(this.ea));
      }
      this.nu = 2 * Math.atan2(Math.sqrt(1 + this.e.length()) * Math.sin(this.ea / 2), Math.sqrt(1 - this.e.length()) * Math.cos(this.ea / 2));
      this.d = this.a * (1 - this.e.length() * Math.cos(this.ea));
      this.r = new THREE.Vector3(Math.cos(this.nu) * this.d, Math.sin(this.nu) * this.d, 0);
      this.v = new THREE.Vector3(-Math.sin(this.ea), Math.sqrt(1 - Math.pow(this.e.length(), 2)) * Math.cos(this.ea), 0).multiplyScalar(Math.sqrt(this.a * this.gm) / this.d);
      x1 = Math.cos(this.omega) * Math.cos(this.o) - Math.sin(this.omega) * Math.cos(this.i) * Math.sin(this.o);
      x2 = Math.sin(this.omega) * Math.cos(this.o) + Math.cos(this.omega) * Math.cos(this.i) * Math.sin(this.o);
      y1 = -Math.cos(this.omega) * Math.sin(this.o) - Math.sin(this.omega) * Math.cos(this.i) * Math.cos(this.o);
      y2 = -Math.sin(this.omega) * Math.sin(this.o) + Math.cos(this.omega) * Math.cos(this.i) * Math.cos(this.o);
      z1 = Math.sin(this.i) * Math.sin(this.omega);
      z2 = -Math.sin(this.i) * Math.cos(this.omega);
      return this.r = new THREE.Vector3(x1 * this.r.x + x2 * this.r.y, y1 * this.r.x + y2 * this.r.y, z1 * this.r.x + z2 * this.r.y);
    };

    Orbit.prototype.position = function() {
      return this.r;
    };

    Orbit.prototype.velocity = function() {
      return this.v;
    };

    Orbit.prototype.distance = function() {
      return this.d;
    };

    Orbit.prototype.semiMajorAxis = function() {
      return this.a;
    };

    Orbit.prototype.inclination = function() {
      return this.i * (180 / Math.PI);
    };

    Orbit.prototype.momentum = function() {
      return this.h.length();
    };

    Orbit.prototype.eccentricity = function() {
      return this.e.length();
    };

    Orbit.prototype.period = function() {
      return this.p;
    };

    Orbit.prototype.meanVelocity = function() {
      return this.a;
    };

    Orbit.prototype.argumentOfPeriapsis = function() {
      return this.o * 180 / Math.PI;
    };

    Orbit.prototype.ascendingNodeLongitude = function() {
      return this.omega * 180 / Math.PI;
    };

    Orbit.prototype.trueAnomaly = function() {
      return this.nu * 180 / Math.PI;
    };

    Orbit.prototype.eccentricAnomaly = function() {
      return this.ea * 180 / Math.PI;
    };

    Orbit.prototype.meanAnomaly = function() {
      return this.m * 180 / Math.PI;
    };

    Orbit.prototype.futureMeanAnomaly = function(dt) {
      var m;
      m = this.m + dt * Math.sqrt(this.gm / Math.pow(this.a, 3));
      if (m > 2 * Math.PI) m -= 2 * Math.PI;
      return m * 180 / Math.PI;
    };

    Orbit.prototype.periapsis = function() {
      return this.a * (1 - this.e.length());
    };

    Orbit.prototype.apoapsis = function() {
      return this.a * (1 + this.e.length());
    };

    Orbit.prototype.timeToApoapsis = function() {
      return this.timeTo(Math.PI);
    };

    Orbit.prototype.timeToPeriapsis = function() {
      return this.timeTo(0);
    };

    Orbit.prototype.timeTo = function(m) {
      var d;
      if (m < this.m) {
        d = (2 * Math.PI - this.m) + m;
      } else {
        d = m - this.m;
      }
      return d * Math.sqrt(Math.pow(this.a, 3) / this.gm);
    };

    Orbit.prototype.maxSpeed = function() {
      return Math.sqrt((1 + this.e.length()) * this.gm / ((1 - this.e.length()) * this.a));
    };

    Orbit.prototype.minSpeed = function() {
      return Math.sqrt((1 - this.e.length()) * this.gm / ((1 + this.e.length()) * this.a));
    };

    return Orbit;

  })();

}).call(this);
