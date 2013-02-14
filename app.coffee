$(document).ready ->
  window.renderer = new Renderer3D("#sim")
  $(window).resize -> window.renderer.handleResize()
  $("#sim").mousemove (e) -> window.renderer.mouseMove(e)
  $("#sim").mousedown (e) -> window.renderer.set('clicked', true); window.renderer.mouseMove(e)
  $("#sim").mouseup (e) -> window.renderer.set('clicked', false); window.renderer.mouseMove(e)

  window.simulation = new Simulator(window.renderer)
  window.simulation.set('ui_updater', updateUI) 
  window.simulation.start()

  displayOnButtonClick("#options-button", "#options", "#info")
  displayOnButtonClick("header", "#info", "#options")
  $("#satellites-button").click ->
    if $("#satellites").is(':visible')
      $("#satellites").hide()
      $("#satellites-button").css('right', '0')
      window.renderer.hideTestOrbit()
    else
      $("#satellites").show()
      $("#satellites-button").css('right', $("#satellites").outerWidth() + "px")

  $("header").hover( ->
      $("#instruction").slideDown(500)
    , ->
      $("#instruction").slideUp(500)
  )

  $("#play").click -> 
    window.simulation.start()
    setActiveButton("play")
  $("#pause").click ->
    window.simulation.pause()
    setActiveButton("pause")
  $("#stop").click ->
    window.simulation.stop()
    setActiveButton("stop")

  initializeClickEvents()

  window.testOrbit = new window.Orbit(window.simulation.get('gm')).fromOrbitalElements(8000, 0.001, 0 * Math.PI/180, 0 * Math.PI/180, 0 * Math.PI/180)
  window.renderer.setTestOrbit(window.testOrbit)
  initializeSliders()

  $("#add-satellite").click ->
    unless window.testOrbit.periapsis() <= window.simulation.get('earth_radius')
      window.simulation.addOrbiter(jQuery.extend(true, {}, window.testOrbit))
      window.renderer.hideTestOrbit()
    else
      error("Periapsis is below sea level!")
  
  elements = ["semiMajorAxis", "eccentricity", "inclination", "argumentOfPeriapsis", "longitudeOfTheAscendingNode"]
  for el in elements
    $("##{el} > input.value").change -> updateTestOrbit(el, $("##{el} > input.value").val())

error = (msg) ->
  $("#error").html(msg)
  $("#error").slideDown(1000)
  setTimeout( ->
    $("#error").slideUp(1000)
  , 5000)

initializeClickEvents = () ->
  $("tr.orbiter").click (e) ->
    id = parseInt($(this).closest('tr').attr('id').replace(/orbiter/gi, ''))
    window.simulation.selectOrbiter(id, initializeClickEvents)

window.formatTime = (sec) ->
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

window.updateTable = (orbiters, selected_id) ->
  html = ""
  for orbiter in orbiters
    cl = "orbiter "
    cl += "selected" if orbiter.id == selected_id
    html += "<tr id='orbiter#{orbiter.id}' class='#{cl}'><td>#{orbiter.id}</td><td>#{orbiter.orbit.semiMajorAxis().toFixed(1)}</td><td>#{orbiter.orbit.eccentricity().toFixed(4)}</td><td>#{orbiter.orbit.inclination().toFixed(1)}</td></tr>"
  $("#orbiters tbody").html(html)

window.updateData = (orbiter) ->
  orbit = orbiter.orbit
  next = jQuery.extend(true, {}, orbit)
  next.step(0.001)
  dE = (next.eccentricAnomaly() - orbit.eccentricAnomaly()) * 10000
  dM = (next.meanAnomaly() - orbit.meanAnomaly()) * 10000
  dN = (next.trueAnomaly() - orbit.trueAnomaly()) * 10000
  dA = (next.distance() - orbit.distance()) * 10000
  dV = (next.velocity().length() - orbit.velocity().length()) * 10000

  html = "<h2>Orbital elements:</h2><table>"
  html += "<tr><td>Semi Major Axis:</td><td>#{orbit.semiMajorAxis().toFixed(1)} km</td></tr>"
  html += "<tr><td>Eccentricity:</td><td>#{orbit.eccentricity().toFixed(4)}</td></tr>"
  html += "<tr><td>Inclination:</td><td>#{orbit.inclination().toFixed(1)} deg</td></tr>"
  html += "<tr><td>Longitude of the Ascending Node:</td><td>#{orbit.ascendingNodeLongitude().toFixed(1)} deg</td></tr>"
  html += "<tr><td>Argument of periapsis:</td><td>#{orbit.argumentOfPeriapsis().toFixed(1)} deg</td></tr>"
  html += "<tr><td>Period:</td><td>#{formatTime orbit.period()}</td></tr>"
  html += "<tr><td>Apoapsis:</td><td>#{(orbit.apoapsis() - window.simulation.get('earth_radius')).toFixed(1)} km</td></tr>"
  html += "<tr><td>Periapsis:</td><td>#{(orbit.periapsis() - window.simulation.get('earth_radius')).toFixed(1)} km</td></tr>"
  html += "</table>"
  $("#orbit_data").html(html)

  html = "<h2>Current flight data:</h2><table>"
  html += "<tr><td>Current Altitude:</td><td>#{(orbit.distance() - 6371).toFixed(1)} km (#{dA.toFixed(3)} d/dt)</td></tr>"
  html += "<tr><td>Current Speed:</td><td>#{orbit.velocity().length().toFixed(2)} km/s (#{dV.toFixed(3)} d/dt)</td></tr>"
  html += "<tr><td>True Anomaly:</td><td>#{orbit.trueAnomaly().toFixed(1)} (#{dN.toFixed(3)} d/dt)</td></tr>"
  html += "<tr><td>Mean Anomaly:</td><td>#{orbit.meanAnomaly().toFixed(1)} (#{dM.toFixed(3)} d/dt)</td></tr>"
  html += "<tr><td>Eccentric Anomaly:</td><td>#{orbit.eccentricAnomaly().toFixed(1)} (#{dE.toFixed(3)})</td></tr>"
  html += "<tr><td>Time to apoapsis:</td><td>#{formatTime orbit.timeToApoapsis()}</td></tr>"
  html += "<tr><td>Time to periapsis:</td><td>#{formatTime orbit.timeToPeriapsis()}</td></tr>"
  html += "</table>"
  $("#flight_data").html(html)

