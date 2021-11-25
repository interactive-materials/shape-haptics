///////
///////
// CREATE
///////
///////

var createMode = "";
var dragging = false;

var createHistory = [];
var undoIndex = undefined;
var createChange = {};

var hoTolerance = 6;
var hitOptions = {
  segments: true,
  stroke: true,
  handles: true,
  tolerance: hoTolerance
};

var hitOptionsDrag = {
  segments: true,
  handles: true,
  stroke: true,
  tolerance: hoTolerance
};

function updateHOTolerance() {
  var val = hoTolerance / Math.pow(paper.view.zoom, 0.8);
  hitOptions.tolerance = val;
  hitOptionsDrag.tolerance = val;
}

var tool = new paper.Tool();

function clearLeftHistory() {
  if (undoIndex !== undefined) {
    createHistory.splice(undoIndex, createHistory.length - undoIndex - 1);
  }
  for (var s of createHistory) {
    s.left = undefined;
    if (s.left === undefined && s.right === undefined) {
      s.remove = true;
    }
  }
  createHistory = createHistory.filter(s => !s.remove);
}

function clearRightHistory() {
  if (undoIndex !== undefined) {
    createHistory.splice(undoIndex, createHistory.length - undoIndex - 1);
  }
  for (var s of createHistory) {
    s.right = undefined;
    if (s.left === undefined && s.right === undefined) {
      s.remove = true;
    }
  }
  createHistory = createHistory.filter(s => !s.remove);
}

function clearHistory() {
  createHistory = [];
  undoIndex = undefined;
}

tool.onMouseUp = function(event) {
  if (activeProject) {
    var change = false;

    var hitResult;
    if (activeProject.profile.left) {
      if (activeProject.profile.left.type === "CREATE") {
        if (
          activeProject.profile.left.createView.segments.length !==
          createChange.left.length
        ) {
          change = true;
        } else {
          var counter = 0;
          for (var s of activeProject.profile.left.createView.segments) {
            var cs = createChange.left[counter];
            if (
              s.point.x !== cs.point.x ||
              s.point.y !== cs.point.y ||
              s.handleIn.x !== cs.handleIn.x ||
              s.handleIn.y !== cs.handleIn.y ||
              s.handleOut.x !== cs.handleOut.x ||
              s.handleOut.y !== cs.handleOut.y
            ) {
              change = true;
            }
            counter++;
          }
        }

        hitResult = activeProject.profile.left.createView.hitTest(
          event.point,
          hitOptions
        );
      }
    }

    if (activeProject.profile.right && !hitResult) {
      if (activeProject.profile.right.type === "CREATE") {
        if (
          activeProject.profile.right.createView.segments.length !==
          createChange.right.length
        ) {
          change = true;
        } else {
          var counter = 0;
          for (var s of activeProject.profile.right.createView.segments) {
            var cs = createChange.right[counter];
            if (
              s.point.x !== cs.point.x ||
              s.point.y !== cs.point.y ||
              s.handleIn.x !== cs.handleIn.x ||
              s.handleIn.y !== cs.handleIn.y ||
              s.handleOut.x !== cs.handleOut.x ||
              s.handleOut.y !== cs.handleOut.y
            ) {
              change = true;
            }
            counter++;
          }
        }

        hitResult = activeProject.profile.right.createView.hitTest(
          event.point,
          hitOptions
        );
      }
    }

    if (change) {
      createChange = {
        left: undefined,
        right: undefined,
        d: +travelSlider.value,
        remove: false
      };

      if (activeProject.profile.left) {
        if (activeProject.profile.left.type === "CREATE") {
          createChange.left = activeProject.profile.left.createView.segments.map(
            s => s.clone()
          );
        }
      }

      if (activeProject.profile.right) {
        if (activeProject.profile.right.type === "CREATE") {
          createChange.right = activeProject.profile.right.createView.segments.map(
            s => s.clone()
          );
        }
      }
      
      if (!undoIndex) {
        createHistory.push(createChange);
      } else {
        createHistory.splice(undoIndex + 1, createHistory.length - undoIndex);
        createHistory.push(createChange);
        undoIndex = undefined;
      }
    }

    if (!hitResult) return;

    if (hitResult) {
      switch (createMode) {
        case "move":
          if (hitResult.type === "segment") {
            if (
              hitResult.segment.index === 0 ||
              hitResult.segment.index === hitResult.item.segments.length - 1
            ) {
            } else {
              if (!shiftDown && !dragging) {
                clearSelectedPoints();
                hitResult.segment.selected = true;
              }
            }
          }
          break;
        case "edit":
          if (clearSegment && !selectedSegment) {
            clearSegment.handleIn = new paper.Point(0, 0);
            clearSegment.handleOut = new paper.Point(0, 0);
          }
          break;
      }
    }

    activeProject.updateGallery = true;
  }
  dragging = false;
  // draggingHandle = false;
  selectedHandle = undefined;
  selectedSegment = undefined;
  clearSegment = undefined;
  moveSegment = undefined;
  mightBeSingle = false;
};

