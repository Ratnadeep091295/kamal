const fs = require('fs');

let content = fs.readFileSync('draft.html', 'utf8');

const cssOld =         #canvas-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 1;
            pointer-events: none;
            /* Remove CSS background so Three.js background colors work */
        }

        #scroll-container {
            position: relative;
            z-index: 2;
            height: 600vh;
            pointer-events: none;
        };

const cssNew =         #canvas-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 2; /* Above backgrounds */
            pointer-events: none;
        }

        #background-layers {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
        }

        .bg-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            opacity: 0;
            filter: blur(3px) brightness(0.9) contrast(0.95);
            transform: scale(1.05); /* Prevent blur bleed */
            transition: none; 
        }

        #scroll-container {
            position: relative;
            z-index: 3;
            height: 3000vh;
            pointer-events: none;
        };

content = content.replace(cssOld, cssNew);

const htmlOld =     <div id="canvas-container"></div>;
const htmlNew =     <div id="background-layers">
        <div class="bg-layer" id="bg-1" style="background-image: url('assets/images/backgrounds/bg_01_hero_1789625444983.jpg'); opacity: 1;"></div>
        <div class="bg-layer" id="bg-2" style="background-image: url('assets/images/backgrounds/bg_02_loading_facility_1789625464381.jpg');"></div>
        <div class="bg-layer" id="bg-3" style="background-image: url('assets/images/backgrounds/bg_03_loading_close_1789625483980.jpg');"></div>
        <div class="bg-layer" id="bg-4" style="background-image: url('assets/images/backgrounds/bg_04_departure_1789625496228.jpg');"></div>
        <div class="bg-layer" id="bg-5" style="background-image: url('assets/images/backgrounds/bg_05_highway_1789625511266.jpg');"></div>
        <div class="bg-layer" id="bg-6" style="background-image: url('assets/images/backgrounds/bg_06_forest_1789625529876.jpg');"></div>
        <div class="bg-layer" id="bg-7" style="background-image: url('assets/images/backgrounds/bg_07_landscape_1789625542652.jpg');"></div>
        <div class="bg-layer" id="bg-8" style="background-image: url('assets/images/backgrounds/bg_08_material_handling_1789625555996.jpg');"></div>
        <div class="bg-layer" id="bg-9" style="background-image: url('assets/images/backgrounds/bg_09_rear_unloading_1789625569305.jpg');"></div>
        <div class="bg-layer" id="bg-10" style="background-image: url('assets/images/backgrounds/bg_10_empty_facility_1789625582333.jpg');"></div>
        <div class="bg-layer" id="bg-11" style="background-image: url('assets/images/backgrounds/bg_11_return_road_1789625595020.jpg');"></div>
    </div>

    <div id="canvas-container"></div>;

content = content.replace(htmlOld, htmlNew);

const sceneColorsOld =             // Define premium sophisticated colors for the environments
            const colorSoftBlue = new THREE.Color('#6B8A9E'); // Soft, premium blue
            const colorDeepBlack = new THREE.Color('#111316'); // Sophisticated dark industrial
            const colorSoftOrange = new THREE.Color('#d17647'); // Dramatic, rich sunset

            // Proxy object for GSAP to animate colors
            const sceneState = {
                r: colorSoftBlue.r,
                g: colorSoftBlue.g,
                b: colorSoftBlue.b,
                roadSpeed: 0
            };

            scene.background = new THREE.Color(sceneState.r, sceneState.g, sceneState.b);
            scene.fog = new THREE.FogExp2(scene.background, 0.003);;

const sceneColorsNew =             // Proxy object for GSAP to animate road speed
            const sceneState = {
                roadSpeed: 0
            };

            // Transparent background so CSS backgrounds show through
            scene.background = null;
            scene.fog = null;;

content = content.replace(sceneColorsOld, sceneColorsNew);

content = content.replace('new THREE.WebGLRenderer({ antialias: true })', 'new THREE.WebGLRenderer({ antialias: true, alpha: true })');

