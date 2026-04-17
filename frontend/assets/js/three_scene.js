import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const canvas = document.getElementById("perfumeCanvas");
if (!canvas) throw new Error("Canvas not found");

// ── Renderer ────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

// ── Scene & Camera ──────────────────────────────────────────
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

// ── Lights ──────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const keyLight = new THREE.DirectionalLight(0xfff5e0, 2.5);
keyLight.position.set(3, 5, 4);
keyLight.castShadow = true;
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x6c3fc4, 80, 20);
fillLight.position.set(-4, -1, 3);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xc9a84c, 50, 15);
rimLight.position.set(0, -3, -3);
scene.add(rimLight);

// ── Particles (floating sparkles) ──────────────────────────
const particleCount = 60;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  const theta = Math.random() * Math.PI * 2;
  const r = 1.8 + Math.random() * 1.5;
  positions[i * 3]     = Math.cos(theta) * r;
  positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
  positions[i * 3 + 2] = Math.sin(theta) * r;
}
const partGeom = new THREE.BufferGeometry();
partGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const particles = new THREE.Points(partGeom, new THREE.PointsMaterial({
  color: 0xc9a84c, size: 0.025, transparent: true, opacity: 0.7,
}));
scene.add(particles);

// ── Load FBX model ──────────────────────────────────────────
const bottleGroup = new THREE.Group();
scene.add(bottleGroup);

const texLoader = new THREE.TextureLoader();
const texBase = "assets/models/perfume/textures/";

// Pre-load textures so FBXLoader can resolve them from the embedded paths
const texMap = {
  "Leather031_COL_2K.jpg":    texLoader.load(texBase + "Leather031_COL_2K.jpg"),
  "Leather031_GLOSS_2K.jpg":  texLoader.load(texBase + "Leather031_GLOSS_2K.jpg"),
  "Leather031_NRM_16_2K.jpg": texLoader.load(texBase + "Leather031_NRM_16_2K.jpg"),
  "Metal032_GLOSS_2K.jpg":    texLoader.load(texBase + "Metal032_GLOSS_2K.jpg"),
  "Metal032_METALNESS_2K.jpg":texLoader.load(texBase + "Metal032_METALNESS_2K.jpg"),
  "Metal032_NRM_16_2K.jpg":   texLoader.load(texBase + "Metal032_NRM_16_2K.jpg"),
  "Shade.png":                 texLoader.load(texBase + "Shade.png"),
};
Object.values(texMap).forEach(t => { t.colorSpace = THREE.SRGBColorSpace; });

// LoadingManager remaps any texture path to our served asset path
const manager = new THREE.LoadingManager();
manager.setURLModifier((url) => {
  const filename = url.split(/[\\/]/).pop();
  if (texMap[filename]) return texBase + filename;
  return url;
});

const fbxLoader = new FBXLoader(manager);
fbxLoader.load(
  "assets/models/perfume/source/Perfume.fbx",
  (fbx) => {
    // Fit model into view
    const box = new THREE.Box3().setFromObject(fbx);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3.0 / maxDim;
    fbx.scale.setScalar(scale);
    fbx.position.sub(center.multiplyScalar(scale));

    fbx.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Assign pre-loaded textures by material name hints
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          mats.forEach((mat) => {
            // Deep dark purple applied to every part of the perfume
            mat.color.set(0x2a0a5e);
            mat.map       = null;
            mat.metalness = 0.05;
            mat.roughness = 0.1;
            mat.needsUpdate = true;
          });
        }
      }
    });

    bottleGroup.add(fbx);

    // ── Logo label — recompute box AFTER scale+position applied ──
    const placedBox    = new THREE.Box3().setFromObject(fbx);
    const placedCenter = placedBox.getCenter(new THREE.Vector3());
    const placedSize   = placedBox.getSize(new THREE.Vector3());
    const labelSize    = Math.min(placedSize.x, placedSize.y) * 0.45;

    const logoTex2 = new THREE.TextureLoader().load("assets/images/logo_aseel.png");
    logoTex2.colorSpace = THREE.SRGBColorSpace;

    const labelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(labelSize, labelSize),
      new THREE.MeshStandardMaterial({
        map: logoTex2,
        transparent: true,
        alphaTest: 0.05,
        depthWrite: false,
        roughness: 0.3,
        metalness: 0.15,
      })
    );
    // Center X/Y, slightly lowered, just in front of the front face
    labelMesh.position.set(placedCenter.x, placedCenter.y - placedSize.y * 0.12, placedBox.max.z + 0.015);
    bottleGroup.add(labelMesh);
  },
  (xhr) => console.log(`[FBX] ${Math.round(xhr.loaded / xhr.total * 100)}% loaded`),
  (err) => console.error("[FBX] Load error:", err)
);

// ── Mouse tracking ──────────────────────────────────────────
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
document.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

let scrollY = 0;
window.addEventListener("scroll", () => { scrollY = window.scrollY; });

function onResize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight || 480;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", onResize);

// ── Animate ─────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  targetX += (mouseX - targetX) * 0.05;
  targetY += (mouseY - targetY) * 0.05;

  bottleGroup.rotation.y = elapsed * 0.25 + targetX * 0.8;
  bottleGroup.rotation.x = targetY * 0.25;
  bottleGroup.position.y = Math.sin(elapsed * 0.6) * 0.08;

  const sf = scrollY * 0.0008;
  bottleGroup.rotation.z = sf * 0.4;
  camera.position.z = 5 - sf * 0.5;

  particles.rotation.y = elapsed * 0.05;

  renderer.render(scene, camera);
}
animate();
