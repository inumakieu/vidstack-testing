"use client";

import { useEffect, useState, useRef } from "react";
import styles from "../styles/SettingsPanel.module.scss";

export function SettingsPanel(props) {
  const menuCon = useRef(null);
  const [DMenu, setDMenu] = useState<any>();

  function createElement(x: any) {
    let temp;
    if ("element" in x) {
      temp = document.createElement(x.element);
    } else {
      temp = document.createElement("div");
    }
    let attributes = x.attributes;

    for (let value in attributes) {
      temp.setAttribute(value, attributes[value]);
    }

    for (let value in x.style) {
      temp.style[value] = x.style[value];
    }

    if ("id" in x) {
      temp.id = x.id;
    }

    if ("className" in x) {
      temp.className = x.className;
    }

    if ("innerText" in x) {
      temp.textContent = x.innerText;
    }

    if ("innerHTML" in x) {
      temp.innerHTML = x.innerHTML;
    }

    let listeners = x.listeners;

    for (let value in listeners) {
      temp.addEventListener(value, listeners[value]);
    }

    return temp;
  }

  class Toggle {
    element: any;
    constructor(element: any) {
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
      return this.element.classList.contains(`${styles.active}`);
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
    element: any;
    constructor(element: any) {
      this.element = element;
    }

    select() {
      this.element.click();
    }
  }

  class Scene {
    data: any;
    DDMinstance: any;
    element: any;
    constructor(config: any, dropDownMenuInstance: any) {
      this.data = config;
      this.DDMinstance = dropDownMenuInstance;
    }

    addItem(config: any, isHeading = false) {
      this.element
        .querySelector(`.${styles.scene}`)
        .append(this.DDMinstance.makeItem(config, isHeading, this.data.id));

      if (this.element.classList.contains(`${styles.active}`)) {
        this.DDMinstance.menuCon.style.height =
          this.element.querySelector(`.${styles.scene}`).offsetHeight + "px";
      }
    }

    delete() {
      this.deleteItems();
      this.data = null;
      this.DDMinstance = null;
      this.element.remove();
    }

    deleteItems() {
      this.element.querySelector(`.${styles.scene}`).innerHTML = "";

      if (this.data.id in this.DDMinstance.selectedValues) {
        this.DDMinstance.selectedValues[this.data.id] = "";
      }

      this.DDMinstance.updateSelectVals(this.data.id);
      this.DDMinstance.deleteSceneFromHistory(this.data.id);

      for (let item of this.data.items) {
        this.DDMinstance.deleteItem(item);
      }
      this.data.items = [];
    }
  }

  class dropDownMenu {
    scenes: any[];
    menuCon: any;
    history: any[];
    toggles: any[];
    selections: any[];
    selectedValues: any[];
    selectedValuesDOM: any[];
    constructor(scenes: any, menuCon: any) {
      this.scenes = [];
      this.menuCon = menuCon;
      this.history = [];
      this.toggles = [];
      this.selections = [];
      this.selectedValues = [];
      this.selectedValuesDOM = [];
      for (let scene of scenes) {
        this.scenes[scene.id] = new Scene(scene, this);
      }

      for (let scene of scenes) {
        if (!this.scenes[scene.id].element) {
          this.makeScene(scene);
        }
      }

      menuCon.onscroll = function () {
        menuCon.scrollLeft = 0;
      };
    }

    open(id: string) {
      if (id in this.scenes) {
        if (
          !this.history.length ||
          (this.history.length && this.history[this.history.length - 1] != id)
        ) {
          this.history.push(id);
        }

        for (let sceneID in this.scenes) {
          if (sceneID === id) {
            console.log(sceneID);
            this.scenes[sceneID].element.classList.add(`${styles.active}`);
            console.log(this.scenes[sceneID].element);
            this.menuCon.style.height =
              this.scenes[sceneID].element.querySelector(`.${styles.scene}`)
                .offsetHeight + "px";
          } else {
            this.scenes[sceneID].element.classList.remove(`${styles.active}`);
          }
        }
      }
    }

    back() {
      if (this.history.length > 1) {
        let lastHistory = this.history.pop();
        this.open(this.history.pop());
      } else {
        this.closeMenu();
      }
    }

    openMenu() {
      this.menuCon.style.display = "block";
    }

    closeMenu() {
      this.menuCon.style.display = "none";
    }

    makeItem(item: any, isHeading = false, sceneID: any) {
      item.selectedValue = this.selectedValues[item.open];

      let menuItem = createElement({
        className: isHeading ? `${styles.menuHeading}` : `${styles.menuItem}`,
        attributes: item.attributes ? item.attributes : {},
      });

      if (!isHeading && "iconID" in item) {
        let menuItemIcon = createElement({
          className: `${styles.menuItemIcon}`,
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
          className: `${styles.menuItemIcon} ${styles.menuItemIconBack}`,
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
        menuItem.classList.add(`${styles.selected}`);
        if (sceneID) {
          this.selectedValues[sceneID] = item.text;
          this.updateSelectVals(sceneID);
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
              child.classList.remove(`${styles.selected}`);
            }
          }

          menuItem.classList.add(`${styles.selected}`);

          if (sceneID) {
            self.selectedValues[sceneID] = menuItem.innerText;
            self.updateSelectVals(sceneID);
          }
        });
      }

      let menuItemText = createElement({
        className: `${styles.menuItemText}`,
        innerText: item.text,
      });

      menuItem.append(menuItemText);

      if (item.textBox) {
        let textBox = createElement({
          element: "input",
          className: `${styles.textBox}`,
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

      if (true) {
        // menuItem.classList.add("menuItemToggle");

        let valueDOM = createElement({
          innerText: item.selectedValue,
          className: `${styles.menuItemValue}`,
        });
        menuItem.append(valueDOM);

        item.valueDOM = valueDOM;
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

      if (item.open) {
        menuItem.append(
          createElement({
            className: `${styles.menuItemIcon} ${styles.menuItemIconSub}`,
            style: {
              marginLeft: item.selectedValue ? "3px" : "auto",
            },
          })
        );
      }
      if (item.toggle) {
        menuItem.classList.add(`${styles.menuItemToggle}`);
        let toggle = createElement({
          className: `${styles.toggle}`,
          listeners: {
            click: function () {
              this.classList.toggle(`${styles.active}`);
              if (this.classList.contains(`${styles.active}`)) {
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

    updateSelectVals(sceneID: any) {
      if (this.selectedValuesDOM[sceneID]) {
        for (let elems of this.selectedValuesDOM[sceneID].elements) {
          elems.innerText = this.selectedValues[sceneID];
        }
      }
    }
    makeScene(config: any) {
      let scene = createElement({
        className: `${styles.scene}`,
      });

      let sceneCon = createElement({
        className: `${styles.sceneCon}`,
      });

      let openScene = this.scenes[config.id];
      if (openScene.element) {
        return;
      }

      if (config.heading) {
        scene.append(this.makeItem(config.heading, true, config.id));
      }
      for (let item of config.items) {
        if (item.open) {
          let openScene = this.scenes[item.open];
          if (!openScene.element && openScene.data.selectableScene) {
            this.makeScene(this.scenes[item.open].data);
          }
        }

        scene.append(this.makeItem(item, false, config.id));
      }

      sceneCon.append(scene);
      this.scenes[config.id].element = sceneCon;
      this.menuCon.append(sceneCon);

      return sceneCon;
    }

    addScene(config: any) {
      let sceneDIV = this.makeScene(config);
      this.menuCon.append(sceneDIV);
      config.element = sceneDIV;
      this.scenes[config.id] = config;
    }

    deleteScene(id: any) {
      if (id in this.scenes) {
        this.scenes[id].delete();
        delete this.scenes[id];
      }
    }

    deleteItem(item: any) {
      if (item.id in this.selections) {
        delete this.selections[item.id];
      }

      if (item.id in this.toggles) {
        delete this.toggles[item.id];
      }

      if (item.open) {
        let elem = this.selectedValuesDOM[item.open];
        if (elem) {
          let elements = elem.elements;
          let idx = elements.indexOf(item.valueDOM);
          if (idx > -1) {
            elements.splice(idx, 1);
          }
        }
      }
    }

    deleteSceneFromHistory(val: any) {
      for (var i = this.history.length - 1; i >= 0; i--) {
        if (this.history[i] == val) {
          this.history.splice(i, 1);
        }
      }
    }

    getToggle(id: any) {
      if (id in this.toggles) {
        return this.toggles[id];
      }

      return null;
    }

    getScene(id: any) {
      if (id in this.scenes) {
        return this.scenes[id];
      }

      return null;
    }
  }

  useEffect(() => {
    console.log("SettingsMenu");
    console.log(menuCon.current);
    let tempData = new dropDownMenu(
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
          items: props.sources.map((ep: any) => {
            return {
              text: ep.quality,
              callback: () => console.log("1080p!"),
              highlightable: true,
              selected: ep.quality == "1080p" ? true : false,
            };
          }),
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
              text: "Fill Mode",
              iconID: "fillIcon",
              open: "fillmode",
            },
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
      menuCon.current
    );
    console.log(tempData);

    setDMenu(tempData);
  }, []);

  useEffect(() => {
    console.log(DMenu);
    if (DMenu != null) {
      DMenu.open("initial");
      DMenu.closeMenu();
    }
    console.log(styles.active);
  }, [DMenu]);

  useEffect(() => {
    if (DMenu != null) {
      if (props.isOpen) {
        DMenu.openMenu();
      } else {
        DMenu.closeMenu();
      }
    }
  }, [props.isOpen]);

  return (
    <div className={styles.menuWrapper}>
      <div className={styles.menuCon} ref={menuCon}></div>
    </div>
  );
}
