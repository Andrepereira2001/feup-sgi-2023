/**
 * @class MyKeyFrame
 */
 export class MyKeyFrame {
    
    /**
     * Records the values of an instant
     * @param {*} instant instant of the keyframe
     * @param {*} translation translations array
     * @param {*} rotation rotation array
     * @param {*} scale scale array
     */
    constructor(instant, translation, rotation, scale) {
        this.instant = instant;
        this.translation = translation; // [0,0,0]
        this.rotation = rotation; // [0,0,0]
        this.scale = scale; // [0,0,0]
    }

 }