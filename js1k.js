// start of submission //
// SCRIPT
// Can use web workers http://caniuse.com/#search=web%20worker
function rect(a, b) {
  // explicit surface definition
  // a,b on 0,1
  return {
    x: a*50, // 50x50 square
    y: b*50
  };
};


var circle = function (a, b) {
  // bad for rejection in sampling use polar coords instead
  var pow = Math.pow;
  var x = a * 100;
  var y = b * 100;
  var radius = 50;
  var xCenter = 50;
  var yCenter = 50;
  if ( pow(x-xCenter, 2) + pow(y-yCenter, 2) < pow(radius, 2)) {
    return {
      x: x,
      y: y * (1 + b) / 2 // deform
    };
  } else {
    return null; // outside circle
  };
};

var monte = function () {
  // Sample our shape
  for (var i=0; i<=1; i+= 0.01) {
    for (var j=0; j<=1; j+= 0.01) {
      var position = circle(i, j);
      if (position) {
        context.fillRect(position.x, position.y, 1, 1);
      }
    }
  }
};

var affine = function (a, b, c, d, e, f) {
    return function (position) {
      return {
        x: (a + c) * position.x + e,
        y: (b + d) * position.y + f
      };
    };
};

var rand = function (max) {
  return Math.floor(Math.random() * (max + 1));
};

var linearScale = function (domain, range) {
  return function (x) {
    return (x - domain[0]) / (domain[1] - domain[0]) * (range[1] - range[0]) + range[0];
  };
};

var barnsley = function (context) {
  var position = { x: 0, y: 0 };
  var first = affine(0, 0, 0, 0.16, 0, 0);
  var second = affine(0.85, 0.04, -0.04, 0.85, 0, 1.6);
  var third = affine(0.2, -0.26, 0.23, 0.22, 0, 1.6);
  var fourth = affine(-0.15, 0.28, 0.26, 0.24, 0, 0.44);
  var r; 

  for (var i = 0; i < 100; i++) {
    r = rand(100);
    if (r <= 1) {
      position = first(position);
    } else if (1 < r && r <= (1+85)) {
      position = second(position);
    } else if ((1+85) < r && r <= (1+85+7)) {
      position = third(position);
    } else if ((1+85+7) < r && r <= (1+85+7+7)) {
      position = fourth(position);
    }
    console.log(position);
    var scaled = [
      linearScale([-2.2, 2.7], [0, c.width-1])(position.x),
      linearScale([0, 10], [0, c.height-1])(position.y)
    ];
    // console.log(scaled);
    context.fillRect(scaled[0], scaled[1], 1, 1);
  }
};

var main = function () {
  c.style.border = "1px";
  c.style.borderColor = "gray";
  c.style.borderStyle = "solid";
  c.width = 250;
  c.height = 250;

  var context = a;
  context.translate(0.5, 0.5); // no AA

  console.log('hio', c.width, c.height);
  barnsley(context);
};

main();
// end of submission //
