varying vec4 colour;

void main()
{
	vec3 normal = normalize(gl_NormalMatrix * gl_Normal);
	vec3 vertex = vec3(gl_ModelViewMatrix * gl_Vertex);
	vec3 viewpoint = normalize(-vertex);
	vec3 light  = normalize(vec3(gl_LightSource[0].position.xyz - vertex));
	vec3 reflection = normalize(-reflect(light, normal));
	float distance = length(light);

	float fatt = 1.0 / (gl_LightSource[0].constantAttenuation + (distance*gl_LightSource[0].linearAttenuation) + (distance*distance*gl_LightSource[0].quadraticAttenuation));
	vec4 Ia = (gl_LightSource[0].ambient * gl_FrontMaterial.ambient) + (gl_FrontLightModelProduct.sceneColor * gl_FrontMaterial.ambient);
	vec4 Id = gl_LightSource[0].diffuse * gl_FrontMaterial.diffuse * max(dot(light, normal), 0.0);
	vec4 Is = gl_LightSource[0].specular * gl_FrontMaterial.specular * pow(max(dot(reflection, viewpoint), 0.0), 0.3*gl_FrontMaterial.shininess);
	
	colour = vec4(gl_FrontLightModelProduct.sceneColor + Ia + fatt*(Id + Is));
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}
