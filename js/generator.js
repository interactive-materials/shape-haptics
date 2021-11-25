function generateViewCaseDouble(
  caseP,
  sliderP,
  sideP,
  springP,
  deflectionAngleA,
  deflectionAngleB,
  displacement
) {
  var springP2 = { ...springP };
  var totalDisplacement = springP.count * springP.gap;
  var actualDisplacement = sliderP.preloadBase + displacement;
  var delta = totalDisplacement - actualDisplacement;
  delta = delta < 0.1 ? 0.1 : delta;
  var newGap = delta / springP.count;
  springP2.gap = newGap;
  springP2.height = springP.height - actualDisplacement;

  var drawing = generateCaseDouble(caseP, sliderP, sideP, sideP, springP);

  var arm = drawing.children["ARM"];
  var armB = arm.clone();

  arm.rotate(deflectionAngleA, arm.firstSegment.point);
  armB.rotate(deflectionAngleB, armB.firstSegment.point);

  var t = arm.segments[3].point.x - arm.segments[1].point.x;
  var t2 = armB.segments[3].point.x - armB.segments[1].point.x;

  var sideP2 = { ...sideP };
  var sideP2B = { ...sideP };

  sideP2.throw = t;
  sideP2.angle = sideP.angle - deflectionAngleA;

  sideP2B.throw = t2;
  sideP2B.angle = sideP.angle - deflectionAngleB;

  arm.remove();
  armB.remove();

  var springLocation = drawing.children["SPRING"].firstSegment.point;
  drawing.children["SPRING"].remove();

  drawing.children["SLIDERBASE"].translate(0, displacement);
  drawing.children["SLIDERTOP"].translate(0, displacement);

  drawing.children["LEFT"].remove();
  drawing.children["RIGHT"].remove();
  drawing.children["OUTER"].remove();
  drawing.children["MASK"].remove();
  // drawing.children["LEFT"].translate(0, displacement);
  // drawing.children["RIGHT"].translate(0, displacement);

  var sideSpringA = generateSideSpring(sideP2);
  var sideSpringB = generateSideSpring(sideP2B);

  var sideSpringAPos = drawing.children["CASE"].segments[4].point;
  sideSpringA.translate(sideSpringAPos.subtract(sideSpringA.lastSegment.point));
  sideSpringA.reverse();

  drawing.children["CASE"].removeSegments(4, 17);
  drawing.children["CASE"].insertSegments(4, sideSpringA.segments);

  drawing.children["CASE"].reverse();
  drawing.children["CASE"].scale(
    -1,
    1,
    drawing.children["CASE"].lastSegment.point
  );

  var sideSpringBPos = drawing.children["CASE"].segments[3].point;
  sideSpringB.translate(sideSpringBPos.subtract(sideSpringB.lastSegment.point));
  sideSpringB.reverse();

  drawing.children["CASE"].removeSegments(3, 16);
  drawing.children["CASE"].insertSegments(3, sideSpringB.segments);

  drawing.children["CASE"].reverse();
  drawing.children["CASE"].scale(
    -1,
    1,
    drawing.children["CASE"].firstSegment.point
  );

  var spring = generateSpring(springP2);
  spring.translate(springLocation.subtract(spring.firstSegment.point));
  spring.translate(0, actualDisplacement);
  spring.name = "SPRING";

  drawing.addChild(spring);

  sideSpringA.remove();
  sideSpringB.remove();

  return drawing;
}

function generateViewCaseSingle(
  caseP,
  sliderP,
  sideP,
  springP,
  deflectionAngleA,
  displacement
) {
  var springP2 = { ...springP };
  var totalDisplacement = springP.count * springP.gap;
  var actualDisplacement = sliderP.preloadBase + displacement;
  var delta = totalDisplacement - actualDisplacement;
  delta = delta < 0.1 ? 0.1 : delta;
  var newGap = delta / springP.count;
  springP2.gap = newGap;
  springP2.height = springP.height - actualDisplacement;

  var drawing = generateCaseSingle(caseP, sliderP, sideP, springP);

  var arm = drawing.children["ARM"];

  arm.rotate(deflectionAngleA, arm.firstSegment.point);

  var t = arm.segments[3].point.x - arm.segments[1].point.x;

  var sideP2 = { ...sideP };

  sideP2.throw = t;
  sideP2.angle = sideP.angle - deflectionAngleA;

  arm.remove();

  var springLocation = drawing.children["SPRING"].firstSegment.point;
  drawing.children["SPRING"].remove();

  drawing.children["SLIDER"].translate(0, displacement);

  drawing.children["LEFT"].remove();
  drawing.children["OUTER"].remove();
  drawing.children["MASK"].remove();
  // drawing.children["LEFT"].translate(0, displacement);

  var sideSpringA = generateSideSpring(sideP2);

  drawing.children["CASE"].reverse();

  var sideSpringAPos = drawing.children["CASE"].segments[10].point;
  sideSpringA.translate(sideSpringAPos.subtract(sideSpringA.lastSegment.point));
  sideSpringA.reverse();

  drawing.children["CASE"].removeSegments(10, 23);
  drawing.children["CASE"].insertSegments(10, sideSpringA.segments);

  drawing.children["CASE"].reverse();

  var spring = generateSpring(springP2);
  spring.translate(springLocation.subtract(spring.firstSegment.point));
  spring.translate(0, actualDisplacement);
  spring.name = "SPRING";

  drawing.addChild(spring);

  sideSpringA.remove();

  return drawing;
}