const roadOld =             // --- 5. Environment (Road & Dockyard) ---
            function createRoadTexture() {
                const canvas = document.createElement('canvas');
                canvas.width = 1024;
                canvas.height = 1024;
                const ctx = canvas.getContext('2d');

                // Solid asphalt road color
                ctx.fillStyle = '#0a0a0a';
                ctx.fillRect(0, 0, 1024, 1024);

                // Single dashed white line in the center
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(502, 0, 20, 512);

                const tex = new THREE.CanvasTexture(canvas);
                tex.wrapS = THREE.RepeatWrapping;
                tex.wrapT = THREE.RepeatWrapping;
                // Repeat 1 time horizontally (one center line), 200 times vertically (for dashes)
                tex.repeat.set(1, 200);
                return tex;
            }

            const roadMaterial = new THREE.MeshStandardMaterial({
                map: createRoadTexture(),
                roughness: 0.9,
                color: 0x888888 // Base tint
            });
            const roadGeometry = new THREE.PlaneGeometry(200, 2000);
            const road = new THREE.Mesh(roadGeometry, roadMaterial);
            road.rotation.x = -Math.PI / 2;
            road.position.y = -0.05;
            road.receiveShadow = true;
            scene.add(road);

            const dockyardGroup = new THREE.Group();

            const buildingGeo = new THREE.BoxGeometry(1, 1, 1);
            const matNavy = new THREE.MeshStandardMaterial({ color: 0x1c355e });
            const building = new THREE.Mesh(buildingGeo, matNavy);
            building.scale.set(40, 50, 80);
            building.position.set(60, 25, 40);
            building.castShadow = true;
            dockyardGroup.add(building);

            const pileGeo = new THREE.ConeGeometry(30, 20, 32);
            const matDark = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 1 });
            const pile = new THREE.Mesh(pileGeo, matDark);
            pile.position.set(-20, 10, 80);
            pile.castShadow = true;
            dockyardGroup.add(pile);

            scene.add(dockyardGroup);;

const roadNew =             // --- 5. Environment (Road Shadow Catcher) ---
            const roadMaterial = new THREE.ShadowMaterial({ opacity: 0.7 });
            const roadGeometry = new THREE.PlaneGeometry(200, 2000);
            const road = new THREE.Mesh(roadGeometry, roadMaterial);
            road.rotation.x = -Math.PI / 2;
            road.position.y = -0.05;
            road.receiveShadow = true;
            scene.add(road);;

content = content.replace(roadOld, roadNew);
content = content.replace('dockyardGroup.position.y = -size.y / 2;', '');

