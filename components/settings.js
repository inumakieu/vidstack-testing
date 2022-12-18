function createElement(x) {
  let temp;
  if ("element" in x) {
    temp = document.createElement(x.element);
  } else {
    temp = document.createElement("div");
  }
  let attributes = x.attributes;

  for (value in attributes) {
    temp.setAttribute(value, attributes[value]);
  }

  for (value in x.style) {
    temp.style[value] = x.style[value];
  }

  if ("id" in x) {
    temp.id = x.id;
  }

  if ("class" in x) {
    temp.className = x.class;
  }

  if ("innerText" in x) {
    temp.textContent = x.innerText;
  }

  if ("innerHTML" in x) {
    temp.innerHTML = x.innerHTML;
  }

  let listeners = x.listeners;

  for (value in listeners) {
    temp.addEventListener(value, listeners[value]);
  }

  return temp;
}

let menuCon = document.querySelector(".menuCon");

class Toggle {
  constructor(element) {
    this.element = element;
  }

  turnOn() {
    if (!this.isOn()) {
      this.element.click();
    }
  }

  turnOff() {
    if (this.isOn()) {
      this.element.click();
    }
  }

  isOn() {
    return this.element.classList.contains("active");
  }

  toggle() {
    if (this.isOn()) {
      this.turnOff();
    } else {
      this.turnOn();
    }
  }
}

class Selectables {
  constructor(element) {
    this.element = element;
  }

  select() {
    this.element.click();
  }
}

class Scene {
  constructor(config, dropDownMenuInstance) {
    this.data = config;
    this.DDMinstance = dropDownMenuInstance;
  }

  addItem(config, isHeading = false) {
    this.element
      .querySelector(".scene")
      .append(this.DDMinstance.makeItem(config, isHeading));

    if (this.element.classList.contains("active")) {
      this.DDMinstance.menuCon.style.height =
        this.element.querySelector(".scene").offsetHeight + "px";
    }
  }

  delete() {
    this.data = null;
    this.DDMinstance = null;
    this.element.remove();
  }

  deleteItems() {
    this.element.querySelector(".scene").innerHTML = "";
    this.data.items = [];
  }
}

class dropDownMenu {
  constructor(scenes, menuCon) {
    this.scenes = {};
    this.menuCon = menuCon;
    this.history = [];
    this.toggles = {};
    this.selections = {};
    this.selectedValues = {};
    this.selectedValuesDOM = {};
    for (let scene of scenes) {
      this.scenes[scene.id] = new Scene(scene, this);
    }

    for (let scene of scenes) {
      if (!this.scenes[scene.id].element) {
        this.makeScene(scene);
      }
    }
  }

  open(id) {
    if (id in this.scenes) {
      if (
        !this.history.length ||
        (this.history.length && this.history[this.history.length - 1] != id)
      ) {
        this.history.push(id);
      }

      for (let sceneID in this.scenes) {
        if (sceneID === id) {
          this.scenes[sceneID].element.classList.add("active");
          this.menuCon.style.height =
            this.scenes[sceneID].element.querySelector(".scene").offsetHeight +
            "px";
        } else {
          this.scenes[sceneID].element.classList.remove("active");
        }
      }
    }
  }

  back() {
    if (this.history.length > 1) {
      let lastHistory = this.history.pop();
      this.open(this.history.pop());
    }
  }

  makeItem(item, isHeading = false, sceneID) {
    // console.log(sceneID);
    let menuItem = createElement({
      class: isHeading ? "menuHeading" : "menuItem",
      attributes: item.attributes ? item.attributes : {},
    });

    if (!isHeading && "iconID" in item) {
      let menuItemIcon = createElement({
        class: "menuItemIcon",
        id: item.iconID,
      });

      menuItem.append(menuItemIcon);
    }

    if (item.open) {
      menuItem.addEventListener("click", () => {
        this.open(item.open);
      });
    }

    if (isHeading && item.hideArrow !== true) {
      let menuItemIcon = createElement({
        class: "menuItemIcon menuItemIconBack",
      });

      menuItem.addEventListener("click", () => {
        this.back();
      });

      menuItem.append(menuItemIcon);
    }

    let self = this;

    if (item.callback) {
      menuItem.addEventListener("click", () => {
        item.callback.bind(menuItem)();
      });
    }

    if (item.selected) {
      menuItem.classList.add("selected");
      if (sceneID) {
        this.selectedValues[sceneID] = item.text;
      }
    }

    if (item.highlightable) {
      if (item.id) {
        this.selections[item.id] = new Selectables(menuItem);
      }
      menuItem.setAttribute("highlightable", "true");
      menuItem.addEventListener("click", function () {
        let siblings = menuItem.parentElement.children;

        for (let child of siblings) {
          if (child.getAttribute("highlightable") === "true") {
            child.classList.remove("selected");
          }
        }

        menuItem.classList.add("selected");

        if (sceneID) {
          self.selectedValues[sceneID] = menuItem.innerText;
          console.log(self.selectedValuesDOM[sceneID], sceneID);
          for (let elems of self.selectedValuesDOM[sceneID].elements) {
            elems.innerText = self.selectedValues[sceneID];
          }
        }
      });
    }

    let menuItemText = createElement({
      class: "menuItemText",
      innerText: item.text,
    });

    menuItem.append(menuItemText);

    if (item.textBox) {
      let textBox = createElement({
        element: "input",
        class: "textBox",
        attributes: {
          type: "text",
        },
      });

      if (item.value) {
        textBox.value = item.value;
      }
      textBox.addEventListener("input", item.onInput);

      // if(item.id){
      //     this.toggles[item.id] = new Toggle(toggle);
      // }
      menuItem.append(textBox);
    }

    if (item.selectedValue) {
      // menuItem.classList.add("menuItemToggle");

      let valueDOM = createElement({
        innerText: item.selectedValue,
        class: "menuItemValue",
      });
      menuItem.append(valueDOM);
      if (!this.selectedValuesDOM[item.open]) {
        this.selectedValuesDOM[item.open] = {};
      }

      let sValue = this.selectedValuesDOM[item.open];

      if (sValue.elements) {
        sValue.elements.push(valueDOM);
      } else {
        sValue.elements = [valueDOM];
      }
    }

    if (item.toggle) {
      menuItem.classList.add("menuItemToggle");
      let toggle = createElement({
        class: `toggle ${item.on ? " active" : ""}`,
        listeners: {
          click: function () {
            this.classList.toggle("active");
            if (this.classList.contains("active")) {
              item.toggleOn();
            } else {
              item.toggleOff();
            }
          },
        },
      });

      if (item.id) {
        this.toggles[item.id] = new Toggle(toggle);
      }
      menuItem.append(toggle);
    }

    return menuItem;
  }

