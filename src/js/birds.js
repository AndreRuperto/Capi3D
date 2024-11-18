import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
    worldRadius, 
    sphericalHelper, 
    rollingGroundSphere, 
    pathAngleValues,
} from './main';

export var birdsInPath=[];
export var birdsPool=[];

export function createBirdsPool(){
	var maxBirdsInPool=10;
	var newBird;
	for(var i=0; i<maxBirdsInPool;i++){
		newBird=createBird();
		birdsPool.push(newBird);
	}
}

export function addPathBird() {
	var options=[0,1,2];
	var lane= Math.floor(Math.random()*3);
	addBird(true,lane);
	options.splice(lane,1);
	if(Math.random()>0.5){
		lane= Math.floor(Math.random()*2);
		addBird(true,options[lane]);
	}
}

function addBird(inPath, row, isLeft) {
    console.log("pool", birdsPool);
    var newBird;

    // Usar pássaro do pool ou criar um novo pássaro
    if (inPath) {
        console.log("pega do pool");
        if (birdsPool.length == 0) return;
        newBird = birdsPool.pop();
        newBird.visible = true;
        birdsInPath.push(newBird);
        sphericalHelper.set(worldRadius - 0.3, pathAngleValues[row], -rollingGroundSphere.rotation.x + 4);
    } else {
        console.log("criando novo");
        // Espera o pássaro ser carregado
        createBird().then(bird => {
            newBird = bird;

            var forestAreaAngle = 0;
            if (isLeft) {
                forestAreaAngle = 1.68 + Math.random() * 0.1;
            } else {
                forestAreaAngle = 1.46 - Math.random() * 0.1;
            }
            sphericalHelper.set(worldRadius - 0.3, forestAreaAngle, row);

            // Configurar a posição do pássaro
            newBird.position.setFromSpherical(sphericalHelper);
            newBird.position.y += alturaAdicional;

            // Alinhar o pássaro com a orientação do terreno
            var rollingGroundVector = rollingGroundSphere.position.clone().normalize();
            var birdVector = newBird.position.clone().normalize();
            newBird.quaternion.setFromUnitVectors(birdVector, rollingGroundVector);

            // Adicionar rotação aleatória para dar variedade
            newBird.rotation.x += (Math.random() * (2 * Math.PI / 10)) + -Math.PI / 10;

            // Adicionar as sombras corretamente
            newBird.castShadow = true;
            newBird.receiveShadow = true;

            // Adicionar o pássaro no terreno (ao Rolling Ground Sphere)
            rollingGroundSphere.add(newBird);
        }).catch(error => {
            console.error("Erro ao criar o pássaro:", error);
        });
    }
}

function createBird() {
    return new Promise((resolve, reject) => {
        let loader = new GLTFLoader(); // Carregador de modelos GLTF
        const url = new URL('../../assets/modelos3D/passaro.glb', import.meta.url);

        loader.load(
            url.href, // Caminho para o arquivo GLTF
            function (gltf) {
                const bird = gltf.scene;

                // Ajuste o tamanho e a rotação do modelo, se necessário
                bird.scale.set(1, 1, 1); // Ajustando o tamanho do pássaro
                bird.rotation.y = Math.random() * Math.PI; // Rotação aleatória

                // Habilitar as sombras
                bird.traverse(function (child) {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                resolve(bird); // Resolve a Promise com o pássaro carregado
            },
            undefined, // Função de progresso (opcional)
            function (error) {
                console.error('Erro ao carregar o modelo do pássaro:', error);
                reject(error);
            }
        );
    });
}
