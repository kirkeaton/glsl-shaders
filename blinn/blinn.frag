precision mediump float;

uniform vec4 uMaterialAmbient;
uniform vec4 uMaterialDiffuse;
uniform vec4 uMaterialSpecular;
uniform float uMaterialShininess;
uniform vec4 uLightAmbient;
uniform vec4 uLightDiffuse;
uniform vec4 uLightSpecular;
uniform vec4 uLightPosition;
uniform float uLightConstantAttenuation;
uniform float uLightLinearAttenuation;
uniform float uLightQuadraticAttenuation;
uniform vec4 uSceneColor;

varying vec3 vNormal;
varying vec3 vVertex;

void main(void)
{
    vec3 viewpoint = normalize(-vVertex);
    vec3 light = normalize(uLightPosition.xyz - vVertex);
    vec3 halfDirection = normalize(light + viewpoint);
    float distance = length(light);

    float fatt = 1.0 / (uLightConstantAttenuation + (distance * uLightLinearAttenuation) + (distance * distance * uLightQuadraticAttenuation));
    vec4 Ia = (uLightAmbient * uMaterialAmbient) + (uSceneColor * uMaterialAmbient);
    vec4 Id = uLightDiffuse * uMaterialDiffuse * max(dot(light, vNormal), 0.0);
    vec4 Is = uLightSpecular * uMaterialSpecular * pow(max(dot(halfDirection, vNormal), 0.0), 0.3 * uMaterialShininess);

    gl_FragColor = uSceneColor + Ia + fatt * (Id + Is);
}