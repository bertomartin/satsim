$(document).ready ->
  window.renderer = new Renderer3D("#sim")
  $(window).resize -> window.renderer.handleResize()
  $("#sim").mousemove (e) -> window.renderer.mouseMove(e)
  $("#sim").mousedown (e) -> window.renderer.set('clicked', true); window.renderer.mouseMove(e)
  $("#sim").mouseup (e) -> window.renderer.set('clicked', false); window.renderer.mouseMove(e)

  window.simulation = new Simulator(window.renderer)
  window.simulation.start()

  displayOnButtonClick("#options-button", "#options", "#info")
  displayOnButtonClick("header", "#info", "#options")

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

sliderArguments = (option, min = 1, max = 500, step = 1) ->
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

