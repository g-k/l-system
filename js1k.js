// start of submission
// SCRIPT
// Can use web workers http://caniuse.com/#search=web%20worker

// Utils

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

var redrawControl = function (control) {
  // A number control that redraws when it changes
  var el = document.querySelector('#'+control.id);

  var redrawOnChange = function (event) {
    if (control.updater === undefined) {
      control.updater = function (target) {
	options[target.id] = target.valueAsNumber;
      };
    }

    control.updater(event.target);
    draw();
  };
  el.addEventListener('change', redrawOnChange, false);
};


// L System Drawing

var rotator = function (direction, angle) {
  var sin = Math.sin;
  var cos = Math.cos;
  var rotationMatrices = {
    U: {
      x: [cos(angle), sin(angle), 0],
      y: [-sin(angle), cos(angle), 0],
      z: [0, 0, 1]
    },
    L: {
      x: [cos(angle), 0, -sin(angle)],
      y: [0, 1, 0],
      z: [sin(angle), 0, cos(angle)]
    },
    H: {
      x: [1, 0, 0],
      y: [0, cos(angle), -sin(angle)],
      z: [0, sin(angle), cos(angle)]
    }
  };

  return function (state) {
    var R = rotationMatrices[direction];
    var orientation = [state.heading, state.up, state.left];

    var newState = {
      heading: dotProduct(orientation, R.x),
      up: dotProduct(orientation, R.y),
      left: dotProduct(orientation, R.z)
    };

    return copy(state, newState);
  };
};


var commandMap = {
  "+": function (state) {
    // turn left by angle
    return rotator('U', degreesToRadians(window.angle))(state);
  },
  "-": function (state) {
    // turn right by angle
    return rotator('U', degreesToRadians(-window.angle))(state);
  },
  "|": function (state) {
    // turn around by angle
    return rotator('U', degreesToRadians(180))(state);
  },
  "&": function (state) {
    // pitch down by angle
    return rotator('L', degreesToRadians(window.angle))(state);
  },
  "^": function (state) {
    // pitch up by angle
    return rotator('L', degreesToRadians(-window.angle))(state);
  },
  "\\": function (state) {
    // roll left by angle
    return rotator('H', degreesToRadians(window.angle))(state);
  },
  "/": function (state) {
    // roll right by angle
    return rotator('H', degreesToRadians(-window.angle))(state);
  },
  "F": function (state, context, project) {
    context.moveTo.apply(context, project(state));

    // move forward in direction
    state.x = state.x + d * state.heading;
    state.y = state.y + d * state.up;
    state.z = state.z + d * state.left;

    context.lineTo.apply(context, project(state));
    return state;
  },
  "[": function (state) {
    // push onto stack
    state.stack.push({
      x: state.x,
      y: state.y,
      z: state.z,
      heading: state.heading,
      up: state.up,
      left: state.left
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
    heading: 1, // direction in degrees angle from horizontal
    left: 1,    // degrees from
    up: 1,
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
  distance: 8,
  angle: 90,
  iterations: 0,
  axiom: "A",
  rules: [
    { from: "A", to: "B-F+CFC+F-D&F^D-F+&&CFC+F+B//" },
    { from: "B", to: "A&F^CFB^F^D^^-F-D^|F^B|FC^F^A//" },
    { from: "C", to: "|D^|F^B-F+C^F^A&&FA&F^C+F+B^F^D//" },
    { from: "D", to: "|CFB-F+B|FA&F^A&&FB-F+B|FC//" }
  ],
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

options.rotate = function (state) {
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

  state = options.rotate(state);

  // projected on canvas x and y coordinates
  var pX = (state.x * perspective) / (state.z - cameraZ);
  var pY = (state.y * perspective) / (state.z - cameraZ);

  return [pX, pY];
};


// expose for L System commands
window.d = options.distance;
window.angle = options.angle;


var init = function (options) {
  var context = options.context;
  context.translate(0.5, 0.5); // no AA

  var controls = [
    { id: 'iterations' },
    { id: 'perspective' },
    { id: 'cameraZ' },
    { id: 'yAxisRotation',
      updater: function (target) {
	options.yAxisRotation = degreesToRadians(target.valueAsNumber);
      }
    },
    {
      id: 'distance',
      updater: function (target) {
	// expose for L System commands
	window.d = options.distance = target.valueAsNumber;
      }
    },
    {
      id: 'angle',
      updater: function (target) {
	// expose for L System commands
	window.angle = options.angle = target.valueAsNumber;
      }
    },
    {
      id: 'offsetX',
      updater: function (target) {
	options.offset.x = (options.canvas.width / 100) * target.valueAsNumber;
      }
    },
    {
      id: 'offsetY',
      updater: function (target) {
	options.offset.y = (options.canvas.width / 100) * target.valueAsNumber;
      }
    }
  ];
  controls.forEach(function (control) { redrawControl(control); });

  draw();
};

init(options);

// end of submission //
