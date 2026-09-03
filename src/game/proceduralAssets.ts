import * as THREE from 'three';
import { AbandonedMansionTextures } from './textures';

export class AbandonedMansionAssets {
  // Global Geometry Cache: guarantees zero allocations during maze traversal
  private static geoCache: Map<string, THREE.BufferGeometry> = new Map();

  public static getBox(w: number, h: number, d: number): THREE.BoxGeometry {
    const key = `b_${w.toFixed(3)}_${h.toFixed(3)}_${d.toFixed(3)}`;
    let geo = this.geoCache.get(key) as THREE.BoxGeometry | undefined;
    if (!geo) {
      geo = new THREE.BoxGeometry(w, h, d);
      this.geoCache.set(key, geo);
    }
    return geo;
  }

  public static getCylinder(rt: number, rb: number, h: number, segs: number = 8): THREE.CylinderGeometry {
    const key = `c_${rt.toFixed(3)}_${rb.toFixed(3)}_${h.toFixed(3)}_${segs}`;
    let geo = this.geoCache.get(key) as THREE.CylinderGeometry | undefined;
    if (!geo) {
      geo = new THREE.CylinderGeometry(rt, rb, h, segs);
      this.geoCache.set(key, geo);
    }
    return geo;
  }

  public static getPlane(w: number, h: number): THREE.PlaneGeometry {
    const key = `p_${w.toFixed(3)}_${h.toFixed(3)}`;
    let geo = this.geoCache.get(key) as THREE.PlaneGeometry | undefined;
    if (!geo) {
      geo = new THREE.PlaneGeometry(w, h);
      this.geoCache.set(key, geo);
    }
    return geo;
  }

  public static getSphere(r: number, ws: number = 8, hs: number = 8): THREE.SphereGeometry {
    const key = `s_${r.toFixed(3)}_${ws}_${hs}`;
    let geo = this.geoCache.get(key) as THREE.SphereGeometry | undefined;
    if (!geo) {
      geo = new THREE.SphereGeometry(r, ws, hs);
      this.geoCache.set(key, geo);
    }
    return geo;
  }

  public static getCone(r: number, h: number, segs: number = 8): THREE.ConeGeometry {
    const key = `cn_${r.toFixed(3)}_${h.toFixed(3)}_${segs}`;
    let geo = this.geoCache.get(key) as THREE.ConeGeometry | undefined;
    if (!geo) {
      geo = new THREE.ConeGeometry(r, h, segs);
      this.geoCache.set(key, geo);
    }
    return geo;
  }

  public static getTorus(r: number, tube: number, rs: number = 6, ts: number = 12): THREE.TorusGeometry {
    const key = `t_${r.toFixed(3)}_${tube.toFixed(3)}_${rs}_${ts}`;
    let geo = this.geoCache.get(key) as THREE.TorusGeometry | undefined;
    if (!geo) {
      geo = new THREE.TorusGeometry(r, tube, rs, ts);
      this.geoCache.set(key, geo);
    }
    return geo;
  }

  public static getCircle(r: number, segs: number = 12): THREE.CircleGeometry {
    const key = `cir_${r.toFixed(3)}_${segs}`;
    let geo = this.geoCache.get(key) as THREE.CircleGeometry | undefined;
    if (!geo) {
      geo = new THREE.CircleGeometry(r, segs);
      this.geoCache.set(key, geo);
    }
    return geo;
  }

  // Shared static materials for performance
  public static floorMat: THREE.MeshStandardMaterial;
  public static wallMat: THREE.MeshStandardMaterial;
  public static ceilingMat: THREE.MeshStandardMaterial;
  public static woodPillarMat: THREE.MeshStandardMaterial;
  public static doorMat: THREE.MeshStandardMaterial;
  public static talismanMat: THREE.MeshStandardMaterial;
  public static maskMat: THREE.MeshStandardMaterial;
  public static portraitMat: THREE.MeshStandardMaterial;
  public static candleMat: THREE.MeshStandardMaterial;
  public static brassMat: THREE.MeshStandardMaterial;
  public static booksMat: THREE.MeshStandardMaterial;
  public static drawersMat: THREE.MeshStandardMaterial;
  public static screenMat: THREE.MeshStandardMaterial;
  public static stoneMat: THREE.MeshStandardMaterial;
  public static ironMat: THREE.MeshStandardMaterial;
  public static jarMat: THREE.MeshStandardMaterial;
  public static puddleMat: THREE.MeshStandardMaterial;
  public static robeWhiteMat: THREE.MeshStandardMaterial;
  public static robeBlackMat: THREE.MeshStandardMaterial;
  public static eyeRedMat: THREE.MeshBasicMaterial;
  public static eyeCyanMat: THREE.MeshBasicMaterial;
  public static ghostHandMatWhite: THREE.MeshStandardMaterial;
  public static ghostHandMatBlack: THREE.MeshStandardMaterial;
  public static incenseStickMat: THREE.MeshBasicMaterial;
  public static emberMat: THREE.MeshBasicMaterial;
  public static flameMat: THREE.MeshBasicMaterial;
  public static hearthMat: THREE.MeshStandardMaterial;
  public static cauldronMat: THREE.MeshStandardMaterial;
  public static silkMat: THREE.MeshStandardMaterial;
  public static cushionMat: THREE.MeshStandardMaterial;
  public static drumMat: THREE.MeshStandardMaterial;
  public static drumHeadMat: THREE.MeshStandardMaterial;
  public static waterMat: THREE.MeshStandardMaterial;
  public static bambooMat: THREE.MeshStandardMaterial;
  public static silkDrapeMat: THREE.MeshStandardMaterial;
  public static porcelainMat: THREE.MeshStandardMaterial;
  public static bladeMat: THREE.MeshStandardMaterial;
  public static runeMat: THREE.MeshBasicMaterial;
  public static gripMat: THREE.MeshStandardMaterial;
  public static tasselMat: THREE.MeshStandardMaterial;
  public static sacredClothMat: THREE.MeshStandardMaterial;
  public static sacredTalismanMat: THREE.MeshStandardMaterial;
  public static flashlightMetalMat: THREE.MeshStandardMaterial;
  public static flashlightBrassMat: THREE.MeshStandardMaterial;
  public static flashlightLensMat: THREE.MeshBasicMaterial;
  public static eoduksiniShadowMat: THREE.MeshStandardMaterial;
  public static eoduksiniDarkMat: THREE.MeshStandardMaterial;
  public static eoduksiniEyeMat: THREE.MeshBasicMaterial;
  public static eoduksiniCoreMat: THREE.MeshBasicMaterial;
  public static bossArenaFloorMat: THREE.MeshStandardMaterial;
  public static bossPillarRuneMat: THREE.MeshStandardMaterial;
  public static bossSpiritualFireMat: THREE.MeshBasicMaterial;
  public static cobwebCornerMat: THREE.MeshStandardMaterial;
  public static cobwebHangingMat: THREE.MeshStandardMaterial;
  public static peelingPaperMat: THREE.MeshStandardMaterial;

  // Reusable Core Geometries
  public static pillarGeo: THREE.BoxGeometry;
  public static talismanGeo: THREE.PlaneGeometry;
  public static maskGeo: THREE.PlaneGeometry;
  public static floorGeo: THREE.PlaneGeometry;
  public static ceilingGeo: THREE.PlaneGeometry;

