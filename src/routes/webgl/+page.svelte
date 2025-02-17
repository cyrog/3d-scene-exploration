<script>
  import { onMount } from 'svelte';

  let canvas;

  onMount(() => {
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      console.error('WebGL2 not supported');
      return;
    }

    // Set up the shader program (vertex and fragment shaders)
    const vertexShaderSource = `#version 300 es
      in vec4 a_position;
      in vec2 a_texCoord;
      out vec2 v_texCoord;
      void main() {
        gl_Position = a_position;
        v_texCoord = a_texCoord;
      }
    `;

    const fragmentShaderSource = `#version 300 es
      precision highp float;

      uniform float iTime;
      uniform vec2 iResolution;
      uniform float iTimeDelta;
      uniform sampler2D iChannel0; // Sampler for the texture
      in vec2 v_texCoord;
      out vec4 fragColor;

      // Shader code provided by the user
      const float SAMPLES_PER_PIXEL = 8.;
      float t;
      vec3 b1, b2;
      const float bR = 1.;

      #define rep(p,s) (mod(p,s)-(s)*.5)

      float hash(float f){return fract(sin(f)*57345.54378);}
      float noise2(vec2 v){
          return texture(iChannel0, (v+.5)/vec2(textureSize(iChannel0, 0).xy)).r;
      }

      float smin( float a, float b, float k )
      {
          k *= 4.0;
          float h = max( k-abs(a-b), 0.0 )/k;
          return min(a,b) - h*h*k*(1.0/4.0);
      }

      float bd, flr;
      float w(vec3 p) {
          vec3 pb1 = p - b1, pb2 = p - b2;
          float b = 1. / dot(pb1, pb1) + 1. / dot(pb2, pb2);    
          bd = smin(length(p-b1)-bR,length(p-b2)-bR, .5);
          flr = p.y + 1.*b;
          return min(bd, flr);
      }

      const vec3 e=vec3(0.,.01,1.);
      vec3 wn(vec3 p){
          return normalize(vec3(
              w(p+e.yxx)-w(p-e.yxx),
              w(p+e.xyx)-w(p-e.xyx),
              w(p+e.xxy)-w(p-e.xxy)
          ));
      }

      float tr(vec3 O, vec3 D, float l, float L){
          for (float i=0.; i<199.;++i){
              float d=w(O+D*l);l+=d;
              if(d<.001*l||l>L)return l;
          }
          return 1e9;
      }

      vec3 bg(vec3 dir) {
          dir.y = max(0., dir.y);
          vec3 c = mix(
              vec3(.8,.3,.2),
              vec3(.05,.1,.3)*.3,
              pow(dir.y, 1./8.)
          );
          
          vec3 ld = normalize(vec3(1.,.5,1.));
          c += .6 * vec3(.5, .8, .9) * max(0., pow(dot(dir, ld), 10.)) * noise2(dir.xz*8.);
          
          return c;
      }

      vec3 pixel(vec2 pix, float time) {
          vec2 uv = pix/iResolution.xy * 2. - 1.;
          uv.x *= iResolution.x / iResolution.y;
          
          t = time;
          
          float p0 = t * .4;
          float p1 = -t * .8;
          b1 = 2.3 * vec3(sin(p0),0.,cos(p0));
          b2 = b1 + (2.7 + (cos(p0) + 1.)*.5) * vec3(sin(p1),0.,cos(p1));
          vec3 at = (b1 + b2) * .5;
          
          vec3 col = vec3(0.);
          vec3 O=vec3(-3., 6., -6.);
          
          vec3 Y = vec3(0.,1.,0.);
          vec3 Z = normalize(O - at);
          vec3 X = cross(Y, Z);
          Y = cross(Z, X);
          vec3 D = mat3(X,Y,Z) * normalize(vec3(uv,-2.));
          
          float sl = 0.;
          vec3 kc = vec3(1.);
          for (float refl = 0.; refl < 3.; ++refl) {
              float L=100.,l=tr(O,D,0.,L);
              sl += l;
              if (l>L) {
                  col += kc * bg(D);
                  break;
              }

              vec3 P=O+D*l;
              vec3 N=wn(P);
              
              vec3 c=vec3(0.);
              vec3 mat = vec3(1.);
              
              if (flr<bd){
                  const vec2 sz = vec2(.2);
                  vec2 p = rep(P.xz,sz);
                  vec2 cell = floor(P.xz / sz);
                  mat = vec3(.7, .7, .9);
                  c += vec3(1.,.3,.01) * smoothstep(.004*sl, .002*sl, length(p)) * (.5 + .5 * smoothstep(.3, .7, noise2(cell * .2)));
              } else {
                  mat = vec3(.9, .3, .5);
              }
              
              kc *= mat;
              col += c * kc;
              O = P + N * .02;
              D = reflect(D, N);
          }

          return col;
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          vec3 col = vec3(0.);
          for (float sm=0.;sm<SAMPLES_PER_PIXEL;++sm) {
              float rnd = hash(sm+fract(iTime)+fragCoord.x*.39+fragCoord.y*.17);
              col += pixel(fragCoord + vec2(hash(rnd),hash(rnd+.1)), iTime - iTimeDelta*rnd);
          }
          fragColor = vec4(sqrt(col/SAMPLES_PER_PIXEL),1.0);
      }

      void main() {
          mainImage(fragColor, gl_FragCoord.xy);
      }
    `;

    // Function to compile shaders
    function compileShader(source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
      }
      return shader;
    }

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link failed:', gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);

    // Set up attributes, uniforms, and buffers
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const vertices = new Float32Array([
      -1.0, -1.0, 0.0,
       1.0, -1.0, 0.0,
      -1.0,  1.0, 0.0,
      -1.0,  1.0, 0.0,
       1.0, -1.0, 0.0,
       1.0,  1.0, 0.0
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionAttribLocation = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribLocation);

    const texCoordAttribLocation = gl.getAttribLocation(program, 'a_texCoord');
    const texCoords = new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0
    ]);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordAttribLocation);

    const resolutionUniformLocation = gl.getUniformLocation(program, 'iResolution');
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

    const timeUniformLocation = gl.getUniformLocation(program, 'iTime');
    const timeDeltaUniformLocation = gl.getUniformLocation(program, 'iTimeDelta');

    // Render loop
    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(timeUniformLocation, performance.now() / 1000);
      gl.uniform1f(timeDeltaUniformLocation, 0.01);  // Example time delta value
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(render);
    }

    render();
  });
</script>

<canvas bind:this={canvas} width="1080" height="720"></canvas>
