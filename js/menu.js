///////
///////
// TABS
///////
///////

var tabs = [...document.getElementsByClassName("profile-tab")];
var tabsLeft = [...document.getElementsByClassName("profile-tab-left")];
var tabsRight = [...document.getElementsByClassName("profile-tab-right")];
var tabContainers = [...document.getElementsByClassName("profile-menu")];
var tabContainersLeft = [
  ...document.getElementsByClassName("profile-menu-left")
];
var tabContainersRight = [
  ...document.getElementsByClassName("profile-menu-right")
];

tabs.forEach(t => {
  t.addEventListener("click", function(e) {
    if (activeProject) {
      switch (e.target.id) {
        case "create-tab-left":
          if (activeProject.profile.left) {
            activeProject.profile.left.setActiveType("CREATE");
            clearLeftHistory();
          }
          break;
        case "create-tab-right":
          if (activeProject.profile.right) {
            activeProject.profile.right.setActiveType("CREATE");
            clearRightHistory();
          }
          break;
        case "import-tab-left":
          if (activeProject.profile.left) {
            activeProject.profile.left.setActiveType("IMPORT");
            clearLeftHistory();
          }
          break;
        case "import-tab-right":
          if (activeProject.profile.right) {
            activeProject.profile.right.setActiveType("IMPORT");
            clearRightHistory();
          }
          break;
        case "sym-tab-left":
          if (activeProject.profile.right) {
            if (activeProject.profile.right.type === "SYMMETRICAL") {
              setUIError(e.target);
              return;
            }
          }
          if (activeProject.profile.left) {
            activeProject.profile.left.setActiveType("SYMMETRICAL");
            clearLeftHistory();
          }
          break;
        case "sym-tab-right":
          if (activeProject.profile.left.type === "SYMMETRICAL") {
            setUIError(e.target);
            return;
          }
          if (activeProject.profile.right) {
            activeProject.profile.right.setActiveType("SYMMETRICAL");
            clearRightHistory();
          }
          break;
      }

      var side = e.target.id.split("-");
      if (side[2] === "left") {
        tabsLeft.forEach(i => i.classList.remove("active"));
        tabContainersLeft.forEach(i => i.classList.remove("active"));
      } else {
        tabsRight.forEach(i => i.classList.remove("active"));
        tabContainersRight.forEach(i => i.classList.remove("active"));
      }

      e.target.classList.add("active");

      document
        .querySelector(`#${side[0]}-menu-${side[2]}`)
        .classList.add("active");

      activeProject.updateView(travelSlider.value);
      activeProject.updateGallery = true;
      catchFDUpdate();
    }
  });
});

function resetTabs() {
  tabs.forEach(t => {
    t.classList.remove("active");
  });
  tabContainers.forEach(t => {
    t.classList.remove("active");
  });
}

///////
///////
// PROFILE EDITS
///////
///////

function updateProfileWidth() {
  if (activeProject) {
    for (var i in activeProject.profile) {
      if (activeProject.profile[i]) {
        var p = activeProject.profile[i];
        var w = p.profileWidth;
        if (w !== undefined) {
          switch (`${p.type}_${p.side}`) {
            case "CREATE_LEFT":
              document.querySelector("#left-profile-width-create").value = w.toFixed(2);
              break;
            case "IMPORT_LEFT":
              document.querySelector("#left-profile-width-import").value = w.toFixed(2);
              break;
            case "CREATE_RIGHT":
              document.querySelector("#right-profile-width-create").value = w.toFixed(2);
              break;
            case "IMPORT_RIGHT":
              document.querySelector("#right-profile-width-import").value = w.toFixed(2);
              break;
          }
        }
      }
    }
  }
}

document
  .querySelector("#left-profile-width-import")
  .addEventListener("change", function(e) {
    if (activeProject) {
      if (activeProject.profile.left) {
        activeProject.profile.left.updateWidth(+e.target.value);
        activeProject.updateView(travelSlider.value);
        activeProject.updateGallery = true;
        catchFDUpdate();
      }
    }
  });

