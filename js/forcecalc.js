// const FORCEDATA_SIDESPRING = [
//   { thickness: 1.0, gradient: 0.893 / 4 },
//   { thickness: 1.1, gradient: 1.179 / 4 },
//   { thickness: 1.2, gradient: 1.516 / 4 },
//   { thickness: 1.3, gradient: 1.945 / 4 },
//   { thickness: 1.4, gradient: 2.38 / 4 },
//   { thickness: 1.5, gradient: 2.858 / 4 },
//   { thickness: 1.6, gradient: 2.065 / 4 },
//   { thickness: 1.7, gradient: 2.463 / 4 },
//   { thickness: 1.8, gradient: 2.901 / 4 },
//   { thickness: 1.9, gradient: 3.376 / 4 },
//   { thickness: 2.0, gradient: 3.906 / 4 },
//   { thickness: 2.1, gradient: 2.992 / 4 },
//   { thickness: 2.2, gradient: 3.436 / 4 },
//   { thickness: 2.3, gradient: 3.908 / 4 },
//   { thickness: 2.4, gradient: 4.422 / 4 },
//   { thickness: 2.5, gradient: 4.981 / 4 }
// ];

// const FORCEDATA_MAINSPRING = [
//   { width: 16, thickness: 1.0, gradient: 3.176 / 10 },
//   { width: 16, thickness: 1.2, gradient: 5.52 / 10 },
//   { width: 16, thickness: 1.4, gradient: 8.838 / 10 },
//   { width: 16, thickness: 1.6, gradient: 13.285 / 10 },
//   { width: 16, thickness: 1.8, gradient: 19.08 / 10 },
//   { width: 20, thickness: 1.0, gradient: 1.597 / 10 },
//   { width: 20, thickness: 1.2, gradient: 2.765 / 10 },
//   { width: 20, thickness: 1.4, gradient: 4.423 / 10 },
//   { width: 20, thickness: 1.6, gradient: 6.615 / 10 },
//   { width: 20, thickness: 1.8, gradient: 9.513 / 10 },
//   { width: 24, thickness: 1.0, gradient: 0.911 / 10 },
//   { width: 24, thickness: 1.2, gradient: 1.58 / 10 },
//   { width: 24, thickness: 1.4, gradient: 2.518 / 10 },
//   { width: 24, thickness: 1.6, gradient: 3.747 / 10 },
//   { width: 24, thickness: 1.8, gradient: 5.416 / 10 }
// ];

const FORCEDATA_SIDESPRING = [
  { thickness: 1.0, gradient: 0.2296},
  { thickness: 1.1, gradient: 0.3033},
  { thickness: 1.2, gradient: 0.3905},
  { thickness: 1.3, gradient: 0.4991},
  { thickness: 1.4, gradient: 0.6118},
  { thickness: 1.5, gradient: 0.7361},
  { thickness: 1.6, gradient: 0.5325},
  { thickness: 1.7, gradient: 0.6360},
  { thickness: 1.8, gradient: 0.7498},
  { thickness: 1.9, gradient: 0.8735},
  { thickness: 2.0, gradient: 1.0115},
  { thickness: 2.1, gradient: 0.7729},
  { thickness: 2.2, gradient: 0.8883},
  { thickness: 2.3, gradient: 1.0113},
  { thickness: 2.4, gradient: 1.1454},
  { thickness: 2.5, gradient: 1.2908}
];

const FORCEDATA_MAINSPRING = [
  { width: 16, thickness: 1.0, gradient: 3.176 / 10 },
  { width: 16, thickness: 1.2, gradient: 5.52 / 10 },
  { width: 16, thickness: 1.4, gradient: 8.838 / 10 },
  { width: 16, thickness: 1.6, gradient: 13.285 / 10 },
  { width: 16, thickness: 1.8, gradient: 19.08 / 10 },
  { width: 20, thickness: 1.0, gradient: 1.597 / 10 },
  { width: 20, thickness: 1.2, gradient: 2.765 / 10 },
  { width: 20, thickness: 1.4, gradient: 4.423 / 10 },
  { width: 20, thickness: 1.6, gradient: 6.615 / 10 },
  { width: 20, thickness: 1.8, gradient: 9.513 / 10 },
  { width: 24, thickness: 1.0, gradient: 0.911 / 10 },
  { width: 24, thickness: 1.2, gradient: 1.58 / 10 },
  { width: 24, thickness: 1.4, gradient: 2.518 / 10 },
  { width: 24, thickness: 1.6, gradient: 3.747 / 10 },
  { width: 24, thickness: 1.8, gradient: 5.416 / 10 }
];

