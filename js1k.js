// start of submission
// SCRIPT
// Can use web workers http://caniuse.com/#search=web%20worker

// Utils

// TODO: don't redraw everything on rescale
// (save image data and rescale)


var copy = function (obj1, obj2) {
  // copy properties from obj2 to obj1
  var has = Object.prototype.hasOwnProperty;
  var property;

  for (property in obj2) {
    if (has.call(obj2, property)) {
      obj1[property] = obj2[property];
    }
  }
  return obj1;
};

var degreesToRadians = function (degrees) {
  return (degrees / 180) * Math.PI;
};

var dotProduct = function (v1, v2) {
    var sum = 0;
    for (var i = 0; i < 3; i++) {
      sum += v1[i] * v2[i];
    }
    return sum;
};


// Tool UI

window.onload = function () {
  var gui = new dat.GUI();

  gui.add(options, 'axiom')
    .onChange(draw);

  gui.add(options, 'iterations', 0, 5)
    .step(1)
    .onChange(draw);

  gui.add(options, 'distance', 0, 25)
    .step(3)
    .onChange(function (value) {
      // expose for L System commands
      window.d = options.distance = value;
      draw();
    });

  gui.add(options, 'angle', 0, 360)
    .step(5)
    .onChange(function (value) {
      // expose for L System commands
      window.options.angle = value;
      draw();
    });

  gui.add(options.offset, 'x', 0, options.canvas.width)
    .step(5)
    .onChange(draw);

  gui.add(options.offset, 'y', 0, options.canvas.height)
    .step(5)
    .onChange(draw);

  gui.add(options, 'perspective', 0, 1500)
    .step(50)
    .onChange(draw);

  gui.add(options, 'cameraZ', -1000, 1000)
    .step(100)
    .onChange(draw);

  gui.add(options, 'yAxisRotation', 0, Math.PI*2)
    .step(0.1)
    .onChange(draw);
};


// L System Drawing

var commandMap = {
  "+": function (state) {
    // turn left by angle
    state.angle += options.angle;
    return state;
  },
  "-": function (state) {
    // turn right by angle
    state.angle -= options.angle;
    return state;
  },
  "|": function (state) {
    // turn around by angle
    state.angle += degreesToRadians(180);
  },
  "&": function (state) {
    // pitch down by angle
    // return rotator('L', degreesToRadians(window.angle))(state);
    return state;
  },
  "^": function (state) {
    // pitch up by angle
    // return rotator('L', degreesToRadians(-window.angle))(state);
    return state;
  },
  "\\": function (state) {
    // roll left by angle
    // return rotator('H', degreesToRadians(window.angle))(state);
    return state;
  },
  "/": function (state) {
    // roll right by angle
    // return rotator('H', degreesToRadians(-window.angle))(state);
    return state;
  },
  "F": function (state, context, project) {
    context.moveTo.apply(context, project(state));

    // move forward in direction
    state.x = state.x + d * Math.cos(degreesToRadians(state.angle));
    state.y = state.y + d * Math.sin(degreesToRadians(state.angle));
    // state.z = state.z; // + d * state.left;

    context.lineTo.apply(context, project(state));
    return state;
  },
  "[": function (state) {
    // push onto stack
    state.stack.push({
      x: state.x,
      y: state.y,
      // z: state.z,
      angle: state.angle
    });
    return state;
  },
  "]": function (state) {
    // pop from stack
    return copy(state, state.stack.pop());
  }
};

var nullCommands = ['A', 'B', 'C', 'D', 'X'];
var doNothing = function (state) {
  // for node rewriting do nothing
  return state;
};
for (var i = 0; i < nullCommands.length; i++) {
  commandMap[nullCommands[i]] = doNothing;
};


var drawL = function (commands, context, project) {
  var state = {
    x: 0,
    y: 0,
    z: 0,
    angle: 0,
    stack: []
  };
  context.beginPath();

  for (var i = 0; i < commands.length; i++) {
    state = commandMap[commands[i]](state, context, project);

    // console.log(commands[i], state);
  }

  context.stroke();
};

var draw = function () {
  options.context.clearRect(0, 0, options.canvas.width, options.canvas.height);

  // Move there
  context.translate(options.offset.x, options.offset.y);

  drawL(expandCommands(options), options.context, options.project);

  // Move back
  context.translate(-options.offset.x, -options.offset.y);
};


// L-System

var applyRule = function (commands, rule) {
  return commands.replace(new RegExp(rule.from, 'g'), rule.to);
};

var expandCommands = function (options) {
  var rules = options.rules;
  var iterations = options.iterations;
  var commands = options.axiom;
  var j;

  while (iterations--) {
    for (j =0; j < rules.length; j++) {
      commands = applyRule(commands, rules[j]);
    }
    // console.log(iterations, commands);
  }

  return commands;
};


// Setup

var canvas = c;
var context = a;
canvas.style.border = "1px";
canvas.style.borderColor = "gray";
canvas.style.borderStyle = "solid";
canvas.width = 500;
canvas.height = 500;

var options = {
  debug: false,
  distance: 8,
  iterations: 1,
  context: a,
  canvas: c,
  offset: {
    x: c.width / 2,
    y: c.height / 2
  },
  perspective: 350,
  cameraZ: -700,
  yAxisRotation: 0
};


var hilbertCurve3d = {
  angle: 90,
  axiom: "A",
  rules: [
    { from: "A", to: "B-F+CFC+F-D&F^D-F+&&CFC+F+B//" },
    { from: "B", to: "A&F^CFB^F^D^^-F-D^|F^B|FC^F^A//" },
    { from: "C", to: "|D^|F^B-F+C^F^A&&FA&F^C+F+B^F^D//" },
    { from: "D", to: "|CFB-F+B|FA&F^A&&FB-F+B|FC//" }
  ]
};

// ABOP 1.24 F
var plant2d = {
  angle: 22.5,
  axiom: 'X',
  rules: [
    { from: "X", to: "F-[[X]+X]+F[+FX]-X" },
    { from: "F", to: "FF" }
  ]
};

options = copy(options, plant2d);

options.rotateY = function (state) {
  var yAxisRotation = options.yAxisRotation;
  // copy of state for drawing to not mess up the L-System
  var drawState = {
    x: state.x,
    y: state.y,
    z: state.z
  };

  drawState.x = state.x * Math.cos(yAxisRotation) + state.z * Math.sin(yAxisRotation);
  drawState.z = state.x * -Math.sin(yAxisRotation) + state.z * Math.cos(yAxisRotation);

  return drawState;
};


options.project = function (state) {
  // function to project into 3D
  var perspective = options.perspective;
  var cameraZ = options.cameraZ;
  var context = options.context;

  state = options.rotateY(state);

  // projected on canvas x and y coordinates
  var pX = (state.x * perspective) / (state.z - cameraZ);
  var pY = (state.y * perspective) / (state.z - cameraZ);

  return [pX, pY];
};


// expose for L System commands
window.d = options.distance;

options.context.translate(0.5, 0.5); // no AA
draw();
// end of submission //
