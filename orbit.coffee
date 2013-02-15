class @Orbit
  atan = (x) ->
    v = Math.atan(x)
    v
  #gm: G*M (mu) in km^3/s^2 
  constructor: (gm = 398524.239) ->
    @gm = gm
    @v = new THREE.Vector3()
    @r = new THREE.Vector3()

  fromOrbitalElements: (a, e, i, o, omega) ->
    @a = a
    @e = new THREE.Vector3(e, 0, 0)
    @i = i
    @o = o
    @omega = omega
    @calculateOrbit()

  calculateOrbit: ->
    @ea = 0
    @n = 0
    @m = 0
    @p = 2 * Math.PI * Math.sqrt(Math.pow(@a, 3)/@gm) # Period in seconds
    @n = Math.sqrt(@gm/Math.pow(@a, 3)) # Average velocity
    this
    
  # r: Position THREE.Vector3 in km, v: Velocity THREE.Vector3 in km/s
  fromStateVectors: (r = new THREE.Vector3(), v = new THREE.Vector3()) ->
    @r = r.clone(); @v = v.clone(); @d = r.length()
    console.log "Position: #{@r.x}, #{@r.y}, #{@r.z} (#{@d}) - Velocity: #{@v.x}, #{@v.y}, #{@v.z} (#{@v.length()})"
    @h = @r.clone().cross(@v) #Orbital Momentum
    @e = @v.clone().cross(@h).divideScalar(@gm).sub(@r.clone().normalize()) # Eccentricity
    @i = Math.PI - Math.acos(@h.z/@h.length()) # Inclination
    @a = 1/(2/@r.length() - Math.pow(@v.length(), 2)/@gm) # Semi Major Axis
    @nu = Math.acos(@e.clone().dot(@r)/(@e.length() * @r.length())) # True anomaly approximation
    @nu = 2 * Math.PI  - @nu if @r.clone().dot(@v) < 0
    @ea = atan(Math.tan(@nu/2)/Math.sqrt((1+@e.length())/(1-@e.length()))) # Eccentric anomaly
    @m = @ea - @e.length() * Math.sin(@ea) # Mean anomaly
    @p = 2 * Math.PI * Math.sqrt(Math.pow(@a, 3)/@gm) # Period in seconds
    @n = Math.sqrt(@gm/Math.pow(@a, 3)) # Average velocity

    @node = new THREE.Vector3(-@h.y, @h.x, 0)
    console.log "h: #{@h.x}, #{@h.y}, #{@h.z}"
    unless @node.length() == 0
      @omega = Math.acos(@node.x / @node.length())
      @omega = 2*Math.PI - @omega if @node.y < 0
      @o = Math.acos((@node.clone().dot(@e)/(@node.length() * @e.length())))
      @o = 2*Math.PI - @o if @e.z < 0
    else
      @omega = 0
      @o = 0
    

  step: (dt, iterations = 100) ->
    @m += dt * Math.sqrt(@gm/Math.pow(@a, 3))
    @m -= 2 * Math.PI if @m > 2 * Math.PI

    @ea = @m
    for i in [1..iterations]
      @ea -= (@ea - @e.length() * Math.sin(@ea) - @m)/(1 - @e.length() * Math.cos(@ea))

    @nu = 2 * Math.atan2(Math.sqrt(1+@e.length()) * Math.sin(@ea/2), Math.sqrt(1-@e.length()) * Math.cos(@ea/2))
    @d = @a * (1 - @e.length() * Math.cos(@ea))
    @r = new THREE.Vector3(Math.cos(@nu) * @d, Math.sin(@nu) * @d, 0)
    @v = new THREE.Vector3(-Math.sin(@ea), Math.sqrt(1-Math.pow(@e.length(), 2)) * Math.cos(@ea), 0).multiplyScalar(Math.sqrt(@a * @gm)/@d)

    x1 = Math.cos(@omega) * Math.cos(@o) - Math.sin(@omega) * Math.cos(@i) * Math.sin(@o)
    x2 = Math.sin(@omega) * Math.cos(@o) + Math.cos(@omega) * Math.cos(@i) * Math.sin(@o)
    y1 = - Math.cos(@omega) * Math.sin(@o) - Math.sin(@omega) * Math.cos(@i) * Math.cos(@o)
    y2 = - Math.sin(@omega) * Math.sin(@o) + Math.cos(@omega) * Math.cos(@i) * Math.cos(@o)
    z1 = Math.sin(@i) * Math.sin(@omega)
    z2 = - Math.sin(@i) * Math.cos(@omega)
    @r = new THREE.Vector3(
      x1 * @r.x + x2 * @r.y,
      y1 * @r.x + y2 * @r.y,
      z1 * @r.x + z2 * @r.y
    )
  position: -> @r # Vector3
  velocity: -> @v # Vector3
  distance: -> @d # km
  semiMajorAxis: -> @a # km
  inclination: -> @i * (180/Math.PI) # degrees
  momentum: -> @h.length() # scalar
  eccentricity: -> @e.length() # scalar
  period: -> @p # seconds
  meanVelocity: -> @a # km/s
  argumentOfPeriapsis: -> @o * 180/Math.PI
  ascendingNodeLongitude: -> @omega * 180/Math.PI
  trueAnomaly: -> @nu * 180/Math.PI
  eccentricAnomaly: -> @ea * 180/Math.PI
  meanAnomaly: -> @m * 180/Math.PI
  futureMeanAnomaly: (dt) -> 
    m = @m + dt * Math.sqrt(@gm/Math.pow(@a, 3))
    m -= 2 * Math.PI if m > 2 * Math.PI
    m * 180/Math.PI


  periapsis: -> @a*(1-@e.length())
  apoapsis: -> @a*(1+@e.length())
  timeToApoapsis: -> @timeTo(Math.PI)
  timeToPeriapsis: -> @timeTo(0)
  timeTo: (m) ->
    if m < @m
      d = (2*Math.PI - @m) + m 
    else
      d = m - @m
    d * Math.sqrt(Math.pow(@a, 3)/@gm)

  maxSpeed: -> Math.sqrt((1+@e.length())*@gm/((1-@e.length()) * @a))
  minSpeed: -> Math.sqrt((1-@e.length())*@gm/((1+@e.length()) * @a))
