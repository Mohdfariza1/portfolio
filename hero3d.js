// Hero 3D: the Bejaa wau (our logo mark, three bands, the teal top band lifted)
// as a glossy object, a wireframe floor rolling slowly in perspective, and a
// few low-poly pieces drifting. Draws only while the hero is on screen.
// three.js comes from the import map in index.php. If WebGL is missing the
// canvas stays hidden and the CSS grid behind it is the hero.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// init() can run again (the portfolio re-renders its home view); the old scene
// stops first so only one render loop ever runs.
let current = null;

function init() {
    if (current) current.stop();
    current = null;
    const canvas = document.querySelector('[data-hero-gl]');
    const frame = document.querySelector('[data-hero]');
    if (!canvas || !frame) return;
    let stopped = false;

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch (e) {
        renderer = null;
    }

    if (renderer) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;

        const scene = new THREE.Scene();
        const pmrem = new THREE.PMREMGenerator(renderer);
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

        const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        camera.position.set(0, 0.4, 14);

        const key = new THREE.DirectionalLight(0xffffff, 1.6);
        key.position.set(4, 6, 8);
        scene.add(key, new THREE.AmbientLight(0xffffff, 0.35));

        // ---- the wau, from the logo: kite (32,2)(58,25)(32,62)(6,25) on a 64 grid,
        // bands y 0–18 (teal), 24–42 and 45.5–64 (ink); gaps 18–24 and 42–45.5.
        const kite = [[32, 2], [58, 25], [32, 62], [6, 25]];
        const xAt = (y, side) => {
            // x of the kite edge at height y on the left (-1) or right (+1) side
            if (y <= 25) {
                const t = (y - 2) / 23;
                return 32 + side * 26 * t;
            }
            const t = (y - 25) / 37;
            return 32 + side * 26 * (1 - t);
        };
        const band = (y0, y1) => {
            const pts = [];
            const ys = [y0];
            if (y0 < 25 && y1 > 25) ys.push(25);
            ys.push(y1);
            ys.forEach((y) => pts.push([xAt(y, -1), y]));
            ys.slice().reverse().forEach((y) => pts.push([xAt(y, 1), y]));
            const shape = new THREE.Shape();
            pts.forEach(([x, y], i) => {
                const X = (x - 32) / 10, Y = (32 - y) / 10;
                if (i === 0) shape.moveTo(X, Y); else shape.lineTo(X, Y);
            });
            shape.closePath();
            const g = new THREE.ExtrudeGeometry(shape, { depth: 0.55, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.1, bevelSegments: 4 });
            g.translate(0, 0, -0.27);
            return g;
        };
        const teal = new THREE.MeshPhysicalMaterial({ color: 0x00a896, metalness: 0.15, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.06 });
        const ink = new THREE.MeshPhysicalMaterial({ color: 0x141a22, metalness: 0.35, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 });

        const wau = new THREE.Group();
        const top = new THREE.Mesh(band(2.2, 18), teal);
        const mid = new THREE.Mesh(band(24, 42), ink);
        const low = new THREE.Mesh(band(45.5, 61.6), ink);
        wau.add(top, mid, low);
        scene.add(wau);

        // ---- wireframe floor
        const floorGeo = new THREE.PlaneGeometry(60, 30, 64, 32);
        const floorMat = new THREE.MeshBasicMaterial({ color: 0x00a896, wireframe: true, transparent: true, opacity: 0.16 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2.25;
        floor.position.set(0, -3.6, -6);
        scene.add(floor);
        const base = floorGeo.attributes.position.array.slice();

        // ---- drifting low-poly pieces
        const bits = [];
        const bitMat = new THREE.MeshPhysicalMaterial({ color: 0xe6f6f3, metalness: 0, roughness: 0.25, transmission: 0.4, thickness: 0.5, clearcoat: 1 });
        const bitMatTeal = new THREE.MeshPhysicalMaterial({ color: 0x00a896, metalness: 0.1, roughness: 0.3, clearcoat: 1 });
        for (let i = 0; i < 9; i++) {
            const m = new THREE.Mesh(i % 3 ? new THREE.IcosahedronGeometry(0.16 + Math.random() * 0.18, 0) : new THREE.OctahedronGeometry(0.14 + Math.random() * 0.14, 0), i % 4 ? bitMat : bitMatTeal);
            // keep them off the text column: right half only
            m.position.set(1.8 + Math.random() * 5.5, (Math.random() - 0.45) * 6, -2 - Math.random() * 4);
            m.userData = { s: 0.2 + Math.random() * 0.5, o: Math.random() * 6.28 };
            bits.push(m);
            scene.add(m);
        }

        // ---- layout in screen pixels: the wau's centre and height on the hero.
        // Desktop: right of the headline, above the service cards. Phone: the
        // gap right of the WhatsApp link, between the button and the cards.
        // The kite is 6 units tall at scale 1.
        let homeY = 0;
        const resize = () => {
            const w = frame.clientWidth, h = frame.clientHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
            const halfW = halfH * camera.aspect;
            const narrow = w < 700;
            // A page can move the wau with data-wau="x,y,maxHeight" (fractions of
            // the hero, px cap) and data-wau-phone="x,yPx,heightPx" on the canvas.
            const d = ((narrow ? canvas.dataset.wauPhone : canvas.dataset.wau) || '').split(',').map(Number);
            const cx = narrow ? w * (d[0] || 0.875) : w * (d[0] || 0.76);
            const cy = narrow ? Math.min(h * 0.57, d[1] || 482) : h * (d[1] || 0.36);
            const ht = narrow ? (d[2] || 96) : Math.min(h * 0.46, d[2] || 420);
            bits.forEach((m) => { m.visible = !narrow; });
            wau.position.x = (cx / w * 2 - 1) * halfW;
            homeY = (1 - cy / h * 2) * halfH + camera.position.y;
            wau.position.y = homeY;
            wau.scale.setScalar((ht / h) * 2 * halfH / 6);
        };
        resize();
        window.addEventListener('resize', resize);

        // ---- mouse / tilt nudges the wau
        let mx = 0, my = 0, tx = 0, ty = 0;
        window.addEventListener('pointermove', (e) => {
            mx = (e.clientX / window.innerWidth) * 2 - 1;
            my = (e.clientY / window.innerHeight) * 2 - 1;
        }, { passive: true });

        // ---- draw only while visible
        let visible = true, running = false, last = 0, t = 0;
        const loop = (now) => {
            if (stopped || !frame.isConnected || !visible || document.hidden) { running = false; return; }
            const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
            last = now;
            t += dt;

            tx += (mx - tx) * 0.04;
            ty += (my - ty) * 0.04;
            wau.rotation.y = Math.sin(t * 0.45) * 0.55 + tx * 0.35;
            wau.rotation.x = -0.08 + ty * 0.18;
            wau.rotation.z = Math.sin(t * 0.3) * 0.05;
            wau.position.y += ((homeY + Math.sin(t * 0.9) * 0.12 * wau.scale.x) - wau.position.y) * 0.1;
            top.position.z = 0.35 + Math.sin(t * 1.1) * 0.12;
            top.position.y = 0.06 + Math.sin(t * 1.1) * 0.04;

            const pos = floorGeo.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const x = base[i * 3], y = base[i * 3 + 1];
                pos.array[i * 3 + 2] = Math.sin(x * 0.28 + t * 0.6) * 0.35 + Math.cos(y * 0.35 + t * 0.45) * 0.3;
            }
            pos.needsUpdate = true;

            bits.forEach((m) => {
                m.rotation.x += dt * m.userData.s;
                m.rotation.y += dt * m.userData.s * 0.7;
                m.position.y += Math.sin(t * m.userData.s + m.userData.o) * 0.002;
            });

            renderer.render(scene, camera);
            requestAnimationFrame(loop);
        };
        const start = () => {
            if (!running && visible && !document.hidden) {
                running = true;
                last = performance.now();
                requestAnimationFrame(loop);
            }
        };

        if ('IntersectionObserver' in window) {
            new IntersectionObserver((entries) => {
                visible = entries[0].isIntersecting;
                start();
            }).observe(frame);
        }
        document.addEventListener('visibilitychange', start);
        canvas.classList.add('is-on');
        start();
        current = {
            stop() {
                stopped = true;
                window.removeEventListener('resize', resize);
                document.removeEventListener('visibilitychange', start);
                renderer.dispose();
            },
        };
    }
}

window.bdHero3d = init;
init();