const FORCEDATA_MAINSPRING_LENGTH = FORCEDATA_MAINSPRING.map(f => ({
  length: Math.pow(
    Math.pow(f.width - 2 * f.thickness, 2) + Math.pow(4, 2),
    0.5
  ),
  width: f.width,
  thickness: f.thickness,
  gradient: f.gradient
}));

const MULTIPLIER_FORCE = 0.57;
const MULTIPLIER_FORCE_MAINSPRING = 0.49;
const FRICTION_COEFFICIENT = 0.2;

function calcSideGradient(t) {
  var cand = [];
  FORCEDATA_SIDESPRING.forEach((f, i, arr) => {
    if (f.thickness === t) {
      cand.push(f);
    } else if (i < arr.length - 1) {
      if (t > f.thickness && t < arr[i + 1].thickness) {
        cand.push(f);
        cand.push(arr[i + 1]);
      }
    }
  });

  var gradient = 0;

  if (cand.length === 1) {
    gradient = cand[0].gradient;
  } else if (cand.length === 2) {
    var ratio =
      (t - cand[0].thickness) / (cand[1].thickness - cand[0].thickness);
    gradient = ratio * cand[1].gradient + (1 - ratio) * cand[0].gradient;
  }

  return MULTIPLIER_FORCE * gradient;
}

function calcSpringGradient(w, t) {
  // var len = Math.pow(Math.pow(w - 2 * t, 2) + Math.pow(4, 2), 0.5);

  var wArr = [16, 20, 24];
  var tArr = [1.0, 1.2, 1.4, 1.6, 1.8];

  var wCand = [];
  var tCand = [];
  
  for (var i = 0; i < wArr.length - 1; i++) {
    if (w >= wArr[i] && w < wArr[i + 1]) {
      wCand.push(wArr[i]);
      wCand.push(wArr[i + 1]);
      break;
    } else if (w === wArr[wArr.length - 1]) {
      wCand.push(wArr[i]);
      wCand.push(wArr[i + 1]);
      break;
    }
  }
  
  for (var i = 0; i < tArr.length - 1; i++) {
    if (t >= tArr[i] && t < tArr[i + 1]) {
      tCand.push(tArr[i]);
      tCand.push(tArr[i + 1]);
      break;
    } else if (t === tArr[tArr.length - 1]) {
      tCand.push(tArr[i]);
      tCand.push(tArr[i + 1]);
      break;
    }
  }

  if (wCand.length === 2 && tCand.length === 2) {
    var ga1 = FORCEDATA_MAINSPRING_LENGTH.filter(
      f => f.width === wCand[0] && f.thickness === tCand[0]
    )[0].gradient;
    var ga2 = FORCEDATA_MAINSPRING_LENGTH.filter(
      f => f.width === wCand[0] && f.thickness === tCand[1]
    )[0].gradient;
    var gb1 = FORCEDATA_MAINSPRING_LENGTH.filter(
      f => f.width === wCand[1] && f.thickness === tCand[0]
    )[0].gradient;
    var gb2 = FORCEDATA_MAINSPRING_LENGTH.filter(
      f => f.width === wCand[1] && f.thickness === tCand[1]
    )[0].gradient;

    var ratioW = (w - wCand[0]) / (wCand[1] - wCand[0]);
    var ratioT = (t - tCand[0]) / (tCand[1] - tCand[0]);

    var ga = ga2 * ratioT + ga1 * (1 - ratioT);
    var gb = gb2 * ratioT + gb1 * (1 - ratioT);
    var g = gb * ratioW + ga * (1 - ratioW);

    return g * MULTIPLIER_FORCE_MAINSPRING;
  } else {
    return 0;
  }
}