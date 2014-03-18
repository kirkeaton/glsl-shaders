varying vec3 normal;
varying vec3 vertex;

void main(void)
{
	normal = normalize(gl_NormalMatrix*gl_Normal);
	vertex = vec3(gl_ModelViewMatrix * gl_Vertex);
	gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}