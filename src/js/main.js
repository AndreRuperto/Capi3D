import * as THREE from 'three';
export default THREE;
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { 
    createTreesPool, 
    addWorldTreesWithSafeZone, 
    addPathTree, 
    treesInPath,
    treesPool,
} from './trees'

import { 
    createBirdsPool,
    addPathBird, 
    birdsInPath,
    birdsPool,
} from './birds'

var sceneWidth;
var sceneHeight;
var camera;
var scene;
var renderer;
var dom;
var sun;
var ground;
var orbitControl;
export var rollingGroundSphere;
export var capivara;
var releaseInterval = 0.5;
var mixer;
var rollingSpeedInitial = 0.0025
var rollingSpeed=rollingSpeedInitial;
export var worldRadius=26;
export var sphericalHelper;
export var pathAngleValues;
var heroBaseY=2;
var bounceValue=0.1;
var gravity=0.005;
var leftLane=-1;
var rightLane=1;
var middleLane=0;
var currentLane=middleLane;
var clock;
var jumping;
var particleGeometry;
var particleCount=20;
var explosionPower =1.06;
var particles;
var scoreText;
var score;
var hasCollided;
var cameraInterval;

createScene();

// Quando o botão "Iniciar Jogo" for clicado, inicia o jogo
document.getElementById("startButton").onclick = function() {
    // Oculta o menu de início
    document.getElementById("gameMenu").style.display = "none";
    mixer.timeScale = 1;
    // Adiciona o evento de clique ao botão inicialmente
    pauseButton.addEventListener("click", togglePause);
    document.addEventListener("keydown", lidarTeclaPausar);
    // cameraInterval = setInterval(randomCameraChange, 30000);

    // Inicia a animação para mover a câmera
    animateCameraTransition();

    // Inicia o jogo
    update();
};

function animateCameraTransition() {
    // Posição final desejada
    const targetPosition = new THREE.Vector3(0, 3, 6.5); 
    const targetLookAt = new THREE.Vector3(0, 0, 0); // Ponto de interesse

    // Função de animação para mover a câmera gradualmente
    const duration = 2; // Duração da animação em segundos
    const startPosition = camera.position.clone(); // Posição inicial
    const startLookAt = new THREE.Vector3().copy(camera.position); // Posição de onde a câmera está olhando (pode ser ajustado se necessário)
    
    let startTime = performance.now(); // Marca o tempo de início da animação

    function animate() {
        // Calcula o tempo atual da animação
        let elapsedTime = (performance.now() - startTime) / 1000;

        // Interpolação linear para a posição da câmera
        if (elapsedTime < duration) {
            // Atualiza a posição da câmera
            camera.position.lerpVectors(startPosition, targetPosition, elapsedTime / duration);
            // Atualiza o ponto para onde a câmera está olhando
            camera.lookAt(startLookAt.lerp(targetLookAt, elapsedTime / duration));
            requestAnimationFrame(animate); // Continua a animação
        } else {
            // Garante que a câmera esteja exatamente na posição final
            camera.position.copy(targetPosition);
            camera.lookAt(targetLookAt);
        }
    }

    animate(); // Inicia a animação
}


