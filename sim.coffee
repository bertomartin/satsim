class @Simulator
  # Instance variables
  loopInterval = 20 # Aim for 50 frames per second
  lastRun = null
  options =
    simulationSpeed: 15
    thrust: false
    speed: 0.1
    gm: 398524.239 # * km^3 * s^-2
    update_data_interval: 10
    timeAcceleration: 100
    useKepler: true

  # Private methods
  randomUpTo = (limit) -> Math.floor(Math.random() * limit) + 1
  time = -> new Date().getTime()
  direction: (from, to) ->
    goal = new Vector2(to.x(), to.y())
    goal.substract(from)

  initialize: ->
    lastRun = time()
    @planet = @renderer.getPlanet()
    @orbiter = @renderer.getOrbiter()
    @last_data_update = options.update_data_interval

    @orbit = {}
    @orbiter.real_position = new THREE.Vector3()
    @orbiter.real_position.z = (6379 + 401)
    @orbiter.velocity = new THREE.Vector3(7.679, 0, 0)#new THREE.Vector3(1.1, 0.2, 0)
    @planet.mass = 5.97219 * 10000 # In 10^20 kg
    @find_orbit()

  gravity: (a, b) ->
    dist = Math.pow((@orbiter.real_position.distanceTo(@planet.position)), 2) # * km^2

    new THREE.Vector3().subVectors(@planet.position, @orbiter.real_position).normalize().multiplyScalar(options.gm/dist)

  update_data: ->
    html = "<h2>State data:</h2><table>"
    html += "<tr><td>Orbital Velocity:</td><td>#{@orbiter.velocity.length().toFixed(3) * 1000} m/s</td></tr>"
    html += "<tr><td>Orbital Velocity (x):</td><td>#{@orbiter.velocity.x.toFixed(3) * 1000} m/s</td></tr>"
    html += "<tr><td>Orbital Velocity (y):</td><td>#{@orbiter.velocity.y.toFixed(3) * 1000} m/s</td></tr>"
    html += "<tr><td>Orbital Velocity (z):</td><td>#{@orbiter.velocity.z.toFixed(3) * 1000} m/s</td></tr>"
    html += "<tr><td>Planet mass:</td><td>#{@planet.mass.toFixed()} * 10^20 kg</td></tr>"
    html += "<tr><td>Altitude:</td><td>#{((new THREE.Vector3().subVectors(@planet.position, @orbiter.real_position).length()) - @planet.radius).toFixed(2)} km</td></tr>"
    html += "<tr><td>Acceleration:</td><td>#{(@gravity().length() * 1000).toFixed(2)} m/s^2</td></tr>"
    html += "</table>"
    $("#flight_data").html(html)

    html = "<h2>Orbital elements:</h2><table>"
    for key, value of @orbit
      html += "<tr><td>#{key}:</td><td>#{value}</td></tr>"
    $("#orbit_data").html(html)

  atan: (x) ->
    v = Math.atan(x)
    v += 2 * Math.PI if v<0
    v

  find_orbit: ->
    r = new THREE.Vector3().subVectors(@planet.position, @orbiter.real_position)
    v = @orbiter.velocity.clone()
    h = r.clone().cross(v.clone()) # Orbital momentum
    e = v.clone().cross(h.clone()).divideScalar(options.gm).sub(r.clone().normalize())
    i = (Math.PI - Math.acos(h.y/h.length()))

    @orbit.semiMajorAxis = 1/(2/r.length() - Math.pow(v.length(), 2)/options.gm)
    @orbit.inclination = i * (180/Math.PI)
    @orbit.momentum = h.length()
    @orbit.eccentricity = e.length()
    @orbit.period = Math.PI * 2 * Math.sqrt(Math.pow(@orbit.semiMajorAxis, 3)/options.gm)

    n = Math.sqrt(options.gm/Math.pow(@orbit.semiMajorAxis, 3))
    nu = Math.acos(e.clone().dot(r)/(e.length() * r.length()))
    if r.clone().dot(v) < 0
      nu = Math.PI * 2 - nu
    @orbit.trueAnomaly = nu
    @orbit.eccentricAnomaly = @atan(Math.tan(nu/2)/Math.sqrt((1+e.length())/(1-e.length())))
    @orbit.meanAnomaly = @orbit.eccentricAnomaly - @orbit.eccentricity * Math.sin(@orbit.eccentricAnomaly)

  update: (delta) ->
    if options.useKepler
      dt = delta * 0.001 * options.timeAcceleration
      @orbit.meanAnomaly += dt * Math.sqrt(options.gm/(Math.pow(@orbit.semiMajorAxis,3)))
      @orbit.meanAnomaly -= Math.PI * 2 if @orbit.meanAnomaly > Math.PI * 2
      m = @orbit.meanAnomaly
      e = @orbit.eccentricity
      @orbit.trueAnomaly = m + 2 * e * Math.sin(m) + 1.25 * Math.pow(e, 2) * Math.sin(2*m)
      nu = @orbit.trueAnomaly
      @orbit.eccentricAnomaly = Math.acos((e + Math.cos(nu))/(1+e*Math.cos(nu)))

      r = @orbit.semiMajorAxis * (1 - e * Math.cos(@orbit.eccentricAnomaly))
      @orbiter.real_position = new THREE.Vector3(Math.cos(nu) * r, 0, Math.sin(nu) * r)

      @orbiter.velocity = new THREE.Vector3(-Math.sin(@orbit.eccentricAnomaly), Math.sqrt(1-Math.pow(e, 2))*Math.cos(@orbit.eccentricAnomaly)).multiplyScalar(Math.sqrt(@orbit.semiMajorAxis * options.gm)/r)
    else
      @orbiter.velocity.add @gravity().clone().multiplyScalar(0.001 * delta * options.timeAcceleration)
      @orbiter.velocity.multiplyScalar(1.001) if options.thrust

      @orbiter.real_position.add @orbiter.velocity.clone().multiplyScalar(0.001 * delta * options.timeAcceleration)
      @find_orbit()

    @orbiter.position = @orbiter.real_position.clone().divideScalar(63.79)

    #@planet.rotation.y -= delta * 0.001 * options.timeAcceleration * 0.001

    @last_data_update -= 1
    if @last_data_update <= 0
      @last_data_update = options.update_data_interval
      @update_data()
   
  run: =>
    delta = time() - lastRun
    lastRun = time()

    @update(delta)
    @renderer.render(delta)
  
  # Public API
  constructor: (renderer) ->
    @renderer = renderer
    @status = "stopped"

  start: ->
    lastRun = time() if @status == "paused"
    @initialize() if @status == "stopped"

    @intervalHandle = setInterval(@run, loopInterval)
    @status = "running"

  pause: ->
    window.clearInterval(@intervalHandle)
    @status = "paused"

  stop: ->
    window.clearInterval(@intervalHandle)
    @status = "stopped"

  get: (option) -> options[option]
  set: (option, value) -> options[option] = value
 
