import * as THREE from 'three'; // Certifique-se de importar a biblioteca Three.js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export let melanciaModel;

export function loadMelanciaModel() {
    const loader = new GLTFLoader();
    loader.load(
        new URL('../../assets/modelos3D/melancia.glb', import.meta.url).href,
        (gltf) => {
            melanciaModel = gltf.scene;
            melanciaModel.scale.set(0.3, 0.3, 0.3); // Ajuste o tamanho da melancia
            melanciaModel.name = 'Melancia'; // Nome do modelo para fácil identificação
            console.log("Modelo de melancia carregado com sucesso!");
        },
        undefined,
        (error) => {
            console.error("Erro ao carregar o modelo de melancia:", error);
        }
    );
}

export function addMelanciasToMap(rollingGroundSphere, treesInPath, worldRadius) {
    if (!melanciaModel) return; // Certifica-se de que o modelo foi carregado
    const melancia = melanciaModel.clone(); // Cria uma cópia do modelo
    melancia.visible = true; // Torna visível

    let positionIsValid = false;
    let attempts = 0;

    while (!positionIsValid && attempts < 10) {
        // Gera uma posição aleatória ao longo do mapa
        const angle = Math.random() * Math.PI * 2;
        const radius = worldRadius - 0.5; // Ajuste o raio para posicionar no mapa
        const xPos = radius * Math.cos(angle);
        const zPos = radius * Math.sin(angle);

        // Verifica se há uma árvore na posição
        positionIsValid = treesInPath.every((tree) => {
            const treePos = new THREE.Vector3();
            treePos.setFromMatrixPosition(tree.matrixWorld);
            return treePos.distanceTo(new THREE.Vector3(xPos, 0, zPos)) > 2; // Distância mínima
        });

        if (positionIsValid) {
            // Posiciona a melancia
            melancia.position.set(xPos, 0.5, zPos); // Ajuste a altura (y) se necessário
            melancia.rotation.y = Math.random() * Math.PI * 2; // Rotação aleatória
            rollingGroundSphere.add(melancia); // Adiciona ao terreno
        }

        attempts++;
    }
}

export function checkMelanciaCollision(capivara, rollingGroundSphere, score, scoreText) {
    const capivaraBox = new THREE.Box3().setFromObject(capivara);

    rollingGroundSphere.children.forEach((child) => {
        if (child.name === 'Melancia' && child.visible) {
            const melanciaBox = new THREE.Box3().setFromObject(child);
            if (capivaraBox.intersectsBox(melanciaBox)) {
                // Colisão detectada
                child.visible = false; // Torna invisível
                score += 50; // Incrementa a pontuação
                scoreText.innerHTML = score.toString(); // Atualiza a pontuação
            }
        }
    });
}