document
  .querySelector("#left-profile-width-create")
  .addEventListener("change", function(e) {
    if (activeProject) {
      if (activeProject.profile.left) {
        activeProject.profile.left.updateWidth(+e.target.value);
        activeProject.updateView(travelSlider.value);
        activeProject.updateGallery = true;
        catchFDUpdate();
      }
    }
  });

document
  .querySelector("#right-profile-width-import")
  .addEventListener("change", function(e) {
    if (activeProject) {
      if (activeProject.profile.right) {
        activeProject.profile.right.updateWidth(+e.target.value);
        activeProject.updateView(travelSlider.value);
        activeProject.updateGallery = true;
        catchFDUpdate();
      }
    }
  });

document
  .querySelector("#right-profile-width-create")
  .addEventListener("change", function(e) {
    if (activeProject) {
      if (activeProject.profile.right) {
        activeProject.profile.right.updateWidth(+e.target.value);
        activeProject.updateView(travelSlider.value);
        activeProject.updateGallery = true;
        catchFDUpdate();
      }
    }
  });

document.querySelector("#flip-x-left").addEventListener("click", function(e) {
  if (activeProject) {
    if (activeProject.profile.left) {
      if (activeProject.profile.left.import) {
        var p = activeProject.profile.left.import;
        p.scale(-1, 1, p.firstSegment.point);
        activeProject.profile.left.setActiveProfile();
        activeProject.updateView(travelSlider.value);
        activeProject.updateGallery = true;
        catchFDUpdate();
      }
    }
  }
});

document.querySelector("#flip-y-left").addEventListener("click", function(e) {
  if (activeProject) {
    if (activeProject.profile.left) {
      if (activeProject.profile.left.import) {
        var p = activeProject.profile.left.import;
        p.scale(1, -1, p.bounds.center);
        p.reverse();
        activeProject.profile.left.setActiveProfile();
        activeProject.updateView(travelSlider.value);
        activeProject.updateGallery = true;
        catchFDUpdate();
      }
    }
  }
});

document.querySelector("#flip-x-right").addEventListener("click", function(e) {
  if (activeProject) {
    if (activeProject.profile.right) {
      if (activeProject.profile.right.import) {
        var p = activeProject.profile.right.import;
        p.scale(-1, 1, p.firstSegment.point);
        activeProject.profile.right.setActiveProfile();
        activeProject.updateView(travelSlider.value);
        activeProject.updateGallery = true;
        catchFDUpdate();
      }
    }
  }
});

document.querySelector("#flip-y-right").addEventListener("click", function(e) {
  if (activeProject) {
    if (activeProject.profile.right) {
      if (activeProject.profile.right.import) {
        var p = activeProject.profile.right.import;
        p.scale(1, -1, p.bounds.center);
        p.reverse();
        activeProject.profile.right.setActiveProfile();
        activeProject.updateView(travelSlider.value);
        activeProject.updateGallery = true;
        catchFDUpdate();
      }
    }
  }
});

///////
///////
// CREATE
///////
///////

var createButtons = [...document.getElementsByClassName("create-btn")];

createButtons.forEach(b => {
  b.addEventListener("click", function(e) {
    createButtons.forEach(c => {
      c.classList.remove("active");
    });
    var id = e.target.id.split("-");
    document
      .querySelector(`#${id[0]}-${id[1]}-${id[2]}-left`)
      .classList.add("active");
    document
      .querySelector(`#${id[0]}-${id[1]}-${id[2]}-right`)
      .classList.add("active");
    createMode = id[0];
  });
});

