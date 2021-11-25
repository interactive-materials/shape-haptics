const DISPLACEMENT_DENSITY = 5;

const SPRING_SAMPLING_DENSITY = 251;

const SPRING_SAMPLING_SUBDENSITY = 4;

const CONTACT_TOLERANCE = 0.005;

const INIT_ITERATION = 10;

const SCALE_UP = 100;

const SIDE_PARAM = {
  thickness: 1.2,
  armThickness: 1.5,
  length: 13,
  throw: 7,
  angle: 20,
  ring: 6
};

const SPRING_PARAM = {
  enable: true,
  height: 28,
  gap: 4,
  thickness: 1.4,
  width: 20,
  count: 3
};

const CASE_PARAM = {
  sideSpringClearance: 1.0,
  springWidth: 22,
  wall: 4,
  topBuffer: 2,
  baseBuffer: 4.5,
  hole: 2.0,
  holeOffset: 7.0
};

const SLIDER_PARAM = {
  base: 4.0,
  travel: 10.0,
  preloadSide: 1.0,
  preloadBase: 1.0,
  stopper: 3,
  fillet: 1.5,
  tolerance: 0.1,
  maxDeflection: 4.0
};

class HapticProject {
  constructor(_name, _sides, _caseP, _sliderP, _springP, _sideSpringP) {
    this.name = _name;

    this.updateDisplay = true;
    this.updateGallery = false;

    this.parameters = {
      case: _caseP,
      slider: _sliderP,
      spring: _springP,
      side: _sideSpringP
    };

    this.sides = _sides;

    this.fdData = [];

    this.drawingBase = undefined;
    this.drawingView = undefined;
    this.drawingFab = undefined;

    this.profile = {
      left: new HapticProfile(this, "LEFT"),
      right:
        this.sides === "DOUBLE" ? new HapticProfile(this, "RIGHT") : undefined
    };

    this.updateBase();

    this.updateView(0);
  }

  initFD() {
    this.fdData = [];
    for (var i in this.profile) {
      if (this.profile[i]) this.profile[i].fdData = [];
    }

    var count = this.parameters.slider.travel * DISPLACEMENT_DENSITY;
    for (var i = 0; i <= count; i++) {
      this.fdData.push({
        d: i * (1 / DISPLACEMENT_DENSITY),
        force: 0,
        forceReverse: 0,
        springForce: 0
      });

      for (var j in this.profile) {
        if (this.profile[j])
          this.profile[j].fdData.push({
            d: i * (1 / DISPLACEMENT_DENSITY),
            angle: 0,
            deflection: 0,
            ratioForce: 0,
            ratioFriction: 0,
            ratioFrictionUp: 0,
            offset: 0,
            force: 0,
            friction: 0
          });
      }
    }
  }

