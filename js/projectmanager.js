var PROJECT_LIST = [];

///////
///////
// NEW PROJECT
///////
///////

var projectCount = 0;
document.querySelector("#new-btn").addEventListener("click", e => {
  document.querySelector("#projects-init-menu").classList.remove("active");
  document.querySelector("#projects-sides-menu").classList.add("active");
});

document.querySelector("#new-cancel-btn").addEventListener("click", e => {
  document.querySelector("#projects-init-menu").classList.add("active");
  document.querySelector("#projects-sides-menu").classList.remove("active");
});

function resetMenu() {
  document.querySelector("#projects-init-menu").classList.add("active");
  document.querySelector("#projects-sides-menu").classList.remove("active");
  document.querySelector("#profiles-panel").classList.remove("active");
  document.querySelector("#parameters-panel").classList.remove("active");
  document.querySelector("#chart-panel").classList.remove("active");

  resetTabs();
  // updateParamUI();
}

function setMenuView(sides) {
  document.querySelector("#projects-sides-menu").classList.remove("active");
  document.querySelector("#projects-init-menu").classList.add("active");
  document.querySelector("#profiles-panel").classList.add("active");
  document.querySelector("#parameters-panel").classList.add("active");
  document.querySelector("#chart-panel").classList.add("active");

  resetTabs();
  setSliderWidth();

  switch (sides) {
    case "SINGLE":
      document.querySelector("#profiles-panel").classList.add("single");
      break;
    case "DOUBLE":
      document.querySelector("#profiles-panel").classList.remove("single");
      break;
  }
}

document.querySelector("#new-double-btn").addEventListener("click", e => {
  createNewProject("DOUBLE");
});
document.querySelector("#new-single-btn").addEventListener("click", e => {
  createNewProject("SINGLE");
});

function createNewProject(sides) {
  if (activeProject) {
    clearHistory();
    finishFD();
    saveGalleryProject(activeProject);
    paper.project.clear();
    generateBackground();
  }

  setMenuView(sides);

  projectCount++;

  activeProject = new HapticProject(
    `haptic-${projectCount}`,
    sides,
    CASE_PARAM,
    SLIDER_PARAM,
    SPRING_PARAM,
    SIDE_PARAM
  );

  updateProjectParam();
  updateParamUI();

  document.querySelector("#create-tab-left").click();
  document.querySelector("#move-pt-btn-left").click();
  if (sides === "DOUBLE") {
    document.querySelector("#create-tab-right").click();
    document.querySelector("#move-pt-btn-right").click();
  }

  addGalleryProject(activeProject);
}

///////
///////
// SAVE PROJECT
///////
///////

function saveProject() {
  if (activeProject) {
    var item = {
      name: activeProject.name,
      sides: activeProject.sides,
      parameters: {},
      fdData: JSON.stringify(activeProject.fdData),
      profile: {}
    };

    for (var i in activeProject.parameters) {
      item.parameters[i] = {};
      for (var j in activeProject.parameters[i]) {
        item.parameters[i][j] = activeProject.parameters[i][j];
      }
    }

    for (var i in activeProject.profile) {
      if (activeProject.profile[i]) {
        var p = activeProject.profile[i];
        item.profile[i] = {
          type: p.type
        };
        if (p.import) {
          item.profile[i].import = p.import.exportSVG({ asString: true });
        }
        if (p.create) {
          item.profile[i].create = p.create.exportSVG({ asString: true });
        }
      }
    }
    var stringItem = JSON.stringify(item);
    // console.log(item, stringItem);
    return stringItem;
  }
}

function loadProject(project) {
  project = JSON.parse(project);

  if (activeProject) {
    clearHistory();
    paper.project.clear();
    generateBackground();
  }

  setMenuView(project.sides);

  for (var i in project.parameters) {
    switch (i) {
      case "case":
        for (var j in CASE_PARAM) {
          CASE_PARAM[j] = project.parameters[i][j];
        }
        break;
      case "slider":
        for (var j in SLIDER_PARAM) {
          SLIDER_PARAM[j] = project.parameters[i][j];
        }
        break;
      case "spring":
        for (var j in SPRING_PARAM) {
          SPRING_PARAM[j] = project.parameters[i][j];
        }
        break;
      case "side":
        for (var j in SIDE_PARAM) {
          SIDE_PARAM[j] = project.parameters[i][j];
        }
        break;
    }
  }

  activeProject = new HapticProject(
    project.name,
    project.sides,
    CASE_PARAM,
    SLIDER_PARAM,
    SPRING_PARAM,
    SIDE_PARAM
  );

  var fdArr = JSON.parse(project.fdData);
  if (fdArr.length > 0) activeProject.fdData = [...fdArr];

  for (var i in project.profile) {
    activeProject.profile[i].type = project.profile[i].type;
    for (var j in project.profile[i]) {
      switch (j) {
        case "import":
          paper.project.importSVG(project.profile[i].import, {
            insert: true,
            onLoad: item => {
              activeProject.profile[i].import = item.clone();
              item.remove();
            }
          });
          break;
        case "create":
          // console.log(paper.project.importSVG(project.profile[i].create));
          paper.project.importSVG(project.profile[i].create, {
            insert: true,
            onLoad: item => {
              activeProject.profile[i].create = item.clone();
              item.remove();
            }
          });
          break;
      }
    }
    activeProject.profile[i].setActiveProfile();
  }

  updateProjectParam();
  updateParamUI();
  catchFDUpdate();
}

