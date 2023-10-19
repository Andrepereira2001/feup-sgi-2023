import { CGFobject } from "../../lib/CGF.js";

/**
 * @class MyTorus
 */
export class MyTorus extends CGFobject {

    /**
     * @constructor
     * @param scene - reference to MyScene object
     * @param {string} id - id of the primitive
     * @param {float} inner - radius of the "tube" of the torus
     * @param {float} outer - radius of the "circular axis" of the torus
     * @param {integer} slices - number of divisions around the inner radius
     * @param {integer} loops - number of divisions around the outer radius
     */
    constructor(scene, id, inner, outer, slices, loops) {
        super(scene);
        this.inner = inner;
        this.outer = outer;
        this.slices = slices;
        this.loops = loops;

        this.initBuffers();
    }

    initBuffers() {
        const sliceAngle = 2 * Math.PI / this.slices;
        const loopAngle = 2 * Math.PI / this.loops;

        const slicesCosTable = [...Array(this.slices + 1).keys()].map(slice => Math.cos(slice * sliceAngle));
        const slicesSinTable = [...Array(this.slices + 1).keys()].map(slice => Math.sin(slice * sliceAngle));
        const loopsCosTable = [...Array(this.loops + 1).keys()].map(loop => Math.cos(loop * loopAngle));
        const loopsSinTable = [...Array(this.loops + 1).keys()].map(loop => Math.sin(loop * loopAngle))

        // generation of the vertices and its corresponding normal vec and texCoord
        this.vertices = [];
        this.normals = [];
        this.texCoords = [];

        for (let loop = 0; loop <= this.loops; loop++) {
            for (let slice = 0; slice <= this.slices; slice++) {
                this.vertices.push(
                    (this.outer + this.inner * slicesCosTable[slice]) * loopsCosTable[loop],
                    (this.outer + this.inner * slicesCosTable[slice]) * loopsSinTable[loop],
                    this.inner * slicesSinTable[slice]
                );
                this.normals.push(
                    slicesCosTable[slice] * loopsCosTable[loop],
                    slicesCosTable[slice] * loopsSinTable[loop],
                    slicesSinTable[slice]
                );
                this.texCoords.push(
                    1 - loop * loopAngle / (2 * Math.PI),
                    slice * sliceAngle / (2 * Math.PI)
                );
            }
        }

        // indices generation: first counter-clockwise and then clockwise
        this.indices = [];

        for (let loop = 0; loop < this.loops; loop++) {
            for (let slice = 0; slice < this.slices; slice++) {
                this.indices.push(
                    loop * (this.slices + 1) + slice,
                    (loop + 1) * (this.slices + 1) + slice,
                    loop * (this.slices + 1) + slice + 1
                );
                this.indices.push(
                    (loop + 1) * (this.slices + 1) + slice,
                    (loop + 1) * (this.slices + 1) + slice + 1,
                    loop * (this.slices + 1) + slice + 1
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
