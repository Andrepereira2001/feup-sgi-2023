/**
 * @class MyComponent
 */
 export class MyComponent {

    constructor() {
        this.transformationMatrix = mat4.create();

        this.materials = [];
        this.materialIdx = 0;

        this.texture = "";
        this.animation = "";
        this.lengthS = 1;
        this.lengthT = 1;
        this.hasToUpdateTexCoords = false;

        this.childrenPrimitives = [];
        this.childrenComponents = [];

        this.highlighted = false;

        this.active = false;
    }

    /**
     * Called when a key is pressed
     * @param {*} event
     */
    keyEvent(event) {
        if (event.code == "KeyM")
            this.materialIdx = (this.materialIdx + 1) % this.materials.length
    }

    /**
     * Returns the current active material
     */
    getMaterialId() {
        return this.materials[this.materialIdx]
    }
 }