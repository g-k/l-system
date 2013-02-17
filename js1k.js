// start of submission //
// SCRIPT
// Can use web workers http://caniuse.com/#search=web%20worker

var barnsley = function (context) {
  context.fillRect(scaled[0], scaled[1], 1, 1);
};

var iterations = 3;
var angle = 90;
var axiom = "-F";
var d = 5;

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
  "F": function (state, context) {
    context.moveTo(state.x, state.y);
    // move forward
    state.x = state.x + d * Math.cos(degreesToRadians(state.angle));
    state.y = state.y + d * Math.sin(degreesToRadians(state.angle));

    context.lineTo(state.x, state.y);
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
    angle: 0 // direction in degrees angle from horizontal
  };
  context.beginPath();
  for (var i = 0; i < commands.length; i++) {
    state = commandMap[commands[i]](state, context);
    console.log(commands[i], state);
  }
  context.stroke();
};


var main = function () {
  var context = a;
  var canvas = c;

  canvas.style.border = "1px";
  canvas.style.borderColor = "gray";
  canvas.style.borderStyle = "solid";
  canvas.width = 500;
  canvas.height = 500;

  // center
  context.translate(canvas.width / 2, 5*d);
  context.translate(0.5, 0.5); // no AA

  console.log('hio', c.width, c.height);
  var commands = "F+F+F+F+";
  while (iterations--) {
    commands = applyRule(commands, {
      from: "F",
      to: "F+F-F-FF+F+F-F"
    });
    console.log(iterations, commands);    
  }
  drawL(commands, context);
};

main();
// end of submission //