  updateFD(index, pos) {
    if (index < this.fdData.length) {
      var springCoeff = calcSpringGradient(
        this.parameters.spring.width,
        this.parameters.spring.thickness
      ); // FORMULA FOR MAIN SPRING COEFF HERE
      this.fdData[index].springForce =
        (this.fdData[index].d + this.parameters.slider.preloadBase) *
        springCoeff;

      var tempForce = this.parameters.spring.enable
        ? this.fdData[index].springForce
        : 0;

      var tempForceReverse = this.parameters.spring.enable
        ? this.fdData[index].springForce
        : 0;

      for (var i in this.profile) {
        if (this.profile[i]) {
          if (this.profile[i].type !== "SYMMETRICAL") {
            this.profile[i].updateProfile(pos);
            this.profile[i].calcForce(index, CONTACT_TOLERANCE * SCALE_UP);

            var sideCoeff = calcSideGradient(this.parameters.side.thickness);

            var frictionCoeff = FRICTION_COEFFICIENT;
            var sideForce =
              sideCoeff * this.profile[i].fdData[index].deflection;

            var avgArr = [];
            for (var j = -1; j <= 1; j++) {
              if (this.profile[i].fdData[index + j]) {
                avgArr.push(this.profile[i].fdData[index + j]);
              }
            }

            var ratioAvgForce =
              avgArr.map(v => v.ratioForce).reduce((acc, v) => acc + v) /
              avgArr.length;
            var ratioAvgFriction =
              avgArr.map(v => v.ratioFriction).reduce((acc, v) => acc + v) /
              avgArr.length;
            var ratioAvgFrictionUp =
              avgArr.map(v => v.ratioFrictionUp).reduce((acc, v) => acc + v) /
              avgArr.length;

            this.profile[i].fdData[index].force = sideForce * ratioAvgForce;

            this.profile[i].fdData[index].friction =
              sideForce * ratioAvgFriction * frictionCoeff;

            tempForce += this.profile[i].fdData[index].force;
            tempForce += this.profile[i].fdData[index].friction;

            tempForceReverse += this.profile[i].fdData[index].force;
            tempForceReverse -= this.profile[i].fdData[index].friction;

            var springFrictionRev =
              this.fdData[index].springForce *
              ratioAvgFrictionUp *
              frictionCoeff;

            // tempForceReverse -= this.parameters.spring.enable
            //   ? springFrictionRev
            //   : 0;
          }
        }
      }

      if (this.profile.left && this.profile.right) {
        var follower;
        var profile;
        if (this.profile.left.type === "SYMMETRICAL") {
          var follower = this.profile.left;
          var profile = this.profile.right;
          this.profile.left.fdData[index] = {...this.profile.right.fdData[index]};
        } else if (this.profile.right.type === "SYMMETRICAL") {
          var follower = this.profile.right;
          var profile = this.profile.left;
          this.profile.right.fdData[index] = {...this.profile.left.fdData[index]};
        }

        if (follower && profile) {
          follower.fdData[index].force = profile.fdData[index].force;
          follower.fdData[index].friction = profile.fdData[index].friction;

          tempForce += follower.fdData[index].force;
          tempForce += follower.fdData[index].friction;

          tempForceReverse += follower.fdData[index].force;
          tempForceReverse -= follower.fdData[index].friction;

          var springFrictionRev =
            this.fdData[index].springForce * ratioAvgFrictionUp * frictionCoeff;

          // tempForceReverse -= this.parameters.spring.enable
          //   ? springFrictionRev
          //   : 0;
        }
      }

      this.fdData[index].force = tempForce;
      this.fdData[index].forceReverse = tempForceReverse;
      this.updateGallery = true;
    }
  }

  smoothFD() {
    this.fdData.forEach((d, index) => {
      var springCoeff = calcSpringGradient(
        this.parameters.spring.width,
        this.parameters.spring.thickness
      ); // FORMULA FOR MAIN SPRING COEFF HERE
      this.fdData[index].springForce =
        (this.fdData[index].d + this.parameters.slider.preloadBase) *
        springCoeff;

      var tempForce = this.parameters.spring.enable
        ? this.fdData[index].springForce
        : 0;

      var tempForceReverse = this.parameters.spring.enable
        ? this.fdData[index].springForce
        : 0;

      for (var i in this.profile) {
        if (this.profile[i]) {
          var sideCoeff = calcSideGradient(this.parameters.side.thickness);
          var frictionCoeff = FRICTION_COEFFICIENT;
          var sideForce = sideCoeff * this.profile[i].fdData[index].deflection;

          var avgArr = [];
          for (var j = -1; j <= 1; j++) {
            if (this.profile[i].fdData[index + j]) {
              avgArr.push(this.profile[i].fdData[index + j]);
            }
          }

          var ratioAvgForce =
            avgArr.map(v => v.ratioForce).reduce((acc, v) => acc + v) /
            avgArr.length;
          var ratioAvgFriction =
            avgArr.map(v => v.ratioFriction).reduce((acc, v) => acc + v) /
            avgArr.length;
          var ratioAvgFrictionUp =
            avgArr.map(v => v.ratioFrictionUp).reduce((acc, v) => acc + v) /
            avgArr.length;

          this.profile[i].fdData[index].force = sideForce * ratioAvgForce;

          this.profile[i].fdData[index].friction =
            sideForce * ratioAvgFriction * frictionCoeff;

          tempForce += this.profile[i].fdData[index].force;
          tempForce += this.profile[i].fdData[index].friction;

          tempForceReverse += this.profile[i].fdData[index].force;
          tempForceReverse -= this.profile[i].fdData[index].friction;

          var springFrictionRev =
            this.fdData[index].springForce * ratioAvgFrictionUp * frictionCoeff;
          // tempForceReverse -= this.parameters.spring.enable
          //   ? springFrictionRev
          //   : 0;
        }
      }

      if (this.fdData[index].force !== tempForce) {
        this.fdData[index].force = tempForce;
        this.fdData[index].forceReverse = tempForceReverse;
        this.updateGallery = true;
      }
    });
  }

