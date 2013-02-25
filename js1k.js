// start of submission //
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
    // node rewriting
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
    console.log(commands[i], state);
  }
  context.stroke();
};


var d = 6;
var angle = 22.5;

var main = function () {
  var context = a;
  var canvas = c;

  canvas.style.border = "1px";
  canvas.style.borderColor = "gray";
  canvas.style.borderStyle = "solid";
  canvas.width = 500;
  canvas.height = 500;

  context.translate(canvas.width / 2, canvas.height / 2);
  context.translate(0.5, 0.5); // no AA

  console.log('hio', c.width, c.height);

  var iterations = 3;
  var axiom = "X";
  var commands = axiom;
  console.log(iterations, commands);
  var rules = [
    { from: "X", to: "F-[[X]+X]+F[+FX]-X" },
    { from: "F", to: "FF" }
  ];
  var j;
  while (iterations--) {
    for (j =0; j < rules.length; j++) {
      commands = applyRule(commands, rules[j]);
    }
    console.log(iterations, commands);
  }
  
  drawL(commands, context);
};

main();
// end of submission //
