import { CGFobject } from '../../lib/CGF.js';
/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 * @param {string} id - id of the primitive
 * @param {float} x1 - X coordinate of the first vertice
 * @param {integer} y1 - Y coordinate of the first vertice
 * @param {integer} z1 - Z coordinate of the first vertice
 */
export class MySphere extends CGFobject {
	constructor(scene, id, radius, slices, stacks) {
		super(scene);
		this.radius = radius;
		this.slices = slices;
        this.stacks = stacks;

		this.initBuffers();
	}
	
	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];
	
		var phi = 0;
		var theta = 0;
		var phiInc = Math.PI / this.stacks;
		var thetaInc = (2 * Math.PI) / this.slices;
		var latVertices = this.slices + 1;
	
		// build an all-around stack at a time, starting on "north pole" and proceeding "south"
	
		for (let longitude = 0; longitude <= this.stacks; longitude++) {
		  var sinPhi = Math.sin(phi);
		  var cosPhi = Math.cos(phi);
	
		  // in each stack, build all the slices around, starting on longitude 0
		  theta = 0;
		  for (let latitude = 0; latitude <= this.slices; latitude++) {
			//--- Vertices coordinates
			var x = Math.cos(-theta) * sinPhi;
			var y = Math.sin(theta) * sinPhi;
			var z = cosPhi;
			this.vertices.push(x * this.radius, y * this.radius, z * this.radius);
	
			//--- Indices
			if (longitude < this.stacks && latitude < this.slices) {
			  var current = longitude * latVertices + latitude;
			  var next = current + latVertices;
			  // pushing two triangles using indices from this round (current, current+1)
			  // and the ones directly south (next, next+1)
			  // (i.e. one full round of slices ahead)

			  this.indices.push(current + 1, current, next);
			  this.indices.push(current + 1, next, next + 1);
			}
	
			//--- Normals
			// at each vertex, the direction of the normal is equal to 
			// the vector from the center of the sphere to the vertex.
			// in a sphere of radius equal to one, the vector length is one.
			// therefore, the value of the normal is equal to the position vectro
			this.normals.push(x, y, z);
			theta += thetaInc;
	
			//--- Texture Coordinates
			this.texCoords.push(latitude / this.slices, longitude / this.stacks);
		  }
		  phi += phiInc;
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

