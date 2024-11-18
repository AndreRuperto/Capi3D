import * as THREE from 'three';
import { 
    worldRadius, 
    sphericalHelper, 
    rollingGroundSphere, 
    pathAngleValues,
} from './main';

export var treesInPath=[];
export var treesPool=[];

export function createTreesPool(){
	var maxTreesInPool=10;
	var newTree;
	for(var i=0; i<maxTreesInPool;i++){
		newTree=createTree();
		treesPool.push(newTree);
	}
}

export function addWorldTreesWithSafeZone() {
    var numTrees = 36;
    var gap = 6.28 / numTrees;
    var safeZoneRadius = 5;  // Define a zona segura ao redor do personagem

    for (var i = 0; i < numTrees; i++) {
        var angle = i * gap;

        // Calcula a posição da árvore
        var xPos = worldRadius * Math.sin(angle);
        var zPos = worldRadius * Math.cos(angle);

        // Verifica se a árvore está fora da zona segura
        if (Math.sqrt(xPos * xPos + zPos * zPos) > safeZoneRadius) {
            addTree(false, angle, true);
            addTree(false, angle, false);
        }
    }
}

export function addPathTree() {
	var options=[0,1,2];
	var lane= Math.floor(Math.random()*3);
	addTree(true,lane);
	options.splice(lane,1);
	if(Math.random()>0.5){
		lane= Math.floor(Math.random()*2);
		addTree(true,options[lane]);
	}
}

function addTree(inPath, row, isLeft) {
    var newTree;
    
    // Usar árvore do pool ou criar uma nova árvore
    if (inPath) {
        if (treesPool.length == 0) return;
        newTree = treesPool.pop();
        newTree.visible = true;
        treesInPath.push(newTree);
        sphericalHelper.set(worldRadius - 0.3, pathAngleValues[row], -rollingGroundSphere.rotation.x + 4);
    } else {
        newTree = createTree();
        
        var forestAreaAngle = 0;
        if (isLeft) {
            forestAreaAngle = 1.68 + Math.random() * 0.1;
        } else {
            forestAreaAngle = 1.46 - Math.random() * 0.1;
        }
        sphericalHelper.set(worldRadius - 0.3, forestAreaAngle, row);
    }
    
    // Configurar a posição da árvore
    newTree.position.setFromSpherical(sphericalHelper);
    
    // Alinhar a árvore com a orientação do terreno
    var rollingGroundVector = rollingGroundSphere.position.clone().normalize();
    var treeVector = newTree.position.clone().normalize();
    newTree.quaternion.setFromUnitVectors(treeVector, rollingGroundVector);
    
    // Adicionar rotação aleatória para dar variedade
    newTree.rotation.x += (Math.random() * (2 * Math.PI / 10)) + -Math.PI / 10;
    
    // Adicionar as sombras corretamente
    newTree.castShadow = true;  // Certifique-se de que a árvore projete sombras
    newTree.receiveShadow = true;  // Certifique-se de que a árvore receba sombras

    // Adicionar a árvore no terreno (ao Rolling Ground Sphere)
    rollingGroundSphere.add(newTree);
}

