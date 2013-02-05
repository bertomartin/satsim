(function() {
  var displayOnButtonClick, initializeSliders, setActiveButton, setOption, sliderArguments;

  $(document).ready(function() {
    window.renderer = new Renderer3D("#sim");
    $(window).resize(function() {
      return window.renderer.handleResize();
    });
    $("#sim").mousemove(function(e) {
      return window.renderer.mouseMove(e);
    });
    $("#sim").mousedown(function(e) {
      window.renderer.set('clicked', true);
      return window.renderer.mouseMove(e);
    });
    $("#sim").mouseup(function(e) {
      window.renderer.set('clicked', false);
      return window.renderer.mouseMove(e);
    });
    window.simulation = new Simulator(window.renderer);
    window.simulation.start();
    displayOnButtonClick("#options-button", "#options", "#info");
    displayOnButtonClick("header", "#info", "#options");
    $("header").hover(function() {
      return $("#instruction").slideDown(500);
    }, function() {
      return $("#instruction").slideUp(500);
    });
    $("#play").click(function() {
      window.simulation.start();
      return setActiveButton("play");
    });
    $("#pause").click(function() {
      window.simulation.pause();
      return setActiveButton("pause");
    });
    $("#stop").click(function() {
      window.simulation.stop();
      return setActiveButton("stop");
    });
    return initializeSliders();
  });

  displayOnButtonClick = function(button, div, hide) {
    return $("" + button).click(function() {
      if (hide) if ($("" + hide).is(":visible")) $("" + hide).slideUp(1000);
      if ($("" + div).is(':visible')) {
        return $("" + div).slideUp(1000);
      } else {
        return $("" + div).slideDown(1000);
      }
    });
  };

  setActiveButton = function(btn) {
    $("#play").removeClass("active");
    $("#stop").removeClass("active");
    $("#pause").removeClass("active");
    return $("#" + btn).addClass("active");
  };

  initializeSliders = function() {
    var option, options, _i, _len;
    options = ["timeAcceleration"];
    for (_i = 0, _len = options.length; _i < _len; _i++) {
      option = options[_i];
      $("#" + option + " > .slider").slider(sliderArguments(option));
    }
    return $("#initialSpeed > .slider").slider(sliderArguments("initialSpeed", 0.1, 20, 0.1));
  };

  sliderArguments = function(option, min, max, step) {
    var value;
    if (min == null) min = 1;
    if (max == null) max = 5000;
    if (step == null) step = 1;
    value = window.simulation.get(option);
    setOption(option, value);
    return {
      value: value,
      min: min,
      max: max,
      step: step,
      slide: function(event, ui) {
        return setOption(option, ui.value);
      }
    };
  };

  setOption = function(option, value) {
    window.simulation.set(option, value);
    $("#" + option + " > .value").html(value);
    if (value === 0) {
      return $("#" + option + " > .value").addClass('zero');
    } else {
      return $("#" + option + " > .value").removeClass('zero');
    }
  };

}).call(this);