var selectedHandle;
var selectedSegment;
var clearSegment;
var moveSegment;
var mightBeSingle;

function clearSelectedPoints() {
  if (activeProject.profile.left) {
    if (activeProject.profile.left.createView) {
      activeProject.profile.left.createView.segments.forEach(s => {
        s.selected = false;
      });
    }
  }
  if (activeProject.profile.right) {
    if (activeProject.profile.right.createView) {
      activeProject.profile.right.createView.segments.forEach(s => {
        s.selected = false;
      });
    }
  }
}

tool.onMouseDown = function(event) {
  if (activeProject) {
    var hitResult;

    createChange = {
      left: undefined,
      right: undefined,
      d: +travelSlider.value,
      remove: false
    };

    if (activeProject.profile.left) {
      if (activeProject.profile.left.type === "CREATE") {
        createChange.left = activeProject.profile.left.createView.segments.map(
          s => s.clone()
        );
        hitResult = activeProject.profile.left.createView.hitTest(
          event.point,
          hitOptions
        );
      }
    }

    if (activeProject.profile.right) {
      if (activeProject.profile.right.type === "CREATE") {
        createChange.right = activeProject.profile.right.createView.segments.map(
          s => s.clone()
        );
      }
    }

    if (createHistory.length === 0) {
      createHistory.push(createChange);
    }

    if (activeProject.profile.right && !hitResult) {
      if (activeProject.profile.right.type === "CREATE") {
        hitResult = activeProject.profile.right.createView.hitTest(
          event.point,
          hitOptions
        );
      }
    }

    if (!hitResult) {
      if (!shiftDown) {
        clearSelectedPoints();
      }
      return;
    }

    if (hitResult) {
      catchFDUpdate();

      switch (createMode) {
        case "move":
          if (hitResult.type === "segment") {
            if (
              hitResult.segment.index === 0 ||
              hitResult.segment.index === hitResult.item.segments.length - 1
            ) {
            } else {
              if (!shiftDown && !hitResult.segment.selected) {
                mightBeSingle = true;
              }
              hitResult.segment.selected = true;
              moveSegment = hitResult.segment;
            }
          }
          break;
        case "add":
          if (hitResult.type === "segment") {
            if (
              hitResult.segment.index === 0 ||
              hitResult.segment.index === hitResult.item.segments.length - 1
            ) {
            } else {
              hitResult.segment.remove();
            }
          } else if (hitResult.type === "stroke") {
            var location = hitResult.location;
            hitResult.item.segments.forEach(s => {
              s.selected = false;
            });
            hitResult.item.divideAt(location);
          }
          break;
        case "edit":
          if (hitResult.type === "segment") {
            clearSelectedPoints();
            hitResult.segment.selected = true;
            clearSegment = hitResult.segment;
          } else if (
            hitResult.type === "handle-in" ||
            hitResult.type === "handle-out"
          ) {
            clearSelectedPoints();
            hitResult.segment.selected = true;
            switch (hitResult.type) {
              case "handle-in":
                selectedHandle = { segment: hitResult.segment, handle: "in" };
                break;
              case "handle-out":
                selectedHandle = { segment: hitResult.segment, handle: "out" };
                break;
            }
          }
          break;
      }
    }
  }
};

