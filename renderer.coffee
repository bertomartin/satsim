class @Renderer3D
  default_options =
    width: window.innerWidth
    height: window.innerHeight
    view_angle: 45
    near: 0.1
    far: 10000
    mouse_x: 0
    mouse_y: 0
    clicked: false
    selected_color: 0xFFB00F
    default_color: 0xCC0000

  # Public API
  

  constructor: (el) ->
    @el = el
    @options = default_options
    @testOrbitVisible = false
    $container = $(@el)

    @renderer = new THREE.WebGLRenderer()
    @scene = new THREE.Scene()

    @onboard_camera = false
    @camera = new THREE.PerspectiveCamera(
      @options['view_angle'],
      @options['width']/@options['height'],
      @options['near'],
      @options['far']
    )
    @camera.position.z = 300
    @scene.add @camera

    @renderer.setSize(@options['width'], @options['height'])

    $container.append(@renderer.domElement)

    sphereMaterial = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'land_ocean_ice_cloud_2048.jpg' ), overdraw: true } )
    @planet = new THREE.Mesh(
      new THREE.SphereGeometry(100, 64, 64),
      sphereMaterial
    )
    @planet.radius = 6371 # km
    @scene.add @planet

    light = new THREE.PointLight(0xFFFFFF)
    light.position.x = 10
    light.position.y = 50
    light.position.z = 130

    @scene.add light
    console.log "Renderer initialized!"

  createOrbiter: () ->
    orbiter = new THREE.Mesh(
      new THREE.SphereGeometry(2, 16, 16),
      new THREE.MeshLambertMaterial({ color: @options.default_color })
    )
    @scene.add orbiter
    orbiter

  render: () ->
    if @onboard_camera
      @camera.position = @orbiter.position
      @camera.lookAt(@scene.position.clone().add(@orbiter.velocity.clone().multiplyScalar(20)))
    else 
      @camera.position.x += ( @options.mouse_x - @camera.position.x) * 0.05 if @options.clicked
      @camera.position.z += ( @options.mouse_x - @camera.position.x) * 0.07 if @options.clicked
      @camera.position.y += ( @options.mouse_y - @camera.position.y) * 0.05 if @options.clicked
      @camera.lookAt(@scene.position)

    @renderer.render(@scene, @camera)

  addOrbit: (x, samples = 10000) ->
    orbit = jQuery.extend(true, {}, x) #Clone
    interval = orbit.period()/samples

    geometry = new THREE.Geometry()
    material = new THREE.LineBasicMaterial({ color: 0xE01B32, opacity: 1.0, linewidth: 2})
    for i in [1..samples+1]
      orbit.step(interval)
      pos = new THREE.Vector3(orbit.position().x/63.71, orbit.position().z/63.71, orbit.position().y/63.71)
      geometry.vertices.push(pos)
    line = new THREE.Line(geometry, material)
    @scene.add(line)

  setTestOrbit: (x, samples = 1000) ->
    orbit = jQuery.extend(true, {}, x) #Clone
    interval = orbit.period()/samples

    geometry = new THREE.Geometry()
    material = new THREE.LineBasicMaterial({ color: 0xFCE235, opacity: 1.0, linewidth: 3})
    for i in [1..samples+1]
      orbit.step(interval)
      pos = new THREE.Vector3(orbit.position().x/63.71, orbit.position().z/63.71, orbit.position().y/63.71)
      geometry.vertices.push(pos)
    @scene.remove(@testOrbit) if @testOrbit and @testOrbitVisible
    @testOrbit = new THREE.Line(geometry, material)
    @scene.add(@testOrbit) if @testOrbitVisible

  showTestOrbit: ->
    return if @testOrbitVisible
    @testOrbitVisible = true
    @scene.add(@testOrbit)

  hideTestOrbit: ->
    return unless @testOrbitVisible
    @testOrbitVisislbe = false
    @scene.remove(@testOrbit)

  select: (orbiter) -> orbiter.material.color.setHex(@options.selected_color)
  unselect: (orbiter) -> orbiter.material.color.setHex(@options.default_color)
  handleResize: ->
    @options.width = window.innerWidth
    @options.height = window.innerHeight

    @camera.aspect = @options.width / @options.height
    @camera.updateProjectionMatrix()

    @renderer.setSize(@options.width, @options.height)

  mouseMove: (e) ->
    @options.mouse_x = e.pageX - @options.width/2
    @options.mouse_y = e.pageY - @options.height/2

  get: (option) -> @options[option]
  set: (option, value) -> @options[option] = value

  getOrbiter: -> @orbiter
  getPlanet: -> @planet


