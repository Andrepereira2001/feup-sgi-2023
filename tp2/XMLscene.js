import { CGFscene, CGFshader } from '../lib/CGF.js';
import { CGFaxis,CGFcamera } from '../lib/CGF.js';

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
        this.selectedCamera = ""

        this.observers = [];
        this.highlighted = new Map();
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.highlightShader = new CGFshader(this.gl, "shaders/highlight.vert", "shaders/highlight.frag");
        this.sceneInited = false;

        this.initCameras();
        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(50);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        if(this.graph === undefined || this.graph.views[this.selectedCamera] == undefined) {
            this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
        } else {
            this.cameras = this.graph.views
            this.camera = this.cameras[this.selectedCamera]
            this.interface.setActiveCamera(this.camera);
        }
    }

    /**
     * Updates the current active camera
     * @param {*} value 
     */
    updateCamera(value) {
        this.selectedCamera = value
        this.camera = this.cameras[this.selectedCamera]
        this.interface.setActiveCamera(this.camera);
    }

    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;  // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].name = key;
                this.lights[i].type = light[1];

                this.lights[i].setPosition(...light[2]);
                this.lights[i].setAmbient(...light[3]);
                this.lights[i].setDiffuse(...light[4]);
                this.lights[i].setSpecular(...light[5]);

                this.lights[i].setConstantAttenuation(light[6][0]);
                this.lights[i].setLinearAttenuation(light[6][1]);
                this.lights[i].setQuadraticAttenuation(light[6][2]);

                const attenuationMap = {
                    0: "Constant",
                    1: "Linear",
                    2: "Quadratic",
                };
                this.lights[i].attenuation = attenuationMap[light[6].indexOf(1.0)];

                if (this.lights[i].type === "spot") {
                    this.lights[i].setSpotCutOff(light[7]);
                    this.lights[i].setSpotExponent(light[8]);

                    let direction = [
                        light[9][0] - light[2][0],
                        light[9][1] - light[2][1],
                        light[9][2] - light[2][2],
                    ];
                    this.lights[i].setSpotDirection(...direction);
                }

                this.lights[i].setVisible(true);
                if (light[0]) {
                    this.lights[i].enable();
                } else {
                    this.lights[i].disable();
                }

                this.lights[i].update();
                i++;
            }
        }
    }

    updateLightAttenuation(light, value) {
        const updateAttenuation = (kc, kl, kq) => {
            light.setConstantAttenuation(kc);
            light.setLinearAttenuation(kl);
            light.setQuadraticAttenuation(kq);
        }

        switch (value) {
            case "Constant":
                updateAttenuation(1.0, 0.0, 0.0);
                return;
            case "Linear":
                updateAttenuation(0.0, 1.0, 0.0);
                return;
            case "Quadratic":
                updateAttenuation(0.0, 0.0, 1.0);
                return;
            default:
                return;
        }
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    /** Handler called when the graph is finally loaded.
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(...this.graph.background);

        this.setGlobalAmbientLight(...this.graph.ambient);

        this.initLights();
        this.interface.initLights();

        this.initCameras();
        this.interface.initCameras();

        this.interface.initHighlighted();

        this.sceneInited = true;
        this.startTime = undefined;
    }

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        this.axis.display();

        for (var i = 0; i < this.lights.length; i++) {
            this.lights[i].update();
            if (this.lights[i].name != undefined)
                this.lights[i].setVisible(true);
        }

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();

            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }

    /**
     * Add a key press observer
     * @param {*} obs
     */
    addKeyPressObs(obs){
        this.observers.push(obs)
    }

    /**
     * Handles a key press event
     * @param {*} event
     */
    keyPressed(event){
        this.observers.forEach(obs => obs.keyEvent(event))
    }

    /**
     * Called periodically according to the interval set in `this.setUpdatePeriod()`
     * @param {number} t - current time value that is always increasing
     */
    update(t) {
        this.highlightShader.setUniformsValues({
            time: t / 1000 % 10000,
        });

        if (this.sceneInited) {
            if (this.startTime === undefined)
                this.startTime = t;
            this.graph.computeAnimation(t - this.startTime)
        }
    }
}