tool.onMouseMove = function(event) {
  if (activeProject) {
    var hitResult;
    if (activeProject.profile.left) {
      if (activeProject.profile.left.type === "CREATE") {
        hitResult = activeProject.profile.left.createView.hitTest(
          event.point,
          hitOptionsDrag
        );
      }
    }

    if (activeProject.profile.right && !hitResult) {
      if (activeProject.profile.right.type === "CREATE") {
        hitResult = activeProject.profile.right.createView.hitTest(
          event.point,
          hitOptionsDrag
        );
      }
    }

    function setCursor(type) {
      var cursor = document.querySelector("#paper-canvas");
      var valid = true;
      if (
        hitResult &&
        hitResult.type === "segment" &&
        (hitResult.segment.index === 0 ||
          hitResult.segment.index === hitResult.item.segments.length - 1)
      ) {
        valid = false;
      }

      if (valid) {
        var url = "";
        switch (type) {
          case "default":
            url =
              "https://cdn.glitch.com/6b38ba76-b34c-468f-9dbf-08efd623068f%2FAsset%2015.png?v=1627036024074";
            break;
          case "move":
            url =
              "https://cdn.glitch.com/46c7c2ac-16b7-470f-9aa2-0be0b6ba2716%2Fmove.png?v=1626703308835";
            break;
          case "edit":
            url =
              "https://cdn.glitch.com/46c7c2ac-16b7-470f-9aa2-0be0b6ba2716%2Fedit.png?v=1626703306166";
            break;
          case "add":
            url =
              "https://cdn.glitch.com/46c7c2ac-16b7-470f-9aa2-0be0b6ba2716%2Fadd.png?v=1626703300511";
            break;
          case "remove":
            url =
              "https://cdn.glitch.com/46c7c2ac-16b7-470f-9aa2-0be0b6ba2716%2Fremove.png?v=1626703311683";
            break;
        }
        cursor.style.cursor = `url("${url}"), default`;
      }
    }

    if (hitResult) {
      switch (createMode) {
        case "move":
          if (hitResult.type === "segment") {
            if (
              hitResult.segment.index !== 0 &&
              hitResult.segment.index !== hitResult.item.segments.length - 1
            ) {
              setCursor("move");
            }
          }
          break;

        case "edit":
          if (hitResult.type === "segment") {
            if (
              hitResult.segment.index !== 0 &&
              hitResult.segment.index !== hitResult.item.segments.length - 1
            ) {
              setCursor("edit");
            }
          } else if (
            hitResult.type === "handle-in" ||
            hitResult.type === "handle-out"
          ) {
            setCursor("move");
          }
          break;

        case "add":
          switch (hitResult.type) {
            case "segment":
              if (
                hitResult.segment.index !== 0 &&
                hitResult.segment.index !== hitResult.item.segments.length - 1
              ) {
                setCursor("remove");
              }
              break;

            case "stroke":
              setCursor("add");
          }
          break;
      }
    } else {
      setCursor("default");
    }

    if (leftMouseDown) {
      if (!travelSliderSelected) {
        iteration = +document.querySelector("#travel-slider").value;
        catchFDUpdate();

        switch (createMode) {
          case "move":
            var seg = [];
            if (activeProject.profile.left) {
              if (activeProject.profile.left.createView) {
                activeProject.profile.left.createView.segments.forEach(s => {
                  if (s.selected) {
                    seg.push(s);
                  }
                });
              }
            }
            if (activeProject.profile.right) {
              if (activeProject.profile.right.createView) {
                activeProject.profile.right.createView.segments.forEach(s => {
                  if (s.selected) {
                    seg.push(s);
                  }
                });
              }
            }

            if (moveSegment && mightBeSingle) {
              seg.forEach(s => {
                s.selected = false;
              });
              moveSegment.selected = true;
              moveSegment.point = moveSegment.point.add(event.delta);
              var parentPath = moveSegment.path;
              var checkX =
                moveSegment.point.x - parentPath.firstSegment.point.x;
              if (checkX > 4.0) {
                moveSegment.point.x = parentPath.firstSegment.point.x + 4.0;
              } else if (checkX < -4.0) {
                moveSegment.point.x = parentPath.firstSegment.point.x - 4.0;
              }

              moveSegment.point.y =
                moveSegment.point.y > parentPath.firstSegment.point.y
                  ? parentPath.firstSegment.point.y
                  : moveSegment.point.y < parentPath.lastSegment.point.y
                  ? parentPath.lastSegment.point.y
                  : moveSegment.point.y;

              dragging = true;
            } else if (moveSegment) {
              var movePoints = true;
              seg.forEach(s => {
                var parentPath = s.path;
                var tempPoint = s.point.add(event.delta);
                var checkX = tempPoint.x - parentPath.firstSegment.point.x;
                if (checkX > 4.0) {
                  movePoints = false;
                } else if (checkX < -4.0) {
                  movePoints = false;
                }
                movePoints =
                  tempPoint.y > parentPath.firstSegment.point.y
                    ? false
                    : tempPoint.y < parentPath.lastSegment.point.y
                    ? false
                    : movePoints;
              });

              if (movePoints) {
                seg.forEach(s => {
                  s.point = s.point.add(event.delta);
                });
              }
              dragging = true;
            }

            break;
          case "edit":
            if (selectedHandle) {
              switch (selectedHandle.handle) {
                case "in":
                  selectedHandle.segment.handleIn = selectedHandle.segment.handleIn.add(
                    event.delta
                  );
                  break;
                case "out":
                  selectedHandle.segment.handleOut = selectedHandle.segment.handleOut.add(
                    event.delta
                  );
                  break;
              }
            } else if (selectedSegment) {
              selectedSegment.handleIn = event.point.subtract(
                selectedSegment.point
              );
              selectedSegment.handleOut = selectedSegment.handleIn.rotate(180);
            } else if (clearSegment) {
              selectedSegment = clearSegment;
              selectedSegment.handleIn = event.point.subtract(
                selectedSegment.point
              );
              selectedSegment.handleOut = selectedSegment.handleIn.rotate(180);
            }
            break;
        }
      }
    }
  }
};