function createScene(){
	hasCollided=false;
	score=0;
	clock=new THREE.Clock();
	clock.start();
	sphericalHelper = new THREE.Spherical();
	pathAngleValues=[1.52,1.57,1.62];
    sceneWidth=window.innerWidth;
    sceneHeight=window.innerHeight;
    scene = new THREE.Scene();//the 3d scene
    camera = new THREE.PerspectiveCamera( 60, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
    renderer = new THREE.WebGLRenderer({alpha:true});//renderer with transparent backdrop
    renderer.setClearColor(0xfffafa, 1);
    renderer.shadowMap.enabled = true;//enable shadow
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize( sceneWidth, sceneHeight );
	document.body.appendChild(renderer.domElement);
	createTreesPool();
	createBirdsPool();
	addWorld();
	const url = new URL('../../assets/modelos3D/capivaraPadrao.glb', import.meta.url);
    addHero(url.href);
	addLight();
	addExplosion();
	
	camera.position.x = -0.08659074306443015;
    camera.position.y = 2.4447632784041478;
    camera.position.z = 3.8661441613329735;

    // Alvo da câmera
    camera.lookAt(-1.6803615076681788, 1.1622977535821688, 7.467959952579934);
	// orbitControl = new OrbitControls( camera, renderer.domElement );//helper to rotate around in scene
	// orbitControl.addEventListener( 'change', render );
	
	window.addEventListener('resize', onWindowResize, false);//resize callback

	document.onkeydown = handleKeyDown;
	
	scoreText = document.createElement('div');
	scoreText.style.position = 'absolute';
	scoreText.style.width = 100;
	scoreText.style.height = 100;
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

function handleKeyDown(keyEvent) {
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
        if (jumping) return; // Impede de iniciar novo pulo durante pulo
        bounceValue = 0.1; // Valor ajustado para um pulo mais alto
        jumping = true;
        validMove = false;
    }
}

// Função que controla o pulo e a suavização do movimento
function updateJump() {
    if (jumping) {
        capivara.position.y += bounceValue;
        bounceValue -= gravity; // Simula a gravidade

        // Verifica se a capivara está no chão novamente
        if (capivara.position.y <= heroBaseY) {
            capivara.position.y = heroBaseY;
            jumping = false;
            bounceValue = 0;
        }
    }
}

// Adicione as luzes uma única vez
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light); 

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5).normalize(); 
scene.add(directionalLight);

// Variáveis de controle de animação
// Função para adicionar o modelo
function addHero(modelUrl) {
    const loader = new GLTFLoader(); 
    
    loader.load(modelUrl, function (gltf) { 
        // Se já houver um modelo, remova-o antes de carregar o novo
        if (capivara) {
            scene.remove(capivara);
            capivara = null;  // Limpa a variável
        }
        
        capivara = gltf.scene; // Atribui o modelo carregado à variável capivara
        
        // Se houver animações, crie ou reinicie o mixer
        if (gltf.animations && gltf.animations.length) { 
            if (mixer) {
                mixer.stopAllAction(); // Interrompe as animações anteriores
            }
            mixer = new THREE.AnimationMixer(capivara);
            gltf.animations.forEach((clip) => { 
                mixer.clipAction(clip).play(); 
            }); 
            mixer.timeScale = 0;
        }
        
        capivara.scale.set(0.2, 0.2, 0.2);
        capivara.position.set(0, 2, 5);
        capivara.rotation.y = Math.PI;
        scene.add(capivara);
    }, undefined, function (error) { 
        console.error(error); 
    });
}

// Função de animação (chamada no loop de renderização)
function animate() { 
    requestAnimationFrame(animate);

    // Atualiza o mixer de animação
    if (mixer) { 
        mixer.update(clock.getDelta());  // Atualiza a animação com base no deltaTime
    }

    // Renderiza o cenário
    renderer.render(scene, camera); 
}

// Inicia o loop de animação
animate();

// Função para lidar com o clique nos botões
Array.from(document.getElementsByClassName("capivara")).forEach(button => {
    button.addEventListener("click", () => {
        const url = new URL('../../assets/modelos3D/capivaraPadrao.glb', import.meta.url);
        addHero(url.href);
    });
});

Array.from(document.getElementsByClassName("samurai")).forEach(button => {
    button.addEventListener("click", () => {
        const url = new URL('../../assets/modelos3D/capivaraSamurai.glb', import.meta.url);
        addHero(url.href);
    });
});

Array.from(document.getElementsByClassName("oculos")).forEach(button => {
    button.addEventListener("click", () => {
        const url = new URL('../../assets/modelos3D/capivaraOculos.glb', import.meta.url);
        addHero(url.href);
    });
});


function addWorld() {
    var sides = 40;
    var tiers = 40;
    var sphereGeometry = new THREE.SphereGeometry(worldRadius, sides, tiers);
    var sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x556B2F, flatShading: true });

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

