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

    $container = $(@el)

    @renderer = new THREE.WebGLRenderer()
    @camera = new THREE.PerspectiveCamera(
      @options['view_angle'],
      @options['width']/@options['height'],
      @options['near'],
      @options['far']
    )

    @scene = new THREE.Scene()

    @scene.add @camera
    @camera.position.z = 300
    @renderer.setSize(@options['width'], @options['height'])

    $container.append(@renderer.domElement)

    sphereMaterial = new THREE.MeshLambertMaterial( { color: 0xCC0000 })
    @planet = new THREE.Mesh(
      new THREE.SphereGeometry(50, 16, 16),
      sphereMaterial
    )
    @scene.add @planet

    @orbiter = new THREE.Mesh(
      new THREE.SphereGeometry(2, 16, 16),
      new THREE.MeshNormalMaterial()
    )
    @scene.add @orbiter

    light = new THREE.PointLight(0xFFFFFF)
    light.position.x = 10
    light.position.y = 50
    light.position.z = 130

    @scene.add light
    console.log "Renderer initialized!"
    
  render: ->
    @camera.position.x += ( @options.mouse_x - @camera.position.x) * 0.05
    @camera.position.y += ( @options.mouse_y - @camera.position.y) * 0.05
    @camera.lookAt(@scene.position)

    geo = new THREE.Geometry()
    geo.vertices.push(@planet.position)
    geo.vertices.push(@orbiter.position)

    @scene.add new THREE.Line(geo, new THREE.LineBasicMaterial({color:0x0000ff}))

    @renderer.render(@scene, @camera)

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