  makeScene(config) {
    let scene = createElement({
      class: "scene",
    });

    let sceneCon = createElement({
      class: "sceneCon",
    });

    let openScene = this.scenes[config.id];
    console.log(openScene.element);
    if (openScene.element) {
      return;
    }

    scene.append(this.makeItem(config.heading, true));
    for (let item of config.items) {
      if (item.open) {
        let openScene = this.scenes[item.open];
        if (!openScene.element) {
          this.makeScene(this.scenes[item.open].data);
        }
      }

      item.selectedValue = this.selectedValues[item.open];
      scene.append(this.makeItem(item, false, config.id));
    }

    sceneCon.append(scene);
    this.scenes[config.id].element = sceneCon;
    this.menuCon.append(sceneCon);

    return sceneCon;
  }

  addScene(config) {
    let sceneDIV = this.makeScene(config);
    this.menuCon.append(sceneDIV);
    config.element = sceneDIV;
    this.scenes[config.id] = config;
  }

  deleteScene(id) {
    if (id in this.scenes) {
      this.scenes[id].delete();
      delete this.scenes[id];
    }
  }

  getToggle(id) {
    if (id in this.toggles) {
      return this.toggles[id];
    }

    return null;
  }

  getScene(id) {
    if (id in this.scenes) {
      return this.scenes[id];
    }

    return null;
  }
}

let DMenu = new dropDownMenu(
  [
    {
      id: "initial",
      heading: {
        text: "Settings",
        hideArrow: true,
      },
      items: [
        {
          text: "Quality",
          iconID: "qualIcon",
          open: "quality",
          subMenu: true,
        },

        {
          text: "Sources",
          iconID: "sourceIcon",
          open: "source",
        },
        {
          text: "Fill Mode",
          iconID: "fillIcon",
          open: "fillmode",
        },
        {
          text: "Config",
          iconID: "configIcon",
          open: "config",
        },
      ],
    },
    {
      id: "quality",
      selectableScene: true,
      heading: {
        text: "Quality",
      },
      items: [
        {
          text: "1080p",
          callback: () => console.log("1080p!"),
          highlightable: true,
          selected: true,
        },
        {
          text: "720p",
          callback: () => console.log("720p!"),
          highlightable: true,
          id: "720",
        },
        {
          text: "480p",
          callback: () => console.log("480p!"),
          highlightable: true,
        },
        {
          text: "Auto",
          toggle: true,
          id: "auto",
          on: false,
          toggleOn: () => console.log("Toggle on"),
          toggleOff: () => console.log("Toggle off"),
        },
      ],
    },

    {
      id: "source",
      selectableScene: true,
      heading: {
        text: "Sources",
      },
      items: [
        {
          text: "HLS#sub",
          highlightable: true,
          selected: true,
        },
        {
          text: "HLS#dub",
          highlightable: true,
        },
      ],
    },

    {
      id: "fillmode",
      selectableScene: true,
      heading: {
        text: "Fill Mode",
      },
      items: [
        {
          text: "Normal",
          highlightable: true,
          selected: true,
        },
        {
          text: "Stretch",
          highlightable: true,
        },
        {
          text: "Subtitles",
          highlightable: true,
        },
        {
          text: "Fill",
          open: "quality",
          // "highlightable": true
        },
      ],
    },

    {
      id: "config",
      heading: {
        text: "Configuration",
        back: true,
      },
      items: [
        {
          text: "Autoplay",
          toggle: true,
          toggleOn: () => console.log("Toggle on"),
          toggleOff: () => console.log("Toggle off"),
        },
        {
          text: "Rewatch Mode",
          toggle: true,
          toggleOn: () => console.log("Toggle on"),
          toggleOff: () => console.log("Toggle off"),
        },
        {
          text: "Hide Skip Intro",
          toggle: true,
          toggleOn: () => console.log("Toggle on"),
          toggleOff: () => console.log("Toggle off"),
        },
        {
          text: "Automatically Skip Intro",
          toggle: true,
          toggleOn: () => console.log("Toggle on"),
          toggleOff: () => console.log("Toggle off"),
        },
        {
          text: "Double Tap Time",
          textBox: true,
          onInput: function (value) {
            console.log(value.target.value);
          },
        },
        {
          text: "Skip Tutton Time",
          textBox: true,
          value: "hi",
          onInput: function (value) {
            console.log(value.target.value);
          },
        },
      ],
    },
  ],
  menuCon
);

DMenu.open("initial");