  updateBase() {
    if (this.drawingBase) this.drawingBase.remove();
    switch (this.sides) {
      case "SINGLE":
        this.drawingBase = generateCaseSingle(
          this.parameters.case,
          this.parameters.slider,
          this.parameters.side,
          this.parameters.spring
        );
        break;
      case "DOUBLE":
        this.drawingBase = generateCaseDouble(
          this.parameters.case,
          this.parameters.slider,
          this.parameters.side,
          this.parameters.side,
          this.parameters.spring
        );
        break;
    }

    for (var i in this.profile) {
      if (this.profile[i]) this.profile[i].updateBase();
    }

    if (!this.parameters.spring.enable)
      this.drawingBase.children["SPRING"].remove();

    this.initFD();

    this.updateDisplay = true;
    this.updateGallery = true;
  }

  updateView(i) {
    if (this.drawingView) this.drawingView.remove();

    switch (this.sides) {
      case "SINGLE":
        this.drawingView = generateViewCaseSingle(
          this.parameters.case,
          this.parameters.slider,
          this.parameters.side,
          this.parameters.spring,
          this.fdData.length > 0 ? this.profile.left.fdData[i].angle : 0,
          this.fdData.length > 0 ? this.fdData[i].d : 0
        );

        break;
      case "DOUBLE":
        this.drawingView = generateViewCaseDouble(
          this.parameters.case,
          this.parameters.slider,
          this.parameters.side,
          this.parameters.spring,
          this.profile.left ? this.profile.left.fdData[i].angle : 0,
          this.profile.right ? this.profile.right.fdData[i].angle : 0,
          this.fdData.length > 0 ? this.fdData[i].d : 0
        );
        break;
    }

    for (var s in this.profile) {
      if (this.profile[s]) {
        if (this.profile[s].active) {
          var p = this.profile[s];
          if (p.base) p.base.strokeWidth = 0;
          if (p.create) p.create.strokeWidth = 0;
          if (p.active) p.active.strokeWidth = 0;
          // p.updateProfile(i);
          // p.setActiveProfile();

          if (this.profile[s].activeView) this.profile[s].activeView.remove();
          this.profile[s].activeView = this.profile[s].active.clone();
          this.profile[s].activeView.translate(0, this.fdData[i].d);
          this.drawingView.addChild(this.profile[s].activeView);
          this.profile[s].updateProfile(i);
        }
      }
    }

    this.drawingBase.strokeWidth = 0;

    // for (var j in this.profile) {
    //   if (this.profile[j]) {
    //     var p = this.profile[j];
    //     if (p.base) p.base.strokeWidth = 0;
    //     if (p.create) p.create.strokeWidth = 0;
    //     if (p.active) p.active.strokeWidth = 0;
    //     this.profile[j].updateProfile(i);
    //   }
    // }

    this.drawingView.strokeColor = "rgba(0, 0, 0, 1)";
    this.drawingView.strokeWidth = 1 / MIN_ZOOM;
    this.drawingView.strokeCap = "round";
    this.drawingView.strokeJoin = "round";

    if (this.drawingFab) this.drawingFab.remove();

    this.drawingFab = this.drawingView.clone();
    this.drawingFab.children["CASE 1"].remove();
    this.drawingFab.children["SPRING 1"].remove();
    this.drawingFab.addChild(this.drawingBase.children["CASE"].clone());
    if (this.parameters.spring.enable)
      this.drawingFab.addChild(this.drawingBase.children["SPRING"].clone());
    this.drawingFab.addChild(this.drawingBase.children["OUTER"].clone());
    this.drawingFab.addChild(this.drawingBase.children["MASK"].clone());

    var rect = this.drawingFab.bounds;
    if (this.parameters.spring.enable)
      this.drawingFab.children["SPRING 1"].translate(rect.width * 1.1, 0);
    this.drawingFab.children["CASE 1"].translate(rect.width * 2.2, 0);
    this.drawingFab.children["CIRCLE1 1"].translate(rect.width * 2.2, 0);
    this.drawingFab.children["CIRCLE2 1"].translate(rect.width * 2.2, 0);
    this.drawingFab.children["CIRCLE3 1"].translate(rect.width * 2.2, 0);
    this.drawingFab.children["CIRCLE4 1"].translate(rect.width * 2.2, 0);
    this.drawingFab.children["MASK 1"].translate(rect.width * 3.3, 0);
    this.drawingFab.children["OUTER 1"].translate(rect.width * 4.4, 0);
    var fabPos = new paper.Point(rect.x, rect.y);
    this.drawingFab.translate(origin.subtract(fabPos));
    this.drawingFab.strokeWidth = 0;

    if (!this.parameters.spring.enable)
      this.drawingView.children["SPRING"].remove();

    this.updateDisplay = false;
  }
}