////////// case double

function generateCaseDouble(caseP, sliderP, sideP1, sideP2, springP) {
  
  var caseGroup = new paper.Group();

  // case /////////////////

  var caseBodyObj = generateCaseDoubleHalf(caseP, sliderP, sideP1, springP);
  var caseBodyObjB = generateCaseDoubleHalf(caseP, sliderP, sideP1, springP);

  var caseBody = caseBodyObj.caseBody;
  var springLocation = caseBodyObj.springLocation;
  var sliderLocation = caseBodyObj.sliderLocation;
  var neckLocation = caseBodyObj.neckLocation;

  var arm = caseBodyObj.arm;

  var caseBodyB = caseBodyObjB.caseBody;

  caseBodyObjB.arm.remove();

  //   caseBody.closePath();
  caseBodyB.scale(-1, 1, caseBody.firstSegment.point);

  var caseMaskA = caseBody.clone();
  caseMaskA.removeSegments(4, 17);
  var caseMaskB = caseBodyB.clone();
  caseMaskB.removeSegments(4, 17);

  caseBody.join(caseBodyB);
  caseMaskA.join(caseMaskB);

  var r = caseBody.bounds;
  var caseOuter = new paper.Path();
  caseOuter.add(new paper.Point(r.x, r.y + caseP.holeOffset / 2));
  caseOuter.arcBy(
    new paper.Point(caseP.holeOffset / 2, -caseP.holeOffset / 2),
    new paper.Point(caseP.holeOffset, 0)
  );
  caseOuter.lineBy(new paper.Point(r.width - caseP.holeOffset * 2, 0));
  caseOuter.arcBy(
    new paper.Point(caseP.holeOffset / 2, -caseP.holeOffset / 2),
    new paper.Point(caseP.holeOffset, 0)
  );
  caseOuter.lineBy(new paper.Point(0, r.height - caseP.holeOffset));
  caseOuter.arcBy(
    new paper.Point(-caseP.holeOffset / 2, caseP.holeOffset / 2),
    new paper.Point(-caseP.holeOffset, 0)
  );
  caseOuter.lineBy(new paper.Point(-r.width + caseP.holeOffset * 2, 0));
  caseOuter.arcBy(
    new paper.Point(-caseP.holeOffset / 2, caseP.holeOffset / 2),
    new paper.Point(-caseP.holeOffset, 0)
  );
  caseOuter.closePath();

  var c1 = new paper.Path.Circle(
    r.x + caseP.holeOffset / 2,
    r.y + caseP.holeOffset / 2,
    caseP.hole / 2
  );
  var c2 = new paper.Path.Circle(
    r.x + r.width - caseP.holeOffset / 2,
    r.y + caseP.holeOffset / 2,
    caseP.hole / 2
  );
  var c3 = new paper.Path.Circle(
    r.x + caseP.holeOffset / 2,
    r.y + r.height - caseP.holeOffset / 2,
    caseP.hole / 2
  );
  var c4 = new paper.Path.Circle(
    r.x + r.width - caseP.holeOffset / 2,
    r.y + r.height - caseP.holeOffset / 2,
    caseP.hole / 2
  );
    
  var p1 = caseOuter.subtract(c1);
  var p2 = p1.subtract(c2);
  var p3 = p2.subtract(c3);
  var p4 = p3.subtract(c4);
  
  caseOuter.remove();
  caseOuter = p4.clone();
  
  var a1 = caseMaskA.subtract(c1);
  var a2 = a1.subtract(c2);
  var a3 = a2.subtract(c3);
  var a4 = a3.subtract(c4);
  
  caseMaskA.remove();
  caseMaskA = a4.clone();
  
  c1.remove();
  c2.remove();
  c3.remove();
  c4.remove();
  p1.remove();
  p2.remove();
  p3.remove();
  p4.remove();
  a1.remove();
  a2.remove();
  a3.remove();
  a4.remove();

  caseOuter.name = "OUTER";
  caseBody.name = "CASE";
  caseMaskA.name = "MASK";

  caseGroup.addChild(caseBody);
  caseGroup.addChild(caseMaskA);
  caseGroup.addChild(caseOuter);

  // spring /////////////////

  var spring = generateSpring(springP);
  spring.translate(springLocation);

  spring.name = "SPRING";

  caseGroup.addChild(spring);

  // slider /////////////////
  
  var preloadBase = springP.enable ? sliderP.preloadBase : 0;

  var slider = new paper.Path();
  var arcMid = sliderP.fillet * Math.cos(Math.PI * 0.25);

  slider.add(
    sliderLocation.add(
      new paper.Point(0, -sliderP.fillet + preloadBase)
    )
  );
  slider.arcBy(
    new paper.Point(sliderP.fillet - arcMid, arcMid),
    new paper.Point(sliderP.fillet, sliderP.fillet)
  );

  slider.lineBy(
    new paper.Point(
      caseP.springWidth / 2 - sliderP.fillet - sliderP.tolerance,
      0
    )
  );

  var sliderB = new paper.Path();

  var sliderHead =
    caseP.holeOffset / 2 > sliderP.stopper
      ? caseP.holeOffset / 2
      : sliderP.stopper;

  sliderB.add(
    new paper.Point(
      slider.lastSegment.point.x,
      neckLocation.y - caseP.wall - sliderP.travel - sliderHead
    )
  );

  var sliderTop = sliderB.lastSegment.point;

  sliderB.add(
    new paper.Point(
      neckLocation.x - sliderP.stopper + sliderP.fillet,
      sliderTop.y
    )
  );
  sliderB.arcBy(
    new paper.Point(-arcMid, sliderP.fillet - arcMid),
    new paper.Point(-sliderP.fillet, sliderP.fillet)
  );
  sliderB.lineBy(new paper.Point(0, sliderHead - sliderP.fillet));
  sliderB.lineBy(new paper.Point(sliderP.stopper + sliderP.tolerance, 0));
  sliderB.lineBy(new paper.Point(0, sliderP.travel + caseP.wall));
  sliderB.lineBy(new paper.Point(-sliderP.stopper, 0));
  sliderB.lineBy(new paper.Point(0, caseP.topBuffer));

  slider.reverse();


  slider.lineBy(
    new paper.Point(0, -sliderP.base + sliderP.fillet - preloadBase)
  );
  slider.add(
    new paper.Point(sliderB.lastSegment.point.x, slider.lastSegment.point.y)
  );
  // slider.lineBy(new paper.Point(0, -caseP.baseBuffer));

  var d = slider.lastSegment.point.getDistance(sliderB.lastSegment.point);
  sliderB.lineBy(
    new paper.Point(0, d - sliderP.travel - caseP.topBuffer - caseP.baseBuffer)
  );

  // slider.closePath();

  var sliderBottomCopy = slider.clone();
  var sliderTopCopy = sliderB.clone();

  sliderBottomCopy.scale(-1, 1, slider.firstSegment.point);
  slider.join(sliderBottomCopy);

  sliderTopCopy.scale(-1, 1, sliderB.firstSegment.point);
  sliderB.join(sliderTopCopy);

  slider.name = "SLIDERBASE";
  sliderB.name = "SLIDERTOP";

  caseGroup.addChild(slider);
  caseGroup.addChild(sliderB);

  var profileRight = new paper.Path();
  profileRight.add(slider.firstSegment.point.add(new paper.Point(0, 0)));
  profileRight.lineBy(0, -caseP.baseBuffer);
  profileRight.lineBy(0, -sliderP.travel);
  profileRight.lineBy(0, -caseP.topBuffer);

  var profileLeft = new paper.Path();
  profileLeft.add(slider.lastSegment.point.add(new paper.Point(0, 0)));
  profileLeft.lineBy(0, -caseP.baseBuffer);
  profileLeft.lineBy(0, -sliderP.travel);
  profileLeft.lineBy(0, -caseP.topBuffer);

  profileLeft.name = "LEFT";
  profileRight.name = "RIGHT";

  caseGroup.addChild(profileLeft);
  caseGroup.addChild(profileRight);

  arm.name = "ARM";
  caseGroup.addChild(arm);

  var rect = caseBody.bounds;
  caseGroup.addChild(
    new paper.Path.Circle({
      name: "CIRCLE1",
      center: [rect.x + caseP.holeOffset / 2, rect.y + caseP.holeOffset / 2],
      radius: caseP.hole / 2
    })
  );

  caseGroup.addChild(
    new paper.Path.Circle({
      name: "CIRCLE2",
      center: [
        rect.x + rect.width - caseP.holeOffset / 2,
        rect.y + caseP.holeOffset / 2
      ],
      radius: caseP.hole / 2
    })
  );

  caseGroup.addChild(
    new paper.Path.Circle({
      name: "CIRCLE3",
      center: [
        rect.x + caseP.holeOffset / 2,
        rect.y + rect.height - caseP.holeOffset / 2
      ],
      radius: caseP.hole / 2
    })
  );

  caseGroup.addChild(
    new paper.Path.Circle({
      name: "CIRCLE4",
      center: [
        rect.x + rect.width - caseP.holeOffset / 2,
        rect.y + rect.height - caseP.holeOffset / 2
      ],
      radius: caseP.hole / 2
    })
  );

  caseGroup.position = new paper.Point(0, 0);
  
  return caseGroup;
}