document
  .querySelector("#clone-import-btn-right")
  .addEventListener("click", function(e) {
    if (activeProject) {
      if (activeProject.profile.right) {
        var p = activeProject.profile.right;
        if (p.import) {
          p.create.remove();
          p.create = new paper.Path([...p.import.segments]);
          p.setActiveProfile();

          updateProfileWidth();
          activeProject.updateView(travelSlider.value);
          activeProject.updateGallery = true;
          catchFDUpdate();
        }
      }
    }
  });

document
  .querySelector("#clone-import-btn-left")
  .addEventListener("click", function(e) {
    if (activeProject) {
      if (activeProject.profile.left) {
        var p = activeProject.profile.left;
        if (p.import) {
          p.create.remove();
          p.create = new paper.Path([...p.import.segments]);
          p.setActiveProfile();

          updateProfileWidth();
          activeProject.updateView(travelSlider.value);
          activeProject.updateGallery = true;
          catchFDUpdate();
        }
      }
    }
  });

document
  .querySelector("#clone-sym-btn-right")
  .addEventListener("click", function(e) {
    if (activeProject) {
      if (activeProject.profile.right) {
        var p = activeProject.profile.right;
        if (activeProject.profile.left) {
          if (activeProject.profile.left.active) {
            p.create.remove();
            p.create = new paper.Path([...activeProject.profile.left.active.segments]);
            p.create.scale(-1, 1, p.create.firstSegment.point);
            p.create.translate(
              p.base.firstSegment.point.subtract(p.create.firstSegment.point)
            );
            p.setActiveProfile();

            updateProfileWidth();
            activeProject.updateView(travelSlider.value);
            activeProject.updateGallery = true;
            catchFDUpdate();
          }
        }
      }
    }
  });

document
  .querySelector("#clone-sym-btn-left")
  .addEventListener("click", function(e) {
    if (activeProject) {
      if (activeProject.profile.left) {
        var p = activeProject.profile.left;
        if (activeProject.profile.right) {
          if (activeProject.profile.right.active) {
            p.create.remove();
            p.create = new paper.Path([...activeProject.profile.right.active.segments]);
            p.create.scale(-1, 1, p.create.firstSegment.point);
            p.create.translate(
              p.base.firstSegment.point.subtract(p.create.firstSegment.point)
            );
            p.setActiveProfile();

            updateProfileWidth();
            activeProject.updateView(travelSlider.value);
            activeProject.updateGallery = true;
            catchFDUpdate();
          }
        }
      }
    }
  });

document
  .querySelector("#clear-btn-left")
  .addEventListener("click", function(e) {
    if (activeProject) {
      if (activeProject.profile.left) {
        var p = activeProject.profile.left;
        p.create.remove();
        p.create = p.base.clone();
        p.setActiveProfile();

        updateProfileWidth();
        activeProject.updateView(travelSlider.value);
        activeProject.updateGallery = true;
        catchFDUpdate();
      }
    }
  });

document
  .querySelector("#clear-btn-right")
  .addEventListener("click", function(e) {
    if (activeProject) {
      if (activeProject.profile.right) {
        var p = activeProject.profile.right;

        p.create.remove();
        p.create = p.base.clone();
        p.setActiveProfile();

        updateProfileWidth();

        activeProject.updateView(travelSlider.value);
        activeProject.updateGallery = true;
        catchFDUpdate();
      }
    }
  });

///////
///////
// PARAMETERS
///////
///////

var paramMap = {
  "param-spring-enable": { object: SPRING_PARAM, key: "enable" },
  "param-spring-height": { object: SPRING_PARAM, key: "height" },
  "param-spring-width": { object: SPRING_PARAM, key: "width" },
  "param-spring-count": { object: SPRING_PARAM, key: "count" },
  "param-spring-thickness": { object: SPRING_PARAM, key: "thickness" },
  "param-spring-travel": { object: SPRING_PARAM },
  "param-side-thickness": { object: SIDE_PARAM, key: "thickness" },
  "param-slider-travel": { object: SLIDER_PARAM, key: "travel" },
  "param-slider-preloadbase": { object: SLIDER_PARAM, key: "preloadBase" },
  "param-slider-preloadside": { object: SLIDER_PARAM, key: "preloadSide" },
  "param-case-springwidth": { object: CASE_PARAM, key: "springWidth" },
  "param-case-topbuffer": { object: CASE_PARAM, key: "topBuffer" },
  "param-case-basebuffer": { object: CASE_PARAM, key: "baseBuffer" },
  "param-case-wall": { object: CASE_PARAM, key: "wall" }
};

