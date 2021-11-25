var chartType = "total";
var profileComparison = [];

var chartCtx = document.querySelector("#chart").getContext("2d");
var chartDiv = document.querySelector("#chart-div");
var legendDiv = document.querySelector("#legend-items-div");

var chartAccents = {
  down: "#222222",
  up: "#878787",
  left: "#F23557",
  right: "#22b2da"
};

var chartColors = [
  "#EF4B62",
  "#AEF72F",
  "#3ED8DB",
  "#BA8AFF",
  "#DB3ED8",
  "#4EB4F9",
  "#BCBA5E",
  "#A56429",
  "#43EDAC",
  "#0BA09C",
  "#EF52D1",
  "#FFA039",
  "#7C40FF",
  "#FCDF35",
];

var chart = new Chart(chartCtx, {
  type: "line",
  data: {
    datasets: []
  },
  options: {
    aspectRatio:
      window.getComputedStyle(chartDiv, null).getPropertyValue("width") /
      window.getComputedStyle(chartDiv, null).getPropertyValue("height"),
    events: [],
    animation: false,
    tooltips: { enabled: false },
    hover: { mode: null },
    elements: {
      point: {
        radius: function(context) {
          var i = context.dataIndex;
          var size = i === +travelSlider.value ? 5 : 2;
          return size;
        },
        display: true
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }
});

function generateLegend() {
  var legendHTML = chart.data.datasets.map((s, i) => {
    var legendClass = "";
    var divStyle = "";

    switch (s.label) {
      case "\u00B110%":
        divStyle = `border: 1px dashed ${s.backgroundColor}`;
        break;

      case "Left Profile":
      case "Right Profile":
      case `${activeProject.name} (DOWN)`:
      case `${activeProject.name} (UP)`:
        legendClass = "legend-highlight";
        divStyle = `background: ${s.backgroundColor}`;
        break;
        
      default:
        divStyle = `background: ${s.backgroundColor}`;
        break;
    }

    if (s.label !== "-10%")
      return `<div id="legend-index-${i}" class="legend-item ${legendClass}"><div style="${divStyle}"></div><h2>${s.label}</h2></div>`;
  });
  return legendHTML.join("");
}

function clearChart() {
  chart.data.datasets = [];
  updateSelectedChartPoint();
}

function initChart(arr) {
  var filterArr = arr.map(d => (d % 1 === 0 ? d : ""));
  chart.data.labels = filterArr;
  var zeroArr = arr.map(i => 0);
  if (chartType === "total") {
    addData("\u00B110%", zeroArr, "rgb(180, 180, 180)", 1);
    addData("-10%", zeroArr, "rgb(180, 180, 180)", 1);
  }
}

function addData(label, dataArr, color, w) {
  chart.data.datasets.push({
    label: label,
    data: dataArr.map(p => p),
    borderColor: color,
    backgroundColor: color,
    pointBorderWidth: 0,
    tension: 0.1,
    borderDash: function() {
      if (label === "\u00B110%" || label === "-10%") return [5, 3];
      else return [];
    },
    borderWidth: function() {
      if (label === "\u00B110%" || label === "-10%") return 1;
      else return 2;
    }
  });
  legendDiv.innerHTML = generateLegend();
}

function updateSelectedChartPoint() {
  if (!activeProject) return;
  chart.options = {
    aspectRatio:
      window.getComputedStyle(chartDiv, null).getPropertyValue("width") /
      window.getComputedStyle(chartDiv, null).getPropertyValue("height"),
    plugins: {
      title: {
        display: true,
        text: "Force-Displacement Profile"
      },
      legend: {
        display: false
        // position: "bottom",
        // align: "end",
        // labels: {
        //   font: {
        //     size: 11
        //   },
        //   padding: 20,
        //   usePointStyle: true,
        //   pointStyle: true,
        //   filter: function(legendItem, chartData) {
        //     if (legendItem.text === "-10%") return false;
        //     return true;
        //   }
        // }
      }
    },
    events: [],
    animation: false,
    tooltips: { enabled: false },
    hover: { mode: null },
    elements: {
      point: {
        radius: function(context) {
          if (!activeProject) return 0;
          var i = context.dataIndex;
          var activeLine =
            sliderDir === 1
              ? `${activeProject.name} (DOWN)`
              : `${activeProject.name} (UP)`;
          var size =
            i === +travelSlider.value &&
            (context.dataset.label === activeLine ||
              context.dataset.label === "Left Profile" ||
              context.dataset.label === "Right Profile")
              ? 5
              : 0;
          if (
            i === +travelSlider.value &&
            (context.dataset.label === activeLine ||
              context.dataset.label === "Left Profile" ||
              context.dataset.label === "Right Profile")
          ) {
            var val = context.dataset.data[i];
            var neg = context.dataset.data[i] < 0 ? -1 : 1;

            chart.data.datasets.forEach(s => {
              switch (s.label) {
                case "\u00B110%":
                  s.data = s.data.map(d => val + neg * 0.1 * val);
                  break;
                case "-10%":
                  s.data = s.data.map(d => val - neg * 0.1 * val);
                  break;
              }
            });
          }
          return size;
        },
        display: true
      }
      // line: {
      //   borderWidth: 1
      // }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Displacement (mm)",
          font: {}
        },

        ticks: {
          callback: function(value, index, values) {
            var label = chart.data.labels[index];
            return label !== "" ? label : null;
          }
        },

        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          zeroLineColor: "rgba(0, 0, 0, 0.1)",
          tickBorderDash: function(context) {
            if (context.tick.value == 0) {
              return [];
            }
            return [5, 5];
          }
        }
      },
      y: {
        title: {
          display: true,
          text: "Force (N)",
          font: {}
        },

        grid: {
          color: function(context) {
            if (context.tick.value == 0) {
              return "rgba(255, 0, 0, 0.6)";
            }
            return "rgba(0, 0, 0, 0.05)";
          },
          tickBorderDash: function(context) {
            if (context.tick.value == 0) {
              return [];
            }
            return [5, 5];
          }
        }
      }
    }
  };

  chart.update();
}

function updateChartComparison() {
  var viewArr = PROJECT_LIST.filter(p => p.viewFD);

  profileComparison = [];
  viewArr.forEach(p => {
    var arr = p.fdData.map(d => d.force);
    profileComparison.push({ label: p.name, force: arr, index: p.index });
  });

  PROJECT_LIST.forEach(p => {
    var item = document.querySelector(`#gallery-index-${p.index}`);
    if (item) item.classList.remove("view-fd");
    if (p.viewFD) item.classList.add("view-fd");
  });
}

document
  .querySelector("#deconstruct-btn")
  .addEventListener("click", function(e) {
    if (e.target.classList.contains("active")) {
      e.target.classList.remove("active");
      chartType = "total";
      activeProject.updateGallery = true;
      updateChart(true);
    } else {
      e.target.classList.add("active");
      chartType = "deconstruct";
      activeProject.updateGallery = true;
      updateChart(true);
    }
  });
