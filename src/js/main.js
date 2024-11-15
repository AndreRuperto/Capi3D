import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

var sceneWidth;
var sceneHeight;
var camera;
var scene;
var renderer;
var dom;
var sun;
var ground;
var orbitControl;
var rollingGroundSphere;
var heroSphere;
var mixer;
var rollingSpeed=0.004;
var worldRadius=26;
var sphericalHelper;
var pathAngleValues;
var heroBaseY=2;
var bounceValue=0.1;
var gravity=0.005;
var leftLane=-1;
var rightLane=1;
var middleLane=0;
var currentLane=middleLane;
var clock;
var jumping;
var treeReleaseInterval=0.5;
var lastTreeReleaseTime=0;
var treesInPath;
var treesPool;
var particleGeometry;
var particleCount=20;
var explosionPower =1.06;
var particles;
//var stats;
var scoreText;
var score;
var hasCollided;

init();

function init() {
	// set up the scene
	createScene();

	//call game loop
	update();
}

function createScene(){
	hasCollided=false;
	score=0;
	treesInPath=[];
	treesPool=[];
	clock=new THREE.Clock();
	clock.start();
	sphericalHelper = new THREE.Spherical();
	pathAngleValues=[1.52,1.57,1.62];
    sceneWidth=window.innerWidth;
    sceneHeight=window.innerHeight;
    scene = new THREE.Scene();//the 3d scene
    // scene.fog = new THREE.FogExp2( 0xf0fff0, 0.14 );
    camera = new THREE.PerspectiveCamera( 60, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
    renderer = new THREE.WebGLRenderer({alpha:true});//renderer with transparent backdrop
    renderer.setClearColor(0xfffafa, 1);
    renderer.shadowMap.enabled = true;//enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( sceneWidth, sceneHeight );
	document.body.appendChild(renderer.domElement);
	//stats = new Stats();
	//dom.appendChild(stats.dom);
	createTreesPool();
	addWorld();
	addHero();
	addLight();
	addExplosion();
	
	camera.position.z = 6.5;
	camera.position.y = 3;
	orbitControl = new OrbitControls( camera, renderer.domElement );//helper to rotate around in scene
	orbitControl.addEventListener( 'change', render );
	
	window.addEventListener('resize', onWindowResize, false);//resize callback

	document.onkeydown = handleKeyDown;
	
	scoreText = document.createElement('div');
	scoreText.style.position = 'absolute';
	//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
	scoreText.style.width = 100;
	scoreText.style.height = 100;
	//scoreText.style.backgroundColor = "blue";
	scoreText.innerHTML = "0";
	scoreText.style.top = 50 + 'px';
	scoreText.style.left = 10 + 'px';
	document.body.appendChild(scoreText);
  
  var infoText = document.createElement('div');
	infoText.style.position = 'absolute';
	infoText.style.width = 100;
	infoText.style.height = 100;
	infoText.style.backgroundColor = "yellow";
	infoText.innerHTML = "UP - Jump, Left/Right - Move";
	infoText.style.top = 10 + 'px';
	infoText.style.left = 10 + 'px';
	document.body.appendChild(infoText);
}
function addExplosion() {
    var particleCount = 1000; // Defina o número de partículas, caso não tenha sido definido
    particleGeometry = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount * 3);  // Array de 3 componentes para cada partícula (x, y, z)

    // Preenche o array de posições com as partículas (em um ponto inicial, por exemplo)
    for (var i = 0; i < particleCount; i++) {
        var x = Math.random() * 2 - 1;  // Posição aleatória em x
        var y = Math.random() * 2 - 1;  // Posição aleatória em y
        var z = Math.random() * 2 - 1;  // Posição aleatória em z
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    // Define o atributo de posição usando o array
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var pMaterial = new THREE.PointsMaterial({
        color: 0xfffafa,
        size: 0.2
    });

    // Cria o objeto de partículas
    particles = new THREE.Points(particleGeometry, pMaterial);
    scene.add(particles);
    particles.visible = false;
}

function createTreesPool(){
	var maxTreesInPool=10;
	var newTree;
	for(var i=0; i<maxTreesInPool;i++){
		newTree=createTree();
		treesPool.push(newTree);
	}
}

function handleKeyDown(keyEvent) {
    if (jumping) return; // Impede de iniciar novo movimento durante pulo
    let validMove = true;

    if (keyEvent.keyCode === 37 || keyEvent.keyCode === 65) { // Esquerda (seta ou A)
        if (currentLane === middleLane) {
            currentLane = leftLane;
        } else if (currentLane === rightLane) {
            currentLane = middleLane;
        } else {
            validMove = false;
        }
    } else if (keyEvent.keyCode === 39 || keyEvent.keyCode === 68) { // Direita (seta ou D)
        if (currentLane === middleLane) {
            currentLane = rightLane;
        } else if (currentLane === leftLane) {
            currentLane = middleLane;
        } else {
            validMove = false;
        }
    } else if (keyEvent.keyCode === 38 || keyEvent.keyCode === 87) { // Pulo (seta para cima ou W)
        bounceValue = 0.1; // Valor ajustado para um pulo mais alto
        jumping = true;
        validMove = false;
    }
}

// Função que controla o pulo e a suavização do movimento
function updateJump() {
    if (jumping) {
        heroSphere.position.y += bounceValue;
        bounceValue -= gravity; // Simula a gravidade

        // Verifica se a capivara está no chão novamente
        if (heroSphere.position.y <= heroBaseY) {
            heroSphere.position.y = heroBaseY;
            jumping = false;
            bounceValue = 0;
        }
    }
}

// No loop de animação, adicione o updateJump() para atualizar o pulo e a posição
function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
    updateJump();
    orbitControl.update();
    renderer.render(scene, camera);
}