function generateCaseDoubleHalf(caseP, sliderP, sideP, springP) {
  var caseBody = generateSideSpring(sideP);

  var arm = new paper.Path();
  arm.add(new paper.Point(sideP.ring / 2, -sideP.ring / 2));
  arm.add(caseBody.segments[4].point);
  arm.add(caseBody.segments[5].point);
  arm.add(caseBody.segments[6].point);
  arm.add(caseBody.segments[7].point);

  var start = caseBody.lastSegment.point;
  var tipPt = caseBody.segments[6].point;
  var tipHeight = 2.3;
  var totalArmLen = sideP.length + tipHeight + sideP.armThickness;

  caseBody.lineBy(new paper.Point(0, totalArmLen + caseP.sideSpringClearance));
  caseBody.add(
    new paper.Point(
      tipPt.x - sliderP.preloadSide - sliderP.maxDeflection,
      caseBody.lastSegment.point.y
    )
  );

  var springLocation = new paper.Point(
    caseBody.lastSegment.point.x + caseP.springWidth / 2 - springP.width / 2,
    caseBody.lastSegment.point.y + sliderP.base
  );
  var sliderLocation = caseBody.lastSegment.point.add(
    new paper.Point(sliderP.tolerance, sliderP.base)
  );

  if (springP.enable) {
    caseBody.lineBy(new paper.Point(0, sliderP.base + springP.height));
  } else {
    caseBody.lineBy(new paper.Point(0, sliderP.base + sliderP.travel));
  }

  caseBody.lineBy(new paper.Point(caseP.springWidth / 2, 0));

  caseBody.reverse();

  var r1 = sideP.ring / 2;
  var r2 = Math.pow(2 * Math.pow(r1, 2), 0.5);

  caseBody.arcBy(new paper.Point(-r2 + r1, -r1), new paper.Point(r1, -r1 - r2));

  caseBody.lineBy(new paper.Point(r1, 0));

  var d1 = sliderLocation.y - caseBody.lastSegment.point.y - sliderP.base;
  var travelBuffer = sliderP.travel + caseP.topBuffer + caseP.baseBuffer;
  if (d1 < travelBuffer) {
    caseBody.lineBy(new paper.Point(0, d1 - travelBuffer));
  }

  var innerY = caseBody.lastSegment.point.y;

  caseBody.add(
    new paper.Point(tipPt.x - sliderP.preloadSide + sliderP.stopper, innerY)
  );

  var neckLocation = caseBody.lastSegment.point;

  caseBody.lineBy(new paper.Point(0, -caseP.wall));
  caseBody.add(
    new paper.Point(
      -0.5 * caseP.wall - r2 + r1 + caseP.holeOffset,
      innerY - caseP.wall
    )
  );

  caseBody.arcBy(
    new paper.Point(-caseP.holeOffset / 2, -caseP.holeOffset / 2),
    new paper.Point(-caseP.holeOffset, 0)
  );

  // caseBody.arcBy(
  //   new paper.Point(-caseP.holeOffset / 2, caseP.holeOffset / 2),
  //   new paper.Point(0, caseP.holeOffset)
  // );

  var bottomY = caseBody.firstSegment.point.y;

  caseBody.lineBy(new paper.Point(0, bottomY - innerY + caseP.wall * 2));

  caseBody.arcBy(
    new paper.Point(caseP.holeOffset / 2, caseP.holeOffset / 2),
    new paper.Point(caseP.holeOffset, 0)
  );

  caseBody.add(
    new paper.Point(caseBody.firstSegment.point.x, caseBody.lastSegment.point.y)
  );

  return {
    caseBody: caseBody,
    arm: arm,
    springLocation: springLocation,
    sliderLocation: sliderLocation,
    neckLocation: neckLocation
  };
}

