import * as THREE from 'three';
import { AbandonedMansionTextures } from './textures';

export class AbandonedMansionAssets {
  // Shared materials for performance
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

  // Reusable Shared Geometries to eliminate repeated allocations and garbage collection
  public static pillarGeo: THREE.BoxGeometry;
  public static talismanGeo: THREE.PlaneGeometry;
  public static maskGeo: THREE.PlaneGeometry;
  public static floorGeo: THREE.PlaneGeometry;
  public static ceilingGeo: THREE.PlaneGeometry;
  public static jarMat: THREE.MeshStandardMaterial;
  public static puddleMat: THREE.MeshStandardMaterial;
  public static robeWhiteMat: THREE.MeshStandardMaterial;
  public static robeBlackMat: THREE.MeshStandardMaterial;
  public static eyeRedMat: THREE.MeshBasicMaterial;
  public static eyeCyanMat: THREE.MeshBasicMaterial;

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
    this.wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.9,
      metalness: 0.05,
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

    // Shared Geometries
    this.pillarGeo = new THREE.BoxGeometry(0.24, 3.2, 0.24);
    this.talismanGeo = new THREE.PlaneGeometry(0.28, 0.55);
    this.maskGeo = new THREE.PlaneGeometry(0.45, 0.45);
    this.floorGeo = new THREE.PlaneGeometry(8.5, 8.5);
    this.ceilingGeo = new THREE.PlaneGeometry(8.5, 8.5);
  }

  // Create standard wooden post/pillar (기둥)
  public static createWoodPillar(height: number = 3.2): THREE.Mesh {
    this.initMaterials();
    const geo = height === 3.2 && this.pillarGeo ? this.pillarGeo : new THREE.BoxGeometry(0.24, height, 0.24);
    const mesh = new THREE.Mesh(geo, this.woodPillarMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // Create wall segment with top wooden lintel and bottom skirting board
  public static createWallSegment(width: number, height: number = 3.2): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Main wall
    const wallGeo = new THREE.BoxGeometry(width, height, 0.16);
    const wallMesh = new THREE.Mesh(wallGeo, this.wallMat);
    wallMesh.position.y = height / 2;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    group.add(wallMesh);

    // Top wooden beam / lintel (인방)
    const topBeamGeo = new THREE.BoxGeometry(width + 0.02, 0.18, 0.22);
    const topBeam = new THREE.Mesh(topBeamGeo, this.woodPillarMat);
    topBeam.position.y = height - 0.09;
    group.add(topBeam);

    // Bottom skirting wood
    const botBeamGeo = new THREE.BoxGeometry(width + 0.02, 0.12, 0.2);
    const botBeam = new THREE.Mesh(botBeamGeo, this.woodPillarMat);
    botBeam.position.y = 0.06;
    group.add(botBeam);

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
    const topTrack = new THREE.Mesh(new THREE.BoxGeometry(trackWidth, 0.12, 0.16), frameMat);
    topTrack.position.set(width * 0.35, height + 0.06, 0);
    group.add(topTrack);

    // Stationary Bottom Floor Guide Rail (문턱 레일)
    const botTrack = new THREE.Mesh(new THREE.BoxGeometry(trackWidth, 0.08, 0.16), frameMat);
    botTrack.position.set(width * 0.35, 0.04, 0);
    group.add(botTrack);

    // Left and Right Frame Posts (문설주)
    const leftPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, height + 0.1, 0.14), frameMat);
    leftPost.position.set(-width / 2 - 0.02, height / 2, 0);
    group.add(leftPost);

    const rightPost = new THREE.Mesh(new THREE.BoxGeometry(0.12, height + 0.1, 0.14), frameMat);
    rightPost.position.set(width / 2 + 0.02, height / 2, 0);
    group.add(rightPost);

    // Sliding Door Leaf Group (미닫이 문짝)
    const leaf = new THREE.Group();
    leaf.name = 'door_leaf';

    // Main Hanji Screen Panel
    const doorGeo = new THREE.BoxGeometry(width, height - 0.06, 0.04);
    const doorMesh = new THREE.Mesh(doorGeo, this.doorMat);
    doorMesh.position.set(0, height / 2, 0);
    doorMesh.castShadow = true;
    doorMesh.receiveShadow = true;
    leaf.add(doorMesh);

    // Wooden Border Frame around sliding leaf
    const borderThickness = 0.06;
    const leafFrameTop = new THREE.Mesh(new THREE.BoxGeometry(width, borderThickness, 0.05), frameMat);
    leafFrameTop.position.set(0, height - borderThickness / 2, 0);
    leaf.add(leafFrameTop);

    const leafFrameBot = new THREE.Mesh(new THREE.BoxGeometry(width, borderThickness, 0.05), frameMat);
    leafFrameBot.position.set(0, borderThickness / 2 + 0.04, 0);
    leaf.add(leafFrameBot);

    const leafFrameLeft = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, height - 0.06, 0.05), frameMat);
    leafFrameLeft.position.set(-width / 2 + borderThickness / 2, height / 2, 0);
    leaf.add(leafFrameLeft);

    const leafFrameRight = new THREE.Mesh(new THREE.BoxGeometry(borderThickness, height - 0.06, 0.05), frameMat);
    leafFrameRight.position.set(width / 2 - borderThickness / 2, height / 2, 0);
    leaf.add(leafFrameRight);

    // Traditional Korean Brass Ring Handle (놋쇠 문고리)
    const handleRing = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 16), this.brassMat);
    handleRing.position.set(-width / 2 + 0.18, 1.15, 0.035);
    leaf.add(handleRing);

    const handleRingBack = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 16), this.brassMat);
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
    const geo = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(geo, this.talismanMat);
    return mesh;
  }

  // Create Cursed Mask on Wall / Pillar
  public static createMask(size: number = 0.45): THREE.Mesh {
    this.initMaterials();
    const geo = new THREE.PlaneGeometry(size, size);
    const mesh = new THREE.Mesh(geo, this.maskMat);
    return mesh;
  }

  // Create Shaman Ritual Altar (제사상과 촛불, 향로)
  public static createRitualAltar(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Table top
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.8), this.woodPillarMat);
    tableTop.position.y = 0.75;
    tableTop.castShadow = true;
    group.add(tableTop);

    // Table legs
    const legGeo = new THREE.BoxGeometry(0.08, 0.75, 0.08);
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
    const portraitGeo = new THREE.PlaneGeometry(0.45, 0.6);
    const portrait = new THREE.Mesh(portraitGeo, this.portraitMat);
    portrait.position.set(0, 1.15, -0.28);
    group.add(portrait);

    // Brass incense burner (향로)
    const burner = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.12, 16), this.brassMat);
    burner.position.set(0, 0.85, 0.1);
    group.add(burner);

    // Incense sticks (향 3개)
    for (let i = -1; i <= 1; i++) {
      const stick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.25, 6),
        new THREE.MeshBasicMaterial({ color: 0x8a3030 })
      );
      stick.position.set(i * 0.03, 0.98, 0.1);
      stick.rotation.z = i * 0.15;
      group.add(stick);

      // Glowing ember tip
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.008, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xff4400 })
      );
      tip.position.set(i * 0.03 + i * 0.02, 1.1, 0.1);
      group.add(tip);
    }

    // Left and Right Candles (촛대와 촛불)
    const createCandle = (xOffset: number) => {
      const candleGroup = new THREE.Group();
      // Brass holder
      const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 0.08, 12), this.brassMat);
      holder.position.y = 0.83;
      candleGroup.add(holder);

      // Wax candle
      const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.24, 12), this.candleMat);
      wax.position.y = 0.98;
      candleGroup.add(wax);

      // Flame
      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.025, 0.07, 8),
        new THREE.MeshBasicMaterial({ color: 0xffaa33 })
      );
      flame.position.y = 1.13;
      flame.name = 'candle_flame';
      candleGroup.add(flame);

      // Candle light
      const light = new THREE.PointLight(0xff9922, 1.2, 4.5);
      light.position.y = 1.15;
      light.name = 'candle_light';
      candleGroup.add(light);

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
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.6), this.woodPillarMat);
    body.position.y = 1.1;
    body.castShadow = true;
    group.add(body);

    // Brass handles
    for (let h = -1; h <= 1; h += 2) {
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 16), this.brassMat);
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
    const geo = new THREE.CylinderGeometry(0.28 * scale, 0.38 * scale, 0.7 * scale, 12);
    const mesh = new THREE.Mesh(geo, this.jarMat);
    mesh.position.y = 0.35 * scale;
    mesh.castShadow = true;
    return mesh;
  }

  // Create Water Puddle with Reflection
  public static createPuddle(radius: number = 0.8): THREE.Mesh {
    this.initMaterials();
    const puddleGeo = new THREE.CircleGeometry(radius, 12);
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

    const bodyGeo = new THREE.ConeGeometry(0.48, 1.8, 10);
    const body = new THREE.Mesh(bodyGeo, robeMat);
    body.position.y = 0.9;
    group.add(body);

    // Head with dark long hair draped forward
    const headMat = isWhite ? this.ironMat : this.stoneMat;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 10), headMat);
    head.position.y = 1.76;
    group.add(head);

    // Long hair mesh falling over face and shoulders
    const hair = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 1.05, 8), headMat);
    hair.position.set(0, 1.4, 0.04);
    group.add(hair);

    // Eerie glowing pinpoint eyes hidden in hair (Crimson red vs Ghostly cyan)
    const eyeMat = isWhite ? this.eyeRedMat : this.eyeCyanMat;
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeMat);
    eyeL.position.set(-0.065, 1.74, 0.18);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeMat);
    eyeR.position.set(0.065, 1.74, 0.18);
    group.add(eyeL);
    group.add(eyeR);

    // Ghostly outstretched arms reaching forward
    const armGeo = new THREE.CylinderGeometry(0.04, 0.03, 0.65, 6);
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
    const handMat = new THREE.MeshStandardMaterial({
      color: isWhite ? 0xb5bcbf : 0x4a4d52,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
    });
    const handGeo = new THREE.ConeGeometry(0.04, 0.16, 6);
    const handL = new THREE.Mesh(handGeo, handMat);
    handL.position.set(-0.28, 1.42, 0.65);
    handL.rotation.x = Math.PI / 2;
    group.add(handL);

    const handR = new THREE.Mesh(handGeo, handMat);
    handR.position.set(0.28, 1.42, 0.65);
    handR.rotation.x = Math.PI / 2;
    group.add(handR);

    // Faint eerie aura light
    const auraColor = isWhite ? 0xff2233 : 0x1188bb;
    const auraLight = new THREE.PointLight(auraColor, 1.2, 4.0);
    auraLight.position.y = 1.3;
    auraLight.name = 'ghost_aura';
    group.add(auraLight);

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
    for (let p = 0; p < 8; p++) {
      const panelGeo = new THREE.BoxGeometry(panelWidth, panelHeight, 0.03);
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
    const shelfFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 0.5), this.woodPillarMat);
    shelfFrame.position.y = 1.3;
    shelfGroup.add(shelfFrame);

    // Books rows
    for (let row = 0; row < 3; row++) {
      const booksMesh = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.55, 0.42), this.booksMat);
      booksMesh.position.set(0, 0.6 + row * 0.75, 0.05);
      shelfGroup.add(booksMesh);
    }
    shelfGroup.position.set(0, 0, -1.8);
    group.add(shelfGroup);

    // Scholar's low wooden desk (서탁)
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.8), this.woodPillarMat);
    desk.position.set(0, 0.225, 0.2);
    group.add(desk);

    // Inkstone & writing brush on desk (벼루와 붓)
    const inkstone = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.3), this.stoneMat);
    inkstone.position.set(-0.35, 0.47, 0.2);
    group.add(inkstone);

    // Rolled talisman scroll
    const scroll = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 10), this.candleMat);
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
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 0.5), this.drawersMat);
    cabinet.position.set(0, 1.2, -1.8);
    cabinet.castShadow = true;
    group.add(cabinet);

    // Wooden mortar & pestle on small side table (약절구와 약공이)
    const sideTable = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.7), this.woodPillarMat);
    sideTable.position.set(1.6, 0.35, -0.8);
    group.add(sideTable);

    const mortar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.22, 12), this.stoneMat);
    mortar.position.set(1.6, 0.81, -0.8);
    group.add(mortar);

    // Dried herbal bundle on table
    const herbBundle = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 8), this.woodPillarMat);
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
    const hearthMat = new THREE.MeshStandardMaterial({ color: 0x3a2c22, roughness: 0.95 });
    const hearth = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.75, 1.2), hearthMat);
    hearth.position.set(0, 0.375, -1.5);
    group.add(hearth);

    // Cast Iron Cauldron (무쇠 가마솥)
    const cauldronMat = new THREE.MeshStandardMaterial({ color: 0x161618, roughness: 0.4, metalness: 0.85 });
    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.7), cauldronMat);
    pot.position.set(-0.5, 0.75, -1.5);
    group.add(pot);

    const potLid = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.06, 16), this.woodPillarMat);
    potLid.position.set(-0.5, 0.86, -1.5);
    group.add(potLid);

    // Firewood stack (장작더미)
    for (let w = 0; w < 6; w++) {
      const woodLog = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 8), this.woodPillarMat);
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
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.7), this.stoneMat);
    base.position.y = 0.125;
    pagodaGroup.add(base);

    // Pillar shaft
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.9, 8), this.stoneMat);
    pillar.position.y = 0.7;
    pagodaGroup.add(pillar);

    // Fire chamber
    const chamber = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.5), this.stoneMat);
    chamber.position.y = 1.35;
    pagodaGroup.add(chamber);

    // Roof cap
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.65, 0.35, 4), this.stoneMat);
    roof.position.y = 1.75;
    roof.rotation.y = Math.PI / 4;
    pagodaGroup.add(roof);

    // Glowing candle inside lantern
    const stoneGlow = new THREE.PointLight(0xffaa44, 1.2, 5.0);
    stoneGlow.position.y = 1.35;
    pagodaGroup.add(stoneGlow);

    pagodaGroup.position.set(0, 0, 0);
    group.add(pagodaGroup);

    // Twisted dead bonsai/tree trunk in stone pot
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.35, 12), this.stoneMat);
    pot.position.set(-1.8, 0.175, -1.4);
    group.add(pot);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.5, 8), this.woodPillarMat);
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
    for (let b = 0; b <= barCount; b++) {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.8, 6), this.ironMat);
      bar.position.set(-cageWidth / 2 + (b / barCount) * cageWidth, 1.4, -1.6);
      group.add(bar);
    }
    // Top & bottom horizontal cross bars
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(cageWidth, 0.06, 0.06), this.ironMat);
    topBar.position.set(0, 2.7, -1.6);
    group.add(topBar);

    const botBar = new THREE.Mesh(new THREE.BoxGeometry(cageWidth, 0.06, 0.06), this.ironMat);
    botBar.position.set(0, 0.1, -1.6);
    group.add(botBar);

    return group;
  }

  // Embroidery & Sewing Chamber (규수방 자수틀과 경대)
  public static createEmbroideryChamber(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Wooden Embroidery Frame (자수틀)
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.1), this.woodPillarMat);
    frame.position.set(-1.6, 0.9, -1.4);
    frame.rotation.y = 0.3;
    group.add(frame);

    // Embroidered Silk Cloth on Frame (붉은 명주 자수천)
    const silkMat = new THREE.MeshStandardMaterial({
      color: 0x992233,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const silkCloth = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.65), silkMat);
    silkCloth.position.set(-1.6, 0.9, -1.34);
    silkCloth.rotation.y = 0.3;
    group.add(silkCloth);

    // Traditional Korean Wooden Vanity / Mirror Stand (목각 경대)
    const vanity = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 0.5), this.woodPillarMat);
    vanity.position.set(1.5, 0.325, -1.5);
    group.add(vanity);

    // Brass Mirror (놋쇠 거울)
    const mirror = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 16), this.brassMat);
    mirror.position.set(1.5, 0.85, -1.45);
    mirror.rotation.x = Math.PI / 2;
    group.add(mirror);

    // Silk Sewing Cushion (바늘꽂이)
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x336688, roughness: 0.8 });
    const cushion = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 10), cushionMat);
    cushion.position.set(1.2, 0.68, -1.4);
    group.add(cushion);

    return group;
  }

  // Shaman Ritual Musical Instruments Hall (제례 악기실과 대북)
  public static createRitualInstrumentsHall(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Korean Traditional Standing Drum (대북)
    const drumStand = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.7), this.woodPillarMat);
    drumStand.position.set(0, 0.7, -1.6);
    group.add(drumStand);

    const drumMat = new THREE.MeshStandardMaterial({ color: 0x8c3322, roughness: 0.65 });
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.6, 16), drumMat);
    drum.rotation.x = Math.PI / 2;
    drum.position.set(0, 1.2, -1.6);
    group.add(drum);

    const drumHeadMat = new THREE.MeshStandardMaterial({ color: 0xdfd3b8, roughness: 0.9 });
    const drumHead = new THREE.Mesh(new THREE.CircleGeometry(0.54, 16), drumHeadMat);
    drumHead.position.set(0, 1.2, -1.29);
    group.add(drumHead);

    // Brass Gong (징) on Stand
    const gongStand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.4), this.woodPillarMat);
    gongStand.position.set(-1.8, 0.6, -1.4);
    group.add(gongStand);

    const gong = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 16), this.brassMat);
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
    const wellOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.75, 16), this.stoneMat);
    wellOuter.position.set(0, 0.375, 0);
    group.add(wellOuter);

    // Deep Dark Well Interior / Water
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x05080c,
      roughness: 0.1,
      metalness: 0.9,
    });
    const wellWater = new THREE.Mesh(new THREE.CircleGeometry(0.65, 16), waterMat);
    wellWater.rotation.x = -Math.PI / 2;
    wellWater.position.set(0, 0.25, 0);
    group.add(wellWater);

    // Wooden Pulley Frame over Well
    const pulleyPostL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), this.woodPillarMat);
    pulleyPostL.position.set(-0.7, 0.8, 0);
    group.add(pulleyPostL);

    const pulleyPostR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), this.woodPillarMat);
    pulleyPostR.position.set(0.7, 0.8, 0);
    group.add(pulleyPostR);

    const pulleyTop = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), this.woodPillarMat);
    pulleyTop.rotation.z = Math.PI / 2;
    pulleyTop.position.set(0, 1.6, 0);
    group.add(pulleyTop);

    // Wooden Bucket (두레박)
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.24, 10), this.woodPillarMat);
    bucket.position.set(0.95, 0.12, 0.4);
    group.add(bucket);

    // Dried Bamboo Stalks bundle against wall
    const bambooMat = new THREE.MeshStandardMaterial({ color: 0x3d472c, roughness: 0.7 });
    for (let b = 0; b < 6; b++) {
      const bamboo = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), bambooMat);
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
    const silkDrapeMat = new THREE.MeshStandardMaterial({
      color: 0x662244,
      roughness: 0.7,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });
    const drapeL = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.4), silkDrapeMat);
    drapeL.position.set(-1.4, 1.2, -1.2);
    drapeL.rotation.y = 0.2;
    group.add(drapeL);

    const drapeR = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.4), silkDrapeMat);
    drapeR.position.set(1.4, 1.2, -1.2);
    drapeR.rotation.y = -0.2;
    group.add(drapeR);

    // Low Tea Table (찻상)
    const teaTable = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.8), this.woodPillarMat);
    teaTable.position.set(0, 0.175, -1.4);
    group.add(teaTable);

    // Porcelain Teapot & Cups (백자 다도 세트)
    const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xeeeeec, roughness: 0.2 });
    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), porcelainMat);
    pot.position.set(-0.25, 0.42, -1.4);
    group.add(pot);

    const cup1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.07, 8), porcelainMat);
    cup1.position.set(0.15, 0.39, -1.3);
    group.add(cup1);

    const cup2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.07, 8), porcelainMat);
    cup2.position.set(0.3, 0.39, -1.45);
    group.add(cup2);

    return group;
  }

  // 13. Sacred Korean Exorcism Sword (사인참사검 - 四寅斬邪劍)
  public static createExorcismSword(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Steel Blade with holy runes
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xd8e4f0,
      metalness: 0.95,
      roughness: 0.2,
    });
    const bladeGeo = new THREE.BoxGeometry(0.045, 0.85, 0.012);
    const blade = new THREE.Mesh(bladeGeo, bladeMat);
    blade.position.y = 0.48;
    blade.castShadow = true;
    group.add(blade);

    // Blade Tip
    const tipGeo = new THREE.ConeGeometry(0.024, 0.1, 4);
    const tip = new THREE.Mesh(tipGeo, bladeMat);
    tip.position.y = 0.95;
    tip.rotation.y = Math.PI / 4;
    group.add(tip);

    // Engraved Constellation Runes (28수 별자리 & 부적선 금박)
    const runeMat = new THREE.MeshBasicMaterial({ color: 0x44ddff });
    for (let r = 0; r < 7; r++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), runeMat);
      dot.position.set((r % 2 === 0 ? 0.01 : -0.01), 0.2 + r * 0.09, 0.008);
      group.add(dot);
    }

    // Brass Guard (용머리/봉황 문양 코등이)
    const guardGeo = new THREE.BoxGeometry(0.16, 0.025, 0.06);
    const guard = new THREE.Mesh(guardGeo, this.brassMat);
    guard.position.y = 0.05;
    group.add(guard);

    // Handle / Grip (자루)
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x161210, roughness: 0.85 });
    const gripGeo = new THREE.CylinderGeometry(0.02, 0.022, 0.26, 8);
    const grip = new THREE.Mesh(gripGeo, gripMat);
    grip.position.y = -0.08;
    group.add(grip);

    // Pommel (자루 끝 놋쇠 폼멜)
    const pommelGeo = new THREE.SphereGeometry(0.032, 8, 8);
    const pommel = new THREE.Mesh(pommelGeo, this.brassMat);
    pommel.position.y = -0.22;
    group.add(pommel);

    // Red Silk Tassel (붉은 술)
    const tasselMat = new THREE.MeshStandardMaterial({ color: 0xaa1122, roughness: 0.6 });
    const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.025, 0.14, 6), tasselMat);
    tassel.position.y = -0.32;
    group.add(tassel);

    return group;
  }

  // Sacred Sword Altar Pedestal in Secret Chamber
  public static createSacredSwordPedestal(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Dark Lacquered Altar Table
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.75, 0.9), this.woodPillarMat);
    table.position.y = 0.375;
    table.castShadow = true;
    table.receiveShadow = true;
    group.add(table);

    // Silk Cloth on Table
    const clothMat = new THREE.MeshStandardMaterial({
      color: 0x142036,
      roughness: 0.6,
    });
    const cloth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.02, 0.75), clothMat);
    cloth.position.y = 0.76;
    group.add(cloth);

    // Wooden Sword Stand (칼 거치대)
    const standL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.3), this.woodPillarMat);
    standL.position.set(-0.3, 0.88, 0);
    group.add(standL);

    const standR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.25, 0.3), this.woodPillarMat);
    standR.position.set(0.3, 0.88, 0);
    group.add(standR);

    // Sacred Sword resting horizontally
    const sword = this.createExorcismSword();
    sword.rotation.z = Math.PI / 2;
    sword.position.set(0, 1.02, 0);
    group.add(sword);

    // Holy Cyan/Silver Spiritual Aura
    const light = new THREE.PointLight(0x00e5ff, 2.5, 4.5);
    light.position.set(0, 1.15, 0);
    group.add(light);

    return group;
  }

  // Sacred Sealing Talisman Altar Pedestal in Secret Chamber
  public static createSacredTalismanPedestal(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    // Octagonal Shaman Altar Pedestal
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.75, 0.8, 8), this.woodPillarMat);
    base.position.y = 0.4;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Brass Bowl with Sacred Ashes
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.16, 0.14, 12), this.brassMat);
    bowl.position.y = 0.87;
    group.add(bowl);

    // Glowing Golden Sealing Talisman floating and gently rotating
    const talMat = new THREE.MeshStandardMaterial({
      map: AbandonedMansionTextures.getTalismanTexture(),
      roughness: 0.4,
      emissive: 0xaa6600,
      emissiveIntensity: 0.8,
      side: THREE.DoubleSide,
    });
    const talisman = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.7), talMat);
    talisman.position.set(0, 1.25, 0);
    talisman.name = 'floating_talisman';
    group.add(talisman);

    // Holy Golden Spiritual Aura
    const light = new THREE.PointLight(0xffaa00, 2.8, 4.5);
    light.position.set(0, 1.25, 0);
    group.add(light);

    return group;
  }

  // First-person Handheld Flashlight Model
  public static createFlashlightModel(): THREE.Group {
    this.initMaterials();
    const group = new THREE.Group();

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x2b3338,
      metalness: 0.85,
      roughness: 0.35,
    });
    const brassRingMat = new THREE.MeshStandardMaterial({
      color: 0xb89234,
      metalness: 0.9,
      roughness: 0.3,
    });

    // Body Tube
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.22, 10), metalMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    // Head Cone
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.026, 0.08, 10), metalMat);
    head.rotation.x = Math.PI / 2;
    head.position.z = -0.14;
    group.add(head);

    // Brass Accent Ring
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.015, 10), brassRingMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.z = -0.15;
    group.add(ring);

    // Glass Lens
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.038, 10), lensMat);
    lens.position.z = -0.181;
    group.add(lens);

    return group;
  }
}
