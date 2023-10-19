import { MyAnimation } from "./MyAnimation.js";

/**
 * @class MyKeyframeAnimation
 */
 export class MyKeyframeAnimation extends MyAnimation {
    
    /**
     * 
     * @param {Scene} scene  
     * @param {Array<MyKeyFrame>} keyFrames 
     */
    constructor(scene, frames) {
        super(scene)
        this.keyFrames = frames;
        this.start = 0;
        if (frames.length > 0){
            this.start = this.keyFrames[0].instant
        }
        this.keyFrames.forEach(elem => {
            elem.instant -= this.start 
        })
        this.drawEnd = false
    }

    /**
     * Updates the current animation matrix
     * @param {int} t time instant
     */
    update(t){
        t -= this.start
        let maxIdx = this.keyFrames.length
        for( let i = 0; i < this.keyFrames.length; i++) {
            if(t <= this.keyFrames[i].instant && i < maxIdx ) maxIdx = i
        }
        if(maxIdx === this.keyFrames.length){
            if(!this.drawAfterEnd){
                const frame = this.keyFrames[maxIdx - 1]
                this.setAnimationMatrix(frame.translation, frame.rotation[0], frame.rotation[1], frame.rotation[2], frame.scale)
                this.drawEnd = true
            }
        }
        else if (maxIdx === 0){
            this.setAnimationMatrix([0,0,0],0,0,0,[0,0,0])
        }
        else {
            this.calculateAnimationMatrix(t, maxIdx)
        }
    }

    /**
     * Calculates the current animation matrix
     * @param {*} t time instant based on first frame instant
     * @param {*} index current index of frame
     */
    calculateAnimationMatrix(t, index){
        const firstFrame = this.keyFrames[index - 1]
        const secondFrame = this.keyFrames[index]
        const ratio = (t - (firstFrame.instant)) / (secondFrame.instant - firstFrame.instant)

        let translation = firstFrame["translation"] 
        let rotX = firstFrame["rotation"][0]
        let rotY = firstFrame["rotation"][1]
        let rotZ = firstFrame["rotation"][2]
        let scale = firstFrame["scale"]
        
        const transChange = [
            translation[0] + (secondFrame["translation"][0] - translation[0]) * ratio,
            translation[1] + (secondFrame["translation"][1] - translation[1]) * ratio, 
            translation[2] + (secondFrame["translation"][2] - translation[2]) * ratio
        ]
        const rotXChange = rotX + (secondFrame["rotation"][0] - rotX) * ratio
        const rotYChange = rotY + (secondFrame["rotation"][1] - rotY) * ratio
        const rotZChange = rotZ + (secondFrame["rotation"][2] - rotZ) * ratio
        const scaleChange = [
            scale[0] + (secondFrame["scale"][0] - scale[0]) * ratio, 
            scale[1] + (secondFrame["scale"][1] - scale[1]) * ratio, 
            scale[2] + (secondFrame["scale"][2] - scale[2]) * ratio
        ]

        this.setAnimationMatrix(transChange,rotXChange,rotYChange,rotZChange,scaleChange )
    }

    /**
     * Update the animation matrix
     * @param {*} translation translation array
     * @param {*} rotX rotation in X
     * @param {*} rotY rotation in Y
     * @param {*} rotZ rotation in Z
     * @param {*} scale scale array
     */
    setAnimationMatrix(translation, rotX, rotY, rotZ, scale ){
        const degToRad = (angle) => angle * Math.PI / 180;
        let matrix = mat4.create()
        
        mat4.translate(matrix, matrix, translation)
        mat4.rotateZ(matrix, matrix, degToRad(rotZ))
        mat4.rotateY(matrix, matrix, degToRad(rotY))
        mat4.rotateX(matrix, matrix, degToRad(rotX))
        mat4.scale(matrix, matrix, scale)

        this.animationMatrix = matrix
    }

 }