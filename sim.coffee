class @Simulator
  # Instance variables
  loopInterval = 20 # Aim for 50 frames per second
  lastRun = null
  default_options =
    simulationSpeed: 15
    thrust: false
    speed: 0.1
    gm: 398524.239 # * km^3 * s^-2
    update_data_interval: 3
    timeAcceleration: 100
    useKepler: true
    earth_radius: 6371
    initialSpeed: 7.7

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
    @last_ui_update = @options.update_ui_interval

    @addOrbiter new window.Orbit(@options.gm).fromOrbitalElements(6780, 0.001, 51 * Math.PI/180, 0 * Math.PI/180, 110 * Math.PI/180)
    @addOrbiter new window.Orbit(@options.gm).fromOrbitalElements(20000, 0.65, 20 * Math.PI/180, 0 * Math.PI/180, 60 * Math.PI/180)
    @addOrbiter new window.Orbit(@options.gm).fromOrbitalElements(8000, 0.1, -20 * Math.PI/180, 0 * Math.PI/180, 40 * Math.PI/180)
    @addOrbiter new window.Orbit(@options.gm).fromOrbitalElements(8000, 0.1, -180 * Math.PI/180, 0 * Math.PI/180, 170 * Math.PI/180)
    @addOrbiter new window.Orbit(@options.gm).fromOrbitalElements(6500, 0, -90 * Math.PI/180, 0 * Math.PI/180, 30 * Math.PI/180)
    @selectOrbiter(0)

    @updateUI(true)

  addOrbiter: (orbit) ->
    orbiter = @renderer.createOrbiter()
    orbiter.orbit = orbit
    orbiter.id = @orbiters.length
    @orbiters.push orbiter
    @renderer.addOrbit(orbit)

  selectOrbiter: (id, callback) ->
    return if id < 0 or id >= @orbiters.length
    @renderer.unselect(@orbiters[@selected]) unless isNaN(@selected)
    @renderer.select(@orbiters[id])
    @selected = id 
    @updateUI(true)
    callback() if typeof(callback) == "function"
    
  
  updateUI: (update_table)->
    @options.ui_updater(@orbiters, @selected, update_table) if typeof(@options.ui_updater) == "function"

  update: (delta) ->
    for orbiter in @orbiters
      orbiter.orbit.step(delta * 0.001 * @options.timeAcceleration)
      orbiter.position = new THREE.Vector3(orbiter.orbit.position().x, orbiter.orbit.position().z, orbiter.orbit.position().y).divideScalar(63.71)
      orbiter.velocity = new THREE.Vector3(orbiter.orbit.v.x, orbiter.orbit.v.z, orbiter.orbit.v.y)
      @last_data_update -= 1
      if @last_data_update <= 0
        @updateUI(false)
   
  run: =>
    delta = time() - lastRun
    lastRun = time()

    @update(delta)
    @renderer.render(delta)
  
  # Public API
  constructor: (renderer) ->
    @renderer = renderer
    @status = "stopped"
    @options = default_options

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

  get: (option) -> @options[option]
  set: (option, value) -> @options[option] = value
 