  public static initMaterials() {
    if (this.floorMat) return;

    const floorTex = AbandonedMansionTextures.getWoodFloorTexture();
    floorTex.repeat.set(2, 2);
    this.floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.85,
      metalness: 0.1,
    });

    const wallTex = AbandonedMansionTextures.getMoldyWallTexture();
    wallTex.repeat.set(1.5, 1);
    const wallBump = AbandonedMansionTextures.getWallBumpTexture();
    wallBump.repeat.set(1.5, 1);
    this.wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      bumpMap: wallBump,
      bumpScale: 0.05,
      roughness: 0.92,
      metalness: 0.04,
    });

    this.cobwebCornerMat = new THREE.MeshStandardMaterial({
      map: AbandonedMansionTextures.getCobwebTexture(),
      transparent: true,
      opacity: 0.84,
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 0.92,
    });

    this.cobwebHangingMat = new THREE.MeshStandardMaterial({
      map: AbandonedMansionTextures.getCorridorCobwebTexture(),
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      depthWrite: false,
      roughness: 0.92,
    });

    this.peelingPaperMat = new THREE.MeshStandardMaterial({
      map: AbandonedMansionTextures.getPeelingPaperStripTexture(),
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.9,
    });

    const ceilTex = AbandonedMansionTextures.getCeilingTexture();
    ceilTex.repeat.set(2, 2);
    this.ceilingMat = new THREE.MeshStandardMaterial({
      map: ceilTex,
      roughness: 0.95,
      metalness: 0.05,
    });

    this.woodPillarMat = new THREE.MeshStandardMaterial({
      map: AbandonedMansionTextures.getWoodFloorTexture(),
      color: 0x3a281c,
      roughness: 0.8,
    });

    this.doorMat = new THREE.MeshStandardMaterial({
      map: AbandonedMansionTextures.getTornHanjiDoorTexture(),
      roughness: 0.85,
      transparent: true,
      opacity: 0.95,
    });

    this.talismanMat = new THREE.MeshStandardMaterial({
      map: AbandonedMansionTextures.getTalismanTexture(),
      roughness: 0.7,
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.maskMat = new THREE.MeshStandardMaterial({
      map: AbandonedMansionTextures.getCursedMaskTexture(),
      roughness: 0.75,
      side: THREE.DoubleSide,
    });

    this.portraitMat = new THREE.MeshStandardMaterial({
      map: AbandonedMansionTextures.getAncestralPortraitTexture(),
      roughness: 0.6,
      side: THREE.DoubleSide,
    });

    this.candleMat = new THREE.MeshStandardMaterial({
      color: 0xd8c69f,
      roughness: 0.4,
    });

    this.brassMat = new THREE.MeshStandardMaterial({
      color: 0x8a703d,
      roughness: 0.35,
      metalness: 0.8,
    });

    this.booksMat = new THREE.MeshStandardMaterial({
      map: AbandonedMansionTextures.getBookSpinesTexture(),
      roughness: 0.8,
    });

    this.drawersMat = new THREE.MeshStandardMaterial({
      map: AbandonedMansionTextures.getMedicineDrawersTexture(),
      roughness: 0.75,
    });

    this.screenMat = new THREE.MeshStandardMaterial({
      map: AbandonedMansionTextures.getFoldingScreenTexture(),
      roughness: 0.7,
      side: THREE.DoubleSide,
    });

    this.stoneMat = new THREE.MeshStandardMaterial({
      color: 0x3d423e,
      roughness: 0.95,
      metalness: 0.05,
    });

    this.ironMat = new THREE.MeshStandardMaterial({
      color: 0x222224,
      roughness: 0.6,
      metalness: 0.9,
    });

    this.jarMat = new THREE.MeshStandardMaterial({
      color: 0x241c16,
      roughness: 0.85,
    });

    this.puddleMat = new THREE.MeshStandardMaterial({
      color: 0x0f1412,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });

    this.robeWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xdce2e8,
      roughness: 0.85,
      transparent: true,
      opacity: 0.82,
    });

    this.robeBlackMat = new THREE.MeshStandardMaterial({
      color: 0x14161a,
      roughness: 0.85,
      transparent: true,
      opacity: 0.88,
    });

    this.eyeRedMat = new THREE.MeshBasicMaterial({ color: 0xff1122 });
    this.eyeCyanMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc });

    this.ghostHandMatWhite = new THREE.MeshStandardMaterial({
      color: 0xb5bcbf,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
    });

    this.ghostHandMatBlack = new THREE.MeshStandardMaterial({
      color: 0x4a4d52,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
    });

    this.incenseStickMat = new THREE.MeshBasicMaterial({ color: 0x8a3030 });
    this.emberMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
    this.flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa33 });
    this.hearthMat = new THREE.MeshStandardMaterial({ color: 0x3a2c22, roughness: 0.95 });
    this.cauldronMat = new THREE.MeshStandardMaterial({ color: 0x161618, roughness: 0.4, metalness: 0.85 });
    this.silkMat = new THREE.MeshStandardMaterial({ color: 0x992233, roughness: 0.6, side: THREE.DoubleSide });
    this.cushionMat = new THREE.MeshStandardMaterial({ color: 0x336688, roughness: 0.8 });
    this.drumMat = new THREE.MeshStandardMaterial({ color: 0x8c3322, roughness: 0.65 });
    this.drumHeadMat = new THREE.MeshStandardMaterial({ color: 0xdfd3b8, roughness: 0.9 });
    this.waterMat = new THREE.MeshStandardMaterial({ color: 0x05080c, roughness: 0.1, metalness: 0.9 });
    this.bambooMat = new THREE.MeshStandardMaterial({ color: 0x3d472c, roughness: 0.7 });
    this.silkDrapeMat = new THREE.MeshStandardMaterial({ color: 0x662244, roughness: 0.7, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
    this.porcelainMat = new THREE.MeshStandardMaterial({ color: 0xeeeeec, roughness: 0.2 });
    this.bladeMat = new THREE.MeshStandardMaterial({ color: 0xd8e4f0, metalness: 0.95, roughness: 0.2 });
    this.runeMat = new THREE.MeshBasicMaterial({ color: 0x44ddff });
    this.gripMat = new THREE.MeshStandardMaterial({ color: 0x161210, roughness: 0.85 });
    this.tasselMat = new THREE.MeshStandardMaterial({ color: 0xaa1122, roughness: 0.6 });
    this.sacredClothMat = new THREE.MeshStandardMaterial({ color: 0x142036, roughness: 0.6 });

    this.sacredTalismanMat = new THREE.MeshStandardMaterial({
      map: AbandonedMansionTextures.getTalismanTexture(),
      roughness: 0.4,
      emissive: 0xaa6600,
      emissiveIntensity: 0.8,
      side: THREE.DoubleSide,
    });

    this.flashlightMetalMat = new THREE.MeshStandardMaterial({
      color: 0x2b3338,
      metalness: 0.85,
      roughness: 0.35,
    });

    this.flashlightBrassMat = new THREE.MeshStandardMaterial({
      color: 0xb89234,
      metalness: 0.9,
      roughness: 0.3,
    });

    this.flashlightLensMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });

    this.eoduksiniShadowMat = new THREE.MeshStandardMaterial({
      color: 0x050608,
      roughness: 0.95,
      metalness: 0.1,
      transparent: true,
      opacity: 0.94,
    });

    this.eoduksiniDarkMat = new THREE.MeshStandardMaterial({
      color: 0x020204,
      roughness: 0.98,
      metalness: 0.05,
      transparent: true,
      opacity: 0.88,
    });

    this.eoduksiniEyeMat = new THREE.MeshBasicMaterial({
      color: 0xff1122,
    });

    this.eoduksiniCoreMat = new THREE.MeshBasicMaterial({
      color: 0xaa1144,
    });

    const arenaFloorTex = AbandonedMansionTextures.getBossArenaFloorTexture();
    arenaFloorTex.repeat.set(4, 4);
    this.bossArenaFloorMat = new THREE.MeshStandardMaterial({
      map: arenaFloorTex,
      roughness: 0.85,
      metalness: 0.2,
    });

    const pillarRuneTex = AbandonedMansionTextures.getBossPillarRuneTexture();
    this.bossPillarRuneMat = new THREE.MeshStandardMaterial({
      map: pillarRuneTex,
      roughness: 0.8,
      metalness: 0.1,
      emissive: 0x661100,
      emissiveIntensity: 0.6,
    });

    this.bossSpiritualFireMat = new THREE.MeshBasicMaterial({
      color: 0x00ccff,
    });

    // Shared Geometries
    this.pillarGeo = this.getBox(0.24, 3.2, 0.24);
    this.talismanGeo = this.getPlane(0.28, 0.55);
    this.maskGeo = this.getPlane(0.45, 0.45);
    this.floorGeo = this.getPlane(8.5, 8.5);
    this.ceilingGeo = this.getPlane(8.5, 8.5);
  }

  // Create standard wooden post/pillar (기둥)
  public static createWoodPillar(height: number = 3.2): THREE.Mesh {
    this.initMaterials();
    const geo = height === 3.2 && this.pillarGeo ? this.pillarGeo : this.getBox(0.24, height, 0.24);
    const mesh = new THREE.Mesh(geo, this.woodPillarMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // 1. Corner Cobweb Mesh (벽과 천장 구석 모서리 거미줄)
  public static createCornerCobweb(size: number = 0.85): THREE.Mesh {
    this.initMaterials();
    const geo = this.getPlane(size, size);
    const mesh = new THREE.Mesh(geo, this.cobwebCornerMat);
    mesh.renderOrder = 2;
    return mesh;
  }

  // 2. Draped Corridor & Doorway Cobweb (인방 및 복도 아래로 드리운 거미줄)
  public static createHangingCobweb(width: number = 1.6, height: number = 0.6): THREE.Mesh {
    this.initMaterials();
    const geo = this.getPlane(width, height);
    const mesh = new THREE.Mesh(geo, this.cobwebHangingMat);
    mesh.renderOrder = 2;
    return mesh;
  }

  // 3. 3D Peeling Wallpaper Strip (벽에서 뜯겨나와 펄럭이는 3D 벽지 조각)
  public static createPeelingStrip(width: number = 0.32, height: number = 0.85): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();
    const planeGeo = this.getPlane(width, height);
    const mesh = new THREE.Mesh(planeGeo, this.peelingPaperMat);
    mesh.position.y = -height / 2;
    mesh.rotation.x = 0.16; // slightly curled outward from wall
    group.add(mesh);
    return group;
  }

  // Create wall segment with top wooden lintel, bottom skirting, peeling wallpaper, and cobwebs
  public static createWallSegment(width: number, height: number = 3.2): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Main wall
    const wallGeo = this.getBox(width, height, 0.16);
    const wallMesh = new THREE.Mesh(wallGeo, this.wallMat);
    wallMesh.position.y = height / 2;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    group.add(wallMesh);

    // Top wooden beam / lintel (인방)
    const topBeamGeo = this.getBox(width + 0.02, 0.18, 0.22);
    const topBeam = new THREE.Mesh(topBeamGeo, this.woodPillarMat);
    topBeam.position.y = height - 0.09;
    group.add(topBeam);

    // Bottom skirting wood
    const botBeamGeo = this.getBox(width + 0.02, 0.12, 0.2);
    const botBeam = new THREE.Mesh(botBeamGeo, this.woodPillarMat);
    botBeam.position.y = 0.06;
    group.add(botBeam);

    // Horror Details: Cobwebs in upper corners & 3D Peeling Wallpaper
    if (width >= 1.4) {
      // Upper Left Corner Cobwebs (Front & Back)
      const cobwebLeft = this.createCornerCobweb(Math.min(0.85, width * 0.45));
      cobwebLeft.position.set(-width / 2 + 0.4, height - 0.48, 0.088);
      group.add(cobwebLeft);

      const cobwebLeftBack = this.createCornerCobweb(Math.min(0.85, width * 0.45));
      cobwebLeftBack.rotation.y = Math.PI;
      cobwebLeftBack.position.set(-width / 2 + 0.4, height - 0.48, -0.088);
      group.add(cobwebLeftBack);

      // Upper Right Corner Cobweb
      const cobwebRight = this.createCornerCobweb(Math.min(0.85, width * 0.45));
      cobwebRight.scale.x = -1;
      cobwebRight.position.set(width / 2 - 0.4, height - 0.48, 0.088);
      group.add(cobwebRight);
    }

    // 3D Tattered Wallpaper strips on wider wall spans
    if (width >= 2.8) {
      // Front peeling wallpaper strip
      const peelFront = this.createPeelingStrip(0.38, 0.95);
      peelFront.position.set(-width * 0.22, height * 0.58, 0.09);
      group.add(peelFront);

      // Back peeling wallpaper strip
      const peelBack = this.createPeelingStrip(0.32, 0.8);
      peelBack.rotation.y = Math.PI;
      peelBack.position.set(width * 0.25, height * 0.48, -0.09);
      group.add(peelBack);

      // Drooping cobweb under top lintel
      const lintelWeb = this.createHangingCobweb(Math.min(2.0, width * 0.6), 0.45);
      lintelWeb.position.set(0, height - 0.38, 0.086);
      group.add(lintelWeb);
    }

    return group;
  }

  // Create Sliding Hanji Door (미닫이문) with sliding leaf and stationary track frame
  public static createHanjiDoor(width: number = 1.6, height: number = 2.4): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();
    group.name = 'interactive_hanji_door';

    const frameMat = this.woodPillarMat;
    const trackWidth = width * 1.8; // Extended track for sliding

    // Stationary Top Header Track (상인방 가이드 레일)
    const topTrack = new THREE.Mesh(this.getBox(trackWidth, 0.12, 0.16), frameMat);
    topTrack.position.set(width * 0.35, height + 0.06, 0);
    group.add(topTrack);

    // Stationary Bottom Floor Guide Rail (문턱 레일)
    const botTrack = new THREE.Mesh(this.getBox(trackWidth, 0.08, 0.16), frameMat);
    botTrack.position.set(width * 0.35, 0.04, 0);
    group.add(botTrack);

    // Left and Right Frame Posts (문설주)
    const leftPost = new THREE.Mesh(this.getBox(0.12, height + 0.1, 0.14), frameMat);
    leftPost.position.set(-width / 2 - 0.02, height / 2, 0);
    group.add(leftPost);

    const rightPost = new THREE.Mesh(this.getBox(0.12, height + 0.1, 0.14), frameMat);
    rightPost.position.set(width / 2 + 0.02, height / 2, 0);
    group.add(rightPost);

    // Doorway Corner Cobweb (문틀 상단에 엉켜있는 거미줄)
    const doorCobweb = this.createCornerCobweb(0.6);
    doorCobweb.position.set(-width / 2 + 0.3, height - 0.28, 0.08);
    group.add(doorCobweb);

    // Sliding Door Leaf Group (미닫이 문짝)
    const leaf = new THREE.Group();
    leaf.name = 'door_leaf';

    // Main Hanji Screen Panel
    const doorGeo = this.getBox(width, height - 0.06, 0.04);
    const doorMesh = new THREE.Mesh(doorGeo, this.doorMat);
    doorMesh.position.set(0, height / 2, 0);
    doorMesh.castShadow = true;
    doorMesh.receiveShadow = true;
    leaf.add(doorMesh);

    // Wooden Border Frame around sliding leaf
    const borderThickness = 0.06;
    const leafFrameTop = new THREE.Mesh(this.getBox(width, borderThickness, 0.05), frameMat);
    leafFrameTop.position.set(0, height - borderThickness / 2, 0);
    leaf.add(leafFrameTop);

    const leafFrameBot = new THREE.Mesh(this.getBox(width, borderThickness, 0.05), frameMat);
    leafFrameBot.position.set(0, borderThickness / 2 + 0.04, 0);
    leaf.add(leafFrameBot);

    const leafFrameLeft = new THREE.Mesh(this.getBox(borderThickness, height - 0.06, 0.05), frameMat);
    leafFrameLeft.position.set(-width / 2 + borderThickness / 2, height / 2, 0);
    leaf.add(leafFrameLeft);

    const leafFrameRight = new THREE.Mesh(this.getBox(borderThickness, height - 0.06, 0.05), frameMat);
    leafFrameRight.position.set(width / 2 - borderThickness / 2, height / 2, 0);
    leaf.add(leafFrameRight);

    // Traditional Korean Brass Ring Handle (놋쇠 문고리)
    const ringGeo = this.getTorus(0.04, 0.01, 8, 16);
    const handleRing = new THREE.Mesh(ringGeo, this.brassMat);
    handleRing.position.set(-width / 2 + 0.18, 1.15, 0.035);
    leaf.add(handleRing);

    const handleRingBack = new THREE.Mesh(ringGeo, this.brassMat);
    handleRingBack.position.set(-width / 2 + 0.18, 1.15, -0.035);
    leaf.add(handleRingBack);

    // Small protective talisman pasted on the door
    const doorTalisman = this.createTalisman(0.18, 0.36);
    doorTalisman.position.set(0.1, 1.35, 0.026);
    leaf.add(doorTalisman);

    group.add(leaf);
    return group;
  }

  // Create Shaman Talisman Mesh on Wall
  public static createTalisman(width: number = 0.28, height: number = 0.55): THREE.Mesh {
    this.initMaterials();
    const geo = width === 0.28 && height === 0.55 && this.talismanGeo ? this.talismanGeo : this.getPlane(width, height);
    const mesh = new THREE.Mesh(geo, this.talismanMat);
    return mesh;
  }

  // Create Cursed Mask on Wall / Pillar
  public static createMask(size: number = 0.45): THREE.Mesh {
    this.initMaterials();
    const geo = size === 0.45 && this.maskGeo ? this.maskGeo : this.getPlane(size, size);
    const mesh = new THREE.Mesh(geo, this.maskMat);
    return mesh;
  }

  // Create Shaman Ritual Altar (제사상과 촛불, 향로)
  public static createRitualAltar(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Table top
    const tableTop = new THREE.Mesh(this.getBox(1.4, 0.08, 0.8), this.woodPillarMat);
    tableTop.position.y = 0.75;
    tableTop.castShadow = true;
    group.add(tableTop);

    // Table legs
    const legGeo = this.getBox(0.08, 0.75, 0.08);
    const legPositions = [
      [-0.6, 0.375, -0.3],
      [0.6, 0.375, -0.3],
      [-0.6, 0.375, 0.3],
      [0.6, 0.375, 0.3],
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, this.woodPillarMat);
      leg.position.set(lx, ly, lz);
      group.add(leg);
    });

    // Ancestral Portrait / Tablet on table
    const portraitGeo = this.getPlane(0.45, 0.6);
    const portrait = new THREE.Mesh(portraitGeo, this.portraitMat);
    portrait.position.set(0, 1.15, -0.28);
    group.add(portrait);

    // Brass incense burner (향로)
    const burner = new THREE.Mesh(this.getCylinder(0.12, 0.08, 0.12, 16), this.brassMat);
    burner.position.set(0, 0.85, 0.1);
    group.add(burner);

    // Incense sticks (향 3개)
    const stickGeo = this.getCylinder(0.005, 0.005, 0.25, 6);
    const tipGeo = this.getSphere(0.008, 6, 6);
    for (let i = -1; i <= 1; i++) {
      const stick = new THREE.Mesh(stickGeo, this.incenseStickMat);
      stick.position.set(i * 0.03, 0.98, 0.1);
      stick.rotation.z = i * 0.15;
      group.add(stick);

      // Glowing ember tip
      const tip = new THREE.Mesh(tipGeo, this.emberMat);
      tip.position.set(i * 0.03 + i * 0.02, 1.1, 0.1);
      group.add(tip);
    }

    // Left and Right Candles (촛대와 촛불)
    const holderGeo = this.getCylinder(0.06, 0.1, 0.08, 12);
    const waxGeo = this.getCylinder(0.035, 0.035, 0.24, 12);
    const flameGeo = this.getCone(0.025, 0.07, 8);

    const createCandle = (xOffset: number) => {
      const candleGroup = new THREE.Group();
      // Brass holder
      const holder = new THREE.Mesh(holderGeo, this.brassMat);
      holder.position.y = 0.83;
      candleGroup.add(holder);

      // Wax candle
      const wax = new THREE.Mesh(waxGeo, this.candleMat);
      wax.position.y = 0.98;
      candleGroup.add(wax);

      // Flame (Glowing emissive flame)
      const flame = new THREE.Mesh(flameGeo, this.flameMat);
      flame.position.y = 1.13;
      flame.name = 'candle_flame';
      candleGroup.add(flame);

      candleGroup.position.x = xOffset;
      candleGroup.position.z = -0.1;
      return candleGroup;
    };

    group.add(createCandle(-0.45));
    group.add(createCandle(0.45));

    // Scatter talismans on table
    const talOnTable = this.createTalisman(0.2, 0.38);
    talOnTable.rotation.x = -Math.PI / 2;
    talOnTable.position.set(-0.2, 0.8, 0.15);
    group.add(talOnTable);

    return group;
  }

  // Create Antique Korean Wardrobe (자개장 / 낡은 장롱)
  public static createWardrobe(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Body
    const body = new THREE.Mesh(this.getBox(1.2, 2.2, 0.6), this.woodPillarMat);
    body.position.y = 1.1;
    body.castShadow = true;
    group.add(body);

    // Brass handles
    const ringGeo = this.getTorus(0.04, 0.01, 8, 16);
    for (let h = -1; h <= 1; h += 2) {
      const handle = new THREE.Mesh(ringGeo, this.brassMat);
      handle.position.set(h * 0.15, 1.1, 0.31);
      group.add(handle);
    }

    // Seal talisman pasted across cabinet doors (봉인된 장롱)
    const seal = this.createTalisman(0.22, 0.44);
    seal.position.set(0, 1.2, 0.31);
    group.add(seal);

    return group;
  }

  // Create Antique Ceramic Jar (옹기 항아리)
  public static createClayJar(scale: number = 1.0): THREE.Mesh {
    this.initMaterials();
    const geo = this.getCylinder(0.28 * scale, 0.38 * scale, 0.7 * scale, 12);
    const mesh = new THREE.Mesh(geo, this.jarMat);
    mesh.position.y = 0.35 * scale;
    mesh.castShadow = true;
    return mesh;
  }

  // Create Water Puddle with Reflection
  public static createPuddle(radius: number = 0.8): THREE.Mesh {
    this.initMaterials();
    const puddleGeo = this.getCircle(radius, 12);
    const mesh = new THREE.Mesh(puddleGeo, this.puddleMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 0.01;
    return mesh;
  }

  // Create Ghost Phantom Figure (소복 입은 원혼 & 검은 도포 저승 망령)
  public static createGhostFigure(variant: 'white_robe' | 'shadow_specter' = 'white_robe'): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    const isWhite = variant === 'white_robe';
    const robeMat = isWhite ? this.robeWhiteMat : this.robeBlackMat;

    const bodyGeo = this.getCone(0.48, 1.8, 10);
    const body = new THREE.Mesh(bodyGeo, robeMat);
    body.position.y = 0.9;
    group.add(body);

    // Head with dark long hair draped forward
    const headMat = isWhite ? this.ironMat : this.stoneMat;
    const head = new THREE.Mesh(this.getSphere(0.19, 10, 10), headMat);
    head.position.y = 1.76;
    group.add(head);

    // Long hair mesh falling over face and shoulders
    const hair = new THREE.Mesh(this.getCylinder(0.2, 0.32, 1.05, 8), headMat);
    hair.position.set(0, 1.4, 0.04);
    group.add(hair);

    // Eerie glowing pinpoint eyes hidden in hair (Crimson red vs Ghostly cyan)
    const eyeMat = isWhite ? this.eyeRedMat : this.eyeCyanMat;
    const eyeGeo = this.getSphere(0.02, 6, 6);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.065, 1.74, 0.18);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.065, 1.74, 0.18);
    group.add(eyeL);
    group.add(eyeR);

    // Ghostly outstretched arms reaching forward
    const armGeo = this.getCylinder(0.04, 0.03, 0.65, 6);
    const armL = new THREE.Mesh(armGeo, robeMat);
    armL.position.set(-0.28, 1.42, 0.3);
    armL.rotation.x = Math.PI / 2.2;
    armL.rotation.z = -0.15;
    group.add(armL);

    const armR = new THREE.Mesh(armGeo, robeMat);
    armR.position.set(0.28, 1.42, 0.3);
    armR.rotation.x = Math.PI / 2.2;
    armR.rotation.z = 0.15;
    group.add(armR);

    // Pale claws / hands
    const handMat = isWhite ? this.ghostHandMatWhite : this.ghostHandMatBlack;
    const handGeo = this.getCone(0.04, 0.16, 6);
    const handL = new THREE.Mesh(handGeo, handMat);
    handL.position.set(-0.28, 1.42, 0.65);
    handL.rotation.x = Math.PI / 2;
    group.add(handL);

    const handR = new THREE.Mesh(handGeo, handMat);
    handR.position.set(0.28, 1.42, 0.65);
    handR.rotation.x = Math.PI / 2;
    group.add(handR);

    group.name = isWhite ? 'ghost_white_maiden' : 'ghost_shadow_specter';
    return group;
  }

  // 8-Panel Folding Screen with Incense Shrine (8폭 병풍과 사당 제단)
  public static createFoldingScreenAltar(): THREE.Group {
    this.initMaterials();
    const groupStr = new THREE.Group();

    // 8-Panel Folding Screen behind altar
    const screenGroup = new THREE.Group();
    const panelWidth = 0.42;
    const panelHeight = 2.3;
    const panelGeo = this.getBox(panelWidth, panelHeight, 0.03);
    for (let p = 0; p < 8; p++) {
      const panel = new THREE.Mesh(panelGeo, this.screenMat);
      const angle = (p % 2 === 0 ? 0.14 : -0.14);
      panel.position.set((p - 3.5) * (panelWidth * 0.95), panelHeight / 2, Math.sin(p * 0.8) * 0.08);
      panel.rotation.y = angle;
      screenGroup.add(panel);
    }
    screenGroup.position.set(0, 0, -0.65);
    groupStr.add(screenGroup);

    // Front Ritual Table
    const altar = this.createRitualAltar();
    altar.position.set(0, 0, 0);
    groupStr.add(altar);

    return groupStr;
  }

  // Forbidden Library Chamber (고서화 서가 및 책상)
  public static createBookshelfChamber(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Tall wooden bookshelf
    const shelfGroup = new THREE.Group();
    const shelfFrame = new THREE.Mesh(this.getBox(2.4, 2.6, 0.5), this.woodPillarMat);
    shelfFrame.position.y = 1.3;
    shelfGroup.add(shelfFrame);

    // Books rows
    const booksGeo = this.getBox(2.1, 0.55, 0.42);
    for (let row = 0; row < 3; row++) {
      const booksMesh = new THREE.Mesh(booksGeo, this.booksMat);
      booksMesh.position.set(0, 0.6 + row * 0.75, 0.05);
      shelfGroup.add(booksMesh);
    }
    shelfGroup.position.set(0, 0, -1.8);
    group.add(shelfGroup);

    // Scholar's low wooden desk (서탁)
    const desk = new THREE.Mesh(this.getBox(1.6, 0.45, 0.8), this.woodPillarMat);
    desk.position.set(0, 0.225, 0.2);
    group.add(desk);

    // Inkstone & writing brush on desk (벼루와 붓)
    const inkstone = new THREE.Mesh(this.getBox(0.2, 0.04, 0.3), this.stoneMat);
    inkstone.position.set(-0.35, 0.47, 0.2);
    group.add(inkstone);

    // Rolled talisman scroll
    const scroll = new THREE.Mesh(this.getCylinder(0.04, 0.04, 0.35, 10), this.candleMat);
    scroll.rotation.z = Math.PI / 2;
    scroll.position.set(0.3, 0.49, 0.2);
    group.add(scroll);

    return group;
  }

  // Herbalist Medicine Apothecary (약초방 한약 서랍장)
  public static createMedicineCabinet(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Large medicine cabinet with hundreds of small labeled drawers (약장)
    const cabinet = new THREE.Mesh(this.getBox(2.6, 2.4, 0.5), this.drawersMat);
    cabinet.position.set(0, 1.2, -1.8);
    cabinet.castShadow = true;
    group.add(cabinet);

    // Wooden mortar & pestle on small side table (약절구와 약공이)
    const sideTable = new THREE.Mesh(this.getBox(0.8, 0.7, 0.7), this.woodPillarMat);
    sideTable.position.set(1.6, 0.35, -0.8);
    group.add(sideTable);

    const mortar = new THREE.Mesh(this.getCylinder(0.18, 0.12, 0.22, 12), this.stoneMat);
    mortar.position.set(1.6, 0.81, -0.8);
    group.add(mortar);

    // Dried herbal bundle on table
    const herbBundle = new THREE.Mesh(this.getCone(0.15, 0.4, 8), this.woodPillarMat);
    herbBundle.rotation.x = Math.PI / 2;
    herbBundle.position.set(1.6, 0.75, -0.5);
    group.add(herbBundle);

    return group;
  }

  // Traditional Kitchen with Iron Cauldron (전통 부뚜막과 무쇠 가마솥)
  public static createTraditionalKitchen(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Mud / Clay Hearth Structure (부뚜막)
    const hearth = new THREE.Mesh(this.getBox(2.2, 0.75, 1.2), this.hearthMat);
    hearth.position.set(0, 0.375, -1.5);
    group.add(hearth);

    // Cast Iron Cauldron (무쇠 가마솥)
    const pot = new THREE.Mesh(this.getSphere(0.42, 12, 10), this.cauldronMat);
    pot.position.set(-0.5, 0.75, -1.5);
    group.add(pot);

    const potLid = new THREE.Mesh(this.getCylinder(0.44, 0.44, 0.06, 12), this.woodPillarMat);
    potLid.position.set(-0.5, 0.86, -1.5);
    group.add(potLid);

    // Firewood stack (장작더미)
    const woodLogGeo = this.getCylinder(0.06, 0.06, 0.9, 8);
    for (let w = 0; w < 6; w++) {
      const woodLog = new THREE.Mesh(woodLogGeo, this.woodPillarMat);
      woodLog.rotation.z = Math.PI / 2;
      woodLog.position.set(0.6, 0.1 + Math.floor(w / 3) * 0.12, -1.3 + (w % 3) * 0.15);
      group.add(woodLog);
    }

    return group;
  }

  // Inner Courtyard with Stone Pagoda Lantern (중정 석등과 뒤틀린 고목)
  public static createStonePagodaCourtyard(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Stone Pagoda / Stone Lantern (석등)
    const pagodaGroup = new THREE.Group();
    // Base pedestal
    const base = new THREE.Mesh(this.getBox(0.7, 0.25, 0.7), this.stoneMat);
    base.position.y = 0.125;
    pagodaGroup.add(base);

    // Pillar shaft
    const pillar = new THREE.Mesh(this.getCylinder(0.18, 0.22, 0.9, 8), this.stoneMat);
    pillar.position.y = 0.7;
    pagodaGroup.add(pillar);

    // Fire chamber
    const chamber = new THREE.Mesh(this.getBox(0.5, 0.45, 0.5), this.stoneMat);
    chamber.position.y = 1.35;
    pagodaGroup.add(chamber);

    // Roof cap
    const roof = new THREE.Mesh(this.getCone(0.65, 0.35, 4), this.stoneMat);
    roof.position.y = 1.75;
    roof.rotation.y = Math.PI / 4;
    pagodaGroup.add(roof);

    // Glowing candle inside lantern (emissive flame)
    const flameGeo = this.getCone(0.06, 0.16, 8);
    const stoneFlame = new THREE.Mesh(flameGeo, this.flameMat);
    stoneFlame.position.y = 1.25;
    pagodaGroup.add(stoneFlame);

    pagodaGroup.position.set(0, 0, 0);
    group.add(pagodaGroup);

    // Twisted dead bonsai/tree trunk in stone pot
    const pot = new THREE.Mesh(this.getCylinder(0.4, 0.3, 0.35, 12), this.stoneMat);
    pot.position.set(-1.8, 0.175, -1.4);
    group.add(pot);

    const trunk = new THREE.Mesh(this.getCylinder(0.08, 0.14, 1.5, 8), this.woodPillarMat);
    trunk.position.set(-1.8, 1.0, -1.4);
    trunk.rotation.z = 0.25;
    group.add(trunk);

    return group;
  }

  // Cellar Iron Dungeon Cage (지하실 쇠창살 감옥)
  public static createIronCageDungeon(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Iron cell bars
    const cageWidth = 2.4;
    const barCount = 10;
    const barGeo = this.getCylinder(0.025, 0.025, 2.8, 6);
    for (let b = 0; b <= barCount; b++) {
      const bar = new THREE.Mesh(barGeo, this.ironMat);
      bar.position.set(-cageWidth / 2 + (b / barCount) * cageWidth, 1.4, -1.6);
      group.add(bar);
    }
    // Top & bottom horizontal cross bars
    const crossBarGeo = this.getBox(cageWidth, 0.06, 0.06);
    const topBar = new THREE.Mesh(crossBarGeo, this.ironMat);
    topBar.position.set(0, 2.7, -1.6);
    group.add(topBar);

    const botBar = new THREE.Mesh(crossBarGeo, this.ironMat);
    botBar.position.set(0, 0.1, -1.6);
    group.add(botBar);

    return group;
  }

  // Embroidery & Sewing Chamber (규수방 자수틀과 경대)
  public static createEmbroideryChamber(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Wooden Embroidery Frame (자수틀)
    const frame = new THREE.Mesh(this.getBox(1.2, 0.9, 0.1), this.woodPillarMat);
    frame.position.set(-1.6, 0.9, -1.4);
    frame.rotation.y = 0.3;
    group.add(frame);

    // Embroidered Silk Cloth on Frame (붉은 명주 자수천)
    const silkCloth = new THREE.Mesh(this.getPlane(0.9, 0.65), this.silkMat);
    silkCloth.position.set(-1.6, 0.9, -1.34);
    silkCloth.rotation.y = 0.3;
    group.add(silkCloth);

    // Traditional Korean Wooden Vanity / Mirror Stand (목각 경대)
    const vanity = new THREE.Mesh(this.getBox(0.7, 0.65, 0.5), this.woodPillarMat);
    vanity.position.set(1.5, 0.325, -1.5);
    group.add(vanity);

    // Brass Mirror (놋쇠 거울)
    const mirror = new THREE.Mesh(this.getCylinder(0.24, 0.24, 0.03, 16), this.brassMat);
    mirror.position.set(1.5, 0.85, -1.45);
    mirror.rotation.x = Math.PI / 2;
    group.add(mirror);

    // Silk Sewing Cushion (바늘꽂이)
    const cushion = new THREE.Mesh(this.getCylinder(0.12, 0.14, 0.08, 10), this.cushionMat);
    cushion.position.set(1.2, 0.68, -1.4);
    group.add(cushion);

    return group;
  }

  // Shaman Ritual Musical Instruments Hall (제례 악기실과 대북)
  public static createRitualInstrumentsHall(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Korean Traditional Standing Drum (대북)
    const drumStand = new THREE.Mesh(this.getBox(0.8, 1.4, 0.7), this.woodPillarMat);
    drumStand.position.set(0, 0.7, -1.6);
    group.add(drumStand);

    const drum = new THREE.Mesh(this.getCylinder(0.55, 0.55, 0.6, 16), this.drumMat);
    drum.rotation.x = Math.PI / 2;
    drum.position.set(0, 1.2, -1.6);
    group.add(drum);

    const drumHead = new THREE.Mesh(this.getCircle(0.54, 16), this.drumHeadMat);
    drumHead.position.set(0, 1.2, -1.29);
    group.add(drumHead);

    // Brass Gong (징) on Stand
    const gongStand = new THREE.Mesh(this.getBox(0.5, 1.2, 0.4), this.woodPillarMat);
    gongStand.position.set(-1.8, 0.6, -1.4);
    group.add(gongStand);

    const gong = new THREE.Mesh(this.getCylinder(0.3, 0.3, 0.04, 16), this.brassMat);
    gong.rotation.x = Math.PI / 2;
    gong.position.set(-1.8, 0.85, -1.35);
    group.add(gong);

    return group;
  }

  // Cursed Stone Well with Bamboo (저주받은 돌우물과 대나무)
  public static createCursedWellCourtyard(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Round Stone Well (돌우물)
    const wellOuter = new THREE.Mesh(this.getCylinder(0.85, 0.9, 0.75, 16), this.stoneMat);
    wellOuter.position.set(0, 0.375, 0);
    group.add(wellOuter);

    // Deep Dark Well Interior / Water
    const wellWater = new THREE.Mesh(this.getCircle(0.65, 16), this.waterMat);
    wellWater.rotation.x = -Math.PI / 2;
    wellWater.position.set(0, 0.25, 0);
    group.add(wellWater);

    // Wooden Pulley Frame over Well
    const pulleyPostGeo = this.getCylinder(0.04, 0.04, 1.6, 6);
    const pulleyPostL = new THREE.Mesh(pulleyPostGeo, this.woodPillarMat);
    pulleyPostL.position.set(-0.7, 0.8, 0);
    group.add(pulleyPostL);

    const pulleyPostR = new THREE.Mesh(pulleyPostGeo, this.woodPillarMat);
    pulleyPostR.position.set(0.7, 0.8, 0);
    group.add(pulleyPostR);

    const pulleyTop = new THREE.Mesh(this.getCylinder(0.04, 0.04, 1.5, 6), this.woodPillarMat);
    pulleyTop.rotation.z = Math.PI / 2;
    pulleyTop.position.set(0, 1.6, 0);
    group.add(pulleyTop);

    // Wooden Bucket (두레박)
    const bucket = new THREE.Mesh(this.getCylinder(0.18, 0.14, 0.24, 10), this.woodPillarMat);
    bucket.position.set(0.95, 0.12, 0.4);
    group.add(bucket);

    // Dried Bamboo Stalks bundle against wall
    const bambooGeo = this.getCylinder(0.03, 0.03, 2.6, 6);
    for (let b = 0; b < 6; b++) {
      const bamboo = new THREE.Mesh(bambooGeo, this.bambooMat);
      bamboo.position.set(-2.0 + (b % 3) * 0.1, 1.3, -1.8 + Math.floor(b / 3) * 0.1);
      bamboo.rotation.z = 0.08 * (b - 2.5);
      group.add(bamboo);
    }

    return group;
  }

  // Silk Drapery & Tea Incense Chamber (비단 휘장과 차실)
  public static createSilkIncenseChamber(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Hanging Silk Drapes (반투명 비단 휘장)
    const drapeGeo = this.getPlane(1.2, 2.4);
    const drapeL = new THREE.Mesh(drapeGeo, this.silkDrapeMat);
    drapeL.position.set(-1.4, 1.2, -1.2);
    drapeL.rotation.y = 0.2;
    group.add(drapeL);

    const drapeR = new THREE.Mesh(drapeGeo, this.silkDrapeMat);
    drapeR.position.set(1.4, 1.2, -1.2);
    drapeR.rotation.y = -0.2;
    group.add(drapeR);

    // Low Tea Table (찻상)
    const teaTable = new THREE.Mesh(this.getBox(1.4, 0.35, 0.8), this.woodPillarMat);
    teaTable.position.set(0, 0.175, -1.4);
    group.add(teaTable);

    // Porcelain Teapot & Cups (백자 다도 세트)
    const pot = new THREE.Mesh(this.getSphere(0.12, 10, 10), this.porcelainMat);
    pot.position.set(-0.25, 0.42, -1.4);
    group.add(pot);

    const cupGeo = this.getCylinder(0.05, 0.04, 0.07, 8);
    const cup1 = new THREE.Mesh(cupGeo, this.porcelainMat);
    cup1.position.set(0.15, 0.39, -1.3);
    group.add(cup1);

    const cup2 = new THREE.Mesh(cupGeo, this.porcelainMat);
    cup2.position.set(0.3, 0.39, -1.45);
    group.add(cup2);

    return group;
  }

  // 13. Sacred Korean Exorcism Sword (사인참사검 - 四寅斬邪劍)
  public static createExorcismSword(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Steel Blade with holy runes
    const bladeGeo = this.getBox(0.045, 0.85, 0.012);
    const blade = new THREE.Mesh(bladeGeo, this.bladeMat);
    blade.position.y = 0.48;
    blade.castShadow = true;
    group.add(blade);

    // Blade Tip
    const tipGeo = this.getCone(0.024, 0.1, 4);
    const tip = new THREE.Mesh(tipGeo, this.bladeMat);
    tip.position.y = 0.95;
    tip.rotation.y = Math.PI / 4;
    group.add(tip);

    // Engraved Constellation Runes (28수 별자리 & 부적선 금박)
    const dotGeo = this.getSphere(0.006, 6, 6);
    for (let r = 0; r < 7; r++) {
      const dot = new THREE.Mesh(dotGeo, this.runeMat);
      dot.position.set((r % 2 === 0 ? 0.01 : -0.01), 0.2 + r * 0.09, 0.008);
      group.add(dot);
    }

    // Brass Guard (용머리/봉황 문양 코등이)
    const guardGeo = this.getBox(0.16, 0.025, 0.06);
    const guard = new THREE.Mesh(guardGeo, this.brassMat);
    guard.position.y = 0.05;
    group.add(guard);

    // Handle / Grip (자루)
    const gripGeo = this.getCylinder(0.02, 0.022, 0.26, 8);
    const grip = new THREE.Mesh(gripGeo, this.gripMat);
    grip.position.y = -0.08;
    group.add(grip);

    // Pommel (자루 끝 놋쇠 폼멜)
    const pommelGeo = this.getSphere(0.032, 8, 8);
    const pommel = new THREE.Mesh(pommelGeo, this.brassMat);
    pommel.position.y = -0.22;
    group.add(pommel);

    // Red Silk Tassel (붉은 술)
    const tassel = new THREE.Mesh(this.getCylinder(0.01, 0.025, 0.14, 6), this.tasselMat);
    tassel.position.y = -0.32;
    group.add(tassel);

    return group;
  }

  // Sacred Sword Altar Pedestal in Secret Chamber
  public static createSacredSwordPedestal(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Dark Lacquered Altar Table
    const table = new THREE.Mesh(this.getBox(1.6, 0.75, 0.9), this.woodPillarMat);
    table.position.y = 0.375;
    table.castShadow = true;
    table.receiveShadow = true;
    group.add(table);

    // Silk Cloth on Table
    const cloth = new THREE.Mesh(this.getBox(1.4, 0.02, 0.75), this.sacredClothMat);
    cloth.position.y = 0.76;
    group.add(cloth);

    // Wooden Sword Stand (칼 거치대)
    const standGeo = this.getBox(0.06, 0.25, 0.3);
    const standL = new THREE.Mesh(standGeo, this.woodPillarMat);
    standL.position.set(-0.3, 0.88, 0);
    group.add(standL);

    const standR = new THREE.Mesh(standGeo, this.woodPillarMat);
    standR.position.set(0.3, 0.88, 0);
    group.add(standR);

    // Sacred Sword resting horizontally
    const sword = this.createExorcismSword();
    sword.rotation.z = Math.PI / 2;
    sword.position.set(0, 1.02, 0);
    group.add(sword);

    return group;
  }

  // Sacred Sealing Talisman Altar Pedestal in Secret Chamber
  public static createSacredTalismanPedestal(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Octagonal Shaman Altar Pedestal
    const base = new THREE.Mesh(this.getCylinder(0.6, 0.75, 0.8, 8), this.woodPillarMat);
    base.position.y = 0.4;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Brass Bowl with Sacred Ashes
    const bowl = new THREE.Mesh(this.getCylinder(0.26, 0.16, 0.14, 12), this.brassMat);
    bowl.position.y = 0.87;
    group.add(bowl);

    // Glowing Golden Sealing Talisman floating and gently rotating
    const talisman = new THREE.Mesh(this.getPlane(0.36, 0.7), this.sacredTalismanMat);
    talisman.position.set(0, 1.25, 0);
    talisman.name = 'floating_talisman';
    group.add(talisman);

    return group;
  }

  // First-person Handheld Flashlight Model
  public static createFlashlightModel(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Body Tube
    const body = new THREE.Mesh(this.getCylinder(0.024, 0.024, 0.22, 10), this.flashlightMetalMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Head Cone
    const head = new THREE.Mesh(this.getCylinder(0.042, 0.026, 0.08, 10), this.flashlightMetalMat);
    head.rotation.x = Math.PI / 2;
    head.position.z = -0.14;
    group.add(head);

    // Brass Accent Ring
    const ring = new THREE.Mesh(this.getCylinder(0.044, 0.044, 0.015, 10), this.flashlightBrassMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.z = -0.15;
    group.add(ring);

    // Glass Lens
    const lens = new THREE.Mesh(this.getCircle(0.038, 10), this.flashlightLensMat);
    lens.position.z = -0.181;
    group.add(lens);

    return group;
  }

  // 14. Giant Korean Mythical Shadow Boss: Eoduksini (어둑시니)
  public static createEoduksiniBoss(): THREE.Group {
    this.initMaterials();
    const bossGroup = new THREE.Group();
    bossGroup.name = 'eoduksini_boss';

    // 1. Towering Smoky Shadow Torso & Mantle (높이 7~8m 거대 체구)
    const torsoGroup = new THREE.Group();
    torsoGroup.name = 'boss_torso_group';

    // Upper Chest (거대한 흑연 흉부)
    const chestGeo = this.getBox(3.4, 2.6, 2.2);
    const chest = new THREE.Mesh(chestGeo, this.eoduksiniShadowMat);
    chest.position.y = 4.6;
    torsoGroup.add(chest);

    // Abdomen / Lower Torso
    const lowerTorsoGeo = this.getCylinder(1.5, 1.0, 2.2, 10);
    const lowerTorso = new THREE.Mesh(lowerTorsoGeo, this.eoduksiniDarkMat);
    lowerTorso.position.y = 2.4;
    torsoGroup.add(lowerTorso);

    // Swirling dark shadow robe tendrils (바닥까지 드리워지는 흑암의 장막)
    for (let r = 0; r < 8; r++) {
      const angle = (r / 8) * Math.PI * 2;
      const tendrilGeo = this.getCylinder(0.25, 0.6, 3.2, 6);
      const tendril = new THREE.Mesh(tendrilGeo, this.eoduksiniDarkMat);
      tendril.position.set(Math.cos(angle) * 1.4, 1.2, Math.sin(angle) * 1.4);
      tendril.rotation.z = Math.cos(angle) * 0.25;
      tendril.rotation.x = Math.sin(angle) * 0.25;
      torsoGroup.add(tendril);
    }

    // 2. Head & Jagged Shadow Horns / Crown (어둑시니 두부와 뿔)
    const headGroup = new THREE.Group();
    headGroup.name = 'boss_head_group';
    headGroup.position.set(0, 6.2, 0);

    const headGeo = this.getBox(1.8, 1.6, 1.6);
    const head = new THREE.Mesh(headGeo, this.eoduksiniShadowMat);
    headGroup.add(head);

    // Sinister Shadow Horns (솟아오른 어둠의 뿔)
    const hornGeo = this.getCone(0.28, 1.6, 6);
    const hornL = new THREE.Mesh(hornGeo, this.eoduksiniDarkMat);
    hornL.position.set(-0.75, 1.2, -0.1);
    hornL.rotation.z = -0.45;
    hornL.rotation.x = -0.2;
    headGroup.add(hornL);

    const hornR = new THREE.Mesh(hornGeo, this.eoduksiniDarkMat);
    hornR.position.set(0.75, 1.2, -0.1);
    hornR.rotation.z = 0.45;
    hornR.rotation.x = -0.2;
    headGroup.add(hornR);

    // Glowing Crimson Eyes (번뜩이는 붉은 눈망울)
    const eyeGeo = this.getSphere(0.18, 10, 10);
    const eyeL = new THREE.Mesh(eyeGeo, this.eoduksiniEyeMat);
    eyeL.position.set(-0.45, 0.15, 0.82);
    eyeL.name = 'boss_eye_left';
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, this.eoduksiniEyeMat);
    eyeR.position.set(0.45, 0.15, 0.82);
    eyeR.name = 'boss_eye_right';
    headGroup.add(eyeR);

    // Eye PointLight (주변을 붉게 물들이는 안광)
    const eyeLight = new THREE.PointLight(0xff1122, 2.5, 18);
    eyeLight.position.set(0, 0.2, 1.1);
    eyeLight.name = 'boss_eye_light';
    headGroup.add(eyeLight);

    torsoGroup.add(headGroup);

    // 3. Massive Left Arm & Claws (거대한 왼쪽 팔과 손톱)
    const armLGroup = new THREE.Group();
    armLGroup.name = 'boss_arm_left';
    armLGroup.position.set(-2.0, 5.2, 0);

    const upperArmL = new THREE.Mesh(this.getCylinder(0.45, 0.35, 2.8, 8), this.eoduksiniShadowMat);
    upperArmL.position.set(-0.6, -1.2, 0);
    upperArmL.rotation.z = 0.35;
    armLGroup.add(upperArmL);

    const forearmL = new THREE.Mesh(this.getCylinder(0.35, 0.25, 2.6, 8), this.eoduksiniDarkMat);
    forearmL.position.set(-1.4, -3.2, 0.6);
    forearmL.rotation.x = 0.4;
    armLGroup.add(forearmL);

    // 5 Shadow Claws (날카로운 그림자 손톱)
    const clawGeo = this.getCone(0.08, 0.85, 5);
    for (let c = 0; c < 5; c++) {
      const claw = new THREE.Mesh(clawGeo, this.eoduksiniShadowMat);
      claw.position.set(-1.6 + (c - 2) * 0.18, -4.4, 0.9 + c * 0.08);
      claw.rotation.x = Math.PI * 0.75;
      armLGroup.add(claw);
    }
    bossGroup.add(armLGroup);

    // 4. Massive Right Arm & Claws (거대한 오른쪽 팔과 손톱)
    const armRGroup = new THREE.Group();
    armRGroup.name = 'boss_arm_right';
    armRGroup.position.set(2.0, 5.2, 0);

    const upperArmR = new THREE.Mesh(this.getCylinder(0.45, 0.35, 2.8, 8), this.eoduksiniShadowMat);
    upperArmR.position.set(0.6, -1.2, 0);
    upperArmR.rotation.z = -0.35;
    armRGroup.add(upperArmR);

    const forearmR = new THREE.Mesh(this.getCylinder(0.35, 0.25, 2.6, 8), this.eoduksiniDarkMat);
    forearmR.position.set(1.4, -3.2, 0.6);
    forearmR.rotation.x = 0.4;
    armRGroup.add(forearmR);

    for (let c = 0; c < 5; c++) {
      const claw = new THREE.Mesh(clawGeo, this.eoduksiniShadowMat);
      claw.position.set(1.6 + (c - 2) * 0.18, -4.4, 0.9 + c * 0.08);
      claw.rotation.x = Math.PI * 0.75;
      armRGroup.add(claw);
    }
    bossGroup.add(armRGroup);

    // 5. Shamanic Dark Core Orb (가슴 속 꿈틀거리는 악귀의 핵)
    const coreMesh = new THREE.Mesh(this.getSphere(0.45, 12, 12), this.eoduksiniCoreMat);
    coreMesh.position.set(0, 4.4, 0.9);
    coreMesh.name = 'boss_core_mesh';
    torsoGroup.add(coreMesh);

    bossGroup.add(torsoGroup);

    return bossGroup;
  }

  // 15. The Void Seal Boss Arena: 28x28m Dark Stone Altar with 8 Sealing Pillars
  public static createBossArena(): THREE.Group {
    this.initMaterials();
    const arenaGroup = new THREE.Group();
    arenaGroup.name = 'boss_arena_realm';

    // 1. Massive Stone Floor (28m x 28m)
    const floorGeo = this.getPlane(28, 28);
    const floor = new THREE.Mesh(floorGeo, this.bossArenaFloorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    arenaGroup.add(floor);

    // 2. Perimeter Dark Stone Wall (경계 석벽)
    const arenaRadius = 14;
    const pillarCount = 8;
    const pillarGeo = this.getBox(0.85, 7.5, 0.85);

    for (let i = 0; i < pillarCount; i++) {
      const angle = (i / pillarCount) * Math.PI * 2;
      const px = Math.cos(angle) * (arenaRadius - 1.5);
      const pz = Math.sin(angle) * (arenaRadius - 1.5);

      // Sealing Stone Pillar (봉인 석주)
      const pillar = new THREE.Mesh(pillarGeo, this.bossPillarRuneMat);
      pillar.position.set(px, 3.75, pz);
      pillar.rotation.y = -angle + Math.PI / 2;
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      arenaGroup.add(pillar);

      // Spiritual Cyan Brazier Fire atop pillar (기둥 위 타오르는 영화)
      const bowl = new THREE.Mesh(this.getCylinder(0.5, 0.35, 0.4, 8), this.ironMat);
      bowl.position.set(px, 7.7, pz);
      arenaGroup.add(bowl);

      const fire = new THREE.Mesh(this.getCone(0.35, 0.8, 6), this.bossSpiritualFireMat);
      fire.position.set(px, 8.2, pz);
      arenaGroup.add(fire);

      // Cyan spiritual light
      const pLight = new THREE.PointLight(0x00ccff, 1.2, 16);
      pLight.position.set(px, 8.0, pz);
      arenaGroup.add(pLight);
    }

    // Boundary low fence/wall segments between pillars
    for (let i = 0; i < pillarCount; i++) {
      const a1 = (i / pillarCount) * Math.PI * 2;
      const a2 = ((i + 1) / pillarCount) * Math.PI * 2;
      const mx = (Math.cos(a1) + Math.cos(a2)) * 0.5 * (arenaRadius - 1.5);
      const mz = (Math.sin(a1) + Math.sin(a2)) * 0.5 * (arenaRadius - 1.5);
      const segmentAngle = Math.atan2(Math.sin(a2) - Math.sin(a1), Math.cos(a2) - Math.cos(a1));

      const wallSegment = new THREE.Mesh(this.getBox(10.5, 3.2, 0.45), this.stoneMat);
      wallSegment.position.set(mx, 1.6, mz);
      wallSegment.rotation.y = -segmentAngle;
      wallSegment.castShadow = true;
      wallSegment.receiveShadow = true;
      arenaGroup.add(wallSegment);
    }

    // Central Altar Stone Pad
    const centerPad = new THREE.Mesh(this.getCylinder(2.4, 2.6, 0.25, 12), this.stoneMat);
    centerPad.position.set(0, 0.125, 0);
    arenaGroup.add(centerPad);

    return arenaGroup;
  }
}
