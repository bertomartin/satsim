class @Renderer3D
  # Public API
  constructor: (el) ->
    @el = el
    @options =
      width: window.innerWidth
      height: window.innerHeight
      view_angle: 45
      near: 0.1
      far: 10000
      mouse_x: 0
      mouse_y: 0
      clicked: false

    $container = $(@el)

    @renderer = new THREE.WebGLRenderer()
    @scene = new THREE.Scene()

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
    @planet.radius = 6378 # km
    @scene.add @planet

    @orbiter = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      new THREE.MeshLambertMaterial({ color: 0xCC0000 })
    )
    @scene.add @orbiter

    light = new THREE.PointLight(0xFFFFFF)
    light.position.x = 10
    light.position.y = 50
    light.position.z = 130

    @scene.add light
    console.log "Renderer initialized!"
    
  render: () ->
    @camera.position.x += ( @options.mouse_x - @camera.position.x) * 0.05 if @options.clicked
    @camera.position.y += ( @options.mouse_y - @camera.position.y) * 0.05 if @options.clicked
    @camera.lookAt(@scene.position)

    @renderer.render(@scene, @camera)

  addOrbit: (x, samples = 100) ->
    orbit = jQuery.extend(true, {}, x) #Clone
    interval = orbit.period()/samples

    geometry = new THREE.Geometry()
    material = new THREE.LineBasicMaterial({ color: 0xE01B32, opacity: 1.0})
    for i in [1..samples+1]
      orbit.step(interval)
      pos = new THREE.Vector3(orbit.position().x/63.79, 0, orbit.position().y/63.79)
      geometry.vertices.push(pos)
    line = new THREE.Line(geometry, material)
    @scene.add(line)

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

