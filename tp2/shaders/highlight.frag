#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec4 vColor;

uniform bool uUseTexture;
uniform sampler2D uSampler;

uniform vec4 target;
uniform float time;

void main() {
    const float PI = atan(1.0) * 4.0;
    vec4 color = vColor;

    if (uUseTexture)
        color = vColor * texture2D(uSampler, vTextureCoord);

    float a = 0.5 * cos(time + PI) + 0.5;
    gl_FragColor = mix(color, target, a);
}