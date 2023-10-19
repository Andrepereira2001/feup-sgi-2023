import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)
        this.lights = this.gui.addFolder("Lights");
        this.lights.open();
        this.cameras = this.gui.addFolder("Cameras");
        this.cameras.open();
        this.highlighted = this.gui.addFolder("Highlighted");
        this.highlighted.open();

        this.initKeys();

        return true;
    }

    /**
     * Creates the GUI for controlling the lights
     */
    initLights() {
        for (const light of this.scene.lights) {
            if (light.name != undefined) {
                let lightFolder = this.lights.addFolder(`[${light.type}] ${light.name}`);

                lightFolder
                    .add(light, "enabled")
                    .name("enabled")
                    .onChange(() => { light.update(); })
                lightFolder
                    .add(light, "attenuation", ["Constant", "Linear", "Quadratic"])
                    .name("attenuation")
                    .onChange((value) => {
                        this.scene.updateLightAttenuation(light, value);
                        light.update();
                    });
            }
        }
    }

    /**
     * Creates the GUI for controlling the lights
     */
    initCameras() {
        const cameras = Object.keys(this.scene.cameras);
        this.cameras
            .add(this.scene, "selectedCamera", cameras)
            .name("selected camera")
            .onChange((value) => { this.scene.updateCamera(value); });
    }

    /**
     * Creates the GUI for controlling highlighted components
     */
    initHighlighted() {
        for (const [component, highlighted] of this.scene.highlighted) {
            let componentFolder = this.highlighted.addFolder(component);
            const color = {
                value: highlighted.color.map(c => c * 255)
            };

            componentFolder
                .add(highlighted, "enabled")
                .name("enabled");
            componentFolder
                .add(highlighted, "scale")
                .name("scale factor");
            componentFolder
                .addColor(color, "value")
                .name("target color")
                .onChange(() => highlighted.color = color.value.map(c => c / 255));
        }
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    /**
     * Handles key down event
     * @param {*} event key event
     */
    processKeyDown(event) {
        this.activeKeys[event.code]=true;

        this.scene.keyPressed(event)
    };

    /**
     * Handles key up event
     * @param {*} event key event
     */
    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    /**
     * checks if key is pressed
     * @param {*} event 
     */
    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}