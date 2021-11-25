var origin = new paper.Point(0, 0);

var activeProject;

var travelSlider = document.querySelector("#travel-slider");

var mobile = false;
if (
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
) {
  mobile = true;
} else {
  mobile = false;
}

window.onload = function() {
  if (mobile) {
    document.querySelector("body").innerHTML =
      '<div class="mobile-warning">Please use a desktop browser to access this application.</div>';
    return;
  }
  paper.setup("paper-canvas");
  paper.view.center = origin;
  paper.view.zoom = MM_TO_PX;

  updateHOTolerance();

  generateBackground();
  uiParamListener();

  window.requestAnimationFrame(update);
};

function updateProjectParam() {
  if (activeProject) {
    activeProject.initFD();
    iteration = 0;
    catchFDUpdate();
    activeProject.updateBase();
    updateDisplacementSlider();
    if (activeProject.profile.left) activeProject.profile.left.setActiveProfile();
    if (activeProject.profile.right) activeProject.profile.right.setActiveProfile();
    activeProject.updateView(travelSlider.value);
    updateChart(true);
  }
}

function updateDisplacementSlider() {
  var count = activeProject.parameters.slider.travel * DISPLACEMENT_DENSITY;
  travelSlider.setAttribute("max", count);
  if (travelSlider.value > count) {
    travelSlider.value = count;
  }
}

var iteration = 0;
const FPS = 50;
var timestamp = 0;
var interval = 1000 / FPS;

function update() {
  if (Date.now() - timestamp > interval) {
    timestamp = Date.now();
    setSliderWidth();

    if (activeProject) {

      if (FDwatcher.update) {
        updateProfileWidth();
        activeProject.updateFD(iteration, travelSlider.value);
        updateChart(false);
      }

      if (activeProject.updateDisplay)
        activeProject.updateView(travelSlider.value);

      iteration++;
      iteration = Math.floor(
        iteration %
          (activeProject.parameters.slider.travel * DISPLACEMENT_DENSITY + 1)
      );

      checkFDUpdate();
    }
  }

  window.requestAnimationFrame(update);
}

var FDwatcher = { update: true, index: 0 };
function catchFDUpdate() {
  FDwatcher.update = true;
  FDwatcher.index = iteration;
  console.log("FD calculation start", iteration);
  updateChart(true);
  document.querySelector("#chart-computing").classList.add("active");
}

function checkFDUpdate() {
  // console.log(FDwatcher.index, iteration);
  if (FDwatcher.index === iteration && FDwatcher.update) {
    console.log("FD calculation stop");
    activeProject.updateFD(iteration, travelSlider.value);
    activeProject.smoothFD();
    saveGalleryProject(activeProject);
    FDwatcher.update = false;
    updateChart(true);
    document.querySelector("#chart-computing").classList.remove("active");
  }
}

function finishFD() {
  if (!activeProject) return;
  if (FDwatcher.update) {
    while (FDwatcher.index !== iteration) {
      activeProject.updateFD(iteration, travelSlider.value);

      iteration++;
      iteration = Math.floor(
        iteration %
          (activeProject.parameters.slider.travel * DISPLACEMENT_DENSITY + 1)
      );
    }
    checkFDUpdate();
  }
}

function updateChart(clear) {
  if (activeProject) {
    if (clear) {
      clearChart();
      switch (chartType) {
        case "deconstruct":
          if (activeProject.profile.left) {
            var labelArr = activeProject.fdData.map(d => d.d.toFixed(2));
            var dataArr = activeProject.profile.left.fdData.map(d => d.force);

            initChart(labelArr);
            addData("Left Profile", dataArr, chartAccents.left, 3);
          }

          if (activeProject.profile.right) {
            var dataArr = activeProject.profile.right.fdData.map(d => d.force);
            addData("Right Profile", dataArr, chartAccents.right, 3);
          }
          break;
        case "total":
          var labelArr = activeProject.fdData.map(d => d.d.toFixed(2));
          var dataArr = activeProject.fdData.map(d => d.force);
          var dataArrReverse = activeProject.fdData.map(d => d.forceReverse);

          initChart(labelArr);
          addData(
            `${activeProject.name} (DOWN)`,
            dataArr,
            chartAccents.down,
            3
          );
          addData(
            `${activeProject.name} (UP)`,
            dataArrReverse,
            chartAccents.up,
            3
          );

          profileComparison.forEach((p, i) => {
            p.chartColor = chartColors[i % chartColors.length];
            addData(p.label, p.force, p.chartColor, 3);
          });
          updateGalleryView();
          break;
      }
    } else {
      switch (chartType) {
        case "deconstruct":
          if (activeProject.profile.left) {
            chart.data.datasets.forEach(d => {
              if (d.label === "Left Profile") {
                d.data = activeProject.profile.left.fdData.map(d => d.force);
              }
            });
          }

          if (activeProject.profile.right) {
            chart.data.datasets.forEach(d => {
              if (d.label === "Right Profile") {
                d.data = activeProject.profile.right.fdData.map(d => d.force);
              }
            });
          }
          break;
        case "total":
          chart.data.datasets.forEach(d => {
            if (d.label === `${activeProject.name} (DOWN)`) {
              d.data = activeProject.fdData.map(d => d.force);
            }
          });

          chart.data.datasets.forEach(d => {
            if (d.label === `${activeProject.name} (UP)`) {
              d.data = activeProject.fdData.map(d => d.forceReverse);
            }
          });

          break;
      }
    }
  }

  chart.update();
}
