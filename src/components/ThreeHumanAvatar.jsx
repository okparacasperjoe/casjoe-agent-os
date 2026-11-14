import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { lipSyncEngine, VOICE_TONES } from '../services/lipSyncEngine';
import { Sparkles, User, Volume2, Shield } from 'lucide-react';

export const THREE_AVATAR_PERSONAS = {
  ELENA: {
    id: 'elena',
    name: 'Elena',
    title: 'Executive AI Advisor',
    gender: 'female',
    skinColor: 0xE7B29D,
    hairColor: 0x24140D,
    suitColor: 0x1A253D,    // Navy blazer
    shirtColor: 0xF8FAFC,   // Silk white
    eyeColor: 0x2A7E62,     // Warm Hazel / Emerald
    lipColor: 0xBD5355,     // Natural rose
    hairStyle: 'female_bob',
    toneId: 'elena'
  },
  MARCUS: {
    id: 'marcus',
    name: 'Marcus',
    title: 'Enterprise Commercial Lead',
    gender: 'male',
    skinColor: 0xB87E5E,
    hairColor: 0x151211,
    suitColor: 0x1E2229,    // Charcoal suit
    shirtColor: 0xFFFFFF,
    eyeColor: 0x543621,     // Deep Warm Amber
    lipColor: 0x9E4C47,
    hairStyle: 'male_short',
    toneId: 'marcus'
  },
  SOPHIA: {
    id: 'sophia',
    name: 'Sophia',
    title: 'Growth & Automation Specialist',
    gender: 'female',
    skinColor: 0xEBBBA3,
    hairColor: 0x3D2419,
    suitColor: 0x064E3B,    // Emerald blazer
    shirtColor: 0xFDF4FF,
    eyeColor: 0x1D6A9E,     // Vivid Sapphire
    lipColor: 0xC45B64,
    hairStyle: 'female_layered',
    toneId: 'sophia'
  },
  DAVID: {
    id: 'david',
    name: 'David',
    title: 'Corporate Solutions Strategist',
    gender: 'male',
    skinColor: 0xCCA08A,
    hairColor: 0x2B2725,
    suitColor: 0x0F172A,    // Slate midnight
    shirtColor: 0xF1F5F9,
    eyeColor: 0x475569,
    lipColor: 0x9E5852,
    hairStyle: 'male_executive',
    toneId: 'david'
  }
};

