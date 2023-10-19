attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform bool uUseTexture;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

uniform float scale;
uniform float time;

varying vec4 vColor;
varying vec2 vTextureCoord;

struct materialProperties {
    vec4 ambient;
    vec4 diffuse;
    vec4 specular;
    float shininess;
};

uniform materialProperties uFrontMaterial;

void main() {
    vec3 expand = aVertexNormal * vec3((scale - 1.0) * abs(cos(time)));
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition + expand, 1.0);

    vColor = mix(mix(uFrontMaterial.diffuse, uFrontMaterial.specular, 0.5), uFrontMaterial.ambient, 0.5);

    if (uUseTexture)
        vTextureCoord = aTextureCoord;
}
