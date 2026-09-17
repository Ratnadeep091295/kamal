
        gsap.registerPlugin(ScrollTrigger);

        if (window.innerWidth >= 1024) {
            init3D();
        }
        function createRoadTexture(renderer) {
            const canvas = document.createElement('canvas');

            // Texture dimensions
            canvas.width = 1024;
            canvas.height = 2048;

            const ctx = canvas.getContext('2d');

            // ==========================================
            // 1. ASPHALT BASE
            // ==========================================

            ctx.fillStyle = '#202020';
            ctx.fillRect(0, 0, canvas.width, canvas.height);


            // ==========================================
            // 2. FINE ASPHALT GRAIN
            // ==========================================

            for (let i = 0; i < 70000; i++) {

                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;

                const shade = Math.floor(Math.random() * 40) + 18;

                ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;

                const size = Math.random() * 2 + 0.4;

                ctx.fillRect(x, y, size, size);
            }


            // ==========================================
            // 3. SUBTLE ASPHALT SPECKLES
            // ==========================================

            for (let i = 5000; i > 0; i--) {

                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;

                ctx.fillStyle = 'rgba(255,255,255,0.06)';

                const size = Math.random() * 2;

                ctx.fillRect(x, y, size, size);
            }


            // ==========================================
            // 4. LEFT YELLOW EDGE LINE
            // ==========================================

            ctx.fillStyle = '#e6bd16';

            ctx.fillRect(
                45,
                0,
                30,
                canvas.height
            );


            // ==========================================
            // 5. RIGHT YELLOW EDGE LINE
            // ==========================================

            ctx.fillRect(
                canvas.width - 75,
                0,
                30,
                canvas.height
            );


            // ==========================================
            // 6. CENTER WHITE DASHED LINE
            // ==========================================

            ctx.fillStyle = '#eeeeee';

            const centerX = canvas.width / 2;

            const dashWidth = 18;
            const dashLength = 90;
            const dashGap = 130;

            for (
                let y = 0;
                y < canvas.height;
                y += dashLength + dashGap
            ) {

                ctx.fillRect(
                    centerX - dashWidth / 2,
                    y,
                    dashWidth,
                    dashLength
                );
            }


            // ==========================================
            // 7. THREE.JS TEXTURE
            // ==========================================

            const texture = new THREE.CanvasTexture(canvas);

            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;

            // Repeat along road length
            texture.repeat.set(1, 20);

            // Three.js r128 uses encoding
            texture.encoding = THREE.sRGBEncoding;

            // Anisotropic filtering
            if (renderer) {
                texture.anisotropy =
                    renderer.capabilities.getMaxAnisotropy();
            }

            texture.needsUpdate = true;

            return texture;
        }

        function init3D() {
            const container = document.getElementById('canvas-container');
            const loadingEl = document.getElementById('loading');

            // --- 1. Scene Setup ---
            const scene = new THREE.Scene();
            scene.background = new THREE.Color('#f8f9fa'); // White background per references
            // No fog so it looks like a clean graphic design

            // --- 2. Camera Setup ---
            const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 5000);
            const cameraRig = new THREE.Group();
            scene.add(cameraRig);
            cameraRig.add(camera);

            // --- 3. Renderer Setup ---
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.outputEncoding = THREE.sRGBEncoding;
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            container.appendChild(renderer.domElement);

            // --- 4. Lighting ---
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
            scene.add(ambientLight);

            const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
            dirLight.position.set(100, 300, 100);
            dirLight.castShadow = true;
            dirLight.shadow.mapSize.width = 2048;
            dirLight.shadow.mapSize.height = 2048;
            dirLight.shadow.camera.near = 0.5;
            dirLight.shadow.camera.far = 1000;
            const d = 300;
            dirLight.shadow.camera.left = -d;
            dirLight.shadow.camera.right = d;
            dirLight.shadow.camera.top = d;
            dirLight.shadow.camera.bottom = -d;
            scene.add(dirLight);

            // --- 5. Road Generation ---
            // Create a long curving path
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),             // Start (Scene 1)
                new THREE.Vector3(-200, 0, -400),       // Loading Site (Scene 2)
                new THREE.Vector3(-500, 0, -1000),      // Curve
                new THREE.Vector3(200, 0, -1800),       // Curve
                new THREE.Vector3(500, 0, -2500),       // Waste Facility (Scene 4)
                new THREE.Vector3(0, 0, -3200)          // End (Scene 5)
            ]);

            function createRoadGeometry(curve, segments, width) {
                const geometry = new THREE.BufferGeometry();
                const vertices = [];
                const uvs = [];
                const indices = [];
                const points = curve.getPoints(segments);

                for (let i = 0; i <= segments; i++) {
                    const p = points[i];
                    let tangent = curve.getTangent(i / segments);
                    tangent.y = 0;
                    tangent.normalize();

                    const normal = new THREE.Vector3(0, 1, 0);
                    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

                    const pLeft = p.clone().add(binormal.clone().multiplyScalar(-width / 2));
                    const pRight = p.clone().add(binormal.clone().multiplyScalar(width / 2));
                    pLeft.y = 0;
                    pRight.y = 0;

                    vertices.push(pLeft.x, pLeft.y, pLeft.z);
                    vertices.push(pRight.x, pRight.y, pRight.z);

                    const v = i / segments;
                    uvs.push(0, v);
                    uvs.push(1, v);
                }

                for (let i = 0; i < segments; i++) {
                    const a = i * 2;
                    const b = i * 2 + 1;
                    const c = (i + 1) * 2;
                    const d = (i + 1) * 2 + 1;
                    indices.push(a, c, b);
                    indices.push(b, c, d);
                }

                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                geometry.setIndex(indices);
                geometry.computeVertexNormals();
                return geometry;
            }

            const roadTexture = createRoadTexture();
            const roadGeom = createRoadGeometry(curve, 300, 300); // 300 width to cover whole width

            const roadMat = new THREE.MeshStandardMaterial({
                map: roadTexture,
                roughness: 0.9,
                metalness: 0.1,
                side: THREE.DoubleSide
            });
            const roadMesh = new THREE.Mesh(roadGeom, roadMat);
            roadMesh.receiveShadow = true;
            roadMesh.position.y = 0.1; // Slightly above ground
            scene.add(roadMesh);

            // Base ground plane (White/light grey to catch shadows)
            const groundGeo = new THREE.PlaneGeometry(10000, 10000);
            const groundMat = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 1 });
            const ground = new THREE.Mesh(groundGeo, groundMat);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            scene.add(ground);

            // --- 6. Coal Meshes (Programmatic) ---
            // Coal inside trailer (scaled way down so it doesn't hide the truck)
            const coalGeo = new THREE.BoxGeometry(4, 1.5, 10);
            const coalMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.9 }); // Gray pile
            const internalCoal = new THREE.Mesh(coalGeo, coalMat);
            internalCoal.position.set(0, 20, 0);
            // We will attach this to the truck once it loads

            // Coal pile on ground at Unloading site
            const pileGeo = new THREE.ConeGeometry(30, 20, 16);
            const groundCoal = new THREE.Mesh(pileGeo, coalMat);
            groundCoal.castShadow = true;
            groundCoal.receiveShadow = true;

            // Place it at the Unloading site (Curve point 4)
            const unloadPoint = curve.getPointAt(0.78); // Approx near index 4
            groundCoal.position.copy(unloadPoint);
            groundCoal.position.y = 5;
            // Shift it slightly backwards so it's behind the truck, but centered enough not to get cut
            const unloadTangent = curve.getTangentAt(0.78);
            groundCoal.position.addScaledVector(unloadTangent, -40);
            groundCoal.scale.set(0, 0, 0); // Starts empty
            scene.add(groundCoal);

            // --- 7. Load Models ---
            const loader = new THREE.GLTFLoader();
            const objLoader = new THREE.OBJLoader();
            const textureLoader = new THREE.TextureLoader();

            let truckModel, jcbModel;
            let truckSize;
            let mixer;
            let gltfAnimations = [];

            // State for GSAP
            const sceneState = {
                progress: 0,
                camRadius: 150,
                camHeight: 50,
                camTheta: Math.PI / 2, // Side view initially
                animProgress: 0, // Truck mechanical animations
                coalScale: 1, // Full coal inside
                pileScale: 0, // Empty pile outside
                jcbDist: 100 // Distance of JCB from truck
            };

            let assetsLoaded = 0;
            function checkLoad() {
                assetsLoaded++;
                if (assetsLoaded === 2) {
                    loadingEl.style.display = 'none';
                    setupScrollAnimation();
                }
            }
            
            window.clock = new THREE.Clock();

            loader.load(
                '3d model/Truck Anim_04.glb',
                function (gltf) {
                    truckModel = gltf.scene;

                    truckModel.traverse((node) => {
                        if (node.isMesh) {
                            node.castShadow = true;
                            node.receiveShadow = true;
                            if (node.material) node.material.envMapIntensity = 1.0;
                        }
                    });

                    const box = new THREE.Box3().setFromObject(truckModel);
                    let size = box.getSize(new THREE.Vector3());
                    let center = box.getCenter(new THREE.Vector3());

                    // Normalize Truck Scale so it is always exactly 100 units long (prevents camera clipping bugs)
                    const maxRawDim = Math.max(size.x, size.y, size.z);
                    const targetScale = 100 / maxRawDim;
                    truckModel.scale.set(targetScale, targetScale, targetScale);

                    // Re-calculate after scaling
                    box.setFromObject(truckModel);
                    truckSize = box.getSize(new THREE.Vector3());
                    center = box.getCenter(new THREE.Vector3());

                    // Center pivot
                    truckModel.position.x = -center.x;
                    truckModel.position.y = -center.y + (truckSize.y / 2);
                    truckModel.position.z = -center.z;
                    truckModel.rotation.y = Math.PI / 2;

                    const truckContainer = new THREE.Group();
                    truckContainer.add(truckModel);

                    // Add internal coal to trailer
                    internalCoal.position.set(0, 15, -10); // Adjust to sit inside Deloupe trailer
                    truckContainer.add(internalCoal);

                    scene.add(truckContainer);
                    truckModel = truckContainer; // Reassign reference so rig follows container

                    if (gltf.animations && gltf.animations.length > 0) {
                        mixer = new THREE.AnimationMixer(gltf.scene);
                        window.wheelActions = [];
                        window.doorAction = null;

                        let doorClip = null;
                        let wheelClips = [];
                        
                        gltf.animations.forEach(clip => {
                            const name = clip.name.toLowerCase();
                            if (name.includes('door') || name.includes('back') || name.includes('open')) {
                                doorClip = clip;
                            } else {
                                wheelClips.push(clip);
                            }
                        });

                        // Fallback: if no door identified by name, assume the longest animation is the door
                        if (!doorClip && gltf.animations.length > 0) {
                            doorClip = gltf.animations.reduce((prev, current) => (prev.duration > current.duration) ? prev : current);
                            wheelClips = gltf.animations.filter(c => c !== doorClip);
                        }

                        if (doorClip) {
                            sceneState.maxAnimDuration = doorClip.duration;
                            const action = mixer.clipAction(doorClip);
                            action.timeScale = 0; // Prevent natural playback
                            action.play();
                            window.doorAction = action;
                        }

                        wheelClips.forEach(clip => {
                            const action = mixer.clipAction(clip);
                            action.play();
                            window.wheelActions.push(action);
                        });
                    }

                    checkLoad();
                }
            );

            // Load JCB
            const jcbMat = new THREE.MeshStandardMaterial({
                map: textureLoader.load('3d model/JCB truck/texture_diffuse.png'),
                normalMap: textureLoader.load('3d model/JCB truck/texture_normal.png'),
                roughnessMap: textureLoader.load('3d model/JCB truck/texture_roughness.png'),
                metalnessMap: textureLoader.load('3d model/JCB truck/texture_metallic.png'),
                color: 0xffffff
            });

            objLoader.load(
                '3d model/JCB truck/base.obj',
                function (obj) {
                    jcbModel = obj;
                    jcbModel.traverse((node) => {
                        if (node.isMesh) {
                            node.material = jcbMat;
                            node.castShadow = true;
                            node.receiveShadow = true;
                        }
                    });

                    const box = new THREE.Box3().setFromObject(jcbModel);
                    const size = box.getSize(new THREE.Vector3());
                    const center = box.getCenter(new THREE.Vector3());

                    // Normalize scale to match the normalized truck (truck is ~100 max, JCB should be ~25 high)
                    const scale = 25 / size.y;
                    jcbModel.scale.set(scale, scale, scale);
                    jcbModel.position.y = (-center.y * scale) + (size.y * scale / 2);

                    scene.add(jcbModel);
                    checkLoad();
                }
            );

            // --- 8. GSAP ScrollTrigger Sequence ---
            function setupScrollAnimation() {
                // Determine animation max duration
                let maxDuration = 0;
                gltfAnimations.forEach(clip => {
                    if (clip.duration > maxDuration) maxDuration = clip.duration;
                });
                sceneState.maxAnimDuration = maxDuration;

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: "#scroll-container",
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1,
                    }
                });

                const maxDim = Math.max(truckSize.x, truckSize.y, truckSize.z);
                // Zoom camera in significantly (cover 50% screen)
                const baseCamRadius = maxDim * 1.5;
                const baseCamHeight = maxDim * 0.4;

                // Setup Initial State (Scene 1: Hero Side Profile)
                sceneState.camTheta = Math.PI / 2; // Side
                sceneState.camHeight = baseCamHeight;
                sceneState.camRadius = baseCamRadius;

                // --- SCENE 1 to 2: Drive to Loading Site ---
                tl.to(sceneState, { progress: 0.15, ease: "power2.inOut", duration: 3 }, "start");

                // JCB comes in to load
                tl.to(sceneState, { jcbDist: 30, ease: "power2.out", duration: 1 }, "start+=2");

                // Camera does Circular Motion around truck during loading (orbit 360 degrees)
                tl.to(sceneState, {
                    camTheta: (Math.PI / 2) + (Math.PI * 2), // Orbit full circle
                    ease: "power1.inOut",
                    duration: 3
                }, "start+=3");

                tl.to(sceneState, { jcbDist: 100, ease: "power2.in", duration: 1 }, "start+=6"); // JCB leaves

                // --- SCENE 2 to 3: The Graphic Journey (United Carriers style) ---
                // Camera shifts to top-down / isometric view
                tl.to(sceneState, {
                    camTheta: (Math.PI / 2) + (Math.PI * 2) + Math.PI, // Back / isometric
                    camHeight: maxDim * 2.5, // Closer top-down
                    camRadius: maxDim * 2.0, // Closer radius
                    ease: "power2.inOut",
                    duration: 2
                }, "start+=7");

                // Truck drives long distance
                tl.to(sceneState, { progress: 0.78, ease: "none", duration: 6 }, "start+=8");

                // --- SCENE 3 to 4: Unloading at Waste Facility ---
                // Camera orbits back down to view the rear doors
                tl.to(sceneState, {
                    camTheta: (Math.PI / 2) + (Math.PI * 2) + Math.PI, // Directly behind
                    camHeight: maxDim * 1.5, // Slightly higher
                    camRadius: maxDim * 2.5, // Slightly further back to fit dumping element
                    ease: "power2.inOut",
                    duration: 2
                }, "start+=13");

                // Mechanical animations trigger (doors open, conveyor runs)
                tl.to(sceneState, { animProgress: 1, ease: "none", duration: 4 }, "start+=15");

                // Coal simulation: internal coal shrinks, ground pile grows
                tl.to(sceneState, { coalScale: 0.1, ease: "none", duration: 3 }, "start+=15.5");
                tl.to(sceneState, { pileScale: 1.0, ease: "none", duration: 3 }, "start+=15.5");

                // --- SCENE 4 to 5: Drive to End & Return to Hero Angle ---
                tl.to(sceneState, { progress: 1.0, ease: "power2.inOut", duration: 3 }, "start+=19");
                tl.to(sceneState, {
                    camTheta: (Math.PI / 2) + (Math.PI * 2) + (Math.PI * 2), // Full 360 wrap back to Side hero profile
                    camHeight: baseCamHeight,
                    camRadius: baseCamRadius,
                    ease: "power2.inOut",
                    duration: 2
                }, "start+=20");

                // --- TEXT ANIMATIONS (Premium Smoky/Horizontal Fade) ---
                const sections = document.querySelectorAll('.section');
                sections.forEach((sec, i) => {
                    gsap.to(sec.querySelectorAll('h1, p'), {
                        scrollTrigger: {
                            trigger: sec,
                            start: "top center",
                            end: "bottom top",
                            scrub: 1
                        },
                        opacity: 1,
                        x: 0, // Horizontal movement to 0
                        filter: "blur(0px)",
                        stagger: 0.2,
                        ease: "power2.out"
                    });
                });
            }

            // --- 9. Render Loop ---
            const truckPos = new THREE.Vector3();
            const truckTangent = new THREE.Vector3();
            const jcbPos = new THREE.Vector3();

            function animate() {
                requestAnimationFrame(animate);

                if (truckModel) {
                    // Update Truck Position along curve
                    curve.getPointAt(sceneState.progress, truckPos);
                    curve.getTangentAt(sceneState.progress, truckTangent);

                    truckModel.position.copy(truckPos);

                    // Make truck look along the curve
                    const lookAtTarget = truckPos.clone().add(truckTangent);
                    truckModel.lookAt(lookAtTarget);

                    // Update Camera Position relative to Truck
                    // Theta is relative to the truck's forward tangent
                    const angle = Math.atan2(truckTangent.x, truckTangent.z); // Current yaw of truck
                    const finalTheta = angle + sceneState.camTheta;

                    camera.position.x = truckPos.x + (Math.sin(finalTheta) * sceneState.camRadius);
                    camera.position.z = truckPos.z + (Math.cos(finalTheta) * sceneState.camRadius);
                    camera.position.y = truckPos.y + sceneState.camHeight;

                    // Look at the truck, but slightly forward so it's not perfectly centered in top-down
                    const camLook = truckPos.clone().add(truckTangent.clone().multiplyScalar(50));
                    camera.lookAt(camLook);

                    // Update Coal Scales
                    internalCoal.scale.z = sceneState.coalScale;
                    // Move internal coal backwards as it shrinks to simulate conveyor
                    internalCoal.position.z = -10 + (1 - sceneState.coalScale) * -40;

                    groundCoal.scale.set(sceneState.pileScale, sceneState.pileScale, sceneState.pileScale);

                    // Update JCB Position (Positioned near the loading site at progress = 0.15)
                    if (jcbModel) {
                        const loadPoint = curve.getPointAt(0.15);
                        const loadTangent = curve.getTangentAt(0.15);

                        // JCB offset perpendicular to road
                        const rightVec = new THREE.Vector3(-loadTangent.z, 0, loadTangent.x);
                        jcbPos.copy(loadPoint).add(rightVec.multiplyScalar(sceneState.jcbDist));

                        jcbModel.position.copy(jcbPos);
                        jcbModel.lookAt(loadPoint);
                    }

                    // Scrub Mechanical Animations
                    if (mixer) {
                        const delta = window.clock.getDelta();
                        
                        // Calculate truck speed to control wheel spin rate
                        let speed = 0;
                        if (window.lastProgress !== undefined) {
                            speed = Math.abs(sceneState.progress - window.lastProgress) * 5000;
                        }
                        window.lastProgress = sceneState.progress;

                        // Set wheel speed
                        if (window.wheelActions) {
                            window.wheelActions.forEach(action => {
                                action.setEffectiveTimeScale(speed);
                            });
                        }

                        // Set door animation frame
                        if (window.doorAction && sceneState.maxAnimDuration > 0) {
                            window.doorAction.time = sceneState.animProgress * sceneState.maxAnimDuration;
                        }

                        mixer.update(delta);
                    }
                }

                renderer.render(scene, camera);
            }
            animate();

            // --- 10. Resize ---
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }
    
