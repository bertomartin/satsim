class @Simulator
  # Instance variables
  loopInterval = 20 # Aim for 50 frames per second
  lastRun = null
  options =
    simulationSpeed: 15
    thrust: false

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

    @orbiter.position.z = 100
    @orbiter.velocity = new THREE.Vector3(1.1, 0.2, 0)

  gravity: (a, b) ->
    p = @planet.position.clone()
    o = @orbiter.position.clone()

    new THREE.Vector3().subVectors(@planet.position, @orbiter.position).normalize().multiplyScalar(100).divideScalar(@orbiter.position.distanceToSquared(@planet.position))

  update: (delta) ->
    @orbiter.velocity.add @gravity()
    @orbiter.velocity.multiplyScalar(1.001) if options.thrust
    
    @orbiter.position.add @orbiter.velocity
   
  run: =>
    delta = time() - lastRun
    lastRun = time()

    @update(delta)
    @renderer.render(@orbiter)
  
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
 
