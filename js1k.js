// start of submission
// SCRIPT
// Can use web workers http://caniuse.com/#search=web%20worker        

var barnsley = function (context) {
  context.fillRect(scaled[0], scaled[1], 1, 1);
};

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

var applyRule = function (commands, rule) {
  return commands.replace(new RegExp(rule.from, 'g'), rule.to);
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


var draw = function () {
  var rules = [
    { from: "X", to: "F-[[X]+X]+F[+FX]-X" },
    { from: "F", to: "FF" }
  ];
  var iterations = options.iterations;
  var commands = options.axiom;
  var j;

  while (iterations--) {
    for (j =0; j < rules.length; j++) {
      commands = applyRule(commands, rules[j]);
    }
    // console.log(iterations, commands);
  }

  // Account for earlier translation
  options.context.clearRect(
    -options.canvas.width / 2, -options.canvas.height / 2, 
    options.canvas.width, options.canvas.height);
  drawL(commands, options.context);  
};

var options = { 
  d: 8,
  angle: 22.5,
  iterations: 0,
  axiom: "X",
  context: a, 
  canvas: c
};

// expose for commands
var d = options.d; 
var angle = options.angle;


var redrawControl = function (id) {
  // A number control that redraws when it changes
  var el = document.querySelector('#'+id);  

  var redrawOnChange = function (event) {
    window[id] = options[id] = event.target.valueAsNumber;
    draw();
  };
  el.addEventListener('change', redrawOnChange, false);
};

var setupControls = function () {
  redrawControl('iterations');
  redrawControl('d');
  redrawControl('angle');
};


var init = function () {
  var canvas = options.canvas;
  var context = options.context;
  canvas.style.border = "1px";
  canvas.style.borderColor = "gray";
  canvas.style.borderStyle = "solid";
  canvas.width = 500;
  canvas.height = 500;

  context.translate(canvas.width / 2, canvas.height / 2);
  context.translate(0.5, 0.5); // no AA

  console.log('hio', canvas.width, canvas.height);
  setupControls();
};

init();
// end of submission //