///////
///////
// ZOOM
///////
///////

var SCALE_FACTOR = 0.01;
var MIN_ZOOM = 3.0;
var MM_TO_PX = 2.835;
var bgRaster;

function generateBackground() {}

window.addEventListener("resize", function(e) {
  paper.project.view.center = origin;
  generateBackground();
  setSliderWidth();
});

document.addEventListener("wheel", function(e) {
  var ratio = Math.pow(Math.abs(e.deltaY), 0.5) * SCALE_FACTOR;
  ratio = e.deltaY > 0 ? ratio : -ratio;

  paper.view.zoom = paper.view.zoom * (1 + ratio);
  paper.view.zoom = paper.view.zoom < MIN_ZOOM ? MIN_ZOOM : paper.view.zoom;

  //reverse;

  paper.settings.handleSize = paper.settings.handleSize * (1 + ratio / 2);
  paper.settings.handleSize =
    paper.settings.handleSize < 1 ? 1 : paper.settings.handleSize;

  updateHOTolerance();
});

document.addEventListener("mousemove", function(e) {
  if (e.target.id === "paper-canvas") {
    if (middleMouseDown || (spaceDown && leftMouseDown)) {
      var moveX = e.movementX / paper.view.zoom;
      var moveY = e.movementY / paper.view.zoom;

      paper.view.center = paper.view.center.subtract(
        new paper.Point(moveX, moveY)
      );

      document.querySelector("#paper-canvas").classList.add("grab");
    }
  }
});