class HapticProfile {
  constructor(_parent, _side) {
    this.parent = _parent;
    this.side = _side;
    this.base;

    this.import;
    this.create;
    this.createView;
    this.active;
    this.activeView;
    this.symmetrical;

    this.type;

    this.fdData = [];
  }

  updateBase() {
    this.base = this.parent.drawingBase.children[this.side];
    var spine = this.base.firstSegment.point.getDistance(
      this.base.lastSegment.point
    );
    var arr = [
      this.import,
      this.create,
      this.createView,
      this.active,
      this.activeView
    ];

    arr.forEach(p => {
      if (p) {
        var oldSpine = p.firstSegment.point.getDistance(p.lastSegment.point);
        p.scale(1, spine / oldSpine, p.firstSegment.point);
        p.translate(
          this.base.firstSegment.point.subtract(p.firstSegment.point)
        );
      }
    });
  }

  updateWidth(w) {
    var rect = this.active.bounds;
    var currW =
      this.side === "LEFT"
        ? this.active.firstSegment.point.x - rect.x
        : rect.width - this.active.firstSegment.point.x + rect.x;
    if (currW > 0) {
      switch (this.type) {
        case "IMPORT":
          this.import.scale(w / currW, 1, this.import.firstSegment.point);
          break;
        case "CREATE":
          this.create.scale(w / currW, 1, this.create.firstSegment.point);
          break;
      }
      this.setActiveProfile();
      this.parent.updateGallery = true;
    }
  }

  get profileWidth() {
    if (this.active) {
      var rect = this.active.bounds;
      var currW =
        this.side === "LEFT"
          ? this.active.firstSegment.point.x - rect.x
          : rect.width - this.active.firstSegment.point.x + rect.x;
      return currW;
    }
    return undefined;
  }

  updateProfile(i) {
    switch (this.type) {
      case "CREATE":
        var t = new paper.Point(
          0,
          this.fdData[i].d -
            (this.createView.firstSegment.point.y -
              this.base.firstSegment.point.y)
        );
        this.createView.translate(t);
        this.createView.strokeColor = "rgba(0, 0, 0, 1)";
        this.createView.strokeWidth = 0.1;

        this.create.remove();
        this.create = new paper.Path([...this.createView.segments]);
        this.create.translate(
          t.x,
          this.base.firstSegment.point.y - this.create.firstSegment.point.y
        );
        this.create.selected = false;
        this.create.strokeWidth = 0;
        this.active = this.create;
        break;
      case "SYMMETRICAL":
        this.setActiveProfile();
        if (this.createView) {
          this.createView.selected = false;
          this.createView.remove();
        }
        break;
      default:
        if (this.createView) {
          this.createView.selected = false;
          this.createView.remove();
        }
        break;
    }
  }

  setImport(path) {
    if (this.import) this.import.remove();
    this.import = path;
  }

  setActiveType(type) {
    this.type = type;
    this.setActiveProfile();
  }

  setActiveProfile() {
    switch (this.type) {
      case "IMPORT":
        this.active = this.import ? this.import : undefined;
        break;
      case "CREATE":
        if (this.create) {
          this.active = this.create;
          if (this.createView) this.createView.remove();
          this.createView = this.create.clone();
        } else {
          this.create = this.base.clone();
          this.createView = this.create.clone();
          this.active = this.create;
        }
        this.createView.selected = true;
        break;
      case "SYMMETRICAL":
        var path =
          this.parent.sides === "DOUBLE"
            ? this.side === "LEFT"
              ? this.parent.profile.right.active
              : this.parent.profile.left.active
            : undefined;
        if (path) {
          path = path.clone();
          path = path.translate(
            this.base.firstSegment.point.subtract(path.firstSegment.point)
          );
          path = path.scale(-1, 1, path.firstSegment.point);
        }
        this.active = path ? path : undefined;
        break;
    }
  }

