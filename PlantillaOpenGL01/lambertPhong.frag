varying vec4 cLightDiff, cLightAmb, cLightSpec;
varying vec4 cMatDiff, cMatAmb, cMatSpec;
varying vec3 camDirection;
varying vec3 N;
varying vec4 L;
uniform float indexOfRefraction;
uniform float m;
uniform bool typeSpec;
uniform bool fresnel;
uniform float bias;
uniform float eta;
uniform float kfr;
uniform float intensidadSpecular;
uniform float intensidadDiffuse;

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
   float ndoth = max(0.0,dot(Nn,H));
   float ndotv = max(0.0,dot(Nn,V));
   float ndot1 = max(0.0,dot(Nn,L));
   float vdoth = max(0.0,dot(V,H));
   float masking = 2*ndoth*ndotv/vdoth;
   float shadowing = 2*ndoth*ndot1/vdoth;
   return min(1,min(masking,shadowing));
}

float fresnel_profe(vec3 normal, vec3 light, float indexOfR){
   float R0 = pow(1.0-indexOfR,2.0)/pow(1.0+indexOfR,2.0);
   return R0+(1.0-R0)*pow(1.0-max(0.0,dot(light,normal)),5.0);
}

float illumCookTorrance(vec3 Nn, vec3 V, float m, vec3 L) {
   float cook = 0;
   vec3 eyeDir = normalize(L+V);
   float D = distro(Nn, eyeDir, m);
   float G = geomAttenu(Nn, eyeDir, L,V);
   float F = fresnel_profe(Nn, V, indexOfRefraction);
   cook =D*G*F;
   float vdotn = max(0.0,dot(V,Nn));
   cook = cook/vdotn;
   cook = cook/3.14;
   return cook;
}

float biasFunc(float t, float a) {
   return pow(t,-(log(a)/log(2)));
}

vec4 fresnelShlickFunc(float bias, float eta, float kfr, vec3 Nn, vec3 Vn) {
   float color = 0.0;
   float dotnv = abs(max(0.0,dot(Nn,Vn)));
   float kr = eta + (1-eta)*pow(1-dotnv,5);
   kr = kfr*biasFunc(kr,bias);
   vec4 res;
   res.x = kr*2.0;
   res.y = kr;
   res.z = kr*2.0;
   res.w = kr;
   return res;
}

float SeeligerFunc(vec3 Nn, vec3 Vn, vec3 Ln){
   vec4 color;
   //Vn = -Vn;
   float c = max(0.0,max(dot(Nn,Ln),0.0)/(max(0.0,dot(Nn,Ln))+max(0.0, dot(Nn,Vn))));
   return c;
}

void main (void)  
{     
   
   vec4 cFinal = vec4(0.0,0.0,0.0,1.0);
   float iDiff, iSpec;
   vec3 vRef;
   vec3 Nn = normalize(N);
   vec3 Ln = normalize(L.xyz);
   vec3 Vn = normalize(camDirection);
   //Componente Especular torrance-cook
   if(typeSpec) {
      iSpec = illumCookTorrance(Nn,Vn,m,Ln);
   } else {
	  iSpec = MinnaertFunc(-1.0,Nn,Vn,Ln);
   }

   //Componente difuso.
   //iDiff = max(dot(Nn,Ln), 0.0) ;
   iDiff = SeeligerFunc(Nn, Vn, Ln);

   if(!fresnel) cFinal = vec4(0.0,0.0,0.0,1.0)*cLightAmb*cMatAmb + iDiff*intensidadDiffuse*(cLightDiff*cMatDiff) + iSpec*intensidadSpecular*(cLightSpec*cMatSpec);
   else cFinal = fresnelShlickFunc(bias, eta, kfr, Nn, Vn);

   cFinal.w = 1.0;
   gl_FragColor = cFinal;

}    
