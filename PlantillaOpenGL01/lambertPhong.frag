varying vec4 cLightDiff, cLightAmb, cLightSpec;
varying vec4 cMatDiff, cMatAmb, cMatSpec;
varying vec3 camDirection;
varying vec3 N;
varying vec4 L;
uniform float indexOfRefraction;
uniform float m;

float distro(vec3 Nn, vec3 H, float m){
   float ndoth = dot(Nn,H);
   float beta = acos(ndoth);
   float tanbeta = tan(beta);
   float tanbeta_over_m = tanbeta/m;
   float D = exp(-(tanbeta_over_m*tanbeta_over_m));
   D = D/(4*m*m*pow(ndoth,4));
   return D;
}

float geomAttenu(vec3 Nn, vec3 H, vec3 L, vec3 V) {
   float ndoth = dot(Nn,H);
   float ndotv = dot(Nn,V);
   float ndot1 = dot(Nn,L);
   float vdoth = dot(V,H);
   float masking = 2*ndoth*ndotv/vdoth;
   float shadowing = 2*ndoth*ndot1/vdoth;
   return min(1,min(masking,shadowing));
}

float fresnel_profe(vec3 normal, vec3 light, float indexOfR){
   float R0 = pow(1.0-indexOfR,2.0)/pow(1.0+indexOfR,2.0);
   return R0+(1.0-R0)*pow(1.0-dot(light,normal),5.0);
}

float illumCookTorrance(vec3 Nn, vec3 V, float m, vec3 L) {
   //Sera necesario el faceforward?
   float cook = 0;
   vec3 Nnor = normalize(Nn);
   vec3 Ln = normalize(L);
   vec3 eyeDir = normalize(Ln+V);
   float D = distro(Nnor, eyeDir, m);
   float G = geomAttenu(Nnor, eyeDir, Ln,V);
   float F = fresnel_profe(Nnor, V, indexOfRefraction);
   cook =D*G*F;
   float vdotn = dot(V,Nnor);
   cook = cook/vdotn;
   cook = cook/3.14;
   return cook;
}

void main (void)  
{     
   
   vec4 cFinal = vec4(0.0,0.0,0.0,1.0);
   float iDiff, iSpec;
   vec3 vRef;
   //Componente Especular torrance-cook
   float iSpecCook = illumCookTorrance(N,camDirection,m,L.xyz);
   //Componente Specular Phong
   /*vRef = -normalize(reflect(L.xyz,N));
   iSpec = pow(max(dot(vRef, normalize(camDirection)), 0.0),10.0);*/

   //Componente difuso.
   iDiff = max(dot(normalize(N),normalize(L.xyz)), 0.0) ;

   cFinal = vec4(10.0,0.0,0.0,1.0)*cLightAmb*cMatAmb + iDiff*(cLightDiff*cMatDiff) + iSpecCook*(cLightSpec*cMatSpec);
   
   cFinal.w = 1.0;
   gl_FragColor = cFinal;

}    