  calcForce(i, tolerance) {
    if (this.active) {
      i = Math.floor(i);
      if (i < this.fdData.length) {
        var path = this.active.clone();
        if (this.side === "RIGHT") {
          path = path.translate(
            this.parent.profile.left.base.firstSegment.point.subtract(
              path.firstSegment.point
            )
          );
          path = path.scale(-1, 1, path.firstSegment.point);
        }

        var replacementSegments = [];
        path.segments.forEach((s, i, arr) => {
          if (i === 0 || i === arr.length - 1) {
            replacementSegments.push(s);
          } else if (i > 0 && i < arr.length - 1) {
            var os = path.getOffsetOf(s.point);
            var osNext = path.getOffsetOf(arr[i + 1].point);
            var os1 = os - 1.5 / DISPLACEMENT_DENSITY;
            var os2 = os + 1.5 / DISPLACEMENT_DENSITY;
            if (os1 > 0 && os2 < osNext) {
              var p1 = path.getPointAt(os1);
              var p2 = path.getPointAt(os2);
              var tan1 = path
                .getTangentAt(os1)
                .normalize(0.7 / DISPLACEMENT_DENSITY);
              var tan2 = path
                .getTangentAt(os2)
                .normalize(0.7 / DISPLACEMENT_DENSITY);
              tan2 = tan2.rotate(180);

              var tempPath1 = path.clone();
              var tempPath2 = path.clone();
              tempPath1.divideAt(os1);
              tempPath2.divideAt(os2);

              var s1 = tempPath1.segments[i];
              var s2 = tempPath2.segments[i + 1];

              s1.handleOut = tan1;
              s2.handleIn = tan2;

              replacementSegments.push(s1);
              replacementSegments.push(s2);

              tempPath1.remove();
              tempPath2.remove();
            } else {
              replacementSegments.push(s);
            }
          }
        });

        path.segments = [...replacementSegments];

        var pathClosed = path.clone();
        pathClosed.lineBy(100, 0);
        pathClosed.reverse();
        pathClosed.lineBy(100, 0);
        pathClosed.reverse();
        pathClosed.closePath();

        path.translate(0, this.fdData[i].d);

        pathClosed.translate(0, this.fdData[i].d);

        var arm = this.parent.drawingBase.children["ARM"].clone();
        var pivot = arm.firstSegment.point;

        arm.scale(SCALE_UP, pivot);
        path.scale(SCALE_UP, pivot);
        pathClosed.scale(SCALE_UP, pivot);

        var tip = new paper.Path([
          arm.segments[2].point,
          arm.segments[3].point,
          arm.segments[4].point
        ]);

        var tipPtArr = [];

        for (var j = 0; j <= SPRING_SAMPLING_DENSITY; j++) {
          var offset = j * (tip.length / SPRING_SAMPLING_DENSITY);
          tipPtArr.push(tip.getPointAt(offset));
        }

        var contactPoint = this.calcContact(
          i,
          tolerance,
          0,
          pivot,
          tipPtArr,
          path,
          pathClosed,
          0,
          this.parent.parameters.side.angle
        );

        switch (contactPoint.type) {
          case "contact":
            if (contactPoint.springAngle !== this.fdData[i].angle)
              this.parent.updateDisplay = true;

            var armVectorInit = new paper.Point(
              arm.lastSegment.point.subtract(arm.firstSegment.point)
            );
            var armVector = armVectorInit.rotate(
              contactPoint.springAngle,
              new paper.Point(0, 0)
            );
            var armVectorN = armVector.rotate(-90);
            var angleBetween = armVectorN.getDirectedAngle(contactPoint.normal);
            var profileRatio = Math.abs(
              Math.cos((angleBetween * Math.PI) / 180)
            );
            var yRatio = contactPoint.normal.y / contactPoint.normal.length;
            var frictionRatio = Math.abs(
              contactPoint.tangent.y / contactPoint.tangent.length
            );

            this.fdData[i].angle = contactPoint.springAngle;
            this.fdData[i].deflection =
              Math.abs(armVector.x - armVectorInit.x) / SCALE_UP;

            this.fdData[i].ratioForce = yRatio * profileRatio;
            this.fdData[i].ratioFriction = frictionRatio * profileRatio;

            var angleFriction = contactPoint.tangent.getDirectedAngle(
              new paper.Point(0, -1)
            );
            var frictionRatioUp =
              angleFriction < 0 && Math.abs(angleFriction) > 0.1
                ? -Math.cos((angleFriction / 180) * Math.PI) *
                  contactPoint.tangent.y
                : 0;
            this.fdData[i].ratioFrictionUp = frictionRatioUp;

            break;

          case "no contact":
            this.fdData[i].angle = 0;
            this.fdData[i].deflection = 0;
            this.fdData[i].ratioForce = 0;
            this.fdData[i].ratioFriction = 0;
            this.fdData[i].ratioFrictionUp = 0;
            break;
        }

        // path.scale(1 / SCALE_UP, pivot);
        // if (i === 0) {
        //   path.selected = true;
        // }

        path.remove();
        pathClosed.remove();
        arm.remove();
        tip.remove();
      }
    }
  }

