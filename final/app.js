(function() {
  var displayOnButtonClick, error, getOrbitalElement, initializeClickEvents, initializeSliders, optionsSliderArguments, orbitSliderArguments, setActiveButton, setOption, updateTestOrbit, updateUI;

  window.rad = function(d) {
    return d * Math.PI / 180;
  };

  window.deg = function(r) {
    return r * 180 / Math.PI;
  };

  $(document).ready(function() {
    var el, elements, _i, _len;
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
    window.simulation.set('ui_updater', updateUI);
    window.simulation.start();
    displayOnButtonClick("#options-button", "#options", "#info");
    displayOnButtonClick("header", "#info", "#options");
    $("#satellites-button").click(function() {
      if ($("#satellites").is(':visible')) {
        $("#satellites").hide();
        $("#satellites-button").css('right', '0');
        return window.renderer.hideTestOrbit();
      } else {
        $("#satellites").show();
        return $("#satellites-button").css('right', $("#satellites").outerWidth() + "px");
      }
    });
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
    initializeClickEvents();
    window.testOrbit = new window.Orbit(window.simulation.get('gm')).fromOrbitalElements(8000, 0.001, 0 * Math.PI / 180, 0 * Math.PI / 180, 0 * Math.PI / 180);
    window.renderer.setTestOrbit(window.testOrbit);
    initializeSliders();
    $("#add-satellite").click(function() {
      if (!(window.testOrbit.periapsis() <= window.simulation.get('earth_radius'))) {
        window.simulation.addOrbiter(jQuery.extend(true, {}, window.testOrbit));
        return window.renderer.hideTestOrbit();
      } else {
        return error("Periapsis is below sea level!");
      }
    });
    elements = ["semiMajorAxis", "eccentricity", "inclination", "argumentOfPeriapsis", "longitudeOfTheAscendingNode"];
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
      el = elements[_i];
      $("#" + el + " > input.value").change(function() {
        return updateTestOrbit(el, $("#" + el + " > input.value").val());
      });
    }
    $("#circulize-low").click(function() {
      return window.simulation.circulizeLow();
    });
    $("#circulize-high").click(function() {
      return window.simulation.circulizeHigh();
    });
    return $("#cancel-maneuver").click(function() {
      return window.simulation.cancelManeuver();
    });
  });

  error = function(msg) {
    $("#error").html(msg);
    $("#error").slideDown(1000);
    return setTimeout(function() {
      return $("#error").slideUp(1000);
    }, 5000);
  };

  initializeClickEvents = function() {
    return $("tr.orbiter").click(function(e) {
      var id;
      id = parseInt($(this).closest('tr').attr('id').replace(/orbiter/gi, ''));
      return window.simulation.selectOrbiter(id, initializeClickEvents);
    });
  };

  window.formatTime = function(sec) {
    var str;
    str = "";
    if (sec > 60 * 60) {
      str += "" + (Math.floor(sec / (60 * 60))) + "h";
      sec = sec % (60 * 60);
    }
    if (sec > 60) {
      str += "" + (Math.floor(sec / 60)) + "m";
      sec = sec % 60;
    }
    if (sec > 0) str += "" + (sec.toFixed(0)) + "s";
    return str;
  };

  window.updateTable = function(orbiters, selected_id) {
    var cl, html, orbiter, _i, _len;
    html = "";
    for (_i = 0, _len = orbiters.length; _i < _len; _i++) {
      orbiter = orbiters[_i];
      cl = "orbiter ";
      if (orbiter.id === selected_id) cl += "selected";
      html += "<tr id='orbiter" + orbiter.id + "' class='" + cl + "'><td>" + orbiter.id + "</td><td>" + (orbiter.orbit.semiMajorAxis().toFixed(1)) + "</td><td>" + (orbiter.orbit.eccentricity().toFixed(4)) + "</td><td>" + (orbiter.orbit.inclination().toFixed(1)) + "</td></tr>";
    }
    return $("#orbiters tbody").html(html);
  };

  window.updateData = function(orbiter) {
    var dA, dE, dM, dN, dV, html, next, orbit;
    orbit = orbiter.orbit;
    next = jQuery.extend(true, {}, orbit);
    next.step(0.001);
    dE = (next.eccentricAnomaly() - orbit.eccentricAnomaly()) * 10000;
    dM = (next.meanAnomaly() - orbit.meanAnomaly()) * 10000;
    dN = (next.trueAnomaly() - orbit.trueAnomaly()) * 10000;
    dA = (next.distance() - orbit.distance()) * 10000;
    dV = (next.velocity().length() - orbit.velocity().length()) * 10000;
    html = "<h2>Orbital elements:</h2><table>";
    html += "<tr><td>Semi Major Axis:</td><td>" + (orbit.semiMajorAxis().toFixed(1)) + " km</td></tr>";
    html += "<tr><td>Eccentricity:</td><td>" + (orbit.eccentricity().toFixed(4)) + "</td></tr>";
    html += "<tr><td>Inclination:</td><td>" + (orbit.inclination().toFixed(1)) + " deg</td></tr>";
    html += "<tr><td>Longitude of the Ascending Node:</td><td>" + (orbit.ascendingNodeLongitude().toFixed(1)) + " deg</td></tr>";
    html += "<tr><td>Argument of periapsis:</td><td>" + (orbit.argumentOfPeriapsis().toFixed(1)) + " deg</td></tr>";
    html += "<tr><td>Period:</td><td>" + (formatTime(orbit.period())) + "</td></tr>";
    html += "<tr><td>Apoapsis:</td><td>" + ((orbit.apoapsis() - window.simulation.get('earth_radius')).toFixed(1)) + " km</td></tr>";
    html += "<tr><td>Periapsis:</td><td>" + ((orbit.periapsis() - window.simulation.get('earth_radius')).toFixed(1)) + " km</td></tr>";
    html += "</table>";
    $("#orbit-data").html(html);
    html = "<h2>Current flight data:</h2><table>";
    html += "<tr><td>Current Altitude:</td><td>" + ((orbit.distance() - 6371).toFixed(1)) + " km (" + (dA.toFixed(3)) + " d/dt)</td></tr>";
    html += "<tr><td>Current Speed:</td><td>" + (orbit.velocity().length().toFixed(2)) + " km/s (" + (dV.toFixed(3)) + " d/dt)</td></tr>";
    html += "<tr><td>True Anomaly:</td><td>" + (orbit.trueAnomaly().toFixed(1)) + " (" + (dN.toFixed(3)) + " d/dt)</td></tr>";
    html += "<tr><td>Mean Anomaly:</td><td>" + (orbit.meanAnomaly().toFixed(1)) + " (" + (dM.toFixed(3)) + " d/dt)</td></tr>";
    html += "<tr><td>Eccentric Anomaly:</td><td>" + (orbit.eccentricAnomaly().toFixed(1)) + " (" + (dE.toFixed(3)) + ")</td></tr>";
    html += "<tr><td>Time to apoapsis:</td><td>" + (formatTime(orbit.timeToApoapsis())) + "</td></tr>";
    html += "<tr><td>Time to periapsis:</td><td>" + (formatTime(orbit.timeToPeriapsis())) + "</td></tr>";
    html += "</table>";
    return $("#flight-data").html(html);
  };

  window.updateManeuvers = function(orbiter) {
    var html;
    if (orbiter.maneuver) {
      html = "";
      html += "<tr><td>Status:</td><td>" + orbiter.maneuver.status + "</td></tr>";
      html += "<tr><td>Delta-V:</td><td>" + orbiter.maneuver.dV + "</td></tr>";
      html += "<tr><td>Next pass in:</td><td>" + (formatTime(orbiter.orbit.timeTo(window.rad(orbiter.maneuver.at)))) + "</tr>";
      $("#maneuver-status > table").html(html);
      if (!$("#maneuver-status").is(":visible")) {
        $("#select-maneuver").hide();
        return $("#maneuver-status").show();
      }
    } else {
      if ($("#maneuver-status").is(":visible")) {
        $("#select-maneuver").show();
        return $("#maneuver-status").hide();
      }
    }
  };

  updateUI = function(orbiters, selected_id, update_table) {
    if (update_table) window.updateTable(orbiters, selected_id);
    if (selected_id !== null) window.updateData(orbiters[selected_id]);
    if (selected_id !== null) window.updateManeuvers(orbiters[selected_id]);
    return initializeClickEvents();
  };

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
    var attr, name, option, options, orbital_elements, _i, _len, _results;
    options = ["timeAcceleration"];
    for (_i = 0, _len = options.length; _i < _len; _i++) {
      option = options[_i];
      $("#" + option + " > .slider").slider(optionsSliderArguments(option));
    }
    orbital_elements = {
      semiMajorAxis: [1, 40000, 1, window.testOrbit.semiMajorAxis()],
      eccentricity: [0, 0.9, 0.0001, window.testOrbit.eccentricity()],
      inclination: [0, 360, 1, window.testOrbit.inclination()],
      argumentOfPeriapsis: [0, 360, 1, window.testOrbit.argumentOfPeriapsis()],
      longitudeOfTheAscendingNode: [0, 360, 1, window.testOrbit.ascendingNodeLongitude()]
    };
    _results = [];
    for (name in orbital_elements) {
      attr = orbital_elements[name];
      _results.push($("#" + name + " > .slider").slider(orbitSliderArguments(name, attr[0], attr[1], attr[2], attr[3])));
    }
    return _results;
  };

  optionsSliderArguments = function(option, min, max, step) {
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

  orbitSliderArguments = function(option, min, max, step, val) {
    if (min == null) min = 1;
    if (max == null) max = 5000;
    if (step == null) step = 1;
    if (val == null) val = 1;
    $("#" + option + " > .value").val(val);
    return {
      value: val,
      min: min,
      max: max,
      step: step,
      slide: function(event, ui) {
        return updateTestOrbit(option, ui.value);
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

  getOrbitalElement = function(name) {
    var v;
    v = parseFloat($("#" + name + " > .value").val());
    if ($.inArray(name, ["inclination", "longitudeOfTheAscendingNode", "argumentOfPeriapsis"]) >= 0) {
      v *= Math.PI / 180;
    }
    return v;
  };

  updateTestOrbit = function(option, value) {
    var a, e, html, i, o, omega;
    window.renderer.showTestOrbit();
    $("#" + option + " > .value").val(value);
    a = getOrbitalElement("semiMajorAxis");
    e = getOrbitalElement("eccentricity");
    i = getOrbitalElement("inclination");
    omega = getOrbitalElement("longitudeOfTheAscendingNode");
    o = getOrbitalElement("argumentOfPeriapsis");
    if (e < 0 || e >= 1 || omega < 0 || o < 0 || omega > Math.PI * 2 || o > Math.PI * 2) {
      error("Invalid orbit!");
    }
    window.testOrbit.fromOrbitalElements(a, e, i, o, omega);
    window.renderer.setTestOrbit(window.testOrbit);
    html = "<table id='test-orbit-data'>";
    html += "<tr><td>Period:</td><td>" + (formatTime(window.testOrbit.period())) + "</td></tr>";
    html += "<tr><td>Apoapsis:</td><td>" + ((window.testOrbit.apoapsis() - window.simulation.get('earth_radius')).toFixed(1)) + " km</td></tr>";
    html += "<tr><td>Periapsis:</td><td>" + ((window.testOrbit.periapsis() - window.simulation.get('earth_radius')).toFixed(1)) + " km</td></tr>";
    html += "</table>";
    return $("#test-orbit-data").html(html);
  };

}).call(this);