// GSAP replace
const gsapRegex = /\/\/ --- 7\. GSAP ScrollTrigger Sequence ---[\s\S]*?\/\/ --- 8\. Render Loop ---/;
const gsapNew = // --- 7. GSAP ScrollTrigger Sequence ---
            function setupScrollAnimation(model, modelSize) {
                const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);

                // Define some cinematic camera positions
                const posHero = { x: maxDim * 1.5, y: maxDim * 0.2, z: 0 };
                const posLoadingClose = { x: maxDim * 0.8, y: maxDim * 0.5, z: maxDim * 0.6 };
                const posDeparture = { x: maxDim * 1.2, y: maxDim * 0.1, z: -maxDim * 0.8 };
                const posHighway = { x: maxDim * 0.8, y: maxDim * 0.3, z: maxDim * 1.2 };
                const posForest = { x: maxDim * 1.0, y: maxDim * 0.2, z: maxDim * 1.0 };
                const posLandscape = { x: maxDim * 2.0, y: maxDim * 0.8, z: 0 };
                const posRear = { x: -maxDim * 0.4, y: maxDim * 0.4, z: maxDim * 1.8 };
                const posEmpty = { x: maxDim * 1.0, y: maxDim * 0.3, z: -maxDim * 1.0 };

                camera.position.set(posHero.x, posHero.y, posHero.z);
                camera.lookAt(cameraTarget);

                // Set initial text and backgrounds
                gsap.set("#text-start", { opacity: 1, y: 0 });
                gsap.set("#bg-1", { opacity: 1 });

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: "#scroll-container",
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1,
                    }
                });

                // The 12 phases
                // 1 -> 2: Hero to Loading Facility
                tl.to("#text-start", { opacity: 0, y: -30, duration: 0.3 }, "p1")
                  .to("#bg-1", { opacity: 0, duration: 1 }, "p1")
                  .to("#bg-2", { opacity: 1, duration: 1 }, "p1")
                  .to(camera.position, { x: posLoadingClose.x, y: posLoadingClose.y, z: posLoadingClose.z, ease: "power1.inOut", duration: 1 }, "p1")
                  .to(cameraTarget, { x: maxDim * 0.1, z: maxDim * 0.2, ease: "power1.inOut", duration: 1 }, "p1")
                  .to("#text-loading", { opacity: 1, y: 0, duration: 0.5 }, "p1+=0.5");

                // 2 -> 3: Loading Facility to Loading Close
                tl.to("#bg-2", { opacity: 0, duration: 1 }, "p2")
                  .to("#bg-3", { opacity: 1, duration: 1 }, "p2")
                  .to(camera.position, { x: posLoadingClose.x * 0.8, y: posLoadingClose.y * 1.2, z: posLoadingClose.z * 1.2, ease: "power1.inOut", duration: 1 }, "p2");

                // 3 -> 4: Loading Close to Departure
                tl.to("#text-loading", { opacity: 0, y: -30, duration: 0.3 }, "p3")
                  .to("#bg-3", { opacity: 0, duration: 1 }, "p3")
                  .to("#bg-4", { opacity: 1, duration: 1 }, "p3")
                  .to(sceneState, { roadSpeed: 0.15, duration: 0.5 }, "p3")
                  .to(camera.position, { x: posDeparture.x, y: posDeparture.y, z: posDeparture.z, ease: "power2.inOut", duration: 1 }, "p3")
                  .to(cameraTarget, { x: 0, y: 0, z: 0, ease: "power1.inOut", duration: 1 }, "p3");

                // 4 -> 5: Departure to Highway
                tl.to("#bg-4", { opacity: 0, duration: 1 }, "p4")
                  .to("#bg-5", { opacity: 1, duration: 1 }, "p4")
                  .to(camera.position, { x: posHighway.x, y: posHighway.y, z: posHighway.z, ease: "power1.inOut", duration: 1 }, "p4")
                  .to("#text-journey", { opacity: 1, y: 0, duration: 0.5 }, "p4+=0.5");

                // 5 -> 6: Highway to Forest
                tl.to("#bg-5", { opacity: 0, duration: 1 }, "p5")
                  .to("#bg-6", { opacity: 1, duration: 1 }, "p5")
                  .to(camera.position, { x: posForest.x, y: posForest.y, z: posForest.z, ease: "power1.inOut", duration: 1 }, "p5");

                // 6 -> 7: Forest to Landscape
                tl.to("#text-journey", { opacity: 0, y: -30, duration: 0.3 }, "p6")
                  .to("#bg-6", { opacity: 0, duration: 1 }, "p6")
                  .to("#bg-7", { opacity: 1, duration: 1 }, "p6")
                  .to(camera.position, { x: posLandscape.x, y: posLandscape.y, z: posLandscape.z, ease: "power1.inOut", duration: 1 }, "p6");

                // 7 -> 8: Landscape to Material Handling
                tl.to("#bg-7", { opacity: 0, duration: 1 }, "p7")
                  .to("#bg-8", { opacity: 1, duration: 1 }, "p7")
                  .to(camera.position, { x: posDeparture.x, y: posDeparture.y, z: posDeparture.z, ease: "power1.inOut", duration: 1 }, "p7")
                  .to(sceneState, { roadSpeed: 0, duration: 0.8 }, "p7");

                // 8 -> 9: Material Handling to Rear Unloading
                tl.to("#bg-8", { opacity: 0, duration: 1 }, "p8")
                  .to("#bg-9", { opacity: 1, duration: 1 }, "p8")
                  .to(camera.position, { x: posRear.x, y: posRear.y, z: posRear.z, ease: "power2.inOut", duration: 1 }, "p8")
                  .to(cameraTarget, { x: 0, y: maxDim * 0.2, z: maxDim * 0.5, ease: "power1.inOut", duration: 1 }, "p8")
                  .to("#text-waste", { opacity: 1, y: 0, duration: 0.5 }, "p8+=0.5");

                // 9 -> 10: Rear Unloading to Empty Facility
                tl.to("#text-waste", { opacity: 0, y: -30, duration: 0.3 }, "p9")
                  .to("#bg-9", { opacity: 0, duration: 1 }, "p9")
                  .to("#bg-10", { opacity: 1, duration: 1 }, "p9")
                  .to(camera.position, { x: posEmpty.x, y: posEmpty.y, z: posEmpty.z, ease: "power1.inOut", duration: 1 }, "p9")
                  .to(cameraTarget, { x: 0, y: 0, z: 0, ease: "power1.inOut", duration: 1 }, "p9");

                // 10 -> 11: Empty Facility to Return Road
                tl.to("#bg-10", { opacity: 0, duration: 1 }, "p10")
                  .to("#bg-11", { opacity: 1, duration: 1 }, "p10")
                  .to(sceneState, { roadSpeed: 0.15, duration: 0.5 }, "p10")
                  .to(camera.position, { x: posHighway.x, y: posHighway.y, z: posHighway.z, ease: "power1.inOut", duration: 1 }, "p10");

                // 11 -> 12: Return Road to Hero (bg-1)
                tl.to("#bg-11", { opacity: 0, duration: 1 }, "p11")
                  .to("#bg-1", { opacity: 1, duration: 1 }, "p11")
                  .to(camera.position, { x: posHero.x, y: posHero.y, z: posHero.z, ease: "power1.inOut", duration: 1 }, "p11")
                  .to(sceneState, { roadSpeed: 0, duration: 0.5 }, "p11")
                  .to("#text-start", { opacity: 1, y: 0, duration: 0.5 }, "p11+=0.5");

                gsap.ticker.add(() => {
                    camera.lookAt(cameraTarget);
                });
            }

            // --- 8. Render Loop ---;

content = content.replace(gsapRegex, gsapNew);

fs.writeFileSync('draft.html', content);
console.log('Successfully updated draft.html via node script');
