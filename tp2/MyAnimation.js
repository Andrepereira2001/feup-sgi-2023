/**
 * @class MyAnimation
 */
 export class MyAnimation {

    constructor(scene) {
        this.scene = scene
        this.animationMatrix = mat4.create(); 
    }


    /**
     * Updates the current animation matrix
     * @param {int} t 
     */
    update(t){
        console.log("Method update() must be implemented")
    }

    /**
     * Applies the current animation matrix
     */
    apply(){
        if(this.animationMatrix !== null){
            this.scene.multMatrix(this.animationMatrix);
        }
    }
 }