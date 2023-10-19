import { CGFobject } from '../../lib/CGF.js';
/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 * @param {integer} id - id of the primitive
 * @param {float} x1 - X coordinate of the first vertice
 * @param {float} y1 - Y coordinate of the first vertice
 * @param {float} z1 - Z coordinate of the first vertice
 * @param {float} x2 - X coordinate of the second vertice
 * @param {float} y2 - Y coordinate of the second vertice
 * @param {float} z2 - Z coordinate of the second vertice
 * @param {float} x3 - X coordinate of the third vertice
 * @param {float} y3 - Y coordinate of the third vertice
 * @param {float} z3 - Z coordinate of the third vertice
 */
export class MyTriangle extends CGFobject {
	constructor(scene, id, x1, y1, z1, x2, y2, z2, x3, y3, z3) {
		super(scene);

		this.x1 = x1;
		this.y1 = y1;
        this.z1 = z1;
		this.x2 = x2;
		this.y2 = y2;
		this.z2 = z2;
        this.x3 = x3;
		this.y3 = y3;
		this.z3 = z3;

		this.a = Math.sqrt(
			(this.x2 - this.x1) * (this.x2 - this.x1) +
			(this.y2 - this.y1) * (this.y2 - this.y1) +
			(this.z2 - this.z1) * (this.z2 - this.z1)
		);
		this.b = Math.sqrt(
			(this.x3 - this.x2) * (this.x3 - this.x2) +
			(this.y3 - this.y2) * (this.y3 - this.y2) +
			(this.z3 - this.z2) * (this.z3 - this.z2)
		);
		this.c = Math.sqrt(
			(this.x1 - this.x3) * (this.x1 - this.x3) +
			(this.y1 - this.y3) * (this.y1 - this.y3) +
			(this.z1 - this.z3) * (this.z1 - this.z3)
		);

		this.cosAlpha = (this.a * this.a - this.b * this.b + this.c * this.c) / (2 * this.a * this.c);
		this.sinAlpha = Math.sqrt(1 - this.cosAlpha * this.cosAlpha);

		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [
			this.x1, this.y1, this.z1,	//0
			this.x2, this.y2, this.z2,	//1
			this.x3, this.y3, this.z3,	//2
		];

		//Counter-clockwise reference of vertices
		this.indices = [
			0, 1, 2,
		];

		var v1 = [this.x2 - this.x1, this.y2 - this.y1, this.z2 - this.z1]
		var v2 = [this.x3 - this.x1, this.y3 - this.y1, this.z3 - this.z1]
		var normal = [
			v1[1]*v2[2] - v1[2]*v2[1],
			-v1[0]*v2[2] + v1[2]*v2[0],
			v1[0]*v2[1] - v1[1]*v2[0]
		]

		//normalization
		var nsize = Math.sqrt(
			normal[0] * normal[0] +
			normal[1] * normal[1] +
			normal[2] * normal[2]
		)

		normal[0] /= nsize
        normal[1] /= nsize
        normal[2] /= nsize

		//Facing Z positive
		this.normals = [
			normal[0], normal[1], normal[2],
			normal[0], normal[1], normal[2],
			normal[0], normal[1], normal[2],
		];

		this.calcTexCoords(1, 1);

		this.primitiveType = this.scene.gl.TRIANGLES;
		this.initGLBuffers();
	}

	/**
	 * @method calcTexCoords
	 * Calculates the texture coordinates for the primitive
	 * @param {float} lengthS - Scale factor in the S axis
	 * @param {float} lengthT - Scale factor in the T axis
	 */
	calcTexCoords(lengthS, lengthT) {
		this.texCoords = [
			0, 1,
			this.a / lengthS, 1,
			this.c * this.cosAlpha / lengthS, 1 - this.c * this.sinAlpha / lengthT
		];
	}

	/**
	 * @method updateTexCoords
	 * Updates the list of texture coordinates of the triangle
	 * @param {float} lengthS - Scale factor in the S axis
	 * @param {float} lengthT - Scale factor in the T axis
	 */
	updateTexCoords(lengthS, lengthT) {
		this.calcTexCoords(lengthS, lengthT);
		this.updateTexCoordsGLBuffers();
	}
}