///////
///////
// GALLERY
///////
///////

function addGalleryProject(p) {
  var save = saveProject(p);

  PROJECT_LIST.forEach(p => {
    p.active = false;
  });

  PROJECT_LIST.push({
    name: p.name,
    active: true,
    index: PROJECT_LIST.length
  });

  saveGalleryProject(p);
}

function saveGalleryProject(p) {
  var save = saveProject(p);

  var activeP = PROJECT_LIST.filter(p => p.active);

  var path = new paper.Path();
  switch (p.sides) {
    case "DOUBLE":
      if (p.profile.left.active) {
        path.addSegments([...p.profile.left.active.segments]);
      } else {
        path.addSegments([...p.profile.left.base.segments]);
      }

      path.reverse();

      if (p.profile.right.active) {
        path.addSegments([...p.profile.right.active.segments]);
      } else {
        path.addSegments([...p.profile.right.base.segments]);
      }

      path.closePath();
      break;

    case "SINGLE":
      if (p.profile.left.active) {
        path.addSegments([...p.profile.left.active.segments]);
      } else {
        path.addSegments([...p.profile.left.base.segments]);
      }

      path.lineBy(p.parameters.spring.width, 0);
      path.add(
        new paper.Point(path.lastSegment.point.x, path.firstSegment.point.y)
      );
      path.closePath();
      break;
  }

  var rect = path.bounds;
  var origin = new paper.Point(0, 0);

  var pathPos = new paper.Point(rect.x, rect.y);
  path.translate(origin.subtract(pathPos));
  path.scale(5, origin);
  rect = path.bounds;
  // console.log(path);
  var profileString = path.exportSVG({ asString: true });
  profileString = profileString.split("d=");
  profileString = profileString[1].split("fill");
  var svgProfile = `<svg viewBox="${rect.x +
    " " +
    rect.y +
    " " +
    rect.width +
    " " +
    rect.height}"><path class="profile" d=${profileString[0]}></svg>`;

  var fdPath = new paper.Path();
  for (var fd of p.fdData) {
    fdPath.add(new paper.Point(fd.d, -fd.force));
  }

  rect = fdPath.bounds;
  var fdPos = new paper.Point(rect.x, rect.y);
  fdPath.translate(origin.subtract(fdPos));
  fdPath.scale(75 / rect.width, origin);
  rect = fdPath.bounds;

  var fdString = fdPath.exportSVG({ asString: true });
  fdString = fdString.split("d=");
  fdString = fdString[1].split("fill");
  var svgFD = `<svg viewBox="${rect.x +
    " " +
    rect.y +
    " " +
    rect.width +
    " " +
    rect.height}"><path class="fd" d=${fdString[0]}></svg>`;

  path.remove();
  fdPath.remove();

  var fab;

  if (p.drawingFab) {
    fab = p.drawingFab.exportSVG({ asString: true });
    rect = p.drawingFab.bounds;
    fab = `<svg width="${rect.width}mm" height="${
      rect.height
    }mm" viewBox="${rect.x +
      " " +
      rect.y +
      " " +
      rect.width +
      " " +
      rect.height}"><style>g, path {stroke:black; stroke-width:0.1; stroke-linejoin:round;}</style>${fab}</svg>`;
  }

  if (activeP.length > 0) {
    activeP[0].name = p.name;
    activeP[0].save = save;
    activeP[0].profile = svgProfile;
    activeP[0].fd = svgFD;
    activeP[0].fab = fab;
    activeP[0].fdData = p.fdData.map(d => d);
    activeP[0].viewFD = false;
  }

  updateGalleryView();
}

function loadGalleryProject(i) {
  if (activeProject) {
    clearHistory();
    saveGalleryProject(activeProject);
  }

  var sameProject = false;

  PROJECT_LIST.forEach((p, index) => {
    if (p.active) {
      if (index === i) {
        sameProject = true;
      }
    }
  });

  if (!sameProject) {
    PROJECT_LIST.forEach(p => {
      p.active = false;
    });
    PROJECT_LIST[i].active = true;
    loadProject(PROJECT_LIST[i].save);
    updateGalleryView();
    activeProject.updateGallery = true;
  }
}

