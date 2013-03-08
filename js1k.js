// start of submission
// SCRIPT
// Can use web workers http://caniuse.com/#search=web%20worker

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

var degreesToRadians = function (degrees) {
  return (degrees / 180) * Math.PI;
};

var commandMap = {
  "+": function (state) {
    // rotate + angle
    state.angle += angle;
    return state;
  },
  "-": function (state) {
    // rotate - angle
    state.angle -= angle;
    return state;
  },
  "X": function (state) {
    // for node rewriting do nothing
    return state;
  },
  "F": function (state, context) {
    context.moveTo(state.x, state.y);
    // move forward
    state.x = state.x + d * Math.cos(degreesToRadians(state.angle));
    state.y = state.y + d * Math.sin(degreesToRadians(state.angle));

    context.lineTo(state.x, state.y);
    return state;
  },
  "[": function (state) {
    // push onto stack
    state.stack.push({
      x: state.x,
      y: state.y,
      angle: state.angle
    });
    return state;
  },
  "]": function (state) {
    // pop from stack
    var newState = state.stack.pop();
    state.x = newState.x;
    state.y = newState.y;
    state.angle = newState.angle;
    return state;
  }
};

var drawL = function (commands, context) {
  var state = {
    x: 0,
    y: 0,
    angle: 0, // direction in degrees angle from horizontal
    stack: []
  };
  context.beginPath();
  for (var i = 0; i < commands.length; i++) {
    state = commandMap[commands[i]](state, context);
    // console.log(commands[i], state);
  }
  context.stroke();
};

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

var draw3d = function (options) {
  // projected on canvas x and y coordinates
  var pX;
  var pY;
  var perspective = options.perspective;
  var cameraZ = options.cameraZ;
  var context = options.context;

  var surface = function (a, b) {
    // cylinder
    var angle = a * Math.PI * 2,
        radius = 100,
        length = 400;

    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: b * length - length / 2, // by subtracting length/2 I have centered the tube at (0, 0, 0)
        r: 0,
        g: Math.floor(b * 255),
        b: 0
    };
  };

  for (var a = 0; a < 1; a += 0.001) {
    for (var b = 0; b < 1; b += 0.01) {
      var point = surface(a, b);
      if (!point) {
	continue;
      }

      pX = (point.x * perspective) / (point.z - cameraZ);
      pY = (point.y * perspective) / (point.z - cameraZ);
      context.fillStyle = 'rgb('+[point.r, point.g, point.b].join(',')+')';
      context.fillRect(pX, pY, 1, 1);
    }
  }

};


var draw = function () {
  options.context.clearRect(0, 0, options.canvas.width, options.canvas.height);

  // Move there
  context.translate(options.offset.x, options.offset.y);

  // drawL(expandCommands(options), options.context);
  draw3d(options);

  // Move back
  context.translate(-options.offset.x, -options.offset.y);
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
  angle: 22.5,
  iterations: 0,
  axiom: "X",
  rules: [
    { from: "X", to: "F-[[X]+X]+F[+FX]-X" },
    { from: "F", to: "FF" }
  ],
  context: a,
  canvas: c,
  offset: {
    x: c.width / 2,
    y: c.height / 2
  },
  perspective: 350,
  cameraZ: -700
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