////////// case single

function generateCaseSingle(caseP, sliderP, sideP, springP) {
  var caseGroup = new paper.Group();

  // case /////////////////

  var caseBody = generateSideSpring(sideP);

  var arm = new paper.Path();
  arm.add(new paper.Point(sideP.ring / 2, -sideP.ring / 2));
  arm.add(caseBody.segments[4].point);
  arm.add(caseBody.segments[5].point);
  arm.add(caseBody.segments[6].point);
  arm.add(caseBody.segments[7].point);

  var start = caseBody.lastSegment.point;
  var tipPt = caseBody.segments[6].point;
  var tipHeight = 2.3;
  var totalArmLen = sideP.length + tipHeight + sideP.armThickness;

  caseBody.lineBy(new paper.Point(0, totalArmLen + caseP.sideSpringClearance));
  caseBody.lineBy(new paper.Point(sideP.armThickness, 0));

  if (springP.enable) {
    caseBody.lineBy(new paper.Point(0, sliderP.base + springP.height));
  } else {
    caseBody.lineBy(new paper.Point(0, sliderP.base + sliderP.travel));
  }

  var sHeight = springP.enable ? springP.height : sliderP.travel;

  var springLocation = new paper.Point(
    sideP.thickness +
      sideP.armThickness +
      0.5 * (caseP.springWidth - springP.width),
    caseBody.lastSegment.point.y - sHeight
  );
  var sliderLocation = new paper.Point(
    sideP.thickness + sideP.armThickness + sliderP.tolerance,
    caseBody.lastSegment.point.y - sHeight
  );

  caseBody.lineBy(new paper.Point(caseP.springWidth, 0));

  caseBody.reverse();

  var r1 = sideP.ring / 2;
  var r2 = Math.pow(2 * Math.pow(r1, 2), 0.5);

  caseBody.arcBy(new paper.Point(-r2 + r1, -r1), new paper.Point(r1, -r1 - r2));

  caseBody.lineBy(new paper.Point(r1, 0));

  var d1 = sliderLocation.y - caseBody.lastSegment.point.y - sliderP.base;
  var travelBuffer = sliderP.travel + caseP.topBuffer + caseP.baseBuffer;

  if (d1 < travelBuffer) {
    caseBody.lineBy(new paper.Point(0, d1 - travelBuffer));
  }

  var innerY = caseBody.lastSegment.point.y;

  caseBody.add(
    new paper.Point(tipPt.x - sliderP.preloadSide + sliderP.stopper, innerY)
  );

  var neckLocation = caseBody.lastSegment.point;

  caseBody.lineBy(new paper.Point(0, -caseP.wall));

  caseBody.add(
    new paper.Point(
      -0.5 * caseP.wall - r2 + r1 + caseP.holeOffset,
      innerY - caseP.wall
    )
  );

  caseBody.arcBy(
    new paper.Point(-caseP.holeOffset / 2, -caseP.holeOffset / 2),
    new paper.Point(-caseP.holeOffset, 0)
  );

  var bottomY = caseBody.firstSegment.point.y;

  caseBody.lineBy(new paper.Point(0, bottomY - innerY + caseP.wall * 2));

  caseBody.reverse();

  caseBody.lineBy(new paper.Point(0, -bottomY + innerY - caseP.wall));
  caseBody.arcBy(
    new paper.Point(caseP.holeOffset / 2, -caseP.holeOffset / 2),
    new paper.Point(caseP.holeOffset, 0)
  );
  caseBody.lineBy(new paper.Point(0, bottomY - innerY + caseP.wall * 2));

  caseBody.arcBy(
    new paper.Point(-caseP.holeOffset / 2, caseP.holeOffset / 2),
    new paper.Point(-caseP.holeOffset, 0)
  );

  caseBody.reverse();

  caseBody.arcBy(
    new paper.Point(caseP.holeOffset / 2, caseP.holeOffset / 2),
    new paper.Point(caseP.holeOffset, 0)
  );

  caseBody.reverse();

  caseBody.closePath();

  caseBody.name = "CASE";

  var r = caseBody.bounds;
  var caseOuter = new paper.Path();
  caseOuter.add(new paper.Point(r.x, r.y + caseP.holeOffset / 2));
  caseOuter.arcBy(
    new paper.Point(caseP.holeOffset / 2, -caseP.holeOffset / 2),
    new paper.Point(caseP.holeOffset, 0)
  );
  caseOuter.lineBy(new paper.Point(r.width - caseP.holeOffset * 2, 0));
  caseOuter.arcBy(
    new paper.Point(caseP.holeOffset / 2, -caseP.holeOffset / 2),
    new paper.Point(caseP.holeOffset, 0)
  );
  caseOuter.lineBy(new paper.Point(0, r.height - caseP.holeOffset));
  caseOuter.arcBy(
    new paper.Point(-caseP.holeOffset / 2, caseP.holeOffset / 2),
    new paper.Point(-caseP.holeOffset, 0)
  );
  caseOuter.lineBy(new paper.Point(-r.width + caseP.holeOffset * 2, 0));
  caseOuter.arcBy(
    new paper.Point(-caseP.holeOffset / 2, caseP.holeOffset / 2),
    new paper.Point(-caseP.holeOffset, 0)
  );
  caseOuter.closePath();
  
  var caseMaskA = caseBody.clone();
  caseMaskA.removeSegments(12, 25);

  var c1 = new paper.Path.Circle(
    r.x + caseP.holeOffset / 2,
    r.y + caseP.holeOffset / 2,
    caseP.hole / 2
  );
  var c2 = new paper.Path.Circle(
    r.x + r.width - caseP.holeOffset / 2,
    r.y + caseP.holeOffset / 2,
    caseP.hole / 2
  );
  var c3 = new paper.Path.Circle(
    r.x + caseP.holeOffset / 2,
    r.y + r.height - caseP.holeOffset / 2,
    caseP.hole / 2
  );
  var c4 = new paper.Path.Circle(
    r.x + r.width - caseP.holeOffset / 2,
    r.y + r.height - caseP.holeOffset / 2,
    caseP.hole / 2
  );
    
  var p1 = caseOuter.subtract(c1);
  var p2 = p1.subtract(c2);
  var p3 = p2.subtract(c3);
  var p4 = p3.subtract(c4);
  
  caseOuter.remove();
  caseOuter = p4.clone();
  
  var a1 = caseMaskA.subtract(c1);
  var a2 = a1.subtract(c2);
  var a3 = a2.subtract(c3);
  var a4 = a3.subtract(c4);
  
  caseMaskA.remove();
  caseMaskA = a4.clone();
  
  c1.remove();
  c2.remove();
  c3.remove();
  c4.remove();
  p1.remove();
  p2.remove();
  p3.remove();
  p4.remove();
  a1.remove();
  a2.remove();
  a3.remove();
  a4.remove();

  caseOuter.name = "OUTER";
  caseMaskA.name = "MASK";

  caseGroup.addChild(caseBody);
  caseGroup.addChild(caseMaskA);
  caseGroup.addChild(caseOuter);

  // spring /////////////////

  var spring = generateSpring(springP);
  spring.translate(springLocation);

  spring.name = "SPRING";

  caseGroup.addChild(spring);

  // slider /////////////////

  var slider = new paper.Path();
  var arcMid = sliderP.fillet * Math.cos(Math.PI * 0.25);

  var preloadBase = springP.enable ? sliderP.preloadBase : 0;

  slider.add(
    sliderLocation.add(new paper.Point(0, -sliderP.fillet + preloadBase))
  );
  slider.arcBy(
    new paper.Point(sliderP.fillet - arcMid, arcMid),
    new paper.Point(sliderP.fillet, sliderP.fillet)
  );

  slider.lineBy(
    new paper.Point(
      caseP.springWidth - sliderP.tolerance * 2 - sliderP.fillet * 2,
      0
    )
  );

  slider.arcBy(
    new paper.Point(arcMid, -sliderP.fillet + arcMid),
    new paper.Point(sliderP.fillet, -sliderP.fillet)
  );

  var sliderHead =
    caseP.holeOffset / 2 > sliderP.stopper
      ? caseP.holeOffset / 2
      : sliderP.stopper;

  slider.lineBy(
    new paper.Point(
      0,
      neckLocation.y -
        sliderLocation.y -
        caseP.wall -
        sliderP.travel -
        sliderHead +
        2 * sliderP.fillet -
        preloadBase
    )
  );

  slider.arcBy(
    new paper.Point(-sliderP.fillet + arcMid, -arcMid),
    new paper.Point(-sliderP.fillet, -sliderP.fillet)
  );

  var sliderTop = slider.lastSegment.point;

  slider.add(
    new paper.Point(
      neckLocation.x - sliderP.stopper + sliderP.fillet,
      sliderTop.y
    )
  );
  slider.arcBy(
    new paper.Point(-arcMid, sliderP.fillet - arcMid),
    new paper.Point(-sliderP.fillet, sliderP.fillet)
  );
  slider.lineBy(new paper.Point(0, sliderHead - sliderP.fillet));
  slider.lineBy(new paper.Point(sliderP.stopper, 0));
  slider.lineBy(new paper.Point(0, sliderP.travel + caseP.wall));
  slider.lineBy(new paper.Point(-sliderP.stopper, 0));
  slider.lineBy(new paper.Point(0, caseP.topBuffer));

  slider.reverse();
  slider.lineBy(
    new paper.Point(0, -sliderP.base + sliderP.fillet - preloadBase)
  );
  slider.add(
    new paper.Point(slider.firstSegment.point.x, slider.lastSegment.point.y)
  );

  slider.reverse();
  var d = slider.lastSegment.point.getDistance(slider.firstSegment.point);
  slider.lineBy(
    new paper.Point(0, d - sliderP.travel - caseP.baseBuffer - caseP.topBuffer)
  );

  slider.name = "SLIDER";
  caseGroup.addChild(slider);

  var profile = new paper.Path();
  profile.add(slider.firstSegment.point.add(new paper.Point(0, 0)));
  profile.lineBy(0, -caseP.baseBuffer);
  profile.lineBy(0, -sliderP.travel);
  profile.lineBy(0, -caseP.topBuffer);
  profile.name = "LEFT";
  caseGroup.addChild(profile);

  arm.name = "ARM";
  caseGroup.addChild(arm);

  var rect = caseBody.bounds;
  caseGroup.addChild(
    new paper.Path.Circle({
      name: "CIRCLE1",
      center: [rect.x + caseP.holeOffset / 2, rect.y + caseP.holeOffset / 2],
      radius: caseP.hole / 2
    })
  );

  caseGroup.addChild(
    new paper.Path.Circle({
      name: "CIRCLE2",
      center: [
        rect.x + rect.width - caseP.holeOffset / 2,
        rect.y + caseP.holeOffset / 2
      ],
      radius: caseP.hole / 2
    })
  );

  caseGroup.addChild(
    new paper.Path.Circle({
      name: "CIRCLE3",
      center: [
        rect.x + caseP.holeOffset / 2,
        rect.y + rect.height - caseP.holeOffset / 2
      ],
      radius: caseP.hole / 2
    })
  );

  caseGroup.addChild(
    new paper.Path.Circle({
      name: "CIRCLE4",
      center: [
        rect.x + rect.width - caseP.holeOffset / 2,
        rect.y + rect.height - caseP.holeOffset / 2
      ],
      radius: caseP.hole / 2
    })
  );

  caseGroup.position = new paper.Point(0, 0);

  return caseGroup;
}