function galleryItemBtnListener(item) {
  item
    .querySelector(".gallery-item-btn-div .fd-btn")
    .addEventListener("click", function(e) {
      if (!item.classList.contains("active")) {
        var id = item.id.split("-");
        var index = +id[id.length - 1];
        PROJECT_LIST[index].viewFD = !PROJECT_LIST[index].viewFD;
        if (activeProject) activeProject.updateGallery = true;
        updateChartComparison();
        updateChart(true);
      }
    });

  item
    .querySelector(".gallery-item-btn-div .edit-btn")
    .addEventListener("click", function(e) {
      item.classList.remove("view-fd");
      var id = item.id.split("-");
      var index = +id[id.length - 1];
      PROJECT_LIST[index].viewFD = false;

      finishFD();
      loadGalleryProject(index);
      updateChartComparison();
      updateChart(true);
    });

  item
    .querySelector(".gallery-item-btn-div .copy-btn")
    .addEventListener("click", function(e) {
      var id = item.id.split("-");
      finishFD();
      var index = +id[id.length - 1];
      var copy = JSON.parse(JSON.stringify(PROJECT_LIST[index]));
      copy.save = copy.save.replace(copy.name, copy.name + "-copy");
      copy.name += "-copy";
      copy.active = false;
      copy.viewFD = false;
      PROJECT_LIST.splice(index, 0, copy);
      PROJECT_LIST.forEach((p, i) => {
        p.index = i;
      });

      updateChartComparison();
      updateChart(true);
      updateGalleryView();
    });

  item
    .querySelector(".gallery-item-btn-div .fab-btn")
    .addEventListener("click", function(e) {
      var id = item.id.split("-");
      var index = +id[id.length - 1];
      downloadFabrication(index);
    });

  item.querySelector(".delete-item-btn").addEventListener("click", function(e) {
    var id = item.id.split("-");
    var index = +id[id.length - 1];
    if (PROJECT_LIST[index].active) {
      activeProject = undefined;
      paper.project.clear();
      generateBackground();
      PROJECT_LIST.splice(index, 1);
      resetMenu();
    } else {
      PROJECT_LIST.splice(index, 1);
      if (activeProject) activeProject.updateGallery = true;
    }

    PROJECT_LIST.forEach((p, i) => {
      p.index = i;
    });
    updateGalleryView();

    updateChartComparison();
    updateChart(true);
  });
}

function updateGalleryView() {
  var gallery = document.querySelector("#projects-gallery");
  gallery.innerHTML = "";

  PROJECT_LIST.forEach(p => {
    var active = p.active ? "active" : "";
    var vfd = p.viewFD ? "view-fd" : "";
    var color = p.active ? "#3E4143" : "#767676";

    for (var i of profileComparison) {
      if (p.index === i.index) color = i.chartColor;
    }

    var html = `<div class="gallery-item ${active} ${vfd}" id="gallery-index-${p.index}"><div class="gallery-item-name"><span class="material-icons-outlined" style="color:${color}">visibility</span><h2>${p.name}</h2></div><div class="gallery-item-fd" style="stroke:${color}">${p.fd}</div><div class="gallery-item-profile">${p.profile}</div><div class="gallery-item-btn-div"><div class="edit-btn gallery-item-btn icon-button"><span class="material-icons-outlined">edit</span></div><div class="fd-btn gallery-item-btn icon-button"><span class="material-icons-outlined">timeline</span></div><div class="copy-btn gallery-item-btn icon-button"><span class="material-icons-outlined">file_copy</span></div><div class="fab-btn gallery-item-btn icon-button"><span class="material-icons-outlined">print</span></div></div><div class="delete-item-btn icon-button"><span class="material-icons-outlined">delete</span></div></div>`;
    gallery.innerHTML = html + gallery.innerHTML;
  });

  var items = [...document.getElementsByClassName("gallery-item")];
  items.forEach((item, i) => {
    galleryItemBtnListener(item);
  });
}

///////
///////
// FAB
///////
///////

function downloadFabrication(index) {
  var fabString = PROJECT_LIST[index].fab;
  if (fabString) {
    if (
      !fabString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)
    ) {
      fabString = fabString.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (!fabString.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      fabString = fabString.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }

    //add xml declaration
    fabString = '<?xml version="1.0" standalone="no"?>\r\n' + fabString;

    //convert svg source to URI data scheme.
    var url =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(fabString);
    var a = document.createElement("a");
    a.href = url;
    a.download = `${PROJECT_LIST[index].name}-${Date.now()}.svg`;
    a.click();
  }
}

///////
///////
// ARCHIVE
///////
///////

document
  .querySelector("#export-archive-btn")
  .addEventListener("click", function(e) {
    saveGalleryProject(activeProject);
    PROJECT_LIST.forEach(p => {
      p.viewFD = false;
    });
    download(
      JSON.stringify(PROJECT_LIST),
      `project-${Date.now()}.hptc`,
      "text/plain"
    );
  });

function download(content, fileName, contentType) {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

function importArchiveHandler(ele, cookie) {
  var file = ele.files[0];
  var fileExt = file.name.split(".");
  fileExt = fileExt[fileExt.length - 1];
  if (fileExt === "hptc") {
    if (alertActive) toggleAlert();
    var fr = new FileReader();
    fr.onload = data => {
      PROJECT_LIST = JSON.parse(fr.result);
      var activeP = PROJECT_LIST.filter(p => p.active);
      loadProject(activeP[0].save);
      updateGalleryView();
    };
    fr.readAsText(file);
  } else {
    var type = cookie ? cookie : ele.id;
    toggleAlert(type, ".hptc");
  }
}
