import * as THREE from 'three';

// Procedurally generates atmospheric, high-detail horror textures for the Abandoned Hospital (폐병원)
export class AbandonedHospitalTextures {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  // 1. Blood-stained, cracked hospital vinyl & ceramic floor tiles (오염되고 깨진 폐병원 타일 바닥)
  public static getWoodFloorTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_floor')) return this.cache.get('hospital_floor')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base dirty hospital concrete & vinyl underlay
    ctx.fillStyle = '#1c2221';
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 64;
    for (let y = 0; y < 512; y += tileSize) {
      for (let x = 0; x < 512; x += tileSize) {
        // Individual tile color variation (sickly institutional pale greenish-gray / dirty bone)
        const jitter = Math.floor(Math.random() * 16) - 8;
        const baseR = 48 + jitter;
        const baseG = 58 + jitter;
        const baseB = 54 + jitter;

        ctx.fillStyle = `rgb(${baseR}, ${baseG}, ${baseB})`;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        // Tile inner surface speckles & vinyl scuffs
        for (let s = 0; s < 12; s++) {
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(25, 32, 30, 0.4)' : 'rgba(75, 88, 82, 0.3)';
          ctx.fillRect(
            x + 4 + Math.random() * (tileSize - 8),
            y + 4 + Math.random() * (tileSize - 8),
            2,
            2
          );
        }

        // Cracked and broken tile fragments
        if (Math.random() < 0.22) {
          ctx.strokeStyle = 'rgba(12, 16, 15, 0.85)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(x + 2, y + 20 + Math.random() * 24);
          ctx.lineTo(x + tileSize * 0.5, y + tileSize * 0.5);
          ctx.lineTo(x + tileSize - 2, y + Math.random() * tileSize);
          ctx.stroke();

          // Dark chipped corner revealing rough concrete
          ctx.fillStyle = '#101413';
          ctx.beginPath();
          ctx.moveTo(x + 2, y + 2);
          ctx.lineTo(x + 18, y + 2);
          ctx.lineTo(x + 2, y + 18);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Grimy recessed grout lines between tiles
    ctx.fillStyle = '#0e1211';
    for (let x = 0; x <= 512; x += tileSize) {
      ctx.fillRect(x - 1, 0, 2, 512);
    }
    for (let y = 0; y <= 512; y += tileSize) {
      ctx.fillRect(0, y - 1, 512, 2);
    }

    // Hospital floor drain grate in bottom corner
    ctx.fillStyle = '#141716';
    ctx.fillRect(384 + 10, 384 + 10, 44, 44);
    ctx.strokeStyle = '#2d3330';
    ctx.lineWidth = 2;
    for (let d = 0; d < 5; d++) {
      ctx.strokeRect(384 + 14 + d * 7, 384 + 14, 3, 36);
    }

    // Dark water pools & yellow-brown chemical/iodine spills
    for (let p = 0; p < 4; p++) {
      const px = 60 + Math.random() * 380;
      const py = 60 + Math.random() * 380;
      const rad = 25 + Math.random() * 45;
      const grad = ctx.createRadialGradient(px, py, 4, px, py, rad);
      grad.addColorStop(0, 'rgba(15, 22, 18, 0.8)');
      grad.addColorStop(0.6, 'rgba(35, 30, 18, 0.45)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Chilling smeared blood trails & bloody shoe/wheel drags
    ctx.strokeStyle = 'rgba(95, 12, 12, 0.72)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(120, 480);
    ctx.bezierCurveTo(180, 380, 260, 320, 310, 210);
    ctx.stroke();

    // Spattered blood droplets
    for (let b = 0; b < 28; b++) {
      ctx.fillStyle = Math.random() > 0.4 ? 'rgba(85, 10, 10, 0.78)' : 'rgba(50, 6, 6, 0.9)';
      const bx = 160 + (Math.random() - 0.5) * 160;
      const by = 260 + (Math.random() - 0.5) * 220;
      ctx.beginPath();
      ctx.arc(bx, by, 1.5 + Math.random() * 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('hospital_floor', texture);
    return texture;
  }

  // 2. Hospital Ward Wall: Dual-tone peeling paint & hospital ceramic tiles (폐병원 병실/복도 벽면)
  public static getMoldyWallTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_wall')) return this.cache.get('hospital_wall')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Upper Wall: Sickly dirty institutional pale-mint plaster (상단 페인트 회벽)
    ctx.fillStyle = '#444d47';
    ctx.fillRect(0, 0, 512, 280);

    // Plaster texture grain
    for (let i = 0; i < 3000; i++) {
      const v = 50 + Math.floor(Math.random() * 30);
      ctx.fillStyle = `rgba(${v}, ${v + 8}, ${v + 4}, 0.25)`;
      ctx.fillRect(Math.random() * 512, Math.random() * 280, 2, 2);
    }

    // Lower Wall: Hospital green/teal ceramic tiles with grout (하단 녹색 세라믹 타일)
    ctx.fillStyle = '#223631';
    ctx.fillRect(0, 280, 512, 232);

    const tileSize = 32;
    for (let y = 280; y < 512; y += tileSize) {
      for (let x = 0; x < 512; x += tileSize) {
        const j = Math.floor(Math.random() * 12) - 6;
        ctx.fillStyle = `rgb(${30 + j}, ${54 + j}, ${48 + j})`;
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        // Mold in tile crevices
        if (Math.random() < 0.25) {
          ctx.fillStyle = 'rgba(10, 18, 14, 0.6)';
          ctx.fillRect(x + 1, y + 1, tileSize - 2, 3);
        }
      }
    }

    // Grout lines
    ctx.fillStyle = '#121c18';
    for (let x = 0; x <= 512; x += tileSize) {
      ctx.fillRect(x - 1, 280, 2, 232);
    }
    for (let y = 280; y <= 512; y += tileSize) {
      ctx.fillRect(0, y - 1, 512, 2);
    }

    // Waist-level bumper rail / transition molding (벽면 보호 핸드레일 몰딩)
    ctx.fillStyle = '#1a221f';
    ctx.fillRect(0, 274, 512, 12);
    ctx.fillStyle = '#5c6b64';
    ctx.fillRect(0, 274, 512, 2);
    ctx.fillStyle = '#0e1412';
    ctx.fillRect(0, 284, 512, 2);

    // Large peeling paint blisters & crumbling plaster exposing dark concrete beneath
    const blisters = [
      { cx: 130, cy: 110, rx: 70, ry: 50 },
      { cx: 380, cy: 180, rx: 80, ry: 65 },
      { cx: 270, cy: 60, rx: 50, ry: 35 },
    ];
    for (const b of blisters) {
      ctx.save();
      ctx.fillStyle = '#1e2421'; // Bare decaying concrete behind
      ctx.beginPath();
      ctx.ellipse(b.cx, b.cy, b.rx, b.ry, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Exposed rusty wire mesh in concrete
      ctx.strokeStyle = 'rgba(75, 45, 30, 0.6)';
      ctx.lineWidth = 1;
      for (let w = -b.rx; w < b.rx; w += 10) {
        ctx.beginPath();
        ctx.moveTo(b.cx + w, b.cy - b.ry * 0.7);
        ctx.lineTo(b.cx + w, b.cy + b.ry * 0.7);
        ctx.stroke();
      }

      // Peeling curled white paint perimeter
      ctx.strokeStyle = '#7c8c83';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();
    }

    // Black fungal blooms & sewer water stains running down vertically
    for (let d = 0; d < 14; d++) {
      const dx = Math.random() * 512;
      const dripHeight = 150 + Math.random() * 320;
      const dripGrad = ctx.createLinearGradient(dx, 0, dx, dripHeight);
      dripGrad.addColorStop(0, 'rgba(10, 16, 12, 0.85)');
      dripGrad.addColorStop(0.4, 'rgba(25, 35, 28, 0.5)');
      dripGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = dripGrad;
      ctx.fillRect(dx, 0, 3 + Math.random() * 6, dripHeight);
    }

    // Desperate blood scratches and scrawled text: "살려줘 (HELP)", "404", "EXIT", Red Cross
    ctx.strokeStyle = 'rgba(110, 15, 15, 0.75)';
    ctx.fillStyle = 'rgba(110, 15, 15, 0.75)';
    ctx.lineWidth = 2.4;
    ctx.font = 'bold 26px sans-serif';

    // "살려줘" scrawled on the wall
    ctx.fillText('살려줘', 180, 160);

    // "404" ward marker
    ctx.font = 'bold 20px monospace';
    ctx.fillText('ROOM 404', 330, 90);

    // Bloody red cross mark
    ctx.fillRect(80, 160, 8, 28);
    ctx.fillRect(70, 170, 28, 8);

    // Bloody drag claw handprints sliding down the tiles
    for (let f = 0; f < 5; f++) {
      ctx.beginPath();
      ctx.moveTo(320 + f * 9, 290);
      ctx.bezierCurveTo(322 + f * 9, 340, 318 + f * 9, 390, 324 + f * 9, 440);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('hospital_wall', texture);
    return texture;
  }

  // 2-B. Hospital Wall Bump Map (타일 메지, 페인트 벗겨짐 요철 맵)
  public static getWallBumpTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_wall_bump')) return this.cache.get('hospital_wall_bump')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Mid-gray base
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    // Grout recessed lines
    ctx.fillStyle = '#202020';
    const tileSize = 32;
    for (let x = 0; x <= 512; x += tileSize) {
      ctx.fillRect(x - 1, 280, 2, 232);
    }
    for (let y = 280; y <= 512; y += tileSize) {
      ctx.fillRect(0, y - 1, 512, 2);
    }

    // High protruding bumper rail
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(0, 274, 512, 12);

    // Sunken concrete cavities (peeled paint)
    const blisters = [
      { cx: 130, cy: 110, rx: 70, ry: 50 },
      { cx: 380, cy: 180, rx: 80, ry: 65 },
      { cx: 270, cy: 60, rx: 50, ry: 35 },
    ];
    for (const b of blisters) {
      ctx.fillStyle = '#252525';
      ctx.beginPath();
      ctx.ellipse(b.cx, b.cy, b.rx, b.ry, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Sharp curled raised ridge
      ctx.strokeStyle = '#f5f5f5';
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('hospital_wall_bump', texture);
    return texture;
  }

  // 3. Heavy Hospital Isolation Ward Door with Wire-Mesh Glass (폐병원 중환자실/격리병동 철문)
  public static getTornHanjiDoorTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_door')) return this.cache.get('hospital_door')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Institutional hospital dark olive / cyan metal paint
    ctx.fillStyle = '#283631';
    ctx.fillRect(0, 0, 512, 512);

    // Scratched steel metal streaks
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(70, 90, 80, 0.2)' : 'rgba(20, 28, 24, 0.3)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 4, 30 + Math.random() * 60);
    }

    // Heavy outer door frame
    ctx.fillStyle = '#1a2320';
    ctx.fillRect(0, 0, 512, 20);
    ctx.fillRect(0, 492, 512, 20);
    ctx.fillRect(0, 0, 20, 512);
    ctx.fillRect(492, 0, 20, 512);

    // Upper Wire-Mesh Safety Observation Window (철망 강화유리 창문)
    const winX = 146;
    const winY = 60;
    const winW = 220;
    const winH = 170;

    // Window rubber seal frame
    ctx.fillStyle = '#101513';
    ctx.fillRect(winX - 8, winY - 8, winW + 16, winH + 16);

    // Dark foggy interior glass with sickly greenish hue
    ctx.fillStyle = '#0a1614';
    ctx.fillRect(winX, winY, winW, winH);

    // Diagonal safety wire mesh inside glass
    ctx.strokeStyle = 'rgba(120, 150, 140, 0.45)';
    ctx.lineWidth = 1.2;
    for (let m = -winH; m < winW + winH; m += 16) {
      ctx.beginPath();
      ctx.moveTo(winX + m, winY);
      ctx.lineTo(winX + m + winH, winY + winH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(winX + m, winY + winH);
      ctx.lineTo(winX + m + winH, winY);
      ctx.stroke();
    }

    // Bloody smeared palm print on the glass window
    ctx.fillStyle = 'rgba(115, 14, 14, 0.75)';
    ctx.beginPath();
    ctx.ellipse(winX + 110, winY + 95, 24, 30, 0.1, 0, Math.PI * 2);
    ctx.fill();
    for (let f = -2; f <= 2; f++) {
      ctx.beginPath();
      ctx.ellipse(winX + 110 + f * 11, winY + 55, 6, 18, f * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Room number plate: "404" (격리병실)
    ctx.fillStyle = '#181f1c';
    ctx.fillRect(winX + 60, winY + winH + 20, 100, 36);
    ctx.strokeStyle = '#4a5952';
    ctx.lineWidth = 2;
    ctx.strokeRect(winX + 60, winY + winH + 20, 100, 36);
    ctx.fillStyle = '#b0c4ba';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('404호', winX + 110, winY + winH + 46);

    // Stainless Steel Push Plate & Lever Handle (스테인리스 손잡이 판)
    const plateX = 50;
    const plateY = 240;
    ctx.fillStyle = '#4c5752';
    ctx.fillRect(plateX, plateY, 36, 120);
    ctx.strokeStyle = '#222b27';
    ctx.strokeRect(plateX, plateY, 36, 120);

    // Handle lever
    ctx.fillStyle = '#7a8a82';
    ctx.fillRect(plateX + 10, plateY + 50, 48, 14);

    // Bottom Stainless Steel Kick Plate (하단 발길질 방호 스테인리스 판)
    ctx.fillStyle = '#3a443f';
    ctx.fillRect(20, 430, 472, 60);
    ctx.strokeStyle = '#1d2421';
    ctx.strokeRect(20, 430, 472, 60);

    // Rust dripping from screws
    for (let r = 0; r < 6; r++) {
      const rx = 45 + r * 80;
      ctx.fillStyle = 'rgba(90, 40, 20, 0.8)';
      ctx.beginPath();
      ctx.arc(rx, 436, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(rx - 1, 436, 2, 20 + Math.random() * 25);
    }

    // Peeling yellow/black biohazard quarantine warning tape across middle
    ctx.save();
    ctx.translate(256, 310);
    ctx.rotate(-0.06);
    ctx.fillStyle = '#9e8020';
    ctx.fillRect(-220, -12, 440, 24);
    for (let s = -220; s < 220; s += 36) {
      ctx.fillStyle = '#1c1505';
      ctx.beginPath();
      ctx.moveTo(s, -12);
      ctx.lineTo(s + 18, -12);
      ctx.lineTo(s + 6, 12);
      ctx.lineTo(s - 12, 12);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('hospital_door', texture);
    return texture;
  }

  // 4. Hospital Biohazard Quarantine & Exorcism Seal (의료 격리구역 경고 결계부)
  public static getTalismanTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_talisman')) return this.cache.get('hospital_talisman')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Stained surgical yellowed medical paper
    ctx.fillStyle = '#c2a853';
    ctx.fillRect(0, 0, 256, 512);

    // Red warning border
    ctx.strokeStyle = '#9e1818';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, 232, 488);

    // Blood-splattered edges & surgical tape pieces on corners
    ctx.fillStyle = 'rgba(230, 220, 190, 0.85)';
    ctx.fillRect(4, 4, 60, 20);
    ctx.fillRect(192, 4, 60, 20);

    // Cinnabar red occult exorcism symbols mixed with biohazard seal
    ctx.fillStyle = '#8a0d0d';
    ctx.strokeStyle = '#8a0d0d';
    ctx.lineWidth = 7;
    ctx.textAlign = 'center';

    // Top: BIOHAZARD / 封印
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('BIOHAZARD', 128, 55);

    // Biohazard triple trefoil symbol
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(128, 125, 32, 0, Math.PI * 2);
    ctx.stroke();

    for (let a = 0; a < 3; a++) {
      const ang = (a * 2 * Math.PI) / 3 - Math.PI / 2;
      const bx = 128 + Math.cos(ang) * 26;
      const by = 125 + Math.sin(ang) * 26;
      ctx.beginPath();
      ctx.arc(bx, by, 22, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Sacred Korean/Taoist Exorcism Cinnabar Script (구천응원 칙령)
    ctx.font = 'bold 38px serif';
    ctx.fillText('敕令', 128, 205);

    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(128, 220);
    ctx.lineTo(128, 330);
    ctx.bezierCurveTo(70, 350, 70, 410, 128, 420);
    ctx.bezierCurveTo(186, 430, 186, 470, 128, 480);
    ctx.stroke();

    // Chinese seal characters for quarantine & binding
    ctx.font = 'bold 24px serif';
    ctx.fillText('惡鬼封結', 128, 380);

    // Warning text
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('출입금지 封印', 128, 495);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('hospital_talisman', texture);
    return texture;
  }

  // 5. Hospital X-Ray Illuminator Viewbox with Skeletal Radiograph (방사선과 엑스레이 판독기)
  public static getCursedMaskTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_xray')) return this.cache.get('hospital_xray')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Dark hospital viewbox frame
    ctx.fillStyle = '#121615';
    ctx.fillRect(0, 0, 256, 256);

    // Bluish-white fluorescent backlight illumination
    const glow = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    glow.addColorStop(0, '#78c6e2');
    glow.addColorStop(0.7, '#2a5a6b');
    glow.addColorStop(1, '#0c1b22');
    ctx.fillStyle = glow;
    ctx.fillRect(16, 16, 224, 224);

    // X-Ray film sheet border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 216, 216);

    // Skeletal Ribs and Spine Silhouette in X-ray negative (인체 흉부/갈비뼈 엑스레이 음영)
    ctx.fillStyle = 'rgba(230, 245, 255, 0.85)';
    // Spine
    ctx.fillRect(122, 40, 12, 160);
    for (let v = 0; v < 10; v++) {
      ctx.fillRect(116, 45 + v * 15, 24, 6);
    }

    // Curved Ribs
    ctx.strokeStyle = 'rgba(215, 240, 255, 0.75)';
    ctx.lineWidth = 7;
    for (let r = 0; r < 7; r++) {
      const ry = 60 + r * 16;
      ctx.beginPath();
      ctx.moveTo(128, ry);
      ctx.bezierCurveTo(70, ry + 12, 45, ry + 26, 40, ry + 36);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(128, ry);
      ctx.bezierCurveTo(186, ry + 12, 211, ry + 26, 216, ry + 36);
      ctx.stroke();
    }

    // Ghostly demonic entity face shadow lurking between ribs!
    ctx.fillStyle = 'rgba(10, 8, 12, 0.88)';
    ctx.beginPath();
    ctx.arc(128, 115, 26, 0, Math.PI * 2);
    ctx.fill();

    // Piercing glowing red ghostly eyes in X-ray
    ctx.fillStyle = '#ff1111';
    ctx.beginPath();
    ctx.arc(120, 112, 4, 0, Math.PI * 2);
    ctx.arc(136, 112, 4, 0, Math.PI * 2);
    ctx.fill();

    // Patient info label
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.fillText('PATIENT: #103 UNKNOWN', 26, 226);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('hospital_xray', texture);
    return texture;
  }

  // 6. Eerie Abandoned Hospital Director Portrait (폐병원장의 흑백 영정 사진)
  public static getAncestralPortraitTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_director')) return this.cache.get('hospital_director')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;

    // Black mourning wood frame
    ctx.fillStyle = '#0f1211';
    ctx.fillRect(0, 0, 256, 384);

    // Weathered, yellowed 1970s black & white medical photograph
    ctx.fillStyle = '#2f3431';
    ctx.fillRect(16, 16, 224, 352);

    // Doctor in white lab coat silhouette
    ctx.fillStyle = '#5a635e';
    ctx.beginPath();
    ctx.moveTo(128, 160);
    ctx.lineTo(50, 360);
    ctx.lineTo(206, 360);
    ctx.closePath();
    ctx.fill();

    // Stethoscope neck piece
    ctx.strokeStyle = '#181e1b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(128, 210, 30, 0, Math.PI);
    ctx.stroke();

    // Doctor's head
    ctx.fillStyle = '#424945';
    ctx.beginPath();
    ctx.arc(128, 125, 42, 0, Math.PI * 2);
    ctx.fill();

    // Gouged-out bleeding eye sockets
    ctx.fillStyle = '#0a0d0c';
    ctx.beginPath();
    ctx.ellipse(112, 122, 9, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(144, 122, 9, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blood trails dripping from eye sockets
    ctx.strokeStyle = '#8a0d0d';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(112, 134);
    ctx.lineTo(110, 220);
    ctx.moveTo(144, 134);
    ctx.lineTo(146, 205);
    ctx.stroke();

    // Cracked glass lines across portrait
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(128, 16);
    ctx.lineTo(100, 110);
    ctx.lineTo(180, 240);
    ctx.lineTo(240, 320);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('hospital_director', texture);
    return texture;
  }

  // 7. Hospital Acoustic Suspended Grid Drop-Ceiling (폐병원 석고 흡음 텍스 천장)
  public static getCeilingTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_ceiling')) return this.cache.get('hospital_ceiling')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Sickly grayish-beige plaster base
    ctx.fillStyle = '#262d29';
    ctx.fillRect(0, 0, 512, 512);

    // 4x4 T-bar grid (128x128 tiles)
    const gridSize = 128;
    for (let y = 0; y < 512; y += gridSize) {
      for (let x = 0; x < 512; x += gridSize) {
        const j = Math.floor(Math.random() * 12) - 6;
        ctx.fillStyle = `rgb(${44 + j}, ${52 + j}, ${48 + j})`;
        ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);

        // Acoustic pinhole texture
        for (let p = 0; p < 40; p++) {
          ctx.fillStyle = 'rgba(15, 20, 18, 0.4)';
          ctx.fillRect(x + 6 + Math.random() * (gridSize - 12), y + 6 + Math.random() * (gridSize - 12), 2, 2);
        }

        // Water leak yellow rings
        if (Math.random() < 0.3) {
          const rx = x + gridSize * 0.5;
          const ry = y + gridSize * 0.5;
          ctx.strokeStyle = 'rgba(50, 42, 20, 0.6)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(rx, ry, 25 + Math.random() * 20, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Missing ceiling tile showing pitch black duct plenum!
        if (x === 128 && y === 256) {
          ctx.fillStyle = '#080a09';
          ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);

          // Hanging severed black electric wire
          ctx.strokeStyle = '#121614';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x + 30, y + 10);
          ctx.bezierCurveTo(x + 40, y + 60, x + 10, y + 90, x + 25, y + 120);
          ctx.stroke();
        }
      }
    }

    // Metal T-bar runners
    ctx.fillStyle = '#161c19';
    for (let x = 0; x <= 512; x += gridSize) {
      ctx.fillRect(x - 2, 0, 4, 512);
    }
    for (let y = 0; y <= 512; y += gridSize) {
      ctx.fillRect(0, y - 2, 512, 4);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('hospital_ceiling', texture);
    return texture;
  }

  // 8. Hospital Medical Records & Autopsy Charts (환자 의무기록 차트철)
  public static getBookSpinesTexture(): THREE.CanvasTexture {
    if (this.cache.has('medical_charts')) return this.cache.get('medical_charts')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#141a18';
    ctx.fillRect(0, 0, 256, 256);

    // Chart binder colors (navy, surgical green, hospital maroon, patient gray)
    const binderColors = ['#1d3345', '#1e4033', '#4a1e1e', '#363d39', '#2d3330'];
    for (let x = 0; x < 256; x += 26) {
      const col = binderColors[(x / 26) % binderColors.length];
      ctx.fillStyle = col;
      ctx.fillRect(x + 2, 6, 22, 244);

      // White patient label tag
      ctx.fillStyle = '#d4ded8';
      ctx.fillRect(x + 5, 40, 16, 40);

      // Barcode / patient ID scribbles
      ctx.fillStyle = '#111614';
      ctx.fillRect(x + 7, 45, 12, 2);
      ctx.fillRect(x + 7, 52, 12, 2);
      ctx.fillRect(x + 7, 60, 12, 2);

      // Metal ring binder clips
      ctx.fillStyle = '#8a9992';
      ctx.fillRect(x + 10, 20, 6, 6);
      ctx.fillRect(x + 10, 220, 6, 6);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('medical_charts', texture);
    return texture;
  }

  // 9. Hospital Pharmacy Drug Dispensary & Ampoules (폐병원 약제실 약품 선반)
  public static getMedicineDrawersTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_pharmacy')) return this.cache.get('hospital_pharmacy')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Stainless steel & frosted glass pharmacy locker
    ctx.fillStyle = '#222b27';
    ctx.fillRect(0, 0, 256, 256);

    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 256; x += 32) {
        // Compartment frame
        ctx.strokeStyle = '#121815';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, 28, 28);

        // Frosted glass background
        ctx.fillStyle = '#2f3c37';
        ctx.fillRect(x + 3, y + 3, 26, 26);

        // Medicine bottles / ampoules inside
        ctx.fillStyle = Math.random() > 0.5 ? '#7a421a' : '#1f4857'; // Amber & blue medical bottles
        ctx.fillRect(x + 9, y + 10, 6, 14);
        ctx.fillRect(x + 17, y + 8, 6, 16);

        // Warning narcotic red dot
        if (Math.random() < 0.25) {
          ctx.fillStyle = '#a61717';
          ctx.beginPath();
          ctx.arc(x + 24, y + 8, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('hospital_pharmacy', texture);
    return texture;
  }

  // 10. Tattered Hospital Medical Privacy Curtain (얼룩진 병원 진료 파티션 커튼)
  public static getFoldingScreenTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_curtain')) return this.cache.get('hospital_curtain')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Mint/cyan hospital fabric curtain
    ctx.fillStyle = '#486159';
    ctx.fillRect(0, 0, 512, 256);

    // Vertical fabric curtain folds & shadows
    for (let x = 0; x < 512; x += 32) {
      const grad = ctx.createLinearGradient(x, 0, x + 32, 0);
      grad.addColorStop(0, 'rgba(25, 36, 32, 0.7)');
      grad.addColorStop(0.5, 'rgba(95, 125, 115, 0.4)');
      grad.addColorStop(1, 'rgba(25, 36, 32, 0.7)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, 0, 32, 256);
    }

    // Heavy blood stains & chemical seepage on curtain
    for (let b = 0; b < 6; b++) {
      const bx = 80 + Math.random() * 350;
      const by = 80 + Math.random() * 120;
      const brad = 20 + Math.random() * 40;
      const bgrad = ctx.createRadialGradient(bx, by, 3, bx, by, brad);
      bgrad.addColorStop(0, 'rgba(90, 10, 10, 0.85)');
      bgrad.addColorStop(0.5, 'rgba(60, 8, 8, 0.55)');
      bgrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgrad;
      ctx.beginPath();
      ctx.arc(bx, by, brad, 0, Math.PI * 2);
      ctx.fill();
    }

    // Torn tattered bottom fringes
    ctx.fillStyle = '#1c2421';
    for (let x = 0; x < 512; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 256);
      ctx.lineTo(x + 8, 230 + Math.random() * 15);
      ctx.lineTo(x + 16, 256);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('hospital_curtain', texture);
    return texture;
  }

  // 11. Underground Morgue & Quarantine Abyss Floor (폐병원 지하 영안실 대결계 바닥)
  public static getBossArenaFloorTexture(): THREE.CanvasTexture {
    if (this.cache.has('morgue_boss_floor')) return this.cache.get('morgue_boss_floor')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Pitch dark industrial concrete
    ctx.fillStyle = '#0c1012';
    ctx.fillRect(0, 0, 512, 512);

    // Heavy square concrete slabs with steel expansion joints
    const tileSize = 64;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        const shade = Math.floor(Math.random() * 14);
        ctx.fillStyle = `rgb(${14 + shade}, ${18 + shade}, ${20 + shade})`;
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      }
    }

    // Massive Central Drainage & Biohazard Demonic Pentagram (시신 세척 대형 배수구 & 어둑시니 결계)
    ctx.strokeStyle = 'rgba(215, 30, 30, 0.8)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(256, 256, 210, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(50, 160, 230, 0.65)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 256, 175, 0, Math.PI * 2);
    ctx.stroke();

    // Biohazard triple trefoil seal combined with 8 Trigram runes
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const rx = 256 + Math.cos(angle) * 190;
      const ry = 256 + Math.sin(angle) * 190;
      ctx.fillStyle = '#ff2222';
      ctx.fillRect(rx - 8, ry - 8, 16, 16);
    }

    // Central drainage grate
    ctx.fillStyle = '#060809';
    ctx.beginPath();
    ctx.arc(256, 256, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2a353b';
    ctx.lineWidth = 3;
    for (let g = -40; g <= 40; g += 10) {
      ctx.beginPath();
      ctx.moveTo(256 + g, 256 - 35);
      ctx.lineTo(256 + g, 256 + 35);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('morgue_boss_floor', texture);
    return texture;
  }

  // 12. Hospital Concrete Support Column with Hazard Warning Stripes & Sealing Runes
  public static getBossPillarRuneTexture(): THREE.CanvasTexture {
    if (this.cache.has('morgue_pillar_rune')) return this.cache.get('morgue_pillar_rune')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Heavy weathered industrial concrete pillar
    ctx.fillStyle = '#181f21';
    ctx.fillRect(0, 0, 256, 512);

    // Hazard yellow/black warning stripes at bottom (위험 경고 사선 줄무늬)
    for (let y = 380; y < 512; y += 30) {
      ctx.fillStyle = '#a88820';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y - 50);
      ctx.lineTo(256, y - 30);
      ctx.lineTo(0, y + 20);
      ctx.closePath();
      ctx.fill();
    }

    // Glowing Vermilion & Gold Exorcism Runes on Column (敕令 封魔 결계)
    ctx.strokeStyle = '#ff3322';
    ctx.fillStyle = '#ff4422';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ff1100';
    ctx.shadowBlur = 14;

    ctx.strokeRect(24, 24, 208, 340);

    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('敕令', 128, 70);

    ctx.beginPath();
    ctx.moveTo(128, 85);
    ctx.lineTo(128, 320);
    ctx.stroke();

    for (let y = 110; y < 320; y += 35) {
      ctx.beginPath();
      ctx.moveTo(60, y);
      ctx.lineTo(196, y + (Math.random() - 0.5) * 16);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('morgue_pillar_rune', texture);
    return texture;
  }

  // 13. Hospital Corner Cobwebs & Loose Wires (천장 구석 거미줄 및 늘어진 전선)
  public static getCobwebTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_cobweb_corner')) return this.cache.get('hospital_cobweb_corner')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 512, 512);

    const radCount = 14;
    const radAngles: number[] = [];
    for (let i = 0; i <= radCount; i++) {
      radAngles.push((i / radCount) * (Math.PI / 2));
    }

    ctx.strokeStyle = 'rgba(210, 230, 225, 0.65)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i <= radCount; i++) {
      const angle = radAngles[i];
      const maxLen = 490 - (Math.random() - 0.5) * 40;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const midX = Math.cos(angle) * maxLen * 0.5;
      const midY = Math.sin(angle) * maxLen * 0.5 + 8;
      const endX = Math.cos(angle) * maxLen;
      const endY = Math.sin(angle) * maxLen;
      ctx.quadraticCurveTo(midX, midY, endX, endY);
      ctx.stroke();
    }

    const ringCount = 22;
    for (let r = 1; r <= ringCount; r++) {
      const dist = (r / ringCount) * 470;
      ctx.strokeStyle = `rgba(190, 220, 215, ${0.35 + (1 - r / ringCount) * 0.4})`;
      ctx.lineWidth = 1.1;

      for (let i = 0; i < radCount; i++) {
        if (r > 6 && Math.random() < 0.18) continue;
        const a1 = radAngles[i];
        const a2 = radAngles[i + 1];

        const x1 = Math.cos(a1) * dist;
        const y1 = Math.sin(a1) * dist;
        const x2 = Math.cos(a2) * dist;
        const y2 = Math.sin(a2) * dist;

        const sagAmount = dist * 0.12;
        const midA = (a1 + a2) * 0.5;
        const cx = Math.cos(midA) * (dist - sagAmount);
        const cy = Math.sin(midA) * (dist - sagAmount);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cx, cy, x2, y2);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('hospital_cobweb_corner', texture);
    return texture;
  }

  // 14. Hanging Corridor Cobwebs & Dripping IV Strands
  public static getCorridorCobwebTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_cobweb_hanging')) return this.cache.get('hospital_cobweb_hanging')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 512, 512);

    const anchors = [0, 60, 140, 220, 290, 370, 450, 512];
    for (let pass = 0; pass < 4; pass++) {
      const dropMax = 200 + pass * 75;
      for (let i = 0; i < anchors.length - 1; i++) {
        const x1 = anchors[i];
        const x2 = anchors[i + 1];
        const midX = (x1 + x2) * 0.5;
        const sagY = 80 + pass * 60 + (Math.random() - 0.5) * 30;

        ctx.strokeStyle = `rgba(200, 225, 220, ${0.45 - pass * 0.08})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x1, 0);
        ctx.quadraticCurveTo(midX, sagY, x2, 0);
        ctx.stroke();

        for (let t = 0; t < 3; t++) {
          const tx = x1 + (t + 1) * ((x2 - x1) / 4);
          const tStartY = sagY * 0.5 + Math.random() * 20;
          const tEndY = sagY + 40 + Math.random() * dropMax * 0.5;
          ctx.strokeStyle = 'rgba(180, 215, 210, 0.35)';
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(tx, tStartY);
          ctx.bezierCurveTo(
            tx + (Math.random() - 0.5) * 15, tStartY + 40,
            tx + (Math.random() - 0.5) * 20, tStartY + 80,
            tx + (Math.random() - 0.5) * 10, tEndY
          );
          ctx.stroke();
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('hospital_cobweb_hanging', texture);
    return texture;
  }

  // 15. Peeling Hospital Paint & Vinyl Strip (벽에서 벗겨진 병원 페인트/비닐 띠)
  public static getPeelingPaperStripTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_peeling_strip')) return this.cache.get('hospital_peeling_strip')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 512);

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#424e47');
    grad.addColorStop(0.6, '#313d37');
    grad.addColorStop(1, '#1b2420');
    ctx.fillStyle = grad;

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

    ctx.strokeStyle = '#7c9488';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('hospital_peeling_strip', texture);
    return texture;
  }

  // 16. Airborne Hospital Dust Motes (부유하는 공기 중 먼지/포자)
  public static getDustParticleTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_dust')) return this.cache.get('hospital_dust')!;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 128, 128);

    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(220, 245, 235, 1.0)');
    grad.addColorStop(0.25, 'rgba(180, 220, 210, 0.75)');
    grad.addColorStop(0.55, 'rgba(120, 170, 160, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(64, 64, 64, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('hospital_dust', texture);
    return texture;
  }

  // 17. Chilly Morgue Floor Mist & Chemical Fog (바닥을 기는 영안실 냉기 안개)
  public static getMistSmokeTexture(): THREE.CanvasTexture {
    if (this.cache.has('hospital_mist')) return this.cache.get('hospital_mist')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, 256, 256);

    const lobes = [
      { x: 128, y: 128, r: 100, a: 0.65 },
      { x: 95, y: 110, r: 80, a: 0.55 },
      { x: 160, y: 115, r: 85, a: 0.55 },
      { x: 110, y: 155, r: 75, a: 0.5 },
      { x: 150, y: 150, r: 80, a: 0.5 },
    ];

    for (const lobe of lobes) {
      const grad = ctx.createRadialGradient(lobe.x, lobe.y, 0, lobe.x, lobe.y, lobe.r);
      grad.addColorStop(0, `rgba(175, 215, 220, ${lobe.a})`);
      grad.addColorStop(0.4, `rgba(130, 175, 185, ${lobe.a * 0.6})`);
      grad.addColorStop(0.75, `rgba(80, 125, 135, ${lobe.a * 0.25})`);
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lobe.x, lobe.y, lobe.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('hospital_mist', texture);
    return texture;
  }
}

// Backward-compatible alias so existing imports in InfiniteMazeEngine & proceduralAssets work seamlessly
export const AbandonedMansionTextures = AbandonedHospitalTextures;
