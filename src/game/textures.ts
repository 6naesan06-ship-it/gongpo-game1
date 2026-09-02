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

  // 2. Moldy peeling wallpaper & damp plaster wall (곰팡이 핀 낡은 벽)
  public static getMoldyWallTexture(): THREE.CanvasTexture {
    if (this.cache.has('moldy_wall')) return this.cache.get('moldy_wall')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base dingy off-white/beige damp plaster
    ctx.fillStyle = '#3a352c';
    ctx.fillRect(0, 0, 512, 512);

    // Peeling wallpaper pattern (faded traditional floral/geometric motifs)
    ctx.strokeStyle = 'rgba(70, 60, 48, 0.25)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 512; x += 32) {
      for (let y = 0; y < 512; y += 32) {
        ctx.strokeRect(x + 4, y + 4, 24, 24);
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Heavy black & dark green mold blooms (곰팡이 군집)
    for (let m = 0; m < 14; m++) {
      const mx = Math.random() * 512;
      const my = Math.random() * 512;
      const mSize = 30 + Math.random() * 80;
      const mGrad = ctx.createRadialGradient(mx, my, 5, mx, my, mSize);
      mGrad.addColorStop(0, 'rgba(12, 18, 12, 0.95)');
      mGrad.addColorStop(0.4, 'rgba(25, 30, 20, 0.7)');
      mGrad.addColorStop(0.8, 'rgba(45, 38, 25, 0.3)');
      mGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.arc(mx, my, mSize, 0, Math.PI * 2);
      ctx.fill();

      // Speckled mold spores
      for (let sp = 0; sp < 40; sp++) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(5, 10, 5, 0.8)' : 'rgba(20, 15, 10, 0.7)';
        ctx.fillRect(mx + (Math.random() - 0.5) * mSize * 1.4, my + (Math.random() - 0.5) * mSize * 1.4, 2, 2);
      }
    }

    // Peeling tear marks revealing dark wet plaster underneath
    for (let p = 0; p < 4; p++) {
      const px = 50 + Math.random() * 400;
      const py = 50 + Math.random() * 400;
      ctx.fillStyle = '#1c1712';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 40 + Math.random() * 30, py + 10);
      ctx.lineTo(px + 30 + Math.random() * 40, py + 70 + Math.random() * 30);
      ctx.lineTo(px - 10, py + 50);
      ctx.closePath();
      ctx.fill();

      // White paper curl edge
      ctx.strokeStyle = 'rgba(200, 190, 170, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Water drip stains running down
    for (let d = 0; d < 8; d++) {
      const dx = Math.random() * 512;
      const grad = ctx.createLinearGradient(dx, 0, dx, 512);
      grad.addColorStop(0, 'rgba(20, 16, 12, 0.8)');
      grad.addColorStop(0.7, 'rgba(30, 24, 18, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(dx, 0, 4 + Math.random() * 8, 300 + Math.random() * 200);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('moldy_wall', texture);
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
}