function addHero() { 
	const loader = new GLTFLoader(); 
	const url = new URL('../../assets/capivaraCorrendo.glb', import.meta.url);
	const light = new THREE.AmbientLight(0xffffff, 1);
	scene.add(light); 
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(5, 5, 5).normalize(); scene.add(directionalLight);
	loader.load(url.href, function (gltf) { 
		heroSphere = gltf.scene;
		if (gltf.animations && gltf.animations.length) { 
			mixer = new THREE.AnimationMixer(heroSphere);
			// mixer.timeScale = 5;
			gltf.animations.forEach((clip) => { 
				mixer.clipAction(clip).play(); 
			}); 
		}
		heroSphere.scale.set(0.2, 0.2, 0.2);
		heroSphere.position.set(0, 2, 5);
		heroSphere.rotation.y = Math.PI;
		scene.add(heroSphere); 
	}, undefined, function (error) { 
		console.error(error); 
	});
	function animate() { 
		requestAnimationFrame(animate);
		if (mixer) { 
			mixer.update(clock.getDelta());
		} 
		renderer.render(scene, camera); 
	}
	animate(); 
}

function addWorld() {
    var sides = 40;
    var tiers = 40;
    var sphereGeometry = new THREE.SphereGeometry(worldRadius, sides, tiers);
    var sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xfffafa, flatShading: true });

    var vertexIndex;
    var vertexVector = new THREE.Vector3();
    var nextVertexVector = new THREE.Vector3();
    var firstVertexVector = new THREE.Vector3();
    var offset = new THREE.Vector3();
    var currentTier = 1;
    var lerpValue = 0.5;
    var heightValue;
    var maxHeight = 0.07;
    
    // Acessando o array de posições diretamente no BufferGeometry
    var positions = sphereGeometry.attributes.position.array;
    
    for (var j = 1; j < tiers - 2; j++) {
        currentTier = j;
        for (var i = 0; i < sides; i++) {
            vertexIndex = (currentTier * sides) + 1;

            // Calculando o índice do vértice no array de posições
            var index = (i + vertexIndex) * 3;  // Multiplicamos por 3 porque cada vértice tem 3 componentes: x, y, z
            vertexVector.set(positions[index], positions[index + 1], positions[index + 2]);

            if (j % 2 !== 0) {
                if (i == 0) {
                    firstVertexVector = vertexVector.clone();
                }
                // Calculando o próximo vértice
                var nextIndex = ((i + 1) % sides + vertexIndex) * 3;
                nextVertexVector.set(positions[nextIndex], positions[nextIndex + 1], positions[nextIndex + 2]);
                
                if (i == sides - 1) {
                    nextVertexVector = firstVertexVector;
                }
                
                // Aplicando a interpolação entre os vértices
                lerpValue = (Math.random() * (0.75 - 0.25)) + 0.25;
                vertexVector.lerp(nextVertexVector, lerpValue);
            }
            
            heightValue = (Math.random() * maxHeight) - (maxHeight / 2);
            offset = vertexVector.clone().normalize().multiplyScalar(heightValue);

            // Atualizando o vértice no array de posições
            positions[index] += offset.x;
            positions[index + 1] += offset.y;
            positions[index + 2] += offset.z;
        }
    }

    // Marcar a atualização das posições
    sphereGeometry.attributes.position.needsUpdate = true;

    // Criando a esfera com as modificações
    rollingGroundSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    
    // Habilitar o recebimento de sombra
    rollingGroundSphere.receiveShadow = true;
    rollingGroundSphere.castShadow = true;  // Garantir que a esfera projete sombras

    rollingGroundSphere.rotation.z = -Math.PI / 2;
    scene.add(rollingGroundSphere);

    rollingGroundSphere.position.y = -24;
    rollingGroundSphere.position.z = 2;

    // Verificar se as sombras estão habilitadas corretamente antes de tentar modificar as configurações
    if (rollingGroundSphere.castShadow) {
        if (rollingGroundSphere.shadow) {
            rollingGroundSphere.shadow.mapSize.width = 1024;  // Aumentando a resolução do mapa de sombra
            rollingGroundSphere.shadow.mapSize.height = 1024; // Aumentando a resolução do mapa de sombra
            rollingGroundSphere.shadow.bias = -0.001;  // Ajustando o viés para evitar artefatos de sombra
        }
    }

    // Adicionando árvores ao mundo com uma zona segura
    addWorldTreesWithSafeZone();
}