function createTree(){
    var sides = 8;
    var tiers = 6;
    var scalarMultiplier = (Math.random() * (0.25 - 0.1)) + 0.05;
    var treeGeometry = new THREE.ConeGeometry(0.5, 1, sides, tiers);
    var treeMaterial = new THREE.MeshStandardMaterial({
        color: 0x33ff33,
        flatShading: true, // Mantenha o flatShading para um aspecto mais estilizado, ou altere para smoothShading para suavizar
    });

    // Acessando as posições de vértices na geometria com BufferGeometry
    var positions = treeGeometry.attributes.position.array;

    // Manipulação da geometria para ajustar a forma da árvore
    blowUpTree(positions, sides, 0, scalarMultiplier); // Alterando a geometria para criar uma forma mais irregular
    tightenTree(positions, sides, 1); // Ajustando a geometria para um aspecto mais apertado
    blowUpTree(positions, sides, 2, scalarMultiplier * 1.1, true); // Outra camada com aumento de escala
    tightenTree(positions, sides, 3); // Ajustando novamente
    blowUpTree(positions, sides, 4, scalarMultiplier * 1.2); // Mais uma camada com aumento de escala
    tightenTree(positions, sides, 5); // Ajustando novamente

    // Criando o topo da árvore a partir da geometria modificada
    var treeTop = new THREE.Mesh(treeGeometry, treeMaterial);
    treeTop.castShadow = true;  // Habilitando sombra para a copa
    treeTop.receiveShadow = false;  // A copa não recebe sombra, mas pode receber se quiser
    treeTop.position.y = 0.9;
    treeTop.rotation.y = Math.random() * Math.PI; // Rotação aleatória no eixo Y

    // Criando o tronco da árvore
    var treeTrunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5);
    var trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x886633,
        flatShading: true, // Mantenha o flatShading aqui também
    });
    var treeTrunk = new THREE.Mesh(treeTrunkGeometry, trunkMaterial);
    treeTrunk.castShadow = true;  // Habilitando sombra para o tronco
    treeTrunk.receiveShadow = true;  // O tronco recebe sombra
    treeTrunk.position.y = 0.25;

    // Agrupando tronco e topo em um único objeto 3D
    var tree = new THREE.Object3D();
    tree.add(treeTrunk);
    tree.add(treeTop);

    return tree;
}


function blowUpTree(vertices, sides, currentTier, scalarMultiplier, odd) {
    var vertexIndex;
    var vertexVector = new THREE.Vector3();
    var midPointVector = new THREE.Vector3();
    var offset;
    for (var i = 0; i < sides; i++) {
        vertexIndex = (currentTier * sides + i);
        // Obtendo as posições diretamente do array
        var x = vertices[vertexIndex * 3];
        var y = vertices[vertexIndex * 3 + 1];
        var z = vertices[vertexIndex * 3 + 2];
        
        vertexVector.set(x, y, z);  // Definindo o vetor de vértice

        midPointVector.y = vertexVector.y;
        offset = vertexVector.clone().sub(midPointVector);

        if (odd) {
            if (i % 2 === 0) {
                offset.normalize().multiplyScalar(scalarMultiplier / 6);
                vertexVector.add(offset);
            } else {
                offset.normalize().multiplyScalar(scalarMultiplier);
                vertexVector.add(offset);
                vertexVector.y = vertices[(vertexIndex + sides) * 3 + 1] + 0.05;
            }
        } else {
            if (i % 2 !== 0) {
                offset.normalize().multiplyScalar(scalarMultiplier / 6);
                vertexVector.add(offset);
            } else {
                offset.normalize().multiplyScalar(scalarMultiplier);
                vertexVector.add(offset);
                vertexVector.y = vertices[(vertexIndex + sides) * 3 + 1] + 0.05;
            }
        }

        // Atualizando os valores no array de posições
        vertices[vertexIndex * 3] = vertexVector.x;
        vertices[vertexIndex * 3 + 1] = vertexVector.y;
        vertices[vertexIndex * 3 + 2] = vertexVector.z;
    }
}

function tightenTree(vertices, sides, currentTier) {
    var vertexIndex;
    var vertexVector = new THREE.Vector3();
    var midPointVector = new THREE.Vector3();
    var offset;
    for (var i = 0; i < sides; i++) {
        vertexIndex = (currentTier * sides + i);
        // Obtendo as posições diretamente do array
        var x = vertices[vertexIndex * 3];
        var y = vertices[vertexIndex * 3 + 1];
        var z = vertices[vertexIndex * 3 + 2];
        
        vertexVector.set(x, y, z);  // Definindo o vetor de vértice

        midPointVector.y = vertexVector.y;
        offset = vertexVector.clone().sub(midPointVector);

        offset.normalize().multiplyScalar(0.06);
        vertexVector.sub(offset);

        // Atualizando os valores no array de posições
        vertices[vertexIndex * 3] = vertexVector.x;
        vertices[vertexIndex * 3 + 1] = vertexVector.y;
        vertices[vertexIndex * 3 + 2] = vertexVector.z;
    }
}