function updateParamUI() {
  var inputs = [...document.getElementsByClassName("parameter")];
  for (var i of inputs) {
    var p = paramMap[i.id];
    switch (i.id) {
      case "param-spring-enable":
        i.checked = SPRING_PARAM.enable ? true : false;
        break;
      case "param-spring-travel":
        i.value = SPRING_PARAM.gap * SPRING_PARAM.count;
        break;
      default:
        i.value = p.object[p.key];
        break;
    }
  }

  document.querySelector("#param-name").value = activeProject.name;
}

document.querySelector("#param-name").addEventListener("change", function(e) {
  activeProject.name = e.target.value;
  saveGalleryProject(activeProject);
  updateGalleryView();
});

function uiParamListener() {
  var inputs = [...document.getElementsByClassName("parameter")];
  for (var i of inputs) {
    i.addEventListener("change", function(e) {
      if (activeProject) {
        var p = paramMap[e.target.id];
        checkParam(+e.target.value, e.target);
        switch (e.target.id) {
          case "param-spring-enable":
            SPRING_PARAM.enable = e.target.checked ? true : false;
            checkParam(
              document.querySelector("#param-slider-travel").value,
              document.querySelector("#param-slider-travel")
            );
            paramMap["param-slider-travel"].object[
              "travel"
            ] = +document.querySelector("#param-slider-travel").value;
            break;
          case "param-spring-travel":
            // SPRING_PARAM.gap = +e.target.value / SPRING_PARAM.count;
            break;
          case "param-spring-count":
            p.object[p.key] = +e.target.value;
            // SPRING_PARAM.gap =
            //   +document.querySelector("#param-spring-travel").value /
            //   +e.target.value;
            document.querySelector("#param-spring-travel").value =
              SPRING_PARAM.gap * SPRING_PARAM.count;
            break;
          case "param-side-thickness":
            p.object[p.key] = +e.target.value;
            if (SIDE_PARAM.thickness <= 1.5) {
              SIDE_PARAM.ring = 6;
              SIDE_PARAM.armThickness = 1.5;
              SIDE_PARAM.throw = 7;
              SIDE_PARAM.length = 13;
            } else if (
              SIDE_PARAM.thickness > 1.5 &&
              SIDE_PARAM.thickness <= 2.0
            ) {
              SIDE_PARAM.ring = 8;
              SIDE_PARAM.armThickness = 2.0;
              SIDE_PARAM.throw = 9;
              SIDE_PARAM.length = 15;
            } else if (
              SIDE_PARAM.thickness > 2.0 &&
              SIDE_PARAM.thickness <= 2.5
            ) {
              SIDE_PARAM.ring = 10;
              SIDE_PARAM.armThickness = 2.5;
              SIDE_PARAM.throw = 11;
              SIDE_PARAM.length = 17;
            }
            break;
          default:
            p.object[p.key] = +e.target.value;
            break;
        }
        updateProjectParam();
      }
    });
  }
}

