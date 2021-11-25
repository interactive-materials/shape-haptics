///////
///////
// IMPORT
///////
///////

var importBtns = document.getElementsByClassName("import-btn");
for (var i of importBtns) {
  i.addEventListener("click", evt => {
    evt.currentTarget.value = null;
    if (alertActive) alertPanel.classList.remove("active");
  });
  i.addEventListener("change", evt => {
    var ele = evt.currentTarget;
    switch (ele.id) {
      case "import-retry":
        var cookie = alertPanel.classList[0];
        console.log(cookie);
        if (cookie === "load-archive-btn") importArchiveHandler(ele, cookie);
        else importPathHandler(ele, cookie);
        break;
        
      case "load-archive-btn":
        importArchiveHandler(ele, undefined);
        break;
        
      case "import-left":
      case "import-right":
        importPathHandler(ele, undefined);
        break;
    }
  });
}

function importPathHandler(ele, cookie) {
  if (!activeProject) return;
  var type = cookie ? cookie : ele.id;
  var file = ele.files[0];
  if (file.type === "image/svg+xml") {
    var obj = document.createElement("object");
    obj.data = URL.createObjectURL(file);
    obj.onload = () => URL.revokeObjectURL(obj.data);
    paper.project.importSVG(obj.data, {
      insert: true,
      onLoad: item => {
        item.children[0].remove();
        importPath(type, item.reduce());
      }
    });
  } else {
    toggleAlert(cookie, ".svg or .xml");
  }
}

function importPath(type, path) {
  console.log(type);
  function checkImport(path) {
    var validPath = true;
    if (path.children) {
      error = "continuous";
      validPath = false;
    } else {
      var ptA = path.firstSegment.point;
      var ptB = path.lastSegment.point;
      if (ptA.y === ptB.y || ptA.x !== ptB.x) {
        error = "vertically collinear";
        validPath = false;
      }
    }
    if (validPath && ptA.y < ptB.y) {
      path.reverse();
    }
    return validPath;
  }

  function calculateMax(path) {
    var ptx = path.firstSegment.point.x;
    var deviation =
      path.name === "import-left"
        ? Math.abs(path.bounds.left - ptx)
        : Math.abs(path.bounds.right - ptx);
    var scaleFactor = 4 / deviation;
    if (deviation > activeProject.parameters.slider.maxDeflection) {
      deviation = activeProject.parameters.slider.maxDeflection;
      path.scale(scaleFactor, 1);
    }
    path.data.maxWidth = path.bounds.width * scaleFactor;
  }

  var error = "";
  var validPath = checkImport(path);
  if (validPath) {
    if (alertActive) toggleAlert();
    var profileLength =
      activeProject.parameters.slider.travel +
      activeProject.parameters.case.topBuffer +
      activeProject.parameters.case.baseBuffer;
    path.name = type;
    path.pivot = path.firstSegment.point;
    path.scale(profileLength / path.bounds.height);
    path.style = paper.project.currentStyle;
    path.fillColor = null;

    calculateMax(path);
    if (type === "import-left") {
      var profile = activeProject.profile.left;
      profile.setImport(path);
      profile.setActiveType("IMPORT");
      path.position = profile.base.firstSegment.point;
    } else {
      var profile = activeProject.profile.right;
      profile.setImport(path);
      profile.setActiveType("IMPORT");
      path.position = profile.base.firstSegment.point;
    }
    activeProject.updateView(travelSlider.value);
    activeProject.updateGallery = true;
    path.remove();
    catchFDUpdate();
  } else {
    path.remove();
    toggleAlert(type, error);
  }
}
