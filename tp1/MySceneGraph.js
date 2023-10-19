import { CGFappearance, CGFcamera, CGFcameraOrtho, CGFtexture, CGFXMLreader } from '../lib/CGF.js';

import { MyRectangle } from './primitives/MyRectangle.js';
import { MyTriangle } from './primitives/MyTriangle.js';
import { MyCylinder } from './primitives/MyCylinder.js';
import { MySphere } from './primitives/MySphere.js';
import { MyTorus } from './primitives/MyTorus.js';
import { MyComponent } from './MyComponent.js';

const degToRad = (angle) => angle * Math.PI / 180;

// Order of the groups in the XML document.
const TAG_ORDER = {
    SCENE: 0,
    VIEWS: 1,
    AMBIENT: 2,
    LIGHTS: 3,
    TEXTURES: 4,
    MATERIALS: 5,
    TRANSFORMATIONS: 6,
    PRIMITIVES: 7,
    COMPONENTS: 8
};

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.components = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != TAG_ORDER.SCENE)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != TAG_ORDER.VIEWS)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != TAG_ORDER.AMBIENT)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != TAG_ORDER.LIGHTS)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }

        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TAG_ORDER.TEXTURES)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != TAG_ORDER.MATERIALS)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TAG_ORDER.TRANSFORMATIONS)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != TAG_ORDER.PRIMITIVES)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != TAG_ORDER.COMPONENTS)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
    }

    /**
     * Parses the <scene> block.
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        const isNumeric = num => num !== null && !isNaN(num);
        const unableToParse = (cname, id) => `unable to parse ${cname} of the primitive for ID = ${id}`;
        const validViewTypes = ['perspective', 'ortho'];

        this.views = [];
        let numOfViews = 0;

        let children = viewsNode.children;
        this.defaultView = this.reader.getString(viewsNode, 'default');
        if (this.defaultView === null)
            return `a default view must be provided`;

        for (const child of children) {

            // Check if the type of view is valid.
            if (!validViewTypes.includes(child.nodeName)) {
                this.onXMLMinorError(`unkown tag <${child.nodeName}>`);
                continue;
            }

            // Get the ID for the current view.
            let viewId = this.reader.getString(child, 'id');
            if (viewId === null)
                return `no ID defined for view`;

            // Check for repeated IDs.
            if (this.views[viewId] != null)
                return `ID must be unique for each view (conflict: ID = ${viewId})`;

            let near = this.reader.getFloat(child, 'near');
            if (!isNumeric(near))
                return unableToParse('near', viewId);

            let far = this.reader.getFloat(child, 'far');
            if (!isNumeric(far))
                return unableToParse('far', viewId);

            let grandChildren = child.children;
            const grandChildrenNodeNames = [...grandChildren].map(node => node.nodeName);

            const fromIndex = grandChildrenNodeNames.indexOf('from');
            let from = this.parseCoordinates3D(grandChildren[fromIndex], `'from' vector for view of ID = ${viewId}`);
            if (!Array.isArray(from))
                return from;
            from = vec3.fromValues(from[0], from[1], from[2]);

            const toIndex = grandChildrenNodeNames.indexOf('to');
            let to = this.parseCoordinates3D(grandChildren[toIndex], `'to' vector for view of ID = ${viewId}`);
            if (!Array.isArray(to))
                return to;
            to = vec3.fromValues(to[0], to[1], to[2]);

            if (child.nodeName === 'perspective') {
                let angle = this.reader.getFloat(child, 'angle');
                if (!isNumeric(angle))
                    return unableToParse('angle', viewId);

                this.views[viewId] = new CGFcamera(degToRad(angle), near, far, from, to);
                numOfViews++;
            } else if (child.nodeName === 'ortho') {
                let left = this.reader.getFloat(child, 'left');
                if (!isNumeric(left))
                    return unableToParse('left', viewId);

                let right = this.reader.getFloat(child, 'right');
                if (!isNumeric(right))
                    return unableToParse('right', viewId);

                let top = this.reader.getFloat(child, 'top');
                if (!isNumeric(top))
                    return unableToParse('top', viewId);

                let bottom = this.reader.getFloat(child, 'bottom');
                if (!isNumeric(bottom))
                    return unableToParse('bottom', viewId);

                let up = vec3.fromValues(0, 1, 0);
                const upIndex = grandChildrenNodeNames.indexOf('up');
                if (upIndex !== -1) {
                    up = this.parseCoordinates3D(grandChildren[upIndex], `'up' vector for view of ID = ${viewId}`);
                    if (!Array.isArray(up))
                        return up
                    up = vec3.fromValues(up[0], up[1], up[2]);
                }

                this.views[viewId] = new CGFcameraOrtho(left, right, bottom, top, near, far, from, to, up);
                numOfViews++;
            } else {
                this.onXMLMinorError(`unreachable`);
            }
        }

        if (this.views[this.defaultView] === null)
            return `the default view of ID = ${this.defaultView} must be specified`

        if (numOfViews === 0)
            return `at least one view must be defined`;

        this.log("Parsed views");
        return null;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = [];
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName !== "omni" && children[i].nodeName !== "spot") {
                this.onXMLMinorError(`unknown tag <${children[i].nodeName}>`);
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular", "attenuation"]);
                attributeTypes.push(...["position", "color", "color", "color", "attenuation"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return `ID must be unique for each light (conflict: ID = ${lightId})`;

            // Light enable/disable
            var enableLight = true;
            var aux = this.reader.getBoolean(children[i], 'enabled');
            if (!(aux != null && !isNaN(aux) && (aux == true || aux == false)))
                this.onXMLMinorError(`unable to parse value component of the 'enable light' field for ID = ${lightId}; assuming 'value = 1'`);

            enableLight = aux;

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    let aux = null;

                    switch (attributeTypes[j]) {
                        case "position":
                            aux = this.parseCoordinates4D(
                                grandChildren[attributeIndex],
                                `light position for ID ${lightId}`
                            );
                            break;
                        case "color":
                            aux = this.parseColor(
                                grandChildren[attributeIndex],
                                `light color for ID ${lightId}`
                            );
                            break;
                        case "attenuation":
                            aux = this.parseAttenuation(
                                grandChildren[attributeIndex],
                                `light attenuation for ID ${lightId}`
                            );
                            break;
                        default:
                            this.onXMLError("This should be unreachable");
                    }

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return `light ${attributeNames[j]} undefined for ID = ${lightId}`;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        return null;
    }

    /**
     * Parses the <textures> block.
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {
        this.textures = [];
        let numOfTextures = 0;

        let children = texturesNode.children;
        for (const child of children) {

            if (child.nodeName !== 'texture') {
                this.onXMLMinorError(`unknown tag <${child.nodeName}>`);
                continue;
            }

            // Get ID of the current texture.
            let textureId = this.reader.getString(child, 'id');
            if (textureId === null)
                return `no ID defined for texture`;

            // Checks for repeated IDs.
            if (this.textures[textureId] != null)
                return `ID must be unique for each texture (conflict: ID = ${textureId})`;

            let file = this.reader.getString(child, 'file');
            if (file === null)
                return `no file provided for texture of ID = ${textureId}`;

            // Checking if the file is an image by looking up its extension
            // Definetely not the most robust method
            if (!file.match('(.*)[a-zA-z0-9-_]+\.(jpg|png)'))
                return `the file provided must have .jpg or .png extension (conflict: file = ${file})`

            this.textures[textureId] = new CGFtexture(this.scene, file);
            numOfTextures++
        }

        if (numOfTextures === 0)
            return `at least one texture must be defined`;

        this.log("Parsed textures");
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        const isNumeric = num => num !== null && !isNaN(num);
        const unableToParse = (cname, id) => `unable to parse ${cname} of the primitive for ID = ${id}`;

        this.materials = [];
        let numOfmaterials = 0;

        let children = materialsNode.children;
        for (const child of children) {

            if (child.nodeName !== 'material') {
                this.onXMLMinorError(`unknown tag <${child.nodeName}>`);
                continue;
            }

            // Get ID of the current material.
            let materialId = this.reader.getString(child, 'id');
            if (materialId === null)
                return `no ID defined for material`;

            // Checks for repeated IDs.
            if (this.materials[materialId] != null)
                return `ID must be unique for each material (conflict: ID = ${materialId})`;

            let shininess = this.reader.getFloat(child, 'shininess');
            if (!isNumeric(shininess) && shininess <= 0)
                return unableToParse('shininess', materialId);

            let grandChildren = child.children;
            const grandChildrenNodeNames = [...grandChildren].map(node => node.nodeName);

            const emissionIndex = grandChildrenNodeNames.indexOf('emission');
            let emission = this.parseColor(grandChildren[emissionIndex], `emission component for material of ID = ${materialId}`);
            if (!Array.isArray(emission))
                return emission;

            const ambientIndex = grandChildrenNodeNames.indexOf('ambient');
            let ambient = this.parseColor(grandChildren[ambientIndex], `ambient component for material of ID = ${materialId}`);
            if (!Array.isArray(ambient))
                return ambient;

            const diffuseIndex = grandChildrenNodeNames.indexOf('diffuse');
            let diffuse = this.parseColor(grandChildren[diffuseIndex], `diffuse component for material of ID = ${materialId}`);
            if (!Array.isArray(diffuse))
                return diffuse;

            const specularIndex = grandChildrenNodeNames.indexOf('specular');
            let specular = this.parseColor(grandChildren[specularIndex], `specular component for material of ID = ${materialId}`);
            if (!Array.isArray(specular))
                return specular;

            let material = new CGFappearance(this.scene);
            material.setShininess(shininess);
            material.setEmission(emission[0], emission[1], emission[2], emission[3]);
            material.setAmbient(ambient[0], ambient[1], ambient[2], ambient[3]);
            material.setDiffuse(diffuse[0], diffuse[1], diffuse[2], diffuse[3]);
            material.setSpecular(specular[0], specular[1], specular[2], specular[3]);

            this.materials[materialId] = material;
            numOfmaterials++;
        }

        if (numOfmaterials === 0)
            return `at least one material must be defined`;

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        let children = transformationsNode.children;
        this.transformations = [];
        let grandChildren = [];

        // Any number of transformations.
        for (let i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError(`unknown tag <${children[i].nodeName}>`);
                continue;
            }

            // Get id of the current transformation.
            let transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return `ID must be unique for each transformation (conflict: ID = ${transformationID})`;

            grandChildren = children[i].children;
            this.transformations[transformationID] = this.parseTransformationInstructions(grandChildren, transformationID);
        }

        this.log("Parsed transformations");
        return null;
    }

    parseTransformationInstructions(instructions, transformationID) {
        const unableToParse = (cname, id) => `unable to parse ${cname} for transformation of ID = ${id}`;
        const getCoords = (node, id) => this.parseCoordinates3D(node, `${node.nodeName} transformation for ${id}`);

        let transformationMatrix = mat4.create();

        for (const instruction of instructions) {
            switch (instruction.nodeName) {
                case 'rotate':
                    const vecs = {
                        'x': vec3.fromValues(1, 0, 0),
                        'y': vec3.fromValues(0, 1, 0),
                        'z': vec3.fromValues(0, 0, 1)
                    };

                    let axis = this.reader.getString(instruction, 'axis');
                    if (!Object.keys(vecs).includes(axis))
                        return unableToParse('axis', transformationID);

                    let angle = this.reader.getFloat(instruction, 'angle');
                    if (angle == null || isNaN(angle))
                        return unableToParse('angle', transformationID);

                    transformationMatrix = mat4.rotate(
                        transformationMatrix,
                        transformationMatrix,
                        degToRad(angle),
                        vecs[axis]
                    );

                    break;
                case 'translate':
                    let tcoords = getCoords(instruction, transformationID);
                    if (!Array.isArray(tcoords))
                        return tcoords;

                    transformationMatrix = mat4.translate(transformationMatrix, transformationMatrix, tcoords);
                    break;
                case 'scale':
                    let scoords = getCoords(instruction, transformationID);
                    if (!Array.isArray(scoords))
                        return scoords;

                        transformationMatrix = mat4.scale(transformationMatrix, transformationMatrix, scoords);
                        break;
                default:
                    this.onXMLMinorError(`unkown tag <${instruction.nodeName}> - not applying instruction`);
            }
        }

        return transformationMatrix;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        const validPrimitives = ['rectangle', 'triangle', 'cylinder', 'sphere', 'torus'];
        const isNumeric = num => num != null && !isNaN(num);
        const unableToParse = (cname, id) => `unable to parse ${cname} of the primitive for ID = ${id}`

        let children = primitivesNode.children;
        this.primitives = [];
        let grandChildren = [];

        // Any number of primitives.
        for (let i = 0; i < children.length; i++) {

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError(`unknown tag <${children[i].nodeName}">`);
                continue;
            }

            // Get id of the current primitive.
            let primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return `no ID defined for texture`;

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return `ID must be unique for each primitive (conflict: ID = ${primitiveId})`;

            grandChildren = children[i].children;

            // Validate the primitive type
            if (grandChildren.length != 1 || !validPrimitives.includes(grandChildren[0].nodeName))
                return `There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)`

            // Specifications for the current primitive.
            let primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {

                let x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!isNumeric(x1))
                    return unableToParse('x1', primitiveId);

                let y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!isNumeric(y1))
                    return unableToParse('y1', primitiveId);

                let x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!isNumeric(x2) || x1 >= x2)
                    return unableToParse('x2', primitiveId);

                let y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!isNumeric(y2) || y1 >= y2)
                    return unableToParse('y2', primitiveId);

                let rectangle = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);
                this.primitives[primitiveId] = rectangle;

            } else if (primitiveType == 'cylinder') {

                let base = this.reader.getFloat(grandChildren[0], 'base');
                if (!isNumeric(base) || base < 0)
                    return unableToParse('base', primitiveId);

                let top = this.reader.getFloat(grandChildren[0], 'top');
                if (!isNumeric(top) || top < 0)
                    return unableToParse('top', primitiveId);

                let height = this.reader.getFloat(grandChildren[0], 'height');
                if (!isNumeric(height) || height < 0)
                    return unableToParse('height', primitiveId);

                let slices = this.reader.getInteger(grandChildren[0], 'slices');
                if (!isNumeric(slices) || slices <= 0)
                    return unableToParse('slices', primitiveId);

                let stacks = this.reader.getInteger(grandChildren[0], 'stacks');
                if (!isNumeric(stacks) || stacks <= 0 )
                    return unableToParse('stacks', primitiveId);

                let cylinder = new MyCylinder(this.scene, primitiveId, base, top, height, slices, stacks);
                this.primitives[primitiveId] = cylinder;

            } else if (primitiveType == 'triangle') {

                let x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!isNumeric(x1))
                    return unableToParse('x1', primitiveId);

                let y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!isNumeric(y1))
                    return unableToParse('y1', primitiveId);

                let z1 = this.reader.getFloat(grandChildren[0], 'z1');
                if (!isNumeric(z1))
                    return unableToParse('z1', primitiveId);

                let x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!isNumeric(x2))
                    return unableToParse('x2', primitiveId);

                let y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!isNumeric(y2))
                    return unableToParse('y2', primitiveId);

                let z2 = this.reader.getFloat(grandChildren[0], 'z2');
                if (!isNumeric(z2))
                    return unableToParse('z2', primitiveId);

                let x3 = this.reader.getFloat(grandChildren[0], 'x3');
                if (!isNumeric(x3))
                    return unableToParse('x3', primitiveId);

                let y3 = this.reader.getFloat(grandChildren[0], 'y3');
                if (!isNumeric(y3))
                    return unableToParse('y3', primitiveId);

                let z3 = this.reader.getFloat(grandChildren[0], 'z3');
                if (!isNumeric(z3))
                    return unableToParse('z3', primitiveId);

                let triangle = new MyTriangle(this.scene, primitiveId, x1, y1, z1, x2, y2, z2, x3, y3, z3)
                this.primitives[primitiveId] = triangle;

            } else if (primitiveType == 'sphere') {

                let radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!isNumeric(radius) || radius < 0)
                    return unableToParse('radius', primitiveId);

                let slices = this.reader.getInteger(grandChildren[0], 'slices');
                if (!isNumeric(slices) || slices <= 0)
                    return unableToParse('slices', primitiveId);

                let stacks = this.reader.getInteger(grandChildren[0], 'stacks');
                if (!isNumeric(stacks) || stacks <= 0 )
                    return unableToParse('stacks', primitiveId);

                let sphere = new MySphere(this.scene, primitiveId, radius, slices, stacks);
                this.primitives[primitiveId] = sphere;

            } else if (primitiveType == 'torus') {

                let inner = this.reader.getFloat(grandChildren[0], 'inner');
                if (!isNumeric(inner) || inner < 0)
                    return unableToParse('inner', primitiveId);

                let outer = this.reader.getFloat(grandChildren[0], 'outer');
                if (!isNumeric(inner) || outer < 0)
                    return unableToParse('outer', primitiveId);

                let slices = this.reader.getInteger(grandChildren[0], 'slices');
                if (!isNumeric(slices) || inner <= 0)
                    return unableToParse('slices', primitiveId);

                let loops = this.reader.getInteger(grandChildren[0], 'loops');
                if (!isNumeric(loops) || inner <= 0)
                    return unableToParse('loops', primitiveId)

                let torus = new MyTorus(this.scene, primitiveId, inner, outer, slices, loops);
                this.primitives[primitiveId] = torus;

            } else {
                console.error("unkown primitive type of the primitive for ID = " + primitiveId);
            }
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
    parseComponents(componentsNode) {
        let children = componentsNode.children;

        this.components = [];

        let grandChildren = [];
        let grandgrandChildren = [];
        let nodeNames = [];

        // Any number of components.
        for (let i = 0; i < children.length; i++) {
            let component = new MyComponent()

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            let componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (let j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            let transformationIndex = nodeNames.indexOf("transformation");
            let materialsIndex = nodeNames.indexOf("materials");
            let textureIndex = nodeNames.indexOf("texture");
            let childrenIndex = nodeNames.indexOf("children");

            // Transformations
            let transformationChildren = grandChildren[transformationIndex].children
            if(transformationChildren.length != 0) {
                if(transformationChildren[0].nodeName == "transformationref") {
                    if(transformationChildren.length > 1)
                        this.onXMLMinorError(`<transformation> tag should only have one <transformationref> (conflict: ID = ${componentID })`)

                    let child = transformationChildren[0];
                    let id = this.reader.getString(child, 'id');
                    if (id == null)
                        this.onXMLMinorError(`Invalid id in <transformationref> tag (conflict: ID = ${componentID})`)

                    component.transformationMatrix = this.transformations[id];
                }
                else {
                    component.transformationMatrix = this.parseTransformationInstructions(transformationChildren, componentID);
                }
            }

            // Materials
            let materials = grandChildren[materialsIndex]
            if(materials.length == 0) {
                this.onXMLMinorError(`<materials> tag must contain at least one children (conflict: ID = ${componentID})`)
            } else {
                let materialsChildren = materials.children
                for (let j = 0; j < materialsChildren.length; j++) {
                    if (materialsChildren[j].nodeName == "material") {
                        let id = this.reader.getString(materialsChildren[j], 'id')
                        if (id == null || (this.materials[id] == undefined && id !== "inherit") )
                            this.onXMLMinorError(`Invalid id in <material> tag (conflict: ID = ${id})`)

                        component.materials.push(id)
                    } else {
                        this.onXMLMinorError(`Invalid in <material> tag (conflict: ID = ${componentID})`);
                        break;
                    }
                }
            }

            // Texture
            let texture = grandChildren[textureIndex]
            let id = this.reader.getString(texture, 'id')

            if (id == null) {
                this.onXMLMinorError(`Invalid id in component <texture> tag (conflict: ID = ${componentID})`)
            } else {
                component.texture = id
                if (id === 'inherit') {
                    component.lengthS = this.reader.getFloat(texture, 'length_s', false);
                    component.lengthT = this.reader.getFloat(texture, 'length_t', false);
                    component.hasToUpdateTexCoords = true;
                } else if (id !== 'none') {
                    if(this.textures[id] == undefined){
                        this.onXMLMinorError(`Invalid id in <texture> tag (conflict: ID = ${id})`)
                    }
                    component.lengthS = this.reader.getFloat(texture, 'length_s');
                    component.lengthT = this.reader.getFloat(texture, 'length_t');
                    component.hasToUpdateTexCoords = true;
                }
            }

            // Children
            let tagChildrenChildren = grandChildren[childrenIndex].children
            if(tagChildrenChildren.length == 0){
                this.onXMLMinorError(`<children> tag must contain at least one children (conflict: ID = ${componentID})`)
            } else {
                for(let j = 0; j < tagChildrenChildren.length; j++){
                    let child = tagChildrenChildren[j]
                    let tagName = child.nodeName
                    let id = this.reader.getString(child, 'id')
                    if(tagName == "componentref" && id != null){
                        component.childrenComponents.push(id)
                    }
                    else if (tagName == "primitiveref" && id != null){
                        component.childrenPrimitives.push(id)
                    }
                    else {
                        this.onXMLMinorError(`invalid <componentref> or <primitiveref> (conflict: ID = ${componentID})`)
                        break
                    }
                }
            }

            this.components[componentID] = component
            this.scene.addKeyPressObs(component)
        }
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError) {
        const isNumeric = num => num != null && !isNaN(num);

        let x = this.reader.getFloat(node, 'x');
        if (!isNumeric(x))
            return `unable to parse x-coordinate of the ${messageError}`;

        let y = this.reader.getFloat(node, 'y');
        if (!isNumeric(y))
            return `unable to parse y-coordinate of the ${messageError}`;

        let z = this.reader.getFloat(node, 'z');
        if (!isNumeric(z))
            return `unable to parse z-coordinate of the ${messageError}`;

        return [x, y, z];
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        let position = this.parseCoordinates3D(node, messageError);
        if (!Array.isArray(position))
            return position;

        let w = this.reader.getFloat(node, 'w');
        if (w == null || isNaN(w))
            return `unable to parse w-coordinate of the ${messageError}`;

        position.push(w);
        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseColor(node, messageError) {
        const validColorComponent = c => c !== null && !isNaN(c) && c >= 0 && c <= 1;
        const unableToParse = (cname, message) => `unable to parse ${cname} component of the ${message}`;

        let r = this.reader.getFloat(node, 'r');
        if (!validColorComponent(r))
            return unableToParse('R', messageError);

        let g = this.reader.getFloat(node, 'g');
        if (!validColorComponent(g))
            return unableToParse('G', messageError);

        let b = this.reader.getFloat(node, 'b');
        if (!validColorComponent(b))
            return unableToParse('B', messageError);

        let a = this.reader.getFloat(node, 'a');
        if (!validColorComponent(a))
            return unableToParse('A', messageError);

        return [r, g, b, a];
    }

    /**
     * Parse the attenuation components for a light node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseAttenuation(node, messageError) {
        const validAttenuationComponent = c => c !== null && !isNaN(c) && (c === 0 || c === 1);
        const unableToParse = (cname, message) => `unable to parse ${cname} component of the ${message}`;

        let constant = this.reader.getFloat(node, 'constant');
        if (!validAttenuationComponent(constant))
            return unableToParse('constant', messageError);

        let linear = this.reader.getFloat(node, 'linear');
        if (!validAttenuationComponent(linear))
            return unableToParse('linear', messageError);

        let quadratic = this.reader.getFloat(node, 'quadratic');
        if (!validAttenuationComponent(quadratic))
            return unableToParse('quadratic', messageError);

        const attenuationComponents = [constant, linear, quadratic];
        return attenuationComponents.reduce((a, b) => a + b, 0) === 1.0 ?
            attenuationComponents : `invalid attenuation components mixing of the ${messageError}`;
    }

    /*
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        this.processComponent(this.idRoot)
    }

    /**
     * Process recursively all the scene components
     * @param {String} id - id of the components being processed
     * @param {String} idMaterial - latest material applied
     * @param {String} idTexture - latest texture applied
     * @param {String} latestLengthS - latest length_s applied
     * @param {String} latestLengthT - latest length_t applied
     * @return {Bool} true if component was processed else false
     */
    processComponent(id, latestMaterial, latestTexture, latestLengthS, latestLengthT) {

        // Apply material and texture
        // Apply transformation
        this.scene.pushMatrix()
        let component = this.components[id]
        if(component === undefined){
            this.onXMLMinorError(`Invalid component ref ${id}`)
            return false
        }

        if(component.active){
            this.onXMLMinorError(`Cycle in scene graph detected (removing: ID = ${id})`)
            return false
        }
        component.active = true;

        let componentTransformations = component.transformationMatrix
        this.scene.multMatrix(componentTransformations)

        // verify if none or inherite in case of texture
        let materialId = component.getMaterialId()
        if (materialId === "inherit")
            materialId = latestMaterial;

        let textureId = component.texture;
        let lengthS = component.lengthS;
        let lengthT = component.lengthT;
        if (textureId === "inherit"){
            textureId = latestTexture;
            if( component.lengthS === null ){
                lengthS = latestLengthS
            }
            if( component.lengthT === null ){
                lengthT = latestLengthT
            }
        }
        if (textureId === 'none'){
            textureId = null;
        }

        let currMaterial = this.materials[materialId];
        currMaterial.setTexture(this.textures[textureId]);
        currMaterial.apply();

        let componentPrimitives = component.childrenPrimitives;
        for (let i = 0; i < componentPrimitives.length; i++) {
            if (component.hasToUpdateTexCoords && textureId !== null) {
                this.primitives[componentPrimitives[i]].updateTexCoords(
                    lengthS,
                    lengthT
                );
                component.hasToUpdateTexCoords = false;
            }
            this.primitives[componentPrimitives[i]].display();
        }

        let componentComponents = component.childrenComponents
        let toRemove = []
        for (let i = 0; i < componentComponents.length; i++) {
            if (!this.processComponent(componentComponents[i], materialId, textureId, lengthS, lengthT))
                toRemove.push(i);
        }

        // remove elements that could not be loaded
        toRemove.forEach(elem => {
            component.childrenComponents.splice(elem, 1)
        });

        component.active = false;
        this.scene.popMatrix();
        return true
    }
}