function checkParam(val, input) {
  var id = input.id;

  switch (id) {
    case "param-spring-thickness":
      if (
        SPRING_PARAM.count * (2 * val + SPRING_PARAM.gap) + 4 >
        SPRING_PARAM.height
      ) {
        input.value =
          ((SPRING_PARAM.height - 4) / SPRING_PARAM.count - SPRING_PARAM.gap) /
          2;
        setUIError(input);
        setUIError(document.querySelector("#param-spring-height"));
      }
      break;
    case "param-spring-count":
      if (
        val * (2 * SPRING_PARAM.thickness + SPRING_PARAM.gap) + 4 >
        SPRING_PARAM.height
      ) {
        input.value = Math.floor(
          (SPRING_PARAM.height - 4) /
            (2 * SPRING_PARAM.thickness + SPRING_PARAM.gap)
        );
        setUIError(input);
        setUIError(document.querySelector("#param-spring-height"));
        setUIError(document.querySelector("#param-spring-travel"));
      }
      break;
    case "param-spring-width":
      if (val > CASE_PARAM.springWidth - 2) {
        input.value = CASE_PARAM.springWidth - 2;
        setUIError(input);
        setUIError(document.querySelector("#param-case-springwidth"));
      }
      break;
    case "param-case-springwidth":
      if (val < SPRING_PARAM.width + 2) {
        input.value = SPRING_PARAM.width + 2;
        setUIError(input);
        setUIError(document.querySelector("#param-spring-width"));
      }
      break;
    case "param-spring-height":
      if (
        val <
        SPRING_PARAM.count * (2 * SPRING_PARAM.thickness + SPRING_PARAM.gap) + 4
      ) {
        input.value =
          SPRING_PARAM.count * (2 * SPRING_PARAM.thickness + SPRING_PARAM.gap) +
          4;
        setUIError(input);
        setUIError(document.querySelector("#param-spring-travel"));
      }
      break;
    case "param-spring-travel":
      if (val < SLIDER_PARAM.travel + SLIDER_PARAM.preloadBase + 1) {
        input.value = SLIDER_PARAM.travel + SLIDER_PARAM.preloadBase + 1;
        setUIError(input);
        setUIError(document.querySelector("#param-slider-preloadbase"));
        setUIError(document.querySelector("#param-slider-travel"));
      }
      if (
        val >
        SPRING_PARAM.height -
          SPRING_PARAM.count * 2 * SPRING_PARAM.thickness -
          4
      ) {
        input.value =
          SPRING_PARAM.height -
          SPRING_PARAM.count * 2 * SPRING_PARAM.thickness -
          4;
        setUIError(input);
        setUIError(document.querySelector("#param-spring-height"));
      }
      break;
    case "param-slider-preloadbase":
      if (
        val >
        SPRING_PARAM.gap * SPRING_PARAM.count - (SLIDER_PARAM.travel + 1)
      ) {
        input.value =
          SPRING_PARAM.gap * SPRING_PARAM.count - (SLIDER_PARAM.travel + 1);
        setUIError(input);
        setUIError(document.querySelector("#param-spring-travel"));
        setUIError(document.querySelector("#param-slider-travel"));
      }
      break;
    case "param-slider-travel":
      if (SPRING_PARAM.enable) {
        if (
          val >
          SPRING_PARAM.gap * SPRING_PARAM.count - SLIDER_PARAM.preloadBase - 1
        ) {
          input.value =
            SPRING_PARAM.gap * SPRING_PARAM.count -
            SLIDER_PARAM.preloadBase -
            1;
          setUIError(input);
          setUIError(document.querySelector("#param-spring-travel"));
          setUIError(document.querySelector("#param-slider-preloadbase"));
        }
      }
      break;
  }

  if (input.min) {
    if (val < input.min) {
      input.value = input.min;
    }
  }
  if (input.max) {
    if (val > input.max) {
      input.value = input.max;
    }
  }
}

///////
///////
// INPUT SPINNER BUTTONS
///////
///////

