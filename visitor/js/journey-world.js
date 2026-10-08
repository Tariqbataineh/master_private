import * as THREE from '../../assets/vendor/three.module.js';

/* Reference-inspired building dimensions are illustrative, not a survey. */
export function startWorld(root) {
  const canvas = root.querySelector('#journeyCanvas');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'low-power'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
  renderer.shadowMap.enabled = innerWidth >= 750;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b9d6e5');
  scene.fog = new THREE.Fog('#cfdbd6', 65, 210);
  const camera = new THREE.PerspectiveCamera(58, 1, .1, 400);
  scene.add(new THREE.HemisphereLight('#e1efff', '#b4a17b', 2.5));
  const sun = new THREE.DirectionalLight('#ffdeb2', 3.1);
  sun.position.set(-40, 65, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 45;
  sun.shadow.camera.bottom = -45;
  sun.shadow.camera.far = 160;
  sun.shadow.bias = -.001;
  scene.add(sun);
  scene.add(sun.target);
  const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({
    color,
    roughness: .85,
    ...opts
  });
  const stone = mat('#bdb6a2'),
    concrete = mat('#d4d1c2'),
    steel = mat('#3c5556', {
      metalness: .55,
      roughness: .4
    }),
    glass = mat('#426577', {
      metalness: .55,
      roughness: .16
    }),
    orange = mat('#ff7800');
  const box = (w, h, d, x, y, z, m, parent = scene) => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  };
  function noiseTexture(base, repeat = 1) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const cx = c.getContext('2d');
    const data = cx.createImageData(128, 128);
    let seed = 19;
    for (let i = 0; i < data.data.length; i += 4) {
      seed = seed * 1664525 + 1013904223 >>> 0;
      const n = (seed / 4294967296 - .5) * 24;
      data.data[i] = base[0] + n;
      data.data[i + 1] = base[1] + n;
      data.data[i + 2] = base[2] + n;
      data.data[i + 3] = 255;
    }
    cx.putImageData(data, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    return t;
  }
  const grass = mat('#a9b18a', {
      map: noiseTexture([137, 149, 106], 70)
    }),
    asphalt = mat('#98938a', {
      map: noiseTexture([100, 101, 98], 1)
    });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 650), grass);
  ground.rotation.x = -Math.PI / 2;
  ground.position.z = -160;
  ground.receiveShadow = true;
  scene.add(ground);
  const clamp = n => Math.max(0, Math.min(1, n));
  const xAt = d => 12 * Math.sin(d * .022) * Math.sin(Math.PI * clamp(d / 275));
  function strip(left, right, y, m, start = 0, end = 283) {
    const vertices = [],
      uv = [];
    for (let d = start; d < end; d += 1) {
      const next = Math.min(d + 1, end),
        x = xAt(d),
        nx = xAt(next);
      vertices.push(x + left, y, -d, x + right, y, -d, nx + left, y, -next, x + right, y, -d, nx + right, y, -next, nx + left, y, -next);
      uv.push(0, d / 6, 1, d / 6, 0, next / 6, 1, d / 6, 1, next / 6, 0, next / 6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    const o = new THREE.Mesh(g, m);
    o.receiveShadow = true;
    scene.add(o);
    return o;
  }
  asphalt.side = THREE.DoubleSide;
  strip(-3.5, 3.5, .025, asphalt);
  strip(-5.2, -3.5, .035, concrete);
  strip(3.5, 5.2, .035, concrete);
  const edge = mat('#f3ead4');
  edge.side = THREE.DoubleSide;
  strip(-3.25, -3.17, .045, edge);
  strip(3.17, 3.25, .045, edge);
  for (let d = 0; d < 276; d += 7) strip(-.055, .055, .05, edge, d, d + 2.8);
  for (let d = -8; d < 64; d += 7) {
    const x = xAt(Math.max(0, d));
    for (const side of [-1, 1]) {
      box(.32, 7, .45, x + side * 5, 3.5, -d, steel);
      box(.2, .25, 7, x + side * 4.8, 1.05, -d - 3.5, steel);
      box(.2, .25, 7, x + side * 4.8, 1.8, -d - 3.5, steel);
      box(.6, .2, 7, x + side * 5, .18, -d - 3.5, concrete);
      const diagonal = box(.18, 7.7, .18, x + side * 5, 3.5, -d - 3.5, steel);
      diagonal.rotation.x = .75;
    }
    box(10.5, .3, .45, x, 7, -d, steel);
    box(10.5, .12, 1, x, 6.8, -d, steel);
  }
  const trunk = mat('#76624a'),
    leaf = mat('#657b46'),
    leafLight = mat('#8c9955');
  const sphere = new THREE.SphereGeometry(1, 10, 7);
  function tree(x, z, size = 1) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    scene.add(group);
    box(.25, 3, .25, 0, 1.5, 0, trunk, group);
    for (let i = 0; i < 5; i++) {
      const crown = new THREE.Mesh(sphere, i % 3 ? leaf : leafLight);
      const angle = i * 2.4,
        r = i % 3 * .5;
      crown.position.set(Math.sin(angle) * r, 3.2 + i % 4 * .43, Math.cos(angle) * r);
      crown.scale.set(.72 * size, (.75 + i % 2 * .2) * size, .7 * size);
      crown.castShadow = i === 0;
      group.add(crown);
    }
  }
  for (let d = 70; d < 290; d += 12) {
    for (const side of [-1, 1]) {
      tree(xAt(d) + side * (8 + d % 4), -d, .9 + d % 3 * .15);
    }
  }
  for (let d = 90; d < 255; d += 26) {
    for (const side of [-1, 1]) {
      const x = xAt(d) + side * 5.6;
      box(.12, 5, .12, x, 2.5, -d, steel);
      box(.8, .12, .28, x - side * .25, 5, -d, steel);
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(.4, .05, .2), mat('#ffe9b8', {
        emissive: '#ffcc77',
        emissiveIntensity: .8
      }));
      lamp.position.set(x - side * .25, 4.9, -d);
      scene.add(lamp);
    }
  }
  // Neighborhood massing helps the route feel embedded in an actual place.
  for (let i = 0; i < 18; i++) {
    const d = 90 + i * 10;
    for (const side of [-1, 1]) {
      const x = xAt(d) + side * (22 + i % 3 * 7),
        h = 5 + i % 4 * 2;
      box(9, h, 9, x, h / 2, -d, stone);
      for (let row = 0; row < Math.floor(h / 3); row++) for (let col = 0; col < 3; col++) box(1.1, 1.4, .08, x - 3 + col * 3, 1.8 + row * 2.7, -d + 4.55, glass);
    }
  }
  const building = new THREE.Group();
  building.position.set(0, 0, -296);
  scene.add(building);
  const facade = mat('#c9ccca', {
    roughness: .55
  });
  box(8, 14, 13, 0, 7, 0, facade, building);
  for (const side of [-1, 1]) {
    box(8, 13, 16, side * 8, 6.5, -1.5, stone, building);
    for (let floor = 0; floor < 4; floor++) for (let col = 0; col < 3; col++) {
      const wx = side * 8 - 2.4 + col * 2.4,
        wy = 1.8 + floor * 3;
      box(1.4, 1.8, .12, wx, wy, 6.57, glass, building);
      box(.12, 2, .2, wx - .77, wy, 6.62, concrete, building);
      box(.12, 2, .2, wx + .77, wy, 6.62, concrete, building);
    }
    // Side windows: visible when the walking camera approaches off-center.
    for (let floor = 0; floor < 4; floor++) for (let col = 0; col < 5; col++) box(.1, 1.8, 1.4, side * 12.05, 1.8 + floor * 3, 4 - col * 2.6, glass, building);
    for (let col = 0; col < 5; col++) box(.18, 13, .2, side * 8 - 3.8 + col * 1.9, 6.5, 6.65, concrete, building);
  }
  const texture = new THREE.TextureLoader().load('../../assets/images/orange_home.jpg', () => requestDraw());
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  const front = new THREE.Mesh(new THREE.PlaneGeometry(7.85, 13.95), new THREE.MeshStandardMaterial({
    map: texture,
    roughness: .65
  }));
  front.position.set(0, 7, 6.57);
  building.add(front);
  box(4.8, .28, 1.6, 0, 3.5, 7.3, concrete, building);
  box(4.8, .16, 1.4, 0, .08, 7.4, stone, building);
  box(5.6, .1, 1.5, 0, .04, 8.6, stone, building);
  box(25, .2, 1, 0, 13.15, -1, concrete, building);
  for (const side of [-1, 1]) {
    box(2.7, .7, 2.4, side * 8, .35, 9.5, concrete, building);
    tree(side * 10, -280, 1.5);
  }
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(32, 22), concrete);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, .018, -280);
  plaza.receiveShadow = true;
  scene.add(plaza);
  // A wide AI architectural view appears on the final roadside information board.
  const image = new THREE.TextureLoader().load('../../assets/images/orange-academy-ai.png', () => requestDraw());
  image.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(5, 3.33), new THREE.MeshBasicMaterial({
    map: image
  }));
  board.position.set(-8, 2.8, -266);
  board.rotation.y = .28;
  scene.add(board);
  box(.15, 1.2, .15, -8, .6, -266, steel);
  // Eight roadside communities, each placed at its own Home section's arrival.
  const peopleGroups = [];
  const skinTones = ['#bf8765', '#e0b491', '#965f46'];
  const clothes = ['#267e7d', '#d2ae79', '#3b5268', '#8e796c'];
  function person(parent, x, z, index) {
    const figure = new THREE.Group();
    figure.position.set(x, 0, z);
    figure.rotation.y = index % 2 ? -.3 : .25;
    parent.add(figure);
    const skin = mat(skinTones[index % 3]),
      shirt = mat(clothes[index % 4]),
      pants = mat('#344854'),
      hair = mat(index % 2 ? '#392c25' : '#232b2d');
    const limb = (radius, length, px, py, pz, m, angle = 0) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * .88, length, 10), m);
      mesh.position.set(px, py, pz);
      mesh.rotation.z = angle;
      mesh.castShadow = true;
      figure.add(mesh);
      return mesh;
    };
    const h = 1 + index % 3 * .035;
    figure.scale.setScalar(h);
    limb(.085, .72, -.12, .43, 0, pants, .035);
    limb(.085, .72, .12, .43, 0, pants, -.035);
    box(.17, .09, .29, -.12, .065, .055, hair, figure);
    box(.17, .09, .29, .12, .065, .055, hair, figure);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.21, .35, 5, 12), shirt);
    torso.position.y = 1.04;
    torso.scale.z = .65;
    torso.castShadow = true;
    figure.add(torso);
    limb(.072, .36, -.28, 1.04, 0, shirt, -.15);
    limb(.062, .28, -.31, .75, .02, skin, -.06);
    limb(.072, .33, .27, 1.07, 0, shirt, .25);
    limb(.06, .28, .29, .85, .075, skin, -.6);
    limb(.065, .14, 0, 1.36, 0, skin);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.135, 14, 10), skin);
    head.position.set(0, 1.54, 0);
    head.scale.set(1, 1.25, .92);
    head.castShadow = true;
    figure.add(head);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.139, 14, 10, 0, Math.PI * 2, 0, Math.PI * .55), hair);
    cap.position.set(0, 1.59, -.008);
    figure.add(cap);
  }
  for (let i = 0; i < 8; i++) {
    const group = new THREE.Group();
    scene.add(group);
    for (let j = 0; j < 3 + i % 2; j++) person(group, (j - 1) * .65, j % 2 * .5, i + j);
    const marker = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, .025, 32), mat('#dce9d6'));
    marker.position.y = .04;
    marker.receiveShadow = true;
    group.add(marker);
    group.visible = false;
    peopleGroups.push(group);
  }
  const communityTexture = new THREE.TextureLoader().load('../../assets/images/road-community.png', texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    for (const group of peopleGroups) {
      group.children.filter(child => child.isGroup).forEach(figure => figure.visible = false);
      const people = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        alphaTest: .08,
        depthWrite: false
      }));
      people.center.set(.5, 0);
      people.position.y = .06;
      people.scale.set(2.1 * texture.image.width / texture.image.height, 2.1, 1);
      group.add(people);
    }
    requestDraw();
  });
  let p = 0,
    bridgeEnd = .2,
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches,
    animation = 0,
    visible = true;
  const current = new THREE.Vector3(),
    desired = new THREE.Vector3(),
    look = new THREE.Vector3();
  const walkDistance = value => value < bridgeEnd ? value / bridgeEnd * 80 : value < .93 ? 80 + (value - bridgeEnd) / (.93 - bridgeEnd) * 179 : 259 + (value - .93) / .07 * 9;
  function position() {
    const d = reduced ? 263 : walkDistance(p),
      arrival = reduced ? 1 : clamp((p - .76) / .17);
    const side = arrival * 5.5;
    desired.set(xAt(d) + side, 1.75 + (reduced ? 0 : Math.sin(d * 2.3) * .022), -d);
    const forward = new THREE.Vector3(xAt(d + 12), 1.6, -d - 12);
    const destination = new THREE.Vector3(0, 5.1, -289);
    look.copy(forward).lerp(destination, arrival);
  }
  function draw() {
    animation = 0;
    if (!visible) return;
    position();
    current.lerp(desired, reduced ? 1 : .17);
    camera.position.copy(current);
    camera.lookAt(look);
    sun.position.set(current.x - 35, 55, current.z + 25);
    sun.target.position.set(current.x, 0, current.z - 25);
    renderer.render(scene, camera);
    if (current.distanceToSquared(desired) > .00005) requestDraw();
  }
  function requestDraw() {
    if (!animation && visible) animation = requestAnimationFrame(draw);
  }
  function resize() {
    const w = canvas.clientWidth,
      h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    requestDraw();
  }
  root.addEventListener('journey-progress', event => {
    p = event.detail.p;
    reduced = event.detail.reduced;
    bridgeEnd = Math.max(.01, event.detail.stations?.[0]?.progress || .2);
    for (const station of event.detail.stations || []) {
      const group = peopleGroups[station.index];
      const d = Math.min(273, walkDistance(station.progress) + 32);
      group.position.set(xAt(d) + station.side * 5.6, .04, -d);
      group.rotation.y = station.side < 0 ? -.55 : .55;
      group.visible = !reduced;
    }
    requestDraw();
  });
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) requestDraw();
  }, {
    threshold: 0
  });
  observer.observe(root);
  const raycaster = new THREE.Raycaster();
  let start = null;
  canvas.addEventListener('pointerdown', e => {
    start = [e.clientX, e.clientY];
  });
  canvas.addEventListener('pointerup', e => {
    if (!start || Math.hypot(e.clientX - start[0], e.clientY - start[1]) > 10 || p < .82) return;
    start = null;
    const r = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), camera);
    const dialog = document.getElementById('academyDetails');
    if (raycaster.intersectObject(building, true).length && !dialog.open) dialog.showModal();
  });
  canvas.addEventListener('pointermove', e => {
    if (p < .82) {
      canvas.style.cursor = 'default';
      return;
    }
    const r = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), camera);
    canvas.style.cursor = raycaster.intersectObject(building, true).length ? 'pointer' : 'default';
  }, {
    passive: true
  });
  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault();
    root.classList.add('journey-fallback');
  });
  addEventListener('resize', resize);
  addEventListener('pageshow', requestDraw);
  addEventListener('pagehide', () => {
    if (animation) cancelAnimationFrame(animation);
  }, {
    once: true
  });
  position();
  current.copy(desired);
  resize();
  root.classList.add('journey-world-ready');
}
