import { CGFnurbsObject, CGFnurbsSurface } from "../../lib/CGF.js";

/**
 * @class MyPatch
 */
export class MyPatch {

    /**
     * @constructor
     * @param {CGFscene} scene - reference to MyScene Object
     * @param {string} id - id of the primitive
     * @param {integer} uDegree - degree in U
     * @param {integer} vDegree - degree in V
     * @param {array} controlPoints - list of control points, divided by U and V
     * @param {integer} uDivs - number of divisions in the U direction
     * @param {integer} vDivs - number of divisions in the V direction
     */
    constructor(scene, id, uDegree, vDegree, controlPoints, uDivs = 20, vDivs = 20) {
        this.surface = new CGFnurbsSurface(uDegree, vDegree, controlPoints);
        this.obj = new CGFnurbsObject(scene, uDivs, vDivs, this.surface);
    }

    /**
     * Displays the nurb in the scene
     */
    display() {
        this.obj.display();
    }

    updateTexCoords(lengthS, lengthT) {
        // Dummy function
    }
}