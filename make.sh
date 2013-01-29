#!/bin/sh

haml index.haml > final/index.html
sass style.scss final/style.css

coffee -c app.coffee
coffee -c renderer.coffee
coffee -c sim.coffee

mv app.js final/app.js
mv renderer.js final/renderer.js
mv sim.js final/sim.js
