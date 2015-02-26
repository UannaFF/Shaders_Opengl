varying vec4 cLightDiff, cLightAmb, cLightSpec;
varying vec4 cMatDiff, cMatAmb, cMatSpec;
varying vec3 camDirection;
varying vec3 N;
varying vec4 L;
uniform float indexOfRefraction;
uniform float m;

void main(void)
{
    //vec4 V = gl_Vertex; 
	vec4 V;

	V = gl_ModelViewMatrix * gl_Vertex;
	N = normalize(gl_NormalMatrix * gl_Normal);
	L = normalize(gl_LightSource[0].position-V);


	cLightDiff = gl_LightSource[0].diffuse;
	cLightAmb = gl_LightSource[0].ambient;
	cLightSpec = gl_LightSource[0].specular;

	cMatDiff = gl_FrontMaterial.diffuse;
	cMatAmb = gl_FrontMaterial.ambient;
	cMatSpec = gl_FrontMaterial.specular;

	camDirection = -V.xyz;
   gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
}