function normalCameraPosition() {
    camera.position.z = 6.5;
	camera.position.y = 3;
	camera.position.x = 0;

    camera.lookAt(0, 0, 0);
}

function sideviewCameraPosition() {
    camera.position.z = 5;
	camera.position.y = 4;
    camera.position.x = -5;

    camera.lookAt(0, 0, 0);
}

function invertedCameraPosition() {
    camera.position.z = -6;
	camera.position.y = 4;
	camera.position.x = 1;

    camera.lookAt(0, 0, 1);
}

function randomCameraChange() {
    const cameraPositions = [normalCameraPosition];
    
    // Seleciona uma posição aleatória
    const randomIndex = Math.floor(Math.random() * cameraPositions.length);
    
    // Chama a função selecionada aleatoriamente
    cameraPositions[randomIndex]();
}

function update() {
    if (!capivara) {
        requestAnimationFrame(update);
        return;
    }

    if (hasCollided) {
        stopGame();
        return;
    }

    if (isPaused) {
        // Lógica de pausa: interrompe animações ou lógica do jogo
        mixer.timeScale = 0;
        clearInterval(cameraInterval);
        return;
    } else {
        mixer.timeScale = 1;// Certifique-se de que `animate` seja a função principal do loop
    }

    if (score > 50) {
        rollingSpeed = 0.003;
    }
    if  (score > 150) {
        rollingSpeed = 0.0035;
    }
    if (score > 300) {
        rollingSpeed = 0.004;
    }
    if (score > 500) {
        rollingSpeed = 0.0045;
    }
    if (score > 700) {
        rollingSpeed = 0.005;
    }

    rollingGroundSphere.rotation.x += rollingSpeed;

    // Atualize o pulo
    updateJump();

    // Atualize o movimento lateral sem afetar o pulo
    capivara.position.x += (currentLane - capivara.position.x) * 0.1;

    if (clock.getElapsedTime() > releaseInterval) {
        clock.start();
        addPathTree();
        addPathBird();
        if (!hasCollided) {
            score += 2 * releaseInterval;
            scoreText.innerHTML = score.toString();
        }
    }

    doTreeLogic();
    doBirdLogic();
    doExplosionLogic();
    render();
    requestAnimationFrame(update);
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
    particles.position.set(capivara.position.x, 2, 4.8);

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

function lidarTeclaReiniciar(event) {
    const tecla = event.key.toLowerCase();

    if (tecla === "enter") {
        restartGame();
    }
}
function lidarTeclaPausar(event) {
    const tecla = event.key.toLowerCase();

    if (tecla === " ") {
        togglePause();
    }
}

function stopGame() {
    clearInterval(cameraInterval);
    explode();
    mixer.timeScale = 0;
    pauseButton.removeEventListener("click", togglePause);
    let currentScore = parseInt(scoreText.innerHTML, 10);
    let maxScore = parseInt(document.getElementById("score-maximo").innerHTML, 10);
    if (currentScore > maxScore) {
        document.getElementById("score-maximo").innerHTML=scoreText.innerHTML;
    }

    // Exibe o menu de Game Over
    document.getElementById("gameOverMenu").style.display = "flex";
    document.getElementById("restartButton").onclick = restartGame; // Atualiza para garantir o evento correto
    document.addEventListener("keydown", lidarTeclaReiniciar);
    document.removeEventListener("keydown", lidarTeclaPausar);
}

function restartGame() {
    // cameraInterval = setInterval(randomCameraChange, 30000);
    normalCameraPosition();
    document.removeEventListener("keydown", lidarTeclaReiniciar);
    document.addEventListener("keydown", lidarTeclaPausar);
    // Reinicia a posição e a pontuação
    currentLane = middleLane;
    score = 0; // Reseta a pontuação
    scoreText.innerHTML = "0"; // Atualiza o texto de pontuação para zero
    hasCollided = false;
    rollingGroundSphere.rotation.x += 2;
    rollingSpeed = rollingSpeedInitial
    mixer.timeScale = 1;
    pauseButton.addEventListener("click", togglePause);

    // Esconde o menu de Game Over e reinicia o jogo
    document.getElementById("gameOverMenu").style.display = "none";

    // Aguarda 100ms antes de chamar update
    setTimeout(() => {
        console.log("Jogo reiniciado!");
        update();
    }, 100);
}

let isPaused = false;
const pauseButton = document.getElementById("pause-button");
const countdownElement = document.getElementById("countdown");

function togglePause() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? "Resume" : "Pause";

    if (!isPaused) {
        // Inicia a contagem regressiva e desativa o botão temporariamente
        pauseButton.removeEventListener("click", togglePause);
        startCountdown(() => {
            isPaused = false;
            update(); // Retoma o loop do jogo
            // Reativa o botão após a contagem
            pauseButton.addEventListener("click", togglePause);
        });
    }
}

