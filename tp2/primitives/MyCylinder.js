import { CGFobject } from '../../lib/CGF.js';

/**
 * @class MyCylinder
 */
export class MyCylinder extends CGFobject {
    /**
     * @constructor
     * @param scene - reference to MyScene object
     * @param {string} id - id of the primitive
     * @param {float} base - radius of the base
     * @param {float} top - radius of the top
     * @param {float} height - height of the cylinder
     * @param {integer} slices - number of divisions around Z axis
     * @param {integer} stacks - number of divisions on Z axis
     */
    constructor(scene, id, base, top, height, slices, stacks) {
        super(scene);
        this.base = base;
        this.top = top;
        this.height = height;
        this.slices = slices;
        this.stacks = stacks;

        this.initBuffers();
    }

    initBuffers() {
        const stackHeight = this.height / this.stacks;
        const sliceAngle = 2 * Math.PI / this.slices;
        const stackRadiusDelta = (this.base - this.top) / this.stacks;

        const zNormal = Math.sin(Math.atan((this.base - this.top) / this.height));

        const cosTable = [...Array(this.slices).keys()].map(slice => Math.cos(slice * sliceAngle));
        const sinTable = [...Array(this.slices).keys()].map(slice => Math.sin(slice * sliceAngle));

        // generation of the vertices and its corresponding normal vec and texCoord
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];

        for (let stack = 0; stack <= this.stacks; stack++) {
            for (let slice = 0; slice <= this.slices; slice++) {
                const stackRadius = this.base - stackRadiusDelta * stack;
                const i = slice % this.slices;
                const magnitude = Math.sqrt(
                    cosTable[i] * cosTable[i] +
                    sinTable[i] * sinTable[i] +
                    zNormal * zNormal
                );

                this.vertices.push(
                    cosTable[i] * stackRadius,
                    sinTable[i] * stackRadius,
                    stack * stackHeight
                );
                this.normals.push(
                    cosTable[i] / magnitude,
                    sinTable[i] / magnitude,
                    zNormal / magnitude
                );
                this.texCoords.push(
                    slice / this.slices,
                    1 - stack / this.stacks
                );
            }
        }

        // indices generation: first counter-clockwise and then clockwise
        this.indices = [];

        for (let stack = 0; stack < this.stacks; stack++) {
            for (let slice = 0; slice < this.slices; slice++) {
                this.indices.push(
                    stack * (this.slices + 1) + slice,
                    stack * (this.slices + 1) + slice + 1,
                    (stack + 1) * (this.slices + 1) + slice
                );
                this.indices.push(
                    (stack + 1) * (this.slices + 1) + slice,
                    stack * (this.slices + 1) + slice + 1,
                    (stack + 1) * (this.slices + 1) + slice + 1
                );
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    /**
	 * @method updateTexCoords
	 * Dummy method in order to make the primitive's API uniform across all of them
	 * @param {float} lengthS - Scale factor in the S axis
	 * @param {float} lengthT - Scale factor in the T axis
	 */
	updateTexCoords(lengthS, lengthT) {
	}
}
