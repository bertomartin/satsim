class @Simulator
  # Instance variables
  loopInterval = 20 # Aim for 50 frames per second
  lastRun = null
  options =
    simulationSpeed: 15
    thrust: false
    speed: 0.1
    gm: 398524.239 # * km^3 * s^-2
    update_data_interval: 3
    timeAcceleration: 100
    useKepler: true
    earth_radius: 6371
    initialSpeed: 7.7

  format_time = (sec) ->
    str = ""
    if sec > 60 * 60
      str += "#{Math.floor(sec/(60*60))}h"
      sec = sec%(60*60)
    if sec > 60
      str += "#{Math.floor(sec/60)}m"
      sec = sec%60
    if sec > 0
      str += "#{sec.toFixed(0)}s"
    str

  # Private methods
  randomUpTo = (limit) -> Math.floor(Math.random() * limit) + 1
  time = -> new Date().getTime()
  direction: (from, to) ->
    goal = new Vector2(to.x(), to.y())
    goal.substract(from)

  initialize: ->
    lastRun = time()
    @planet = @renderer.getPlanet()
    @orbiters = []
    @last_data_update = options.update_data_interval

    @addOrbiter new window.Orbit(options.gm).fromOrbitalElements(6780, 0.001, 51 * Math.PI/180, 0 * Math.PI/180, 110 * Math.PI/180)

    @addOrbiter new window.Orbit(options.gm).fromOrbitalElements(20000, 0.65, 20 * Math.PI/180, 0 * Math.PI/180, 60 * Math.PI/180)

    @addOrbiter new window.Orbit(options.gm).fromOrbitalElements(8000, 0.1, -20 * Math.PI/180, 0 * Math.PI/180, 40 * Math.PI/180)

    @addOrbiter new window.Orbit(options.gm).fromOrbitalElements(8000, 0.1, -180 * Math.PI/180, 0 * Math.PI/180, 170 * Math.PI/180)

    @addOrbiter new window.Orbit(options.gm).fromOrbitalElements(6500, 0, -90 * Math.PI/180, 0 * Math.PI/180, 30 * Math.PI/180)

  addOrbiter: (orbit) ->
    orbiter = @renderer.createOrbiter()
    orbiter.orbit = orbit
    orbiter.id = @orbiters.length + 1
    @orbiters.push orbiter
    @renderer.addOrbit(orbit)

    
  update_data: (orbit) ->
    html = "<h2>State data:</h2><table>"
    html += "<tr><td>Orbital Velocity:</td><td>#{(orbit.velocity().length() * 1000).toFixed(1)} m/s</td></tr>"
    html += "<tr><td>Orbital Velocity (x):</td><td>#{(orbit.velocity().x * 1000).toFixed(1)} m/s</td></tr>"
    html += "<tr><td>Orbital Velocity (y):</td><td>#{(orbit.velocity().y * 1000).toFixed(1)} m/s</td></tr>"
    html += "<tr><td>Orbital Velocity (z):</td><td>#{(orbit.velocity().z * 1000).toFixed(1)} m/s</td></tr>"
    html += "<tr><td>G * M:</td><td>#{orbit.gm} km^3 s^-2</td></tr>"
    html += "<tr><td>Altitude:</td><td>#{(orbit.distance() - 6371).toFixed(1)} km</td></tr>"
    html += "</table>"
    $("#flight_data").html(html)

    html = "<h2>Orbital elements:</h2><table>"
    html += "<tr><td>Semi Major Axis:</td><td>#{orbit.semiMajorAxis().toFixed(1)} km</td></tr>"
    html += "<tr><td>Eccentricity:</td><td>#{orbit.eccentricity().toFixed(4)}</td></tr>"
    html += "<tr><td>Period:</td><td>#{format_time orbit.period()}</td></tr>"
    html += "<tr><td>Apoapsis:</td><td>#{(orbit.apoapsis() - options.earth_radius).toFixed(1)} km</td></tr>"
    html += "<tr><td>Periapsis:</td><td>#{(orbit.periapsis() - options.earth_radius).toFixed(1)} km</td></tr>"
    html += "<tr><td>Inclination:</td><td>#{orbit.inclination().toFixed(1)} deg</td></tr>"
    html += "<tr><td>Time to apoapsis:</td><td>#{format_time orbit.timeToApoapsis()}</td></tr>"
    html += "<tr><td>Time to periapsis:</td><td>#{format_time orbit.timeToPeriapsis()}</td></tr>"
    html += "<tr><td>Mean Velocity:</td><td>#{orbit.meanVelocity().toFixed(1)} m/s</td></tr>"
    html += "<tr><td>Longitude of the Ascending Node:</td><td>#{orbit.ascendingNodeLongitude().toFixed(1)} deg</td></tr>"
    html += "<tr><td>Argument of periapsis:</td><td>#{orbit.argumentOfPeriapsis().toFixed(1)} deg</td></tr>"
    html += "<tr><td>True Anomaly:</td><td>#{orbit.trueAnomaly().toFixed(1)}</td></tr>"
    html += "<tr><td>Eccentric Anomaly:</td><td>#{orbit.eccentricAnomaly().toFixed(1)}</td></tr>"
    html += "<tr><td>Mean Anomaly:</td><td>#{orbit.meanAnomaly().toFixed(1)}</td></tr>"
    html += "</table>"
    $("#orbit_data").html(html)

    html = ""
    for orbiter in @orbiters
      html += "<tr><td>#{orbiter.id}</td><td>#{orbiter.orbit.semiMajorAxis().toFixed(1)}</td><td>#{orbiter.orbit.eccentricity().toFixed(4)}</td><td>#{orbiter.orbit.inclination().toFixed(1)}</td></tr>"
    $("#orbiters tbody").html(html)

       


  update: (delta) ->
    for orbiter in @orbiters
      orbiter.orbit.step(delta * 0.001 * options.timeAcceleration)
      orbiter.position = new THREE.Vector3(orbiter.orbit.position().x, orbiter.orbit.position().z, orbiter.orbit.position().y).divideScalar(63.71)
      orbiter.velocity = new THREE.Vector3(orbiter.orbit.v.x, orbiter.orbit.v.z, orbiter.orbit.v.y)
      @last_data_update -= 1
      if @last_data_update <= 0
        @last_data_update = options.update_data_interval
        @update_data(@orbiters[0].orbit) if @orbiters.length > 0
   
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
 
