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
    initialSpeed: 7.6

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

    @orbit = new window.Orbit(options.gm)
    @orbit.fromStateVectors(
      new THREE.Vector3(0, (6379 + 401), 0), # position
      new THREE.Vector3(options.initialSpeed, 0, 0) # veloicity
    )
    @renderer.addOrbit(@orbit)

  update_data: ->
    html = "<h2>State data:</h2><table>"
    html += "<tr><td>Orbital Velocity:</td><td>#{@orbit.velocity().length().toFixed(3) * 1000} m/s</td></tr>"
    html += "<tr><td>Orbital Velocity (x):</td><td>#{@orbit.velocity().x.toFixed(3) * 1000} m/s</td></tr>"
    html += "<tr><td>Orbital Velocity (y):</td><td>#{@orbit.velocity().y.toFixed(3) * 1000} m/s</td></tr>"
    html += "<tr><td>Orbital Velocity (z):</td><td>#{@orbit.velocity().z.toFixed(3) * 1000} m/s</td></tr>"
    html += "<tr><td>G * M:</td><td>#{@orbit.gm} km^3 s^-2</td></tr>"
    html += "<tr><td>Altitude:</td><td>#{@orbit.distance() - 6379} km</td></tr>"
    html += "</table>"
    $("#flight_data").html(html)

    html = "<h2>Orbital elements:</h2><table>"
    html += "<tr><td>Semi Major Axis:</td><td>#{@orbit.semiMajorAxis()}</td></tr>"
    html += "<tr><td>Inclination:</td><td>#{@orbit.inclination()}</td></tr>"
    html += "<tr><td>Momentum:</td><td>#{@orbit.momentum()}</td></tr>"
    html += "<tr><td>Eccentricity:</td><td>#{@orbit.eccentricity()}</td></tr>"
    html += "<tr><td>Period:</td><td>#{@orbit.period()}</td></tr>"
    html += "<tr><td>Mean Velocity:</td><td>#{@orbit.meanVelocity()}</td></tr>"
    html += "<tr><td>True Anomaly:</td><td>#{@orbit.trueAnomaly()}</td></tr>"
    html += "<tr><td>Eccentric Anomaly:</td><td>#{@orbit.eccentricAnomaly()}</td></tr>"
    html += "<tr><td>Mean Anomaly:</td><td>#{@orbit.meanAnomaly()}</td></tr>"
    html += "</table>"
    $("#orbit_data").html(html)

  update: (delta) ->
    @orbit.step(delta * 0.001 * options.timeAcceleration)
    @orbiter.position = new THREE.Vector3(@orbit.position().x, @orbit.position().z, @orbit.position().y).divideScalar(63.79)
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
 
