precision mediump float;

attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uModelViewProjectionMatrix;
uniform mat3 uNormalMatrix;

uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uLightPosition;
uniform vec4 uSceneColor;

varying vec4 vColor;

void main()
{
    vec3 normal = normalize(uNormalMatrix * aNormal);
    vec3 vertex = vec3(uModelViewMatrix * vec4(aPosition, 1.0));
    vec3 light = normalize(uLightPosition.xyz - vertex);

    vec4 ambient = uLightAmbient * uMaterialAmbient + uSceneColor * uMaterialAmbient;
    vec4 diffuse = uLightDiffuse * uMaterialDiffuse * max(dot(light, normal), 0.0);

    vColor = ambient + diffuse;
    gl_Position = uModelViewProjectionMatrix * vec4(aPosition, 1.0);
}