////////// side spring

function generateSideSpring(param) {
  var t = param.thickness;
  var at = param.armThickness;
  var r = param.ring / 2;
  var r2 = r - t;

  var ringAngle = (param.angle / 180) * Math.PI;

  var tipHeight = 2.3;
  var tipArmAngle = Math.atan(tipHeight / param.length);
  var tipArmLen = Math.pow(
    Math.pow(tipHeight, 2) + Math.pow(param.length, 2),
    0.5
  );
  var angleDelta = Math.asin(param.throw / tipArmLen) - tipArmAngle;
  var angleComp = 0.5 * Math.PI - angleDelta;

  var spring = new paper.Path();

  spring.add(new paper.Point(0, 0));
  spring.add(new paper.Point(0, -r));

  spring.arcBy(
    new paper.Point(r, -r),
    new paper.Point(r + r * Math.sin(ringAngle), r * Math.cos(ringAngle))
  );

  var pivot = spring.lastSegment.point;

  var d1 = param.length - tipHeight;
  spring.add(
    new paper.Point(
      pivot.x + d1 * Math.sin(angleDelta),
      pivot.y + d1 * Math.cos(angleDelta)
    )
  );

  var tipBase = new paper.Point(
    param.length * Math.sin(angleDelta),
    param.length * Math.cos(angleDelta)
  );
  var tipVec = tipBase.add(
    new paper.Point(
      tipHeight * Math.cos(angleDelta),
      -tipHeight * Math.sin(angleDelta)
    )
  );

  spring.add(pivot.add(tipVec));

  var d2 = param.length + tipHeight;
  var tipEnd = new paper.Point(
    pivot.x + d2 * Math.sin(angleDelta),
    pivot.y + d2 * Math.cos(angleDelta)
  );

  var scaleCenter = spring.lastSegment.point;
  var tipEndVec = tipEnd.subtract(scaleCenter);
  tipEndVec = tipEndVec.multiply((tipHeight + at) / tipHeight);

  spring.add(scaleCenter.add(tipEndVec));

  var pivotThick = pivot.add(
    new paper.Point(-at * Math.sin(angleComp), at * Math.cos(angleComp))
  );
  var pivotThickSegment = new paper.Segment({
    point: [pivotThick.x, pivotThick.y],
    handleOut: [-t * Math.sin(angleDelta), -t * Math.cos(angleDelta)]
  });

  spring.add(pivotThickSegment);

  // deal with fillet here

  var arc = new paper.Path.Arc(
    new paper.Point(
      r + r2 * Math.sin(ringAngle),
      -r + r2 * Math.cos(ringAngle)
    ),
    new paper.Point(r, -r - r2),
    new paper.Point(r - r2, -r)
  );

  spring.addSegments(arc.segments);
  arc.remove();

  spring.add(new paper.Point(r - r2, 0));

  return spring;
}

