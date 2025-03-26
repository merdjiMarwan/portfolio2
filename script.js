import * as THREE from 'https://esm.sh/three@0.152.2';
import { GLTFLoader } from 'https://esm.sh/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://esm.sh/three@0.152.2/examples/jsm/controls/OrbitControls.js';

// Création de la page de chargement
const loaderContainer = document.createElement('div');
loaderContainer.id = 'loader-container';
loaderContainer.innerHTML = `<div class="pokeball"></div>`;
document.body.appendChild(loaderContainer);

// Ajouter un style CSS pour l'animation et le curseur personnalisé
const style = document.createElement('style');
style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'); 

    body {
        margin: 0;
        overflow: hidden;
        cursor: none;
    }
    #loader-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        background-image: url('src/fond.jpg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        transition: opacity 0.5s ease-in-out, visibility 0.5s ease-in-out;
    }
    .pokeball {
        width: 100px;
        height: 100px;
        background: radial-gradient(circle at center, red 50%, white 50%);
        border: 4px solid black;
        border-radius: 50%;
        position: absolute;
        bottom: 10%;
        left: 10%;
        animation: bounce 1.2s infinite;
    }
    .pokeball::after {
        content: '';
        width: 30px;
        height: 30px;
        background: white;
        border: 4px solid black;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }
    @keyframes slideOut {
        0% { transform: translate(0, 0); opacity: 1; }
        100% { transform: translate(100vw, -100vh) scale(0.5); opacity: 0; }
    }
    #custom-cursor {
        position: fixed;
        width: 50px;
        height: 50px;
        background: orange;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-family: Arial, sans-serif;
        color: white;
        font-weight: bold;
        pointer-events: none;
        transform: translate(-50%, -50%);
        transition: transform 0.1s ease-out;
    }
    #custom-cursor::after {
        content: '';
        width: 6px;
        height: 6px;
        background: white;
        border-radius: 50%;
        position: absolute;
    }
`;
document.head.appendChild(style);

// Création de la scène
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(-0.6, 0.4, 1.2);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lumières
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Définir la couleur du ciel en gris clair
scene.background = new THREE.Color(0xB0B0B0);

// Création du curseur personnalisé
const cursor = document.createElement('div');
cursor.id = 'custom-cursor';
cursor.innerHTML = '<span>Visite</span>';
document.body.appendChild(cursor);

// Déplacement du curseur personnalisé avec la souris
document.addEventListener('mousemove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
});

// Chargement du modèle
const loader = new GLTFLoader();
let pokemonModel = null;

loader.load('pc.glb', (gltf) => {
    pokemonModel = gltf.scene;

    console.log("Objets chargés :", pokemonModel.children.map(obj => obj.name || "Sans nom"));

    if (pokemonModel.children.length > 0) {
        pokemonModel.children[0].name = "ecran-haut";
    }
    if (pokemonModel.children.length > 1) {
        pokemonModel.children[1].name = "ecran-bas";
    }
    if (pokemonModel.children.length > 2) {
        pokemonModel.children[2].name = "portfolio";
    }

    scene.add(pokemonModel);
    const box = new THREE.Box3().setFromObject(pokemonModel);
    const center = box.getCenter(new THREE.Vector3());
    camera.lookAt(center);

    const pokeball = document.querySelector('.pokeball');
    pokeball.style.animation = 'slideOut 1s forwards';

    setTimeout(() => {
        loaderContainer.style.opacity = '0';
        setTimeout(() => {
            loaderContainer.style.display = 'none';
        }, 500);
    }, 1000);
}, undefined, (error) => {
    console.error('❌ Erreur de chargement du modèle:', error);
});

// Contrôles de la caméra
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;

// Raycaster pour détecter les clics et le survol des objets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        if (hoveredObject.name === "ecran-haut" || hoveredObject.name === "ecran-bas") {
            cursor.innerHTML = '<span>Cliquez pour voir Projet Pokedex</span>';
        } else if (hoveredObject.name === "portfolio") {
            cursor.innerHTML = '<span>View Portfolio</span>';
        } else {
            cursor.innerHTML = '<span>Visite</span>';
        }
    } else {
        cursor.innerHTML = '<span>Visite</span>';
    }
});

window.addEventListener('click', (event) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        if (selectedObject.name === "ecran-haut" || selectedObject.name === "ecran-bas") {
            zoomAndRedirect(selectedObject, "none");
        } else if (selectedObject.name === "portfolio") {
            zoomAndRedirect(selectedObject, "https://marwan-merdji-portfolio.netlify.app/");
        }
    }
});

function zoomAndRedirect(object, url) {
    const targetPosition = new THREE.Vector3();
    object.getWorldPosition(targetPosition);

    const duration = 1000;
    const start = performance.now();
    const initialPosition = camera.position.clone();

    function animateZoom(time) {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);

        camera.position.lerpVectors(initialPosition, targetPosition.clone().add(new THREE.Vector3(0, 0, -0,61)), progress);
        camera.lookAt(targetPosition);

        if (progress < 1) {
            requestAnimationFrame(animateZoom);
        } else {
            setTimeout(() => {
                window.open(url, '_blank');

            }, 500);
        }
    }
    requestAnimationFrame(animateZoom);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();