var middleMouseDown = false;
var leftMouseDown = false;
var travelSliderSelected = false;

var pauseCalculation = false;

document.addEventListener("mousedown", function(e) {
  if (alertActive && !e.path.includes(alertPanel.firstElementChild)) {
    toggleAlert();
  } else if (e.target === travelSlider) {
    travelSliderSelected = true;
  }

  middleMouseDown = e.which === 2 ? true : middleMouseDown;
  leftMouseDown = e.which === 1 ? true : leftMouseDown;
});

document.addEventListener("mouseup", function(e) {
  travelSliderSelected = false;
  mouseDelta = undefined;
  middleMouseDown = e.which === 2 ? false : middleMouseDown;
  leftMouseDown = e.which === 1 ? false : leftMouseDown;
  document.querySelector("#paper-canvas").classList.remove("grab");
  dragging = false;
  selectedHandle = undefined;
});

var spaceDown = false;
var shiftDown = false;
document.addEventListener("keydown", function(e) {
  spaceDown = e.code === "Space" ? true : spaceDown;
  shiftDown =
    e.code === "ShiftLeft" || e.code === "ShiftRight" ? true : shiftDown;

  if (e.ctrlKey && e.key === "z" && activeProject) {
    // UNDO
    if (undoIndex === undefined) {
      undoIndex = createHistory.length-1;
    }
    undoIndex--;
    undoIndex = undoIndex >= createHistory.length ? createHistory.length - 1 : undoIndex;
    undoIndex = undoIndex < 0 ? 0 : undoIndex;
    if (undoIndex >= 0 && undoIndex < createHistory.length) {
      if (activeProject.profile.left) {
        if (activeProject.profile.left.type === "CREATE" && createHistory[undoIndex].left !== undefined) {
          activeProject.profile.left.createView.segments = createHistory[
            undoIndex
          ].left.map(s => s.clone());
          catchFDUpdate();
        }
      }

      if (activeProject.profile.right) {
        if (activeProject.profile.right.type === "CREATE" && createHistory[undoIndex].right !== undefined) {
          activeProject.profile.right.createView.segments = createHistory[
            undoIndex
          ].right.map(s => s.clone());
          catchFDUpdate();
        }
      }
    }
  }

  if (e.ctrlKey && e.key === "y" && activeProject) {
    // UNDO
    if (undoIndex === undefined) {
    } else {
      undoIndex++;
      undoIndex = undoIndex >= createHistory.length ? createHistory.length - 1 : undoIndex;
      if (undoIndex >= 0 && undoIndex < createHistory.length) {
        if (activeProject.profile.left) {
          if (activeProject.profile.left.type === "CREATE" && createHistory[undoIndex].left !== undefined) {
            activeProject.profile.left.createView.segments = createHistory[
              undoIndex
            ].left.map(s => s.clone());
            catchFDUpdate();
          }
        }

        if (activeProject.profile.right) {
          if (activeProject.profile.right.type === "CREATE" && createHistory[undoIndex].right !== undefined) {
            activeProject.profile.right.createView.segments = createHistory[
              undoIndex
            ].right.map(s => s.clone());
            catchFDUpdate();
          }
        }
      }
    }
  }
});

var dummyProject;

document.addEventListener("keyup", function(e) {
  spaceDown = e.code === "Space" ? false : spaceDown;
  shiftDown =
    e.code === "ShiftLeft" || e.code === "ShiftRight" ? false : shiftDown;
  if (!spaceDown)
    document.querySelector("#paper-canvas").classList.remove("grab");
});

window.addEventListener("beforeunload", function (e) {
    var confirmationMessage = "It looks like you have been editing something."
                            + "If you leave before saving, your changes will be lost.";

    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
});
