precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uModelViewProjectionMatrix;
uniform mat3 uNormalMatrix;

varying vec3 vNormal;
varying vec3 vVertex;

void main(void)
{
    vNormal = normalize(uNormalMatrix * aNormal);
    vVertex = vec3(uModelViewMatrix * vec4(aPosition, 1.0));
    gl_Position = uModelViewProjectionMatrix * vec4(aPosition, 1.0);
}