updateUI = (orbiters, selected_id, update_table) ->
  window.updateTable(orbiters, selected_id) if update_table
  window.updateData(orbiters[selected_id]) unless selected_id == null
  initializeClickEvents()


displayOnButtonClick = (button, div, hide) ->
  $("#{button}").click ->
    if hide
      $("#{hide}").slideUp(1000) if $("#{hide}").is(":visible")
    if $("#{div}").is(':visible')
      $("#{div}").slideUp(1000)
    else
      $("#{div}").slideDown(1000)

setActiveButton = (btn) ->
  $("#play").removeClass("active")
  $("#stop").removeClass("active")
  $("#pause").removeClass("active")
  $("##{btn}").addClass("active")

initializeSliders = ->
  options = ["timeAcceleration"]
  for option in options
    $("##{option} > .slider").slider optionsSliderArguments(option)

  orbital_elements =
    semiMajorAxis: [1, 40000, 1, window.testOrbit.semiMajorAxis()]
    eccentricity: [0, 0.9, 0.0001, window.testOrbit.eccentricity()]
    inclination: [0, 360, 1, window.testOrbit.inclination()]
    argumentOfPeriapsis: [0, 360, 1, window.testOrbit.argumentOfPeriapsis()]
    longitudeOfTheAscendingNode: [0, 360, 1, window.testOrbit.ascendingNodeLongitude()]
  
  for name, attr of orbital_elements
    $("##{name} > .slider").slider orbitSliderArguments(name, attr[0], attr[1], attr[2], attr[3])

optionsSliderArguments = (option, min = 1, max = 5000, step = 1) ->
  value = window.simulation.get(option)
  setOption(option, value)
  value: value
  min: min
  max: max
  step: step
  slide: (event, ui) -> setOption(option, ui.value) 

orbitSliderArguments = (option, min = 1, max = 5000, step = 1, val = 1) ->
  $("##{option} > .value").val(val)
  value: val
  min: min
  max: max
  step: step
  slide: (event, ui) -> updateTestOrbit(option, ui.value) 

setOption = (option, value) ->
  window.simulation.set(option, value)
  $("##{option} > .value").html(value)
  if value == 0
    $("##{option} > .value").addClass('zero')
  else
    $("##{option} > .value").removeClass('zero')

getOrbitalElement = (name) ->
  v = parseFloat($("##{name} > .value").val())
  v *= Math.PI/180 if $.inArray(name, ["inclination", "longitudeOfTheAscendingNode", "argumentOfPeriapsis"]) >= 0
  v

updateTestOrbit = (option, value) ->
  window.renderer.showTestOrbit()
  $("##{option} > .value").val(value)
  a = getOrbitalElement("semiMajorAxis")
  e = getOrbitalElement("eccentricity")
  i = getOrbitalElement("inclination")
  omega = getOrbitalElement("longitudeOfTheAscendingNode")
  o = getOrbitalElement("argumentOfPeriapsis")

  if e < 0 or e >= 1 or omega < 0 or o < 0 or omega > Math.PI*2 or o > Math.PI*2
    error("Invalid orbit!")

  window.testOrbit.fromOrbitalElements(a, e, i, o, omega)
  window.renderer.setTestOrbit(window.testOrbit)
  html = "<table id='test-orbit-data'>"
  html += "<tr><td>Period:</td><td>#{formatTime window.testOrbit.period()}</td></tr>"
  html += "<tr><td>Apoapsis:</td><td>#{(window.testOrbit.apoapsis() - window.simulation.get('earth_radius')).toFixed(1)} km</td></tr>"
  html += "<tr><td>Periapsis:</td><td>#{(window.testOrbit.periapsis() - window.simulation.get('earth_radius')).toFixed(1)} km</td></tr>"
  html += "</table>"
  $("#test-orbit-data").html(html)

