import { CGFapplication } from '../lib/CGF.js';
import { XMLscene } from './XMLscene.js';
import { MyInterface } from './MyInterface.js';
import { MySceneGraph } from './MySceneGraph.js';

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
    function(m,key,value) {
      vars[decodeURIComponent(key)] = decodeURIComponent(value);
    });
    return vars;
}

function main() {

	// Standard application, scene and interface setup
    let app = new CGFapplication(document.body);
    let myInterface = new MyInterface();
    let myScene = new XMLscene(myInterface);

    app.init();

    app.setScene(myScene);
    app.setInterface(myInterface);

    myInterface.setActiveCamera(myScene.camera);

	// get file name provided in URL, e.g. http://localhost/myproj/?file=myfile.xml
	// or use "basketball.xml" as default (assumes files in subfolder "scenes", check MySceneGraph constructor)

    let filename=getUrlVars()['file'] || "basketball.xml";

	// create and load graph, and associate it to scene.
	// Check console for loading errors
	let myGraph = new MySceneGraph(filename, myScene);

	// start
    app.run();
}

main();