////////// main spring

function generateSpring(param) {
  var w = param.width;
  var t = param.thickness;
  var inclineAngle = Math.atan((param.gap * 0.5) / (w - t * 2));
  var ythick = t * Math.cos(inclineAngle);
  var xthick = t * Math.sin(inclineAngle);
  var arcMid = t * Math.sin(0.25 * Math.PI);
  var leafHeight = param.gap + ythick * 2;
  var springHeight = param.count * leafHeight;
  var buffer = 0.5 * (param.height - springHeight);

  var spring = new paper.Path();

  // top buffer
  spring.add(new paper.Point(0, 0));
  spring.add(new paper.Point(w, 0));
  spring.add(new paper.Point(w, buffer));
  spring.add(new paper.Point(t, buffer));

  // spring right side
  for (var i = 0; i < param.count; i++) {
    var h1 = buffer + param.gap * 0.5 + i * leafHeight;
    var h2 = buffer + (i + 1) * leafHeight;
    var x1 = t - xthick;
    var x2 = w - t + xthick;
    // spring.add(new paper.Point(w - t + xthick, h1));
    var arc = new paper.Path.Arc(
      new paper.Point(x2, h1),
      new paper.Point(w, h1 + ythick),
      new paper.Point(x2, h1 + 2 * ythick)
    );
    spring.addSegments(arc.segments);
    arc.remove();

    spring.add(new paper.Point(x1, h2));
  }

  // bottom buffer
  spring.add(new paper.Point(w, buffer + springHeight));
  spring.add(new paper.Point(w, 2 * buffer + springHeight));
  spring.add(new paper.Point(0, 2 * buffer + springHeight));

  // spring left side
  for (var i = 0; i < param.count; i++) {
    var h1 = buffer + (param.count - i) * leafHeight;
    var h2 = buffer + (param.count - i) * leafHeight - arcMid;
    var h3 = buffer + (param.count - i) * leafHeight - ythick;
    var h4 = buffer + (param.count - i - 0.5) * leafHeight;
    var h5 = buffer + (param.count - i - 1) * leafHeight;
    var x1 = t - arcMid;
    var x2 = t - xthick;

    var arc1 = new paper.Path.Arc(
      new paper.Point(0, h1),
      new paper.Point(x1, h2),
      new paper.Point(x2, h3)
    );

    spring.addSegments(arc1.segments);
    arc1.remove();

    spring.add(new paper.Point(w - t, h4));

    var arc2 = new paper.Path.Arc(
      new paper.Point(x2, h5 + ythick),
      new paper.Point(x1, h5 + arcMid),
      new paper.Point(0, h5)
    );

    spring.addSegments(arc2.segments);
    arc2.remove();
  }

  spring.closePath();

  return spring;
}