function addWorldTreesWithSafeZone() {
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

function addLight() {
    // Luz hemisférica (mais suave, como uma luz ambiente)
    var hemisphereLight = new THREE.HemisphereLight(0xfffafa, 0x000000, 0.9);
    scene.add(hemisphereLight);

    // Luz direcional (simulando o sol)
    sun = new THREE.DirectionalLight(0xcdc1c5, 3);  // Aumentei a intensidade da luz para tornar as sombras mais fortes
    sun.position.set(12, 6, -7);
    sun.castShadow = true;
    scene.add(sun);

    // Ajustes de sombra para a luz direcional
    sun.shadow.mapSize.width = 2048;  // Aumentando a resolução das sombras para 2048x2048
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;  // Ajustando a distância da câmera de sombras
    sun.shadow.camera.far = 50;
    sun.shadow.camera.left = -10;   // Ajuste da câmera de sombra
    sun.shadow.camera.right = 10;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -10;

    // Ajuste de viés para evitar artefatos
    sun.shadow.bias = -0.005;  // Ajuste de viés mais negativo para maior intensidade e menor artefato

    // Luz ambiente para melhorar a definição das sombras
    var ambientLight = new THREE.AmbientLight(0x404040, 0.5);  // Luz ambiente suave
    scene.add(ambientLight);
}

function addPathTree(){
	var options=[0,1,2];
	var lane= Math.floor(Math.random()*3);
	addTree(true,lane);
	options.splice(lane,1);
	if(Math.random()>0.5){
		lane= Math.floor(Math.random()*2);
		addTree(true,options[lane]);
	}
}
function addWorldTrees(){
	var numTrees=36;
	var gap=6.28/36;
	for(var i=0;i<numTrees;i++){
		addTree(false,i*gap, true);
		addTree(false,i*gap, false);
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

function update() {
    if (!heroSphere) {
        requestAnimationFrame(update);
        return;
    }

    if (hasCollided) {
        stopGame();
        return;
    }

    rollingGroundSphere.rotation.x += rollingSpeed;

    // Atualize o pulo
    updateJump();

    // Atualize o movimento lateral sem afetar o pulo
    heroSphere.position.x += (currentLane - heroSphere.position.x) * 0.1;

    if (clock.getElapsedTime() > treeReleaseInterval) {
        clock.start();
        addPathTree();
        if (!hasCollided) {
            score += 2 * treeReleaseInterval;
            scoreText.innerHTML = score.toString();
        }
    }

    doTreeLogic();
    doExplosionLogic();
    render();
    requestAnimationFrame(update);
}

function doTreeLogic(){
	var oneTree;
	var treePos = new THREE.Vector3();
	var treesToRemove=[];
	treesInPath.forEach( function ( element, index ) {
		oneTree=treesInPath[ index ];
		treePos.setFromMatrixPosition( oneTree.matrixWorld );
		if(treePos.z>6 &&oneTree.visible){//gone out of our view zone
			treesToRemove.push(oneTree);
		}else { //check colision
			if (treePos.distanceTo(heroSphere.position) <= 0.6) {
				hasCollided = true;
			}
		}
	});
	var fromWhere;
	treesToRemove.forEach( function ( element, index ) {
		oneTree=treesToRemove[ index ];
		fromWhere=treesInPath.indexOf(oneTree);
		treesInPath.splice(fromWhere,1);
		treesPool.push(oneTree);
		oneTree.visible=false;
	});
}
function doExplosionLogic() {
    if (!particles.visible) return;

    const positions = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] *= explosionPower;     // Multiplica x pelo explosionPower
        positions[i + 1] *= explosionPower; // Multiplica y pelo explosionPower
        positions[i + 2] *= explosionPower; // Multiplica z pelo explosionPower
    }

    // Reduz gradualmente o power da explosão
    if (explosionPower > 1.005) {
        explosionPower -= 0.001;
    } else {
        particles.visible = false;
    }

    // Marca as posições como atualizadas
    particleGeometry.attributes.position.needsUpdate = true;
}

function explode() {
    // Define a posição inicial das partículas
    particles.position.set(heroSphere.position.x, 2, 4.8);

    const positions = [];
    for (let i = 0; i < particleCount; i++) {
        const x = -0.2 + Math.random() * 0.4;
        const y = -0.2 + Math.random() * 0.4;
        const z = -0.2 + Math.random() * 0.4;
        positions.push(x, y, z);
    }

    // Atualiza as posições no BufferGeometry
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    explosionPower = 1.07;
    particles.visible = true;
}

function render(){
    renderer.render(scene, camera);//draw
}
function onWindowResize() {
	//resize & align
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}

function stopGame() {
    explode();
    mixer.timeScale = 0;

    let currentScore = parseInt(scoreText.innerHTML, 10);
    let maxScore = parseInt(document.getElementById("score-maximo").innerHTML, 10);
    if (currentScore > maxScore) {
        document.getElementById("score-maximo").innerHTML=scoreText.innerHTML;
    }

    // Exibe o menu de Game Over
    document.getElementById("gameOverMenu").style.display = "flex";
    document.getElementById("restartButton").onclick = restartGame; // Atualiza para garantir o evento correto
}

function restartGame() {
    // Reinicia a posição e a pontuação
    currentLane = middleLane;
    score = 0; // Reseta a pontuação
    scoreText.innerHTML = "0"; // Atualiza o texto de pontuação para zero
    hasCollided = false;
    rollingGroundSphere.rotation.x = 0;
    mixer.timeScale = 1;

    // Esconde o menu de Game Over e reinicia o jogo
    document.getElementById("gameOverMenu").style.display = "none";
    update();
}

// function restartGame() {
//     // Limpar o cenário, como o mundo e as árvores
//     clearScene();

//     // Reiniciar variáveis e objetos importantes do jogo
//     resetGameVariables();

//     // Recriar elementos do cenário
//     createWorld();
//     addTrees();

//     // Reiniciar o estado da câmera, se necessário
//     resetCamera();

//     // Reiniciar a animação, caso tenha
//     resetAnimations();

//     // Reiniciar a pontuação ou outras variáveis de jogo
//     resetScore();

//     // Esconder o menu de Game Over
//     document.getElementById("gameOverMenu").style.display = "none";

//     // Iniciar o loop de animação novamente
//     animate();
// }

// function clearScene() {
//     // Remover árvores ou objetos do cenário
//     treesInPath.forEach(tree => {
//         scene.remove(tree);
//     });
//     treesInPath = [];  // Limpar a lista de árvores
    
//     // Remover qualquer outro objeto, como o jogador
//     scene.remove(rollingGroundSphere);
// }

// function resetGameVariables() {
//     // Exemplo: resetar o contador de pontos, variáveis de controle, etc.
//     score = 0;
//     isGameOver = false;
// }

// function createWorld() {
//     // Recriar o mundo
//     rollingGroundSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
//     rollingGroundSphere.receiveShadow = true;
//     rollingGroundSphere.castShadow = false;
//     scene.add(rollingGroundSphere);

//     // Criar o fundo do mundo, etc.
//     addWorld();
// }

// function createWorld() {
// 	var sides = 40;
//     var tiers = 40;
// 	var sphereGeometry = new THREE.SphereGeometry(worldRadius, sides, tiers);
//     var sphereMaterial = new THREE.MeshStandardMaterial({ color: 0xfffafa, flatShading: true });
//     // Recriar o mundo
//     rollingGroundSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
//     rollingGroundSphere.receiveShadow = true;
//     rollingGroundSphere.castShadow = false;
//     scene.add(rollingGroundSphere);

//     // Criar o fundo do mundo, etc.
//     addWorld();
// }

// function addTrees() {
//     for (let i = 0; i < 10; i++) {  // Exemplo de quantidade de árvores
//         addTree(false, i, Math.random() > 0.5);
//     }
// }

// function resetCamera() {
//     // Coloque a câmera na posição inicial, por exemplo:
//     camera.position.set(0, 2, 5);
//     camera.lookAt(0, 2, 0); // Ajuste conforme necessário
// }

// function resetAnimations() {
//     mixer.stopAllAction();  // Para todas as animações
//     // Reinicie a animação, se houver
// }

// function resetScore() {
//     scoreText.innerHTML = "0"; // Resetar a pontuação
// }

// function animate() {
//     requestAnimationFrame(animate);  // Continuar o loop de animação
//     renderer.render(scene, camera);  // Renderizar a cena
//     orbitControl.update();  // Se você estiver usando controles de câmera
// }
