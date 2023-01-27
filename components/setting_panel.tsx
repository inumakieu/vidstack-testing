"use client";

import { useEffect, useState, useRef } from "react";
import styles from "../styles/SettingsPanel.module.scss";

export function SettingsPanel(props: any) {
    const menuCon = useRef(null);
    const [DMenu, setDMenu] = useState<any>();

    class settingsPull {
      constructor(dom, callback, shouldCheck = false) {
        this.dom = dom;
        this.shouldCheck = shouldCheck;
        let self = this;
        this.callback = callback;
        this.iniX = 0;
        this.lastX = 0;
        this.sensitivity = 50;
        this.iniTop = 0;
        this.dom.addEventListener("touchstart", function (event) {
          self.touchStart(event, self);
        }, { passive: true });
    
        this.dom.addEventListener("touchmove", function (event) {
          self.touchMove(event, self);
        }, { passive: true });
    
        this.dom.addEventListener("touchend", function (event) {
          self.touchEnd(self);
        });
    
        this.dom.addEventListener("touchcancel", function (event) {
          self.touchEnd(self);
        });
    
        self.shouldStart = false;
        self.hasMoved = false;
        self.settingCon = document.querySelector(".menuCon");
      }
    
      touchStart(event, self) {
        
        if(self.shouldCheck){
          self.scrollCon = self.dom.querySelector(".sceneCon.active");
        }
    
        if (self.shouldCheck && self.scrollCon.scrollTop !== 0) {
          return;
        }
    
        const targetTouches = event.targetTouches;
        let x = targetTouches[0].screenY;
        self.iniX = x;
        self.shouldStart = true;
        self.iniTop = self.settingCon.offsetTop;
        self.settingCon.style.transitionDuration = "0ms";
    
      }
    
      touchMove(event, self) {
        
        if ((self.shouldCheck && self.scrollCon.scrollTop > 0) || self.shouldStart === false) {
          self.shouldStart = false;
          return;
        }
        
        const targetTouches = event.targetTouches;
        let x = targetTouches[0].screenY;
    
        let translate = -(-x + self.iniX);
        if(translate > 0){
    
          console.log(`translateY(${-(-x + self.iniX)}px)`, self.settingCon.style.transform);
          self.settingCon.style.transform = `translateY(${-(-x + self.iniX)}px)`;
          self.lastX = -x + self.iniX;
        }
      }
    
      touchEnd(self) {
        // if(self.hasMoved){
        // 	self.callback();
        // }else{
        // 	self.dom.style.opacity = "1";
        // 	self.dom.style.transform = `translateX(0px)`;
        // }
    
        console.log(self.shouldStart);
    
        if (self.shouldStart === false) {
          self.settingCon.style.transform = `translateY(0)`;
          return;
        }
    
        if (self.lastX < -75) {
          self.callback();
        } else {
          self.settingCon.style.transform = `translateY(0)`;
        }
    
        self.settingCon.style.transitionDuration = "200ms";
    
    
        self.iniTop = 0;
        self.iniX = 0;
        self.lastX = 0;
        self.shouldStart = false;
        self.hasMoved = false;
    
    
      }
    }

    function createElement(config) {
        let temp;
        if ("element" in config) {
            temp = document.createElement(config.element);
        } else {
            temp = document.createElement("div");
        }
        let attributes = config.attributes;
        for (let value in attributes) {
            temp.setAttribute(value, attributes[value]);
        }
        for (let value in config.style) {
            temp.style[value] = config.style[value];
        }
        if ("id" in config) {
            temp.id = config.id;
        }
        if ("class" in config) {
            temp.className = config.class;
        }
        if ("innerText" in config) {
            temp.textContent = config.innerText;
        }
        if ("innerHTML" in config) {
            temp.innerHTML = config.innerHTML;
        }
        let listeners = config.listeners;
        for (let value in listeners) {
            temp.addEventListener(value, function () {
                listeners[value].bind(this)();
            });
        }
        return temp;
    }
    /**
     * A toggle class
     */
    class Toggle {
        constructor(element) {
            this.element = element;
        }
        /**
         * Turns the toggle on if it isn't already on
         */
        turnOn() {
            if (!this.isOn()) {
                this.element.click();
            }
        }
        /**
         * Turns the toggle off if it isn't already off
         */
        turnOff() {
            if (this.isOn()) {
                this.element.click();
            }
        }
        /**
         * Checks if the toggle is on
         * @returns true if the toggle is on. false otherwise
         */
        isOn() {
            return this.element.classList.contains("active");
        }
        /**
         * Toggles the toggle
         */
        toggle() {
            if (this.isOn()) {
                this.turnOff();
            } else {
                this.turnOn();
            }
        }
    }
    class Selectables {
        constructor(element, DDMinstance, sceneID, sceneElem) {
            this.element = element;
            this.DDMinstance = DDMinstance;
            this.sceneID = sceneID;
            this.sceneElem = sceneElem;
        }
        select() {
            Selectables.selectWithoutCallback(
                this.element,
                this.DDMinstance,
                this.sceneID,
                this.sceneElem
            );
        }
        selectWithCallback() {
            this.element.click();
        }
        static selectWithoutCallback(element, DDMinstance, sceneID, sceneElem) {
            let parentElement = element.parentElement
                ? element.parentElement
                : sceneElem;
            let siblings = parentElement.children;
            for (let i = 0; i < siblings.length; i++) {
                let child = siblings[i];
                if (child.getAttribute("highlightable") === "true") {
                    child.classList.remove("selected");
                }
            }
            element.classList.add("selected");
            if (sceneID) {
                let selectedValue = element.getAttribute("data-alttext");
                DDMinstance.selectedValues[sceneID] = selectedValue
                    ? selectedValue
                    : element.innerText;
                DDMinstance.updateSelectVals(sceneID);
            }
        }
    }
    class Scene {
        /**
         *
         * @param {menuSceneConfig} config the config that builds the scene
         * @param {dropDownMenu} dropDownMenuInstance The drop down menu that the scene is a part of
         *
         */
        constructor(config, dropDownMenuInstance) {
            this.data = config;
            this.DDMinstance = dropDownMenuInstance;
        }
        addItem(config, isHeading = false) {
            var _a, _b;
            if (!this.DDMinstance) return;
            if (!this.data) return;
            let sceneElem = this.element.querySelector(".scene");
            if (sceneElem) {
                let item = this.DDMinstance.makeItem(
                    config,
                    isHeading,
                    this.data.id,
                    sceneElem
                );
                if (
                    config.selected &&
                    config.triggerCallbackIfSelected === true
                ) {
                    item.click();
                }
                sceneElem.append(item);
            }
            if (this.element.classList.contains("active")) {
                this.DDMinstance.menuCon.style.height =
                    ((_b =
                        (_a = this.element.querySelector(".scene")) === null ||
                        _a === void 0
                            ? void 0
                            : _a.offsetHeight) !== null && _b !== void 0
                        ? _b
                        : 100) + "px";
                        this.DDMinstance.menuCon.style.setProperty('--height', ((_b =
                          (_a = this.element.querySelector(".scene")) === null ||
                          _a === void 0
                              ? void 0
                              : _a.offsetHeight) !== null && _b !== void 0
                          ? _b
                          : 100) + "px")
            }
        }
        delete() {
            this.deleteItems();
            delete this.DDMinstance.scenes[this.data.id];
            this.data = undefined;
            this.DDMinstance = undefined;
            this.element.remove();
        }
        deleteItems() {
            if (!this.DDMinstance) return;
            if (!this.data) return;
            let sceneDOM = this.element.querySelector(".scene");
            if (sceneDOM) {
                sceneDOM.innerHTML = "";
            }
            if (this.data.id in this.DDMinstance.selectedValues) {
                this.DDMinstance.selectedValues[this.data.id] = "";
            }
            this.DDMinstance.updateSelectVals(this.data.id);
            this.DDMinstance.deleteSceneFromHistory(this.data.id);
            for (const item of this.data.items) {
                this.DDMinstance.deleteItem(item);
            }
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
            for (const scene of scenes) {
                this.scenes[scene.id] = new Scene(scene, this);
            }
            for (const scene of scenes) {
                if (!this.scenes[scene.id].element) {
                    this.makeScene(scene);
                }
            }
            menuCon.onscroll = function () {
                menuCon.scrollLeft = 0;
            };
        }
        /**
         * Opens a scene
         * @param {string} id the sceneID
         */
        open(id) {
            if (id && id in this.scenes) {
                if (
                    !this.history.length ||
                    (this.history.length &&
                        this.history[this.history.length - 1] != id)
                ) {
                    this.history.push(id);
                }
                for (const sceneID in this.scenes) {
                    if (sceneID === id) {
                        this.scenes[sceneID].element.classList.add("active");
                        this.menuCon.style.height =
                            this.scenes[sceneID].element.querySelector(".scene")
                                .offsetHeight + "px";
                        this.menuCon.style.setProperty('--height', this.scenes[sceneID].element.querySelector(".scene")
                        .offsetHeight + "px")
                    } else {
                        this.scenes[sceneID].element.classList.remove("active");
                    }
                }
            }
        }
        /**
         * Goes back to the the last-opened scene
         * Closes the menu if it can't go back
         */
        back() {
            if (this.history.length > 1) {
                let lastHistory = this.history.pop();
                this.open(this.history.pop());
            } else {
                this.closeMenu();
            }
        }
        /**
         * Opens the menu
         */
        openMenu() {
          this.menuCon.style.opacity = "1";
          this.menuCon.style.pointerEvents = "auto";

        }
        /**
         * Closes the menu
         */
        closeMenu() {
            this.menuCon.style.opacity = "0";
            this.menuCon.style.pointerEvents = "none";

        }
        /**
         *
         * @param {menuItemConfig} itemConfig the config object used to build the menuItem
         * @param {boolean} isHeading if the item is a heading or now
         * @param {string} sceneID the sceneID of the scene of which this menuItem is a part of
         * @returns {HTMLElement}
         */
        makeItem(itemConfig, isHeading, sceneID, sceneElem) {
            let item = itemConfig;
            let shouldShowValue = false;
            if (item.open) {
                item.selectedValue = this.selectedValues[item.open];
                if (this.scenes[item.open] instanceof Scene) {
                    shouldShowValue =
                        this.scenes[item.open].data.selectableScene === true;
                }
            }
            const tempConfig = {
                class: "menuItemText",
            };
            if (item.html) {
                tempConfig.innerHTML = isHeading
                    ? `<div style="display: flex; align-items: center; gap: 8px;"><svg width="10px" height="10px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="#8a8a8a"><path fill="#8a8a8a" d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 278.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>${item.html}</div>`
                    : item.html;
            } else {
                tempConfig.innerHTML = isHeading
                    ? `<div style="display: flex; align-items: center; gap: 8px;"><svg width="10px" height="10px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="#8a8a8a"><path fill="#8a8a8a" d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 278.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>${item.text}</div>`
                    : item.text;
            }
            if (item.altText) {
                tempConfig.attributes = {
                    "data-alttext": item.altText,
                };
            }
            const menuConfig = {
                class: isHeading ? "menuHeading" : "menuItem",
            };
            if (item.attributes) {
                menuConfig.attributes = item.attributes;
            }
            const menuItem = createElement(menuConfig);
            const menuItemText = createElement(tempConfig);
            if (item.altText) {
                menuItem.setAttribute("data-alttext", item.altText);
            }
            if (!isHeading && "iconID" in item) {
                const menuItemIcon = createElement({
                    class: "menuItemIcon",
                    id: item.iconID,
                });
                menuItem.append(menuItemIcon);
            }
            if (item.open && !isHeading) {
                menuItem.addEventListener("click", () => {
                    this.open(item.open);
                });
            }
            if (isHeading && item.hideArrow !== true) {
                const menuItemIcon = createElement({
                    class: "menuItemIcon menuItemIconBack",
                });
                menuItem.addEventListener("click", () => {
                    this.back();
                });
                menuItem.append(menuItemIcon);
            }
            if (item.callback) {
                menuItem.addEventListener("click", () => {
                    var _a;
                    (_a = item.callback) === null || _a === void 0
                        ? void 0
                        : _a.bind(menuItem)();
                });
            }
            // Should be before selectWithoutCallback is called to make sure
            // .innerText is not an empty string
            menuItem.append(menuItemText);
            if (item.selected) {
                if (sceneID) {
                    Selectables.selectWithoutCallback(
                        menuItem,
                        this,
                        sceneID,
                        sceneElem
                    );
                    this.updateSelectVals(sceneID);
                }
            }
            if (item.highlightable) {
                if (item.id) {
                    this.selections[item.id] = new Selectables(
                        menuItem,
                        this,
                        sceneID,
                        sceneElem
                    );
                }
                menuItem.setAttribute("highlightable", "true");
                menuItem.addEventListener("click", () => {
                    Selectables.selectWithoutCallback(
                        menuItem,
                        this,
                        sceneID,
                        sceneElem
                    );
                });
            }
            if (item.textBox) {
                const textBox = createElement({
                    element: "input",
                    class: "textBox",
                    attributes: {
                        type: "text",
                    },
                });
                if (item.value) {
                    textBox.value = item.value;
                }
                textBox.addEventListener("input", function (event) {
                    if (item.onInput) {
                        item.onInput(event);
                    }
                });
                menuItem.append(textBox);
            }
            if (shouldShowValue) {
                const valueDOM = createElement({
                    innerText: item.selectedValue,
                    class: "menuItemValue",
                });
                menuItem.append(valueDOM);
                item.valueDOM = valueDOM;
                if (item.open) {
                    if (!this.selectedValuesDOM[item.open]) {
                        this.selectedValuesDOM[item.open] = {};
                    }
                    const sValue = this.selectedValuesDOM[item.open];
                    if (sValue.elements) {
                        sValue.elements.push(valueDOM);
                    } else {
                        sValue.elements = [valueDOM];
                    }
                }
            }
            if (item.open && item.hideSubArrow !== true) {
                menuItem.append(
                    createElement({
                        class: "menuItemIcon menuItemIconSub",
                        style: {
                            marginLeft: item.selectedValue ? "3px" : "auto",
                        },
                    })
                );
            }
            if (item.toggle) {
                menuItem.classList.add("menuItemToggle");
                let toggle = createElement({
                    class: `toggle ${item.on ? " active" : ""}`,
                    listeners: {
                        click: function () {
                            this.classList.toggle("active");
                            if (this.classList.contains("active")) {
                                item.toggleOn ? item.toggleOn() : "";
                            } else {
                                item.toggleOff ? item.toggleOff() : "";
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
        /**
         * Updates all menuItems that point to the scene with a particular sceneID
         * @param {string} sceneID the sceneID of the scene whose selected values will be updated
         */
        updateSelectVals(sceneID) {
            if (this.selectedValuesDOM[sceneID]) {
                for (const elems of this.selectedValuesDOM[sceneID].elements) {
                    elems.innerText = this.selectedValues[sceneID];
                }
            }
        }
        makeScene(config) {
            const scene = createElement({
                class: "scene",
            });
            const sceneCon = createElement({
                class: "sceneCon",
            });
            const openScene = this.scenes[config.id];
            if (
                openScene === null || openScene === void 0
                    ? void 0
                    : openScene.element
            ) {
                return;
            }
            if (config.heading) {
                scene.append(
                    this.makeItem(config.heading, true, config.id, scene)
                );
            }
            for (const item of config.items) {
                let newItemConfig = item;
                if (item.open) {
                    const openScene = this.scenes[item.open];
                    if (!openScene.element && openScene.data.selectableScene) {
                        this.makeScene(this.scenes[item.open].data);
                    }
                }
                scene.append(
                    this.makeItem(newItemConfig, false, config.id, scene)
                );
            }
            sceneCon.append(scene);
            this.scenes[config.id].element = sceneCon;
            this.menuCon.append(sceneCon);
            return sceneCon;
        }
        addScene(config) {
            this.scenes[config.id] = new Scene(config, this);
            const sceneDIV = this.makeScene(config);
            if (sceneDIV) {
                this.menuCon.append(sceneDIV);
                config.element = sceneDIV;
            }
        }
        deleteScene(id) {
            if (id in this.scenes) {
                this.scenes[id].delete();
                delete this.scenes[id];
            }
        }
        deleteItem(item) {
            if (item.id && item.id in this.selections) {
                delete this.selections[item.id];
            }
            if (item.id && item.id in this.toggles) {
                delete this.toggles[item.id];
            }
            if (item.open) {
                const elem = this.selectedValuesDOM[item.open];
                if (elem) {
                    const elements = elem.elements;
                    let idx = elements.indexOf(item.valueDOM);
                    if (idx > -1) {
                        elements.splice(idx, 1);
                    }
                }
            }
        }
        deleteSceneFromHistory(val) {
            for (let i = this.history.length - 1; i >= 0; i--) {
                if (this.history[i] == val) {
                    this.history.splice(i, 1);
                }
            }
        }
        /**
         *
         * @param {string} id the id of the toggle
         * @returns {Toggle | null}
         */
        getToggle(id) {
            if (id in this.toggles) {
                return this.toggles[id];
            }
            return null;
        }
        /**
         *
         * @param {string} id the id of the scene
         * @returns {Scene | null}
         */
        getScene(id) {
            if (id in this.scenes) {
                return this.scenes[id];
            }
            return null;
        }
    }

    useEffect(() => {
        console.log("SettingsMenu");
        console.log(menuCon.current);
        let subs = [];

        subs.push({
            text: "Styling",
            iconID: "fillIcon",
            open: "subStyle",
        });

        const languageNames = new Intl.DisplayNames(["en"], {
            type: "language",
        });

        props.subtitles.map((ep: any, index: number) => {
            subs.push({
                text: languageNames.of(ep.lang.split("-")[0]),
                callback: () => console.log(ep.lang),
                highlightable: true,
                selected: ep.lang == "en-US" ? true : false,
            });
        });

        let tempData = new dropDownMenu(
            [
                {
                    id: "initial",
                    items: [
                        {
                            html: "<div style='color: white'>Speed</div>",
                            iconID: "speedIcon",
                            open: "speed",
                        },
                        {
                            html: "<div style='color: white'>Quality</div>",
                            iconID: "qualIcon",
                            open: "quality",
                        },
                        {
                            html: "<div style='color: white'>Subtitles</div>",
                            iconID: "sourceIcon",
                            open: "subtitle",
                        },
                        {
                            html: "<div style='color: white'>Settings</div>",
                            iconID: "configIcon",
                            open: "config",
                        },
                    ],
                },
                {
                    id: "speed",
                    selectableScene: true,
                    heading: {
                        html: "<div style='color: white'>Speed</div>",
                        open: "speed",
                        hideSubArrow: true,
                    },
                    items: [
                        {
                            html: `<div class="radioItemWrapper"><div class="radioButtonOutside"><div class="radioButtonInside"></div></div> 0.5x</div>`,
                            callback: () => {},
                            highlightable: true,
                            selected: false,
                        },
                        {
                            html: `<div class="radioItemWrapper"><div class="radioButtonOutside"><div class="radioButtonInside"></div></div> 1x</div>`,
                            callback: () => {},
                            highlightable: true,
                            selected: true,
                        },
                        {
                            html: `<div class="radioItemWrapper"><div class="radioButtonOutside"><div class="radioButtonInside"></div></div> 1.5x</div>`,
                            callback: () => {},
                            highlightable: true,
                            selected: false,
                        },
                    ],
                },
                {
                    id: "quality",
                    selectableScene: true,
                    heading: {
                        html: "<div style='color: white'>Quality</div>",
                        open: "quality",
                        hideSubArrow: true,
                    },
                    items: props.sources.map((ep: any) => {
                        return {
                            html: `<div class="qualityItem"><div class="radioItemWrapper"><div class="radioButtonOutside"><div class="radioButtonInside"></div></div>${
                                ep.quality
                            }</div><h4 class="hdText">${
                                ep.quality == "1080p"
                                    ? "HD"
                                    : ep.quality == "720p"
                                    ? "SD"
                                    : ""
                            }</h4></div>`,
                            altText: ep.quality,
                            callback: () => console.log(ep.quality),
                            highlightable: true,
                            selected: ep.quality == "1080p" ? true : false,
                        };
                    }),
                },
                {
                    id: "subtitle",
                    selectableScene: true,
                    heading: {
                        text: "Subtitles",
                    },
                    items: subs,
                },
                {
                    id: "subStyle",
                    selectableScene: true,
                    heading: {
                        text: "Sub Styling",
                    },
                    items: [
                        {
                            text: "Disable Subs",
                            toggle: true,
                            toggleOn: () => console.log("Toggle on"),
                            toggleOff: () => console.log("Toggle off"),
                        },
                        {
                            text: "Font Color",
                            textBox: true,
                            value: "#000000",
                            onInput: function (value) {
                                console.log(value.target.value);
                            },
                        },
                        {
                            text: "Font Opacity",
                            textBox: true,
                            value: "0.7",
                            onInput: function (value) {
                                console.log(value.target.value);
                            },
                        },
                        {
                            text: "Background Color",
                            textBox: true,
                            value: "#000000",
                            onInput: function (value) {
                                console.log(value.target.value);
                            },
                        },
                        {
                            text: "Background Opacity",
                            textBox: true,
                            value: "0.7",
                            onInput: function (value) {
                                console.log(value.target.value);
                            },
                        },
                        {
                            text: "Font Size",
                            textBox: true,
                            value: "24",
                            onInput: function (value) {
                                console.log(value.target.value);
                            },
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
                            html: '<h3 class="qualityText">Autoplay</h3>',
                            toggle: true,
                            toggleOn: () => console.log("Toggle on"),
                            toggleOff: () => console.log("Toggle off"),
                        },
                        {
                            html: '<h3 class="qualityText">Hide Skip Intro</h3>',
                            toggle: true,
                            toggleOn: () => console.log("Toggle on"),
                            toggleOff: () => console.log("Toggle off"),
                        },
                        {
                            html: '<h3 class="qualityText">Auto Skip Intro</h3>',
                            toggle: true,
                            toggleOn: () => console.log("Toggle on"),
                            toggleOff: () => console.log("Toggle off"),
                        },
                    ],
                },
            ],
            menuCon.current
        );
        console.log(tempData);

        setDMenu(tempData);

        new settingsPull(document.querySelector(".menuCon"), () => {props.setIsOpen(false)}, true);
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
            <div className="menuCon" ref={menuCon}></div>
        </div>
    );
}
