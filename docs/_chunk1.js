nd = new THREE.Color(0x6aaad0);
scene.fog = new THREE.FogExp2(0x9ec8e0, 0.000012);

const camera = new THREE.PerspectiveCamera(55, 1, 5, 450000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.HemisphereLight(0xfff2dc, 0x1a4a3a, 0.95));
const sun = new THREE.DirectionalLight(0xffe8c0, 1.35);
sun.position.set(80000, 120000, 40000);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x6080a0, 0.3));

{
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      top: { value: new THREE.Color(0x1a5a9a) },
      mid: { value: new THREE.Color(0x87b8d8) },
      bot: { value: new THREE.Color(0xc8e0f0) },
    },
    vertexShader: `varying vec3 v; void main(){ v=normalize((modelMatrix*vec4(position,1.0)).xyz); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: `uniform vec3 top,mid,bot; varying vec3 v; void main(){ float h=clamp(v.y*0.5+0.5,0.0,1.0); vec3 c=mix(bot,mid,smoothstep(0.0,0.45,h)); c=mix(c,top,smoothstep(0.45,1.0,h)); gl_FragColor=vec4(c,1.0); }`,
  });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(380000, 32, 16), mat));
}

function hash2(x, z) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function smoothNoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx), uz = fz * fz * (3 - 2 * fz);
  return (
    hash2(ix, iz) * (1 - ux) * (1 - uz) +
    hash2(ix + 1, iz) * ux * (1 - uz) +
    hash2(ix, iz + 1) * (1 - ux) * uz +
    hash2(ix + 1, iz + 1) * ux * uz
  );
}
function fbm(x, z, oct = 5) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += a * smoothNoise(x * f, z * f);
    a *= 0.5;
 