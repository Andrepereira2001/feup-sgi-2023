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
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;

        this.scene.keyPressed(event)
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}