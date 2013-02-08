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

  initializeSliders()
  initializeClickEvents()

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
  html += "<tr><td>Period:</td><td>#{formatTime orbit.period()}</td></tr>"
  html += "<tr><td>Apoapsis:</td><td>#{(orbit.apoapsis() - window.simulation.get('earth_radius')).toFixed(1)} km</td></tr>"
  html += "<tr><td>Periapsis:</td><td>#{(orbit.periapsis() - window.simulation.get('earth_radius')).toFixed(1)} km</td></tr>"
  html += "<tr><td>Inclination:</td><td>#{orbit.inclination().toFixed(1)} deg</td></tr>"
  html += "<tr><td>Time to apoapsis:</td><td>#{formatTime orbit.timeToApoapsis()}</td></tr>"
  html += "<tr><td>Time to periapsis:</td><td>#{formatTime orbit.timeToPeriapsis()}</td></tr>"
  html += "<tr><td>Mean Velocity:</td><td>#{orbit.meanVelocity().toFixed(1)} m/s</td></tr>"
  html += "<tr><td>Longitude of the Ascending Node:</td><td>#{orbit.ascendingNodeLongitude().toFixed(1)} deg</td></tr>"
  html += "<tr><td>Argument of periapsis:</td><td>#{orbit.argumentOfPeriapsis().toFixed(1)} deg</td></tr>"
  html += "<tr><td>True Anomaly:</td><td>#{orbit.trueAnomaly().toFixed(1)}</td></tr>"
  html += "<tr><td>Eccentric Anomaly:</td><td>#{orbit.eccentricAnomaly().toFixed(1)}</td></tr>"
  html += "<tr><td>Mean Anomaly:</td><td>#{orbit.meanAnomaly().toFixed(1)}</td></tr>"
  html += "</table>"
  $("#orbit_data").html(html)

updateUI = (orbiters, selected_id, update_table) ->
  console.log "Updating UI"
  window.updateTable(orbiters, selected_id) if update_table
  window.updateData(orbiters[selected_id])


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
    $("##{option} > .slider").slider sliderArguments(option)
  $("#initialSpeed > .slider").slider sliderArguments("initialSpeed", 0.1, 20, 0.1)

sliderArguments = (option, min = 1, max = 5000, step = 1) ->
  value = window.simulation.get(option)
  setOption(option, value)
  value: value
  min: min
  max: max
  step: step
  slide: (event, ui) -> setOption(option, ui.value) 

setOption = (option, value) ->
  window.simulation.set(option, value)
  $("##{option} > .value").html(value)
  if value == 0
    $("##{option} > .value").addClass('zero')
  else
    $("##{option} > .value").removeClass('zero')