var spinnerBtns = document.querySelectorAll(".decrement, .increment");
for (var t of spinnerBtns) {
  t.addEventListener("click", e => {
    var type = e.target.getAttribute("class");
    var input = e.target.parentElement.querySelector('input[type="number"]');

    if (input) {
      var min = input.hasAttribute("min") ? +input.getAttribute("min") : 0;
      var max = input.hasAttribute("max") ? +input.getAttribute("max") : 999999;
      var step = input.hasAttribute("step")
        ? +input.getAttribute("step")
        : undefined;
      var value = +input.value;

      var calcStep = type === "increment" ? step : step * -1;
      var newValue = value + calcStep;

      if (newValue >= min && newValue <= max) {
        input.value = newValue;
        var evt = "";
        if (e.target.parentElement.classList.contains("profile-menu-inputs")) {
          evt = new Event("input");
        } else {
          evt = new Event("change");
        }
        input.dispatchEvent(evt);
      }
    }
  });
}

///////
///////
// EXPAND BUTTONS
///////
///////

var expandBtns = document.querySelectorAll(
  ".side-expand-btn, .bottom-expand-btn"
);
for (var t of expandBtns) {
  t.addEventListener("click", e => {
    var parentId = e.target.parentElement.id;
    var index = parentId.lastIndexOf("-");
    var panelName = parentId.slice(0, index);
    var panel = document.querySelector(`#${panelName}`);

    if (panel.classList.contains("active")) {
      panel.classList.remove("active");
    } else {
      panel.classList.add("active");
    }
    updateSelectedChartPoint();
  });
}

///////
///////
// TRAVEL SLIDER
///////
///////

// document.querySelector("#travel-slider").style.width =

function setSliderWidth() {
  var div = document.querySelector("#travel-slider-div");
  var divW = div.clientHeight;
  var padding = window.getComputedStyle(div, null).getPropertyValue("padding");
  padding = padding.substring(0, padding.length - 2);
  var sliderW = divW - parseInt(padding) * 2 - 2;
  document
    .querySelector("#travel-slider")
    .setAttribute("style", `width:${sliderW}px`);
}

var pSliderValue = 0;
var sliderDir = 1;
document.querySelector("#travel-slider").addEventListener("input", function(e) {
  if (activeProject) {
    activeProject.updateView(+e.target.value);
    updateSelectedChartPoint();
    chart.update();

    if (+e.target.value >= pSliderValue) {
      sliderDir = 1;
    } else {
      sliderDir = -1;
    }
    pSliderValue = +e.target.value;
  }
});

///////
///////
// IMPORT UNSUCCESSFUL ALERT
///////
///////

var alertActive = false;
var alertPanel = document.querySelector("#alert-panel");

function toggleAlert(cookie, error) {
  if (error) {
    document
      .querySelector("#alert-icon span")
      .setAttribute(
        "style",
        `font-size:${document.querySelector("#alert-icon").clientHeight}px`
      );

    var errorHTML = document.querySelector("#alert-error");
    switch (error) {
      case "continuous":
        errorHTML.innerHTML = `The path should be <span id="alert-error-type">${error}</span>.`;
        break;

      case "vertically collinear":
        errorHTML.innerHTML = `The path's start and end points should be <span id="alert-error-type">${error}</span>.`;
        break;

      case ".svg or .xml":
        errorHTML.innerHTML = `Please upload an <span id="alert-error-type">${error}</span> file.`;

      case ".hptc":
        errorHTML.innerHTML = `Please upload an <span id="alert-error-type">${error}</span> file.`;
        break;

      default:
        errorHTML.innerHTML = "The imported file was invalid.";
    }

    alertPanel.classList.add(cookie, "active");
    console.log(alertPanel.className);
    alertActive = true;
  } else {
    alertPanel.className = "";
    alertActive = false;
  }
}

document
  .querySelector("#import-cancel-btn")
  .addEventListener("click", function(e) {
    toggleAlert();
  });

///////
///////
// QUALITY OF LIFE
///////
///////

function setUIError(ele) {
  ele.classList.add("error");
  setTimeout(function() {
    ele.classList.remove("error");
  }, 250);
}