  calcContact(
    i,
    tolerance,
    count,
    pivot,
    tipPtArr,
    path,
    pathClosed,
    angleStart,
    angleEnd
  ) {
    var tipCullNull = tipPtArr.filter(p => p !== null);
    var tipStart = tipCullNull.map(p => p.rotate(angleStart, pivot));
    var angleMiddle = (angleStart + angleEnd) / 2;
    var tipMiddle = tipCullNull.map(p => p.rotate(angleMiddle, pivot));
    var tipEnd = tipCullNull.map(p => p.rotate(angleEnd, pivot));

    var iterate = false;

    var containsStart = false;
    var containsMiddle = false;
    var containsEnd = false;

    tipStart.forEach((p, k, arr) => {
      if (k === arr.length - 1 || k % SPRING_SAMPLING_SUBDENSITY === 0) {
        if (pathClosed.contains(p)) {
          containsStart = true;
        }
      }
    });

    tipMiddle.forEach((p, k, arr) => {
      if (k === arr.length - 1 || k % SPRING_SAMPLING_SUBDENSITY === 0) {
        if (pathClosed.contains(p)) {
          containsMiddle = true;
        }
      }
    });

    tipEnd.forEach((p, k, arr) => {
      if (k === arr.length - 1 || k % SPRING_SAMPLING_SUBDENSITY === 0) {
        if (pathClosed.contains(p)) {
          containsEnd = true;
        }
      }
    });

    if (containsStart && containsMiddle && containsEnd) {
      return { offset: undefined, type: "exceed" };
    } else if (!containsStart && !containsMiddle && !containsEnd) {
      return { offset: undefined, type: "no contact" };
    } else {
      var aS, aE;
      var tip;
      if (containsStart && !containsMiddle) {
        tip = tipMiddle.map(p => p);
        aS = angleStart;
        aE = angleMiddle;
      } else if (containsMiddle && !containsEnd) {
        tip = tipEnd.map(p => p);
        aS = angleMiddle;
        aE = angleEnd;
      }

      if (count > INIT_ITERATION) {
        for (let p of tip) {
          var pt = path.getNearestPoint(p);
          if (pt.getDistance(p) < tolerance) {
            var os = path.getOffsetOf(pt);
            var nor = path.getNormalAt(os).normalize();
            var tan = path.getTangentAt(os).normalize();

            return {
              point: pt,
              offset: os,
              normal: nor,
              tangent: tan,
              springAngle: aS,
              type: "contact"
            };
          }
        }

        iterate = true;
        //         var cpArr = tip.map(p => {
        //           var pt = path.getNearestPoint(p);
        //           return { point: pt, distance: pt.getDistance(p) };
        //         });

        //         cpArr.sort((a, b) => a.distance - b.distance);

        //         if (cpArr[0].distance < tolerance) {
        //           var cpt = cpArr[0].point;
        //           var os = path.getOffsetOf(cpt);
        //           var nor = path.getNormalAt(os).normalize();
        //           var tan = path.getTangentAt(os).normalize();

        //           return {
        //             point: cpt,
        //             offset: os,
        //             normal: nor,
        //             tangent: tan,
        //             springAngle: aS,
        //             type: "contact"
        //           };
        //         } else iterate = true;
      } else iterate = true;
    }

    if (iterate) {
      count++;
      return this.calcContact(
        i,
        tolerance,
        count,
        pivot,
        tipPtArr,
        path,
        pathClosed,
        aS,
        aE
      );
    }
  }
}