export default function ThreeHumanAvatar({
  personaId = 'elena',
  isSpeaking = false,
  isListening = false,
  isThinking = false,
  className = ''
}) {
  const containerRef = useRef(null);
  const persona = THREE_AVATAR_PERSONAS[personaId?.toUpperCase()] || THREE_AVATAR_PERSONAS.ELENA;

  // Live blendshape state for UI badge
  const [liveMetrics, setLiveMetrics] = useState({
    jawOpen: 0,
    audioLevel: 0,
    micLevel: 0
  });

  useEffect(() => {
    if (!containerRef.current) return;

    let isMounted = true;
    const container = containerRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    // -------------------------------------------------------------
    // 1. THREE.JS SCENE, CAMERA & RENDERER
    // -------------------------------------------------------------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.25, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.replaceChildren(renderer.domElement);

    // -------------------------------------------------------------
    // 2. STUDIO THREE-POINT LIGHTING SETUP
    // -------------------------------------------------------------
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.25);
    scene.add(ambientLight);

    // Key light (warm studio key)
    const keyLight = new THREE.DirectionalLight(0xFFF7EC, 2.4);
    keyLight.position.set(1.8, 2.2, 2.6);
    scene.add(keyLight);

    // Fill light (cool gentle fill)
    const fillLight = new THREE.DirectionalLight(0xCCE7FF, 1.3);
    fillLight.position.set(-1.8, 1.2, 2.0);
    scene.add(fillLight);

    // Rim light (sharp back edge highlight on hair & shoulders)
    const rimLight = new THREE.DirectionalLight(0xFFFFFF, 3.2);
    rimLight.position.set(0, 2.8, -2.2);
    scene.add(rimLight);

    // -------------------------------------------------------------
    // 3. ANATOMICAL 3D HUMAN MODEL ASSEMBLY
    // -------------------------------------------------------------
    const avatarRoot = new THREE.Group();
    scene.add(avatarRoot);

    const headGroup = new THREE.Group();
    avatarRoot.add(headGroup);

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: persona.skinColor,
      roughness: 0.62,
      metalness: 0.05
    });

    const lipMat = new THREE.MeshStandardMaterial({
      color: persona.lipColor,
      roughness: 0.45,
      metalness: 0.08
    });

    const teethMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.25,
      metalness: 0.02
    });

    const mouthCavityMat = new THREE.MeshBasicMaterial({
      color: 0x1A050B
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: persona.hairColor,
      roughness: 0.75,
      metalness: 0.15
    });

    const suitMat = new THREE.MeshStandardMaterial({
      color: persona.suitColor,
      roughness: 0.85,
      metalness: 0.05
    });

    const shirtMat = new THREE.MeshStandardMaterial({
      color: persona.shirtColor,
      roughness: 0.7,
      metalness: 0.02
    });

    // --- A. Torso & Suit Jacket ---
    const torsoGeo = new THREE.CylinderGeometry(0.72, 0.85, 1.1, 32);
    const torsoMesh = new THREE.Mesh(torsoGeo, suitMat);
    torsoMesh.position.set(0, -1.05, 0);
    avatarRoot.add(torsoMesh);

    // Collar / Shirt V
    const collarGeo = new THREE.ConeGeometry(0.35, 0.45, 3);
    const collarMesh = new THREE.Mesh(collarGeo, shirtMat);
    collarMesh.rotation.z = Math.PI;
    collarMesh.position.set(0, -0.42, 0.35);
    avatarRoot.add(collarMesh);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.24, 0.27, 0.45, 32);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, -0.22, 0);
    headGroup.add(neckMesh);

    // --- B. Head Base Mesh ---
    const headGeo = new THREE.SphereGeometry(0.62, 48, 48);
    headGeo.scale(1, 1.25, 1.1);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.set(0, 0.38, 0);
    headGroup.add(headMesh);

    // Nose Bridge
    const noseGeo = new THREE.ConeGeometry(0.08, 0.22, 16);
    const noseMesh = new THREE.Mesh(noseGeo, skinMat);
    noseMesh.rotation.x = -Math.PI * 0.15;
    noseMesh.position.set(0, 0.34, 0.66);
    headGroup.add(noseMesh);

    // --- C. Detailed 3D Eyes & Blinking Eyelids ---
    const eyeScleraMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.15 });
    const irisMat = new THREE.MeshStandardMaterial({ color: persona.eyeColor, roughness: 0.3 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const eyelidMat = new THREE.MeshStandardMaterial({ color: persona.skinColor, roughness: 0.65 });

    function createEye(x) {
      const eyePivot = new THREE.Group();
      eyePivot.position.set(x, 0.48, 0.58);

      // Sclera
      const scleraGeo = new THREE.SphereGeometry(0.11, 24, 24);
      const scleraMesh = new THREE.Mesh(scleraGeo, eyeScleraMat);
      eyePivot.add(scleraMesh);

      // Iris
      const irisGeo = new THREE.CircleGeometry(0.055, 24);
      const irisMesh = new THREE.Mesh(irisGeo, irisMat);
      irisMesh.position.set(0, 0, 0.105);
      eyePivot.add(irisMesh);

      // Pupil
      const pupilGeo = new THREE.CircleGeometry(0.026, 24);
      const pupilMesh = new THREE.Mesh(pupilGeo, pupilMat);
      pupilMesh.position.set(0, 0, 0.108);
      eyePivot.add(pupilMesh);

      // Catchlight reflection
      const catchGeo = new THREE.CircleGeometry(0.012, 12);
      const catchMesh = new THREE.Mesh(catchGeo, new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
      catchMesh.position.set(-0.015, 0.015, 0.11);
      eyePivot.add(catchMesh);

      // Upper Eyelid (animated for blinks)
      const eyelidGeo = new THREE.SphereGeometry(0.12, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const eyelidMesh = new THREE.Mesh(eyelidGeo, eyelidMat);
      eyelidMesh.rotation.x = -Math.PI * 0.5; // Initially open
      eyePivot.add(eyelidMesh);

      headGroup.add(eyePivot);
      return { eyePivot, eyelidMesh };
    }

    const leftEye = createEye(-0.21);
    const rightEye = createEye(0.21);

    // Eyebrows
    const browMat = new THREE.MeshStandardMaterial({ color: persona.hairColor, roughness: 0.8 });
    const browGeo = new THREE.BoxGeometry(0.18, 0.028, 0.03);
    const leftBrow = new THREE.Mesh(browGeo, browMat);
    leftBrow.position.set(-0.21, 0.63, 0.63);
    leftBrow.rotation.z = 0.06;
    headGroup.add(leftBrow);

    const rightBrow = new THREE.Mesh(browGeo, browMat);
    rightBrow.position.set(0.21, 0.63, 0.63);
    rightBrow.rotation.z = -0.06;
    headGroup.add(rightBrow);

    // --- D. ANATOMICAL 3D BLENDSHAPE MOUTH RIG ---
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, 0.14, 0.62);
    headGroup.add(mouthGroup);

    // Inner Oral Cavity
    const cavityGeo = new THREE.SphereGeometry(0.14, 24, 16);
    cavityGeo.scale(1.2, 0.6, 0.7);
    const cavityMesh = new THREE.Mesh(cavityGeo, mouthCavityMat);
    cavityMesh.position.set(0, 0, -0.05);
    mouthGroup.add(cavityMesh);

    // Upper Dental Arch
    const upperTeethGeo = new THREE.BoxGeometry(0.19, 0.038, 0.04);
    const upperTeethMesh = new THREE.Mesh(upperTeethGeo, teethMat);
    upperTeethMesh.position.set(0, 0.02, 0);
    mouthGroup.add(upperTeethMesh);

    // Upper Lip
    const upperLipGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.24, 16);
    upperLipGeo.rotateZ(Math.PI * 0.5);
    const upperLipMesh = new THREE.Mesh(upperLipGeo, lipMat);
    upperLipMesh.position.set(0, 0.042, 0.025);
    mouthGroup.add(upperLipMesh);

    // Lower Jaw Bone Group (Kinematic pivot for jawOpen)
    const jawBone = new THREE.Group();
    jawBone.position.set(0, -0.02, 0);
    mouthGroup.add(jawBone);

    // Lower Dental Arch
    const lowerTeethGeo = new THREE.BoxGeometry(0.17, 0.034, 0.04);
    const lowerTeethMesh = new THREE.Mesh(lowerTeethGeo, teethMat);
    lowerTeethMesh.position.set(0, -0.015, -0.01);
    jawBone.add(lowerTeethMesh);

    // Lower Lip
    const lowerLipGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.22, 16);
    lowerLipGeo.rotateZ(Math.PI * 0.5);
    const lowerLipMesh = new THREE.Mesh(lowerLipGeo, lipMat);
    lowerLipMesh.position.set(0, -0.035, 0.025);
    jawBone.add(lowerLipMesh);

    // --- E. Stylized 3D Hair Meshes ---
    const hairGroup = new THREE.Group();
    headGroup.add(hairGroup);

    if (persona.hairStyle.includes('female')) {
      // Elegant sculpted hair volume
      const hairCrownGeo = new THREE.SphereGeometry(0.66, 32, 24);
      hairCrownGeo.scale(1.04, 1.25, 1.08);
      const hairCrown = new THREE.Mesh(hairCrownGeo, hairMat);
      hairCrown.position.set(0, 0.44, -0.04);
      hairGroup.add(hairCrown);

      // Side hair tresses
      const tressGeo = new THREE.CylinderGeometry(0.16, 0.12, 0.85, 16);
      const leftTress = new THREE.Mesh(tressGeo, hairMat);
      leftTress.position.set(-0.55, 0.22, 0.12);
      leftTress.rotation.z = 0.12;
      hairGroup.add(leftTress);

      const rightTress = new THREE.Mesh(tressGeo, hairMat);
      rightTress.position.set(0.55, 0.22, 0.12);
      rightTress.rotation.z = -0.12;
      hairGroup.add(rightTress);
    } else {
      // Modern executive short cut
      const hairShortGeo = new THREE.SphereGeometry(0.65, 32, 24);
      hairShortGeo.scale(1.02, 1.24, 1.05);
      const hairShort = new THREE.Mesh(hairShortGeo, hairMat);
      hairShort.position.set(0, 0.46, -0.04);
      hairGroup.add(hairShort);
    }

    // -------------------------------------------------------------
    // 4. ANIMATION & 60FPS BLENDSHAPE RIGGING LOOP
    // -------------------------------------------------------------
    let clock = new THREE.Clock();
    let animId = null;
    let blinkTimer = 0;
    let isBlinking = false;
    let blinkProgress = 0;

    // Connect to real-time LipSyncEngine blendshapes
    const unsub = lipSyncEngine.subscribe((blend) => {
      if (!isMounted) return;
      setLiveMetrics({
        jawOpen: blend.jawOpen,
        audioLevel: blend.audioLevel,
        micLevel: blend.micLevel
      });

      // Apply real-time ARKit blendshapes directly to 3D meshes:
      // 1. Jaw Opening
      jawBone.position.y = -blend.jawOpen * 0.16;
      jawBone.rotation.x = -blend.jawOpen * 0.12; // Anatomical TMJ rotation

      // 2. Mouth Pucker / Funnel ('O', 'U' circular narrowing)
      const puckerFactor = 1 - blend.mouthPucker * 0.38;
      upperLipMesh.scale.x = puckerFactor * (1 + blend.mouthStretch * 0.2);
      lowerLipMesh.scale.x = puckerFactor * (1 + blend.mouthStretch * 0.2);
      mouthGroup.position.z = 0.62 + blend.mouthPucker * 0.05;

      // 3. Teeth visibility
      upperTeethMesh.position.y = 0.02 - blend.teethExposure * 0.015;
    });

    const animate = () => {
      if (!isMounted) return;
      const elapsedTime = clock.getElapsedTime();

      // Natural Human Eye Blinking Logic
      blinkTimer += 0.016;
      if (blinkTimer > 3.8 + Math.sin(elapsedTime * 0.3) * 1.5) {
        isBlinking = true;
        blinkTimer = 0;
      }

      if (isBlinking) {
        blinkProgress += 0.18;
        const blinkAmount = Math.sin(blinkProgress * Math.PI);
        const lidRot = -Math.PI * 0.5 + blinkAmount * Math.PI * 0.5;
        leftEye.eyelidMesh.rotation.x = lidRot;
        rightEye.eyelidMesh.rotation.x = lidRot;

        if (blinkProgress >= 1.0) {
          isBlinking = false;
          blinkProgress = 0;
          leftEye.eyelidMesh.rotation.x = -Math.PI * 0.5;
          rightEye.eyelidMesh.rotation.x = -Math.PI * 0.5;
        }
      }

      // Natural Breathing & Kinematic Postural Shifts
      const breath = Math.sin(elapsedTime * 1.6);
      headGroup.position.y = breath * 0.018;
      headGroup.rotation.z = Math.sin(elapsedTime * 0.7) * 0.012;

      // Expressive Gestures based on Interaction State
      if (isSpeaking) {
        // Natural speech emphasis micro-nods synced with vocal energy
        const speechNod = Math.sin(elapsedTime * 9.0) * (liveMetrics.jawOpen * 0.035);
        headGroup.rotation.x = speechNod;
        headGroup.rotation.y = Math.cos(elapsedTime * 3.5) * 0.02;
      } else if (isListening) {
        // Engaged forward listening posture
        headGroup.rotation.x = 0.035;
        headGroup.rotation.y = 0;
        leftBrow.position.y = 0.645;
        rightBrow.position.y = 0.645;
      } else if (isThinking) {
        // Thoughtful upward glance
        headGroup.rotation.y = 0.06;
        headGroup.rotation.x = -0.04;
        leftBrow.position.y = 0.62;
        rightBrow.position.y = 0.65;
      } else {
        // Rest state
        headGroup.rotation.x = 0;
        headGroup.rotation.y = 0;
        leftBrow.position.y = 0.63;
        rightBrow.position.y = 0.63;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    // Handle Window / Container Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      unsub();
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
      renderer.dispose();
    };
  }, [personaId, isSpeaking, isListening, isThinking]);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      
      {/* 3D WebGL Avatar Viewport Canvas Container */}
      <div 
        ref={containerRef}
        className="w-80 h-96 sm:w-96 sm:h-104 relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-b from-[#0F172A] via-[#0A0F1D] to-[#040711] border border-white/15"
      />

      {/* Real-time Status Badge & ARKit Jaw Metric */}
      <div className="mt-3 flex items-center gap-2">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-md ${
          isSpeaking 
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
            : isListening 
              ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' 
              : isThinking 
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300' 
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isSpeaking ? 'bg-emerald-400 animate-ping' : isListening ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'
          }`} />

          <span>
            {isSpeaking 
              ? `${persona.name} Speaking (Edge Neural)` 
              : isListening 
                ? 'Listening to you...' 
                : isThinking 
                  ? 'Thinking...' 
                  : `${persona.name} Ready`}
          </span>

          {/* Real-time 3D Blendshape Jaw Meter */}
          {isSpeaking && liveMetrics.jawOpen > 0.05 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
              Jaw {(liveMetrics.jawOpen * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