function startCountdown(callback) {
    const countdownNumbers = [3, 2, 1];
    let index = 0;

    countdownElement.style.display = "block"; // Mostra o contêiner de contagem regressiva
    countdownElement.textContent = countdownNumbers[index];

    const interval = setInterval(() => {
        index++;
        if (index < countdownNumbers.length) {
            countdownElement.textContent = countdownNumbers[index];
        } else {
            clearInterval(interval); // Para a contagem regressiva
            countdownElement.style.display = "none"; // Esconde o contêiner
            callback(); // Chama o callback para retomar o jogo
        }
    }, 1000); // Intervalo de 1 segundo entre os números
}

// setInterval(() => {
//     console.log(`Camera Position: x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`);
// }, 2000);
// setInterval(() => {
//     console.log(`Orbit Target: x=${orbitControl.target.x}, y=${orbitControl.target.y}, z=${orbitControl.target.z}`);
// }, 2000);

function doTreeLogic() {
    var treePos = new THREE.Vector3();
    var treesToRemove = [];

    treesInPath.forEach(function (oneTree, index) {
        // Obtém a posição da árvore
        treePos.setFromMatrixPosition(oneTree.matrixWorld);

        // Verifica se a árvore está fora do campo de visão
        if (treePos.z > 6 && oneTree.visible) {
            treesToRemove.push(oneTree); // Marca para remoção
        } else if (oneTree.visible) {
            // Verifica colisão apenas com árvores visíveis
            if (treePos.distanceTo(capivara.position) <= 0.8) {
                hasCollided = true;
            }
        }
    });

    // Remove árvores fora do campo de visão
    treesToRemove.forEach(function (oneTree) {
        var fromWhere = treesInPath.indexOf(oneTree);
        if (fromWhere > -1) {
            treesInPath.splice(fromWhere, 1); // Remove do array
            treesPool.push(oneTree); // Adiciona de volta ao pool
            oneTree.visible = false; // Torna invisível
        }
    });
}

function doBirdLogic() {
    var oneBird;
    var birdPos = new THREE.Vector3();
    var birdsToRemove = [];

    birdsInPath.forEach(function (element, index) {
        oneBird = birdsInPath[index];
        if (oneBird && oneBird.matrixWorld) { // Verifique se oneBird e oneBird.matrixWorld são válidos
            birdPos.setFromMatrixPosition(oneBird.matrixWorld);

            if (birdPos.z > 6 && oneBird.visible) {
                // Saiu da zona de visão
                birdsToRemove.push(oneBird);
            } else {
                // Verificar colisão
                if (birdPos.distanceTo(capivara.position) <= 0.8) {
                    hasCollided = true;
                }
            }
        }
    });

    birdsToRemove.forEach(function (element, index) {
        oneBird = birdsToRemove[index];
        var fromWhere = birdsInPath.indexOf(oneBird);
        birdsInPath.splice(fromWhere, 1);
        birdsPool.push(oneBird); // Retorna o pássaro ao pool
        oneBird.visible = false;
    });
}