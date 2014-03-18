varying vec3 normal;
varying vec3 vertex;

void main(void)
{
	vec3 viewpoint = normalize(-vertex);
	vec3 light = normalize(vec3(gl_LightSource[0].position.xyz - vertex));
	vec3 halfDirection = normalize(light + viewpoint);
	float distance = length(light);

	float fatt = 1.0 / (gl_LightSource[0].constantAttenuation + (distance*gl_LightSource[0].linearAttenuation) + (distance*distance*gl_LightSource[0].quadraticAttenuation));
	vec4 Ia = (gl_LightSource[0].ambient * gl_FrontMaterial.ambient) + (gl_FrontLightModelProduct.sceneColor * gl_FrontMaterial.ambient);
	vec4 Id = gl_LightSource[0].diffuse * gl_FrontMaterial.diffuse * max(dot(light, normal), 0.0);
	vec4 Is = gl_LightSource[0].specular * gl_FrontMaterial.specular * pow(max(dot(halfDirection, normal), 0.0), 0.3*gl_FrontMaterial.shininess);

    gl_FragColor = gl_FrontLightModelProduct.sceneColor + Ia + fatt*(Id + Is);
}