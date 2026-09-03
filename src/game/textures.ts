import * as THREE from 'three';

// Procedurally generates realistic, high-detail horror textures for the abandoned mansion (폐가)
export class AbandonedMansionTextures {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  // 1. Weathered, dark rotting wood planks (썩은 마룻바닥)
  public static getWoodFloorTexture(): THREE.CanvasTexture {
    if (this.cache.has('wood_floor')) return this.cache.get('wood_floor')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base dark weathered wood color
    ctx.fillStyle = '#221811';
    ctx.fillRect(0, 0, 512, 512);

    const plankHeight = 64;
    for (let y = 0; y < 512; y += plankHeight) {
      // Individual plank variation
      const brightness = Math.floor(Math.random() * 20) - 10;
      ctx.fillStyle = `rgb(${38 + brightness}, ${28 + brightness}, ${20 + brightness})`;
      ctx.fillRect(0, y, 512, plankHeight);

      // Wood grain lines
      for (let g = 0; g < 18; g++) {
        ctx.strokeStyle = `rgba(${18 + Math.random() * 15}, ${12 + Math.random() * 10}, 8, ${0.15 + Math.random() * 0.25})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        const startY = y + Math.random() * plankHeight;
        ctx.moveTo(0, startY);
        ctx.bezierCurveTo(
          150, startY + (Math.random() - 0.5) * 12,
          350, startY + (Math.random() - 0.5) * 12,
          512, startY + (Math.random() - 0.5) * 12
        );
        ctx.stroke();
      }

      // Dirt, grime, and mold stains
      for (let s = 0; s < 5; s++) {
        const sx = Math.random() * 512;
        const sy = y + Math.random() * plankHeight;
        const rad = 10 + Math.random() * 30;
        const grad = ctx.createRadialGradient(sx, sy, 2, sx, sy, rad);
        grad.addColorStop(0, 'rgba(10, 8, 5, 0.6)');
        grad.addColorStop(0.6, 'rgba(25, 22, 12, 0.3)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // Plank gap separator shadow
      ctx.fillStyle = '#0a0604';
      ctx.fillRect(0, y + plankHeight - 3, 512, 3);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(0, y, 512, 1);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('wood_floor', texture);
    return texture;
  }

  // 2. Moldy peeling wallpaper & damp plaster wall (흉가의 낡고 뜯겨나간 벽지와 곰팡이 핀 흙벽)
  public static getMoldyWallTexture(): THREE.CanvasTexture {
    if (this.cache.has('moldy_wall')) return this.cache.get('moldy_wall')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base dingy aged yellow-gray paper plaster (누렇게 변색되고 눅눅한 바탕)
    ctx.fillStyle = '#322b22';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle traditional antique damask/lattice floral wallpaper pattern (색바랜 고택 벽지 문양)
    ctx.strokeStyle = 'rgba(78, 67, 52, 0.35)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < 512; x += 32) {
      for (let y = 0; y < 512; y += 32) {
        // Antique rhombus frame
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 2);
        ctx.lineTo(x + 30, y + 16);
        ctx.lineTo(x + 16, y + 30);
        ctx.lineTo(x + 2, y + 16);
        ctx.closePath();
        ctx.stroke();

        // Inner lotus/floral petal cross
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Large jagged tear patches revealing dark rotting straw-earth mud wall underneath (뜯겨나간 흙벽 노출)
    const tearPatches = [
      { cx: 120, cy: 150, rx: 75, ry: 110, rot: 0.2 },
      { cx: 380, cy: 280, rx: 90, ry: 130, rot: -0.3 },
      { cx: 220, cy: 410, rx: 60, ry: 70, rot: 0.5 },
      { cx: 440, cy: 80, rx: 50, ry: 60, rot: -0.1 },
    ];

    for (const patch of tearPatches) {
      ctx.save();
      ctx.translate(patch.cx, patch.cy);
      ctx.rotate(patch.rot);

      // Deep dark wet earthen plaster base (어둡게 썩어 들어간 진흙벽)
      ctx.fillStyle = '#140e09';
      ctx.beginPath();
      ctx.moveTo(-patch.rx, 0);
      const points = 16;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radJitter = 0.75 + Math.sin(angle * 5) * 0.2 + (Math.random() - 0.5) * 0.15;
        const px = Math.cos(angle) * patch.rx * radJitter;
        const py = Math.sin(angle) * patch.ry * radJitter;
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();

      // Exposed straw fibers embedded in ancient mud (흙벽 속 지푸라기 심)
      ctx.strokeStyle = '#3d301e';
      ctx.lineWidth = 1.2;
      for (let s = 0; s < 25; s++) {
        const sx = (Math.random() - 0.5) * patch.rx * 1.4;
        const sy = (Math.random() - 0.5) * patch.ry * 1.4;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + (Math.random() - 0.5) * 16, sy + (Math.random() - 0.5) * 16);
        ctx.stroke();
      }

      // Peeling jagged paper border rim with curling light edge & cast shadow (들떠서 말려있는 벽지 경계면)
      ctx.strokeStyle = '#c4b69c';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Drop shadow around peeled paper edge
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.restore();
    }

    // Heavy black & necrotic dark-green mold blooms (피어난 검은 곰팡이와 이끼 군집)
    for (let m = 0; m < 18; m++) {
      const mx = Math.random() * 512;
      const my = Math.random() * 512;
      const mSize = 25 + Math.random() * 85;
      const mGrad = ctx.createRadialGradient(mx, my, 4, mx, my, mSize);
      mGrad.addColorStop(0, 'rgba(8, 12, 8, 0.96)');
      mGrad.addColorStop(0.35, 'rgba(18, 26, 16, 0.8)');
      mGrad.addColorStop(0.7, 'rgba(38, 32, 22, 0.4)');
      mGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.arc(mx, my, mSize, 0, Math.PI * 2);
      ctx.fill();

      // Speckled fungal spores
      for (let sp = 0; sp < 45; sp++) {
        ctx.fillStyle = Math.random() > 0.4 ? 'rgba(4, 8, 4, 0.85)' : 'rgba(28, 22, 14, 0.75)';
        ctx.fillRect(mx + (Math.random() - 0.5) * mSize * 1.5, my + (Math.random() - 0.5) * mSize * 1.5, 1.8, 1.8);
      }
    }

    // Chilling desperate claw scratch marks (벽을 할퀴어댄 듯한 손톱 긁힘)
    for (let sc = 0; sc < 3; sc++) {
      const startX = 60 + Math.random() * 380;
      const startY = 80 + Math.random() * 260;
      for (let finger = 0; finger < 4; finger++) {
        ctx.strokeStyle = 'rgba(12, 8, 5, 0.85)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        const fx = startX + finger * 9;
        ctx.moveTo(fx, startY);
        ctx.bezierCurveTo(
          fx + 5, startY + 50,
          fx - 4, startY + 110,
          fx + 2, startY + 160 + Math.random() * 20
        );
        ctx.stroke();

        // White paper fray edge along scratches
        ctx.strokeStyle = 'rgba(180, 170, 150, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Water drip & dirty seepage trails running down vertically (천장에서 흘러내린 오염된 물때)
    for (let d = 0; d < 12; d++) {
      const dx = Math.random() * 512;
      const dripHeight = 180 + Math.random() * 320;
      const dripGrad = ctx.createLinearGradient(dx, 0, dx, dripHeight);
      dripGrad.addColorStop(0, 'rgba(14, 10, 6, 0.85)');
      dripGrad.addColorStop(0.5, 'rgba(25, 20, 14, 0.45)');
      dripGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = dripGrad;
      ctx.fillRect(dx, 0, 3 + Math.random() * 8, dripHeight);
    }

    // Faint cursed bloody smear trace (희미하게 남은 핏빛 얼룩 흔적)
    ctx.fillStyle = 'rgba(65, 12, 10, 0.35)';
    ctx.beginPath();
    ctx.ellipse(310, 190, 45, 25, 0.4, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('moldy_wall', texture);
    return texture;
  }

  // 2-B. Tangible Bump & Normal relief map for torn wallpaper and cracks (벽면 요철 및 질감 맵)
  public static getWallBumpTexture(): THREE.CanvasTexture {
    if (this.cache.has('wall_bump')) return this.cache.get('wall_bump')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Mid-gray base wallpaper plane (128)
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    // Noise plaster grain
    for (let i = 0; i < 4000; i++) {
      const v = 110 + Math.floor(Math.random() * 36);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    // Sunken tears in plaster (deep cavities = 30-50 dark gray)
    const patches = [
      { cx: 120, cy: 150, rx: 75, ry: 110, rot: 0.2 },
      { cx: 380, cy: 280, rx: 90, ry: 130, rot: -0.3 },
      { cx: 220, cy: 410, rx: 60, ry: 70, rot: 0.5 },
      { cx: 440, cy: 80, rx: 50, ry: 60, rot: -0.1 },
    ];

    for (const p of patches) {
      ctx.save();
      ctx.translate(p.cx, p.cy);
      ctx.rotate(p.rot);

      ctx.fillStyle = '#222222';
      ctx.beginPath();
      ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // High bright ridge along the peeling wallpaper curl (240-255 bright highlight)
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 5;
      ctx.stroke();

      ctx.restore();
    }

    // Scratch grooves (sunken lines = 20)
    for (let s = 0; s < 3; s++) {
      const sx = 70 + s * 120;
      for (let f = 0; f < 4; f++) {
        ctx.strokeStyle = '#151515';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx + f * 8, 100);
        ctx.lineTo(sx + f * 8 + 4, 250);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('wall_bump', texture);
    return texture;
  }

  // 3. Torn Hanji sliding paper door (창호지 문)
  public static getTornHanjiDoorTexture(): THREE.CanvasTexture {
    if (this.cache.has('hanji_door')) return this.cache.get('hanji_door')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Translucent aged yellowed hanji paper background
    ctx.fillStyle = '#4a4336';
    ctx.fillRect(0, 0, 512, 512);

    // Wooden door grid lattice (창살)
    const gridSize = 64;
    ctx.fillStyle = '#261b14';
    // Outer frame
    ctx.fillRect(0, 0, 512, 16);
    ctx.fillRect(0, 496, 512, 16);
    ctx.fillRect(0, 0, 16, 512);
    ctx.fillRect(496, 0, 16, 512);

    // Inner lattice bars
    for (let x = gridSize; x < 512; x += gridSize) {
      ctx.fillRect(x - 4, 0, 8, 512);
    }
    for (let y = gridSize; y < 512; y += gridSize) {
      ctx.fillRect(0, y - 4, 512, 8);
    }

    // Torn paper holes with darkness behind
    for (let t = 0; t < 9; t++) {
      const tx = 40 + Math.floor(Math.random() * 6) * gridSize;
      const ty = 40 + Math.floor(Math.random() * 6) * gridSize;
      ctx.fillStyle = '#080503';
      ctx.beginPath();
      ctx.ellipse(tx, ty, 18 + Math.random() * 12, 12 + Math.random() * 14, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();

      // Torn jagged paper fibers
      ctx.strokeStyle = '#6e6252';
      ctx.lineWidth = 1.5;
      for (let f = 0; f < 8; f++) {
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + (Math.random() - 0.5) * 35, ty + (Math.random() - 0.5) * 35);
        ctx.stroke();
      }
    }

    // Blood fingerprint smudge on door
    ctx.fillStyle = 'rgba(100, 12, 12, 0.65)';
    ctx.beginPath();
    ctx.arc(280, 220, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(295, 205, 12, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('hanji_door', texture);
    return texture;
  }

  // 4. Shaman Crimson Talisman (봉인 부적)
  public static getTalismanTexture(): THREE.CanvasTexture {
    if (this.cache.has('talisman')) return this.cache.get('talisman')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Yellow aged talisman paper
    ctx.fillStyle = '#b89842';
    ctx.fillRect(0, 0, 256, 512);

    // Weathered paper borders & burn marks
    ctx.strokeStyle = '#735818';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 236, 492);

    // Cinnabar red occult calligraphy (주사 부적 붉은 문양)
    ctx.strokeStyle = '#8a0d0d';
    ctx.fillStyle = '#8a0d0d';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Top seal crown (敕令)
    ctx.beginPath();
    ctx.moveTo(128, 40);
    ctx.lineTo(80, 70);
    ctx.lineTo(176, 70);
    ctx.lineTo(128, 40);
    ctx.stroke();

    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('敕令', 128, 115);

    // Occult esoteric curves and lightning seals (태상노군 부적 선)
    ctx.beginPath();
    ctx.moveTo(128, 140);
    ctx.lineTo(128, 240);
    ctx.bezierCurveTo(60, 260, 60, 320, 128, 330);
    ctx.bezierCurveTo(190, 340, 190, 400, 128, 420);
    ctx.lineTo(128, 460);
    ctx.stroke();

    // Side lightning strikes (귀신 결박인)
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(70, 160);
    ctx.lineTo(50, 200);
    ctx.lineTo(75, 230);
    ctx.lineTo(55, 270);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(186, 160);
    ctx.lineTo(206, 200);
    ctx.lineTo(181, 230);
    ctx.lineTo(201, 270);
    ctx.stroke();

    ctx.font = 'bold 22px serif';
    ctx.fillText('急急如律令', 128, 485);

    // Burnt edges
    const burnGrad = ctx.createLinearGradient(0, 480, 0, 512);
    burnGrad.addColorStop(0, 'rgba(0,0,0,0)');
    burnGrad.addColorStop(1, 'rgba(30,10,0,0.85)');
    ctx.fillStyle = burnGrad;
    ctx.fillRect(0, 480, 256, 32);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('talisman', texture);
    return texture;
  }

  // 5. Creepy Korean Wooden Mask (목각 하회탈 / 방상시 귀면탈)
  public static getCursedMaskTexture(): THREE.CanvasTexture {
    if (this.cache.has('cursed_mask')) return this.cache.get('cursed_mask')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#2c1e13';
    ctx.fillRect(0, 0, 256, 256);

    // Face oval
    ctx.fillStyle = '#5c442f';
    ctx.beginPath();
    ctx.ellipse(128, 128, 90, 110, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hollow eye sockets with glowing or bleeding red pupils
    ctx.fillStyle = '#0f0805';
    ctx.beginPath();
    ctx.ellipse(90, 105, 20, 12, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(166, 105, 20, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Red pupil glint
    ctx.fillStyle = '#b31515';
    ctx.beginPath();
    ctx.arc(90, 105, 5, 0, Math.PI * 2);
    ctx.arc(166, 105, 5, 0, Math.PI * 2);
    ctx.fill();

    // Blood dripping from eyes
    ctx.strokeStyle = '#6e0a0a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(90, 115);
    ctx.lineTo(88, 170);
    ctx.moveTo(166, 115);
    ctx.lineTo(168, 185);
    ctx.stroke();

    // Grotesque grinning mouth
    ctx.fillStyle = '#100805';
    ctx.beginPath();
    ctx.moveTo(75, 175);
    ctx.quadraticCurveTo(128, 230, 181, 175);
    ctx.quadraticCurveTo(128, 190, 75, 175);
    ctx.fill();

    // Yellowed jagged teeth
    ctx.fillStyle = '#d4c29a';
    for (let i = 0; i < 7; i++) {
      ctx.fillRect(88 + i * 12, 178, 6, 8);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('cursed_mask', texture);
    return texture;
  }

  // 6. Old Shaman Altar Painting / Ancestral Portrait (위패 / 영정)
  public static getAncestralPortraitTexture(): THREE.CanvasTexture {
    if (this.cache.has('portrait')) return this.cache.get('portrait')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;

    // Black lacquered frame
    ctx.fillStyle = '#110c08';
    ctx.fillRect(0, 0, 256, 384);

    // Weathered sepia vintage photo
    ctx.fillStyle = '#42362b';
    ctx.fillRect(16, 16, 224, 352);

    // Silhouette of traditional Korean white robe (소복 입은 형체)
    ctx.fillStyle = '#8a7d6d';
    ctx.beginPath();
    ctx.moveTo(128, 180);
    ctx.lineTo(60, 360);
    ctx.lineTo(196, 360);
    ctx.closePath();
    ctx.fill();

    // Blurred, face-scratched portrait head
    ctx.fillStyle = '#2b221a';
    ctx.beginPath();
    ctx.arc(128, 140, 40, 0, Math.PI * 2);
    ctx.fill();

    // Scratched out face marks (붉은 손톱 할큄 자국)
    ctx.strokeStyle = '#8a1010';
    ctx.lineWidth = 3;
    for (let s = 0; s < 5; s++) {
      ctx.beginPath();
      ctx.moveTo(100 + s * 14, 110);
      ctx.lineTo(90 + s * 14, 170);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('portrait', texture);
    return texture;
  }

  // 7. Dark ceiling wood rafters (서까래 천장)
  public static getCeilingTexture(): THREE.CanvasTexture {
    if (this.cache.has('ceiling')) return this.cache.get('ceiling')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#18120c';
    ctx.fillRect(0, 0, 512, 512);

    // Heavy wooden beams across
    for (let x = 0; x < 512; x += 128) {
      ctx.fillStyle = '#0f0a06';
      ctx.fillRect(x, 0, 24, 512);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(x + 24, 0, 2, 512);
    }

    // Cobwebs in corners
    ctx.strokeStyle = 'rgba(180, 180, 180, 0.15)';
    ctx.lineWidth = 1;
    for (let w = 0; w < 6; w++) {
      const cx = (w % 2) * 512;
      const cy = Math.floor(w / 2) * 256;
      for (let r = 20; r < 90; r += 15) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 0.5);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('ceiling', texture);
    return texture;
  }

  // 8. Ancient Korean book spines (고문서 책등)
  public static getBookSpinesTexture(): THREE.CanvasTexture {
    if (this.cache.has('books')) return this.cache.get('books')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1c140e';
    ctx.fillRect(0, 0, 256, 256);

    const colors = ['#4a2e1b', '#2b382d', '#5a2218', '#382a4a', '#4a3f28'];
    for (let x = 0; x < 256; x += 24) {
      const color = colors[(x / 24) % colors.length];
      ctx.fillStyle = color;
      ctx.fillRect(x + 2, 8, 20, 240);

      // Gold spine ribs & hanja title marks
      ctx.fillStyle = '#b89a4b';
      ctx.fillRect(x + 4, 30, 16, 2);
      ctx.fillRect(x + 4, 220, 16, 2);
      for (let h = 0; h < 3; h++) {
        ctx.fillRect(x + 10, 60 + h * 18, 4, 10);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('books', texture);
    return texture;
  }

  // 9. Herbal medicine drawers (약초방 서랍장)
  public static getMedicineDrawersTexture(): THREE.CanvasTexture {
    if (this.cache.has('herbal_drawers')) return this.cache.get('herbal_drawers')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#2e2016';
    ctx.fillRect(0, 0, 256, 256);

    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 256; x += 32) {
        ctx.strokeStyle = '#150d09';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, 28, 28);

        // Drawer ring pull
        ctx.fillStyle = '#9e8048';
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // White paper label with ink writing
        ctx.fillStyle = '#d6cbaf';
        ctx.fillRect(x + 8, y + 6, 16, 6);
        ctx.fillStyle = '#110c08';
        ctx.fillRect(x + 11, y + 8, 10, 2);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('herbal_drawers', texture);
    return texture;
  }

  // 10. Folding screen ink wash landscape (8폭 병풍 수묵산수화)
  public static getFoldingScreenTexture(): THREE.CanvasTexture {
    if (this.cache.has('folding_screen')) return this.cache.get('folding_screen')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Silk / aged hanji paper background
    ctx.fillStyle = '#d4c7a9';
    ctx.fillRect(0, 0, 512, 256);

    // Ink wash misty mountains
    ctx.fillStyle = 'rgba(30, 28, 25, 0.4)';
    ctx.beginPath();
    ctx.moveTo(0, 180);
    ctx.lineTo(80, 80);
    ctx.lineTo(160, 140);
    ctx.lineTo(240, 60);
    ctx.lineTo(340, 150);
    ctx.lineTo(440, 70);
    ctx.lineTo(512, 160);
    ctx.lineTo(512, 256);
    ctx.lineTo(0, 256);
    ctx.closePath();
    ctx.fill();

    // Dark foreground mountain crags and pine trees
    ctx.fillStyle = 'rgba(15, 12, 10, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, 220);
    ctx.lineTo(120, 140);
    ctx.lineTo(220, 200);
    ctx.lineTo(320, 130);
    ctx.lineTo(460, 190);
    ctx.lineTo(512, 160);
    ctx.lineTo(512, 256);
    ctx.lineTo(0, 256);
    ctx.closePath();
    ctx.fill();

    // Red seal stamp in top left
    ctx.fillStyle = '#a61b1b';
    ctx.fillRect(30, 30, 18, 18);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('folding_screen', texture);
    return texture;
  }

  // 11. Cursed Dark Altar Stone Floor (어둑시니 흑야 결계 석판 바닥)
  public static getBossArenaFloorTexture(): THREE.CanvasTexture {
    if (this.cache.has('boss_arena_floor')) return this.cache.get('boss_arena_floor')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark obsidian stone base
    ctx.fillStyle = '#0d0d12';
    ctx.fillRect(0, 0, 512, 512);

    // Flagstone grid with blood-tinted veins
    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        const shade = Math.floor(Math.random() * 15);
        ctx.fillStyle = `rgb(${16 + shade}, ${14 + shade}, ${22 + shade})`;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        // Cracks & mysterious talisman markings
        if (Math.random() > 0.4) {
          ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(180, 30, 40, 0.45)' : 'rgba(40, 140, 220, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + Math.random() * tileSize, y + Math.random() * tileSize);
          ctx.lineTo(x + Math.random() * tileSize, y + Math.random() * tileSize);
          ctx.stroke();
        }
      }
    }

    // Great Center Shaman Bagua / Trigram Seal Ring
    ctx.strokeStyle = 'rgba(230, 45, 45, 0.7)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(256, 256, 210, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(70, 180, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 256, 175, 0, Math.PI * 2);
    ctx.stroke();

    // Sacred Yin-Yang / Taegeuk swirl & runes
    ctx.strokeStyle = 'rgba(255, 60, 60, 0.75)';
    ctx.lineWidth = 4;
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const rx = 256 + Math.cos(angle) * 190;
      const ry = 256 + Math.sin(angle) * 190;
      ctx.fillStyle = '#ff2233';
      ctx.fillRect(rx - 8, ry - 8, 16, 16);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('boss_arena_floor', texture);
    return texture;
  }

  // 12. Sealing Stone Pillar Talisman Runes
  public static getBossPillarRuneTexture(): THREE.CanvasTexture {
    if (this.cache.has('boss_pillar_rune')) return this.cache.get('boss_pillar_rune')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark granite stone base
    ctx.fillStyle = '#181a1f';
    ctx.fillRect(0, 0, 256, 512);

    // Glowing Vermilion / Gold Exorcism Runes (敕令 九天應元 鎭煞)
    ctx.strokeStyle = '#ff3322';
    ctx.fillStyle = '#ff4422';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ff1100';
    ctx.shadowBlur = 12;

    // Outer talisman boundary
    ctx.strokeRect(20, 20, 216, 472);

    // Chinese/Sanskrit seal characters
    ctx.beginPath();
    // Head crown
    ctx.moveTo(128, 45);
    ctx.lineTo(60, 100);
    ctx.lineTo(196, 100);
    ctx.closePath();
    ctx.stroke();

    // Sacred central spine
    ctx.beginPath();
    ctx.moveTo(128, 100);
    ctx.lineTo(128, 440);
    ctx.stroke();

    // 28 constellation cross ticks
    for (let y = 140; y < 440; y += 40) {
      ctx.beginPath();
      ctx.moveTo(70, y);
      ctx.lineTo(186, y + (Math.random() - 0.5) * 15);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('boss_pillar_rune', texture);
    return texture;
  }

  // 13. Intricate Corner Cobweb Alpha Texture (천장 및 벽 구석 모서리 거미줄)
  public static getCobwebTexture(): THREE.CanvasTexture {
    if (this.cache.has('cobweb_corner')) return this.cache.get('cobweb_corner')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 512, 512);

    // Anchor point at top-left (0, 0)
    const radCount = 14;
    const radAngles: number[] = [];
    for (let i = 0; i <= radCount; i++) {
      radAngles.push((i / radCount) * (Math.PI / 2));
    }

    // 1. Draw structural radiating anchor threads from corner
    ctx.strokeStyle = 'rgba(215, 225, 230, 0.65)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i <= radCount; i++) {
      const angle = radAngles[i];
      const maxLen = 490 - (Math.random() - 0.5) * 40;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const midX = Math.cos(angle) * maxLen * 0.5;
      const midY = Math.sin(angle) * maxLen * 0.5 + 8; // slight sag
      const endX = Math.cos(angle) * maxLen;
      const endY = Math.sin(angle) * maxLen;
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();
    }

    // 2. Concentric sagging spiral/catenary threads connecting the radii
    const ringCount = 22;
    for (let r = 1; r <= ringCount; r++) {
      const dist = (r / ringCount) * 470;
      ctx.strokeStyle = `rgba(205, 218, 225, ${0.35 + (1 - r / ringCount) * 0.4})`;
      ctx.lineWidth = 1.1;

      for (let i = 0; i < radCount; i++) {
        // Occasional broken web gap
        if (r > 6 && Math.random() < 0.18) continue;

        const a1 = radAngles[i];
        const a2 = radAngles[i + 1];

        const x1 = Math.cos(a1) * dist;
        const y1 = Math.sin(a1) * dist;
        const x2 = Math.cos(a2) * dist;
        const y2 = Math.sin(a2) * dist;

        // Catenary sag towards center
        const sagAmount = dist * 0.12;
        const midA = (a1 + a2) * 0.5;
        const cx = Math.cos(midA) * (dist - sagAmount);
        const cy = Math.sin(midA) * (dist - sagAmount);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cx, cy, x2, y2);
        ctx.stroke();

        // Dust motes caught on the web intersection
        if (Math.random() < 0.25) {
          ctx.fillStyle = 'rgba(235, 240, 245, 0.75)';
          ctx.beginPath();
          ctx.arc(x1 + (Math.random() - 0.5) * 4, y1 + (Math.random() - 0.5) * 4, 1.2 + Math.random() * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. Frayed dangling loose strands
    ctx.strokeStyle = 'rgba(195, 210, 220, 0.45)';
    ctx.lineWidth = 0.9;
    for (let f = 0; f < 15; f++) {
      const startAngle = Math.random() * (Math.PI / 2);
      const startDist = 150 + Math.random() * 300;
      const sx = Math.cos(startAngle) * startDist;
      const sy = Math.sin(startAngle) * startDist;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(
        sx + (Math.random() - 0.5) * 30, sy + 30,
        sx + (Math.random() - 0.5) * 40, sy + 70,
        sx + (Math.random() - 0.5) * 20, sy + 110 + Math.random() * 50
      );
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('cobweb_corner', texture);
    return texture;
  }

  // 14. Hanging Corridor & Doorway Drooping Cobweb (복도 천장 및 문틀 드리운 거미줄)
  public static getCorridorCobwebTexture(): THREE.CanvasTexture {
    if (this.cache.has('cobweb_hanging')) return this.cache.get('cobweb_hanging')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 512, 512);

    // Draped webs hanging from the top edge (y=0)
    const anchors = [0, 60, 140, 220, 290, 370, 450, 512];

    // Deep hanging swag curves
    for (let pass = 0; pass < 4; pass++) {
      const dropMax = 200 + pass * 75;
      for (let i = 0; i < anchors.length - 1; i++) {
        const x1 = anchors[i];
        const x2 = anchors[i + 1];
        const midX = (x1 + x2) * 0.5;
        const sagY = 80 + pass * 60 + (Math.random() - 0.5) * 30;

        ctx.strokeStyle = `rgba(215, 225, 235, ${0.45 - pass * 0.08})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x1, 0);
        ctx.quadraticCurveTo(midX, sagY, x2, 0);
        ctx.stroke();

        // Vertical dangling gossamer threads
        for (let t = 0; t < 3; t++) {
          const tx = x1 + (t + 1) * ((x2 - x1) / 4);
          const tStartY = sagY * 0.5 + Math.random() * 20;
          const tEndY = sagY + 40 + Math.random() * dropMax * 0.5;
          ctx.strokeStyle = 'rgba(200, 215, 225, 0.35)';
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(tx, tStartY);
          ctx.bezierCurveTo(
            tx + (Math.random() - 0.5) * 15, tStartY + 40,
            tx + (Math.random() - 0.5) * 20, tStartY + 80,
            tx + (Math.random() - 0.5) * 10, tEndY
          );
          ctx.stroke();

          // Little dust specks
          if (Math.random() < 0.4) {
            ctx.fillStyle = 'rgba(230, 235, 240, 0.6)';
            ctx.beginPath();
            ctx.arc(tx, (tStartY + tEndY) * 0.5, 1.3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('cobweb_hanging', texture);
    return texture;
  }

  // 15. 3D Peeling Wallpaper Strip Texture (벽에서 너덜너덜하게 뜯겨 나와 늘어진 벽지 조각)
  public static getPeelingPaperStripTexture(): THREE.CanvasTexture {
    if (this.cache.has('peeling_paper')) return this.cache.get('peeling_paper')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 512);

    // Weathered antique paper strip
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#383025');
    grad.addColorStop(0.6, '#2a221a');
    grad.addColorStop(1, '#1b140e');
    ctx.fillStyle = grad;

    // Tattered curved strip shape
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(216, 0);
    ctx.bezierCurveTo(230, 180, 200, 320, 180, 480);
    ctx.lineTo(160, 510);
    ctx.lineTo(130, 460);
    ctx.lineTo(90, 500);
    ctx.lineTo(60, 440);
    ctx.bezierCurveTo(40, 320, 50, 160, 40, 0);
    ctx.closePath();
    ctx.fill();

    // Traditional faded wallpaper patterns on the strip
    ctx.strokeStyle = 'rgba(80, 68, 52, 0.4)';
    ctx.lineWidth = 1.2;
    for (let y = 30; y < 450; y += 40) {
      ctx.beginPath();
      ctx.arc(128, y, 18, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Curled light highlight edge
    ctx.strokeStyle = '#c8bc9f';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // Mold speckles on the strip
    for (let m = 0; m < 35; m++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(8, 12, 8, 0.85)' : 'rgba(25, 20, 12, 0.7)';
      ctx.beginPath();
      ctx.arc(70 + Math.random() * 110, 20 + Math.random() * 450, 2 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('peeling_paper', texture);
    return texture;
  }

  // 16. Soft Radial Glow Dust Particle (부유하는 고택 먼지/포자 파티클)
  public static getDustParticleTexture(): THREE.CanvasTexture {
    if (this.cache.has('dust_particle')) return this.cache.get('dust_particle')!;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 128, 128);

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 248, 230, 1.0)');
    grad.addColorStop(0.25, 'rgba(220, 210, 190, 0.75)');
    grad.addColorStop(0.55, 'rgba(160, 150, 130, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 64, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('dust_particle', texture);
    return texture;
  }

  // 17. Ground Cold Ghost Mist / Smoke Puff (바닥을 기는 음산한 냉기 안개 파티클)
  public static getMistSmokeTexture(): THREE.CanvasTexture {
    if (this.cache.has('mist_smoke')) return this.cache.get('mist_smoke')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 256);

    // Multi-lobed billowy spectral puff
    const lobes = [
      { x: 128, y: 128, r: 100, a: 0.65 },
      { x: 95, y: 110, r: 80, a: 0.55 },
      { x: 160, y: 115, r: 85, a: 0.55 },
      { x: 110, y: 155, r: 75, a: 0.5 },
      { x: 150, y: 150, r: 80, a: 0.5 },
    ];

    for (const lobe of lobes) {
      const grad = ctx.createRadialGradient(lobe.x, lobe.y, 0, lobe.x, lobe.y, lobe.r);
      grad.addColorStop(0, `rgba(180, 205, 215, ${lobe.a})`);
      grad.addColorStop(0.4, `rgba(140, 170, 180, ${lobe.a * 0.6})`);
      grad.addColorStop(0.75, `rgba(90, 120, 130, ${lobe.a * 0.25})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lobe.x, lobe.y, lobe.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('mist_smoke', texture);
    return texture;
  }
}
