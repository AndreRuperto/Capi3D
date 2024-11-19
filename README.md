# Capi3D 🐾 

## 🎮 Descrição

**Capi3D** é um jogo desenvolvido no âmbito da disciplina de Computabilidade e Complexidade de Algoritmos no 6º Semestre do curso de Ciência da Computação na UDF. O jogo é uma experiência interativa 3D onde o jogador controla uma capivara 🦡 em um ambiente dinâmico, com árvores, obstáculos e desafios crescentes. Utilizando **Three.js** para renderização 3D e **Node.js** como servidor, o jogo oferece uma mecânica de movimentação fluida, colisões e animações em tempo real.

## 🧑‍🤝‍🧑 Participantes

- 👩‍🏫 **Professora:** Kadidja Valéria  
- 👤 **André Ruperto** | RGM: 30003032  
- 👤 **José Henrique** | RGM: 30525187  
- 👤 **Julio Augusto** | RGM: 30132401  
- 👤 **Miguel de Moraes** | RGM: 30129061  

## 🚀 Tecnologias

- **JavaScript**
- **Node.js**
- **Three.js** (para renderização 3D)
- **HTML5 & CSS3**
- **Blender** (para criação de modelos 3D)

## 📋 Pré-requisitos

Para rodar o jogo localmente, siga as etapas abaixo:

### 1. Instalação do Node.js

- Se ainda não tiver o **Node.js** instalado, [baixe e instale o Node.js](https://nodejs.org/).

### 2. Clonar o Repositório

- Clone este repositório para sua máquina local:
  ```bash
  git clone https://github.com/seu-usuario/Capi3D.git
  ```

### 3. Instalar as Dependências

- No diretório do projeto, abra um terminal e execute:
  ```bash
  npm install
  ```

### 4. Instalar o Parcel (Bundler)

- Para garantir que o bundler utilizado no projeto seja o mesmo, instale o Parcel:
  ```bash
  npm install parcel --save-dev
  ```
- Ou, para instalação global:
  ```bash
  npm install parcel -g
  ```

### 5. Rodar o Servidor

- Para iniciar o servidor de desenvolvimento, execute:
  ```bash
  npm start
  ```
- O jogo estará disponível em: http://localhost:1234

## ✅ Objetivos e Funcionalidades

O objetivo do projeto foi criar um jogo 3D interativo com as seguintes funcionalidades:

- **Ambiente 3D dinâmico**: Utilizando Three.js, foi criado um cenário esférico com árvores, obstáculos e animações.
- **Movimentação fluida**: O jogador pode controlar a capivara, com movimentação e colisões precisas.
- **Sistema de pontuação e desafios**: O jogo oferece um ciclo infinito de desafios, onde o jogador deve evitar obstáculos para continuar avançando.
- **Gerenciamento de objetos (pooling)**: Para otimizar o desempenho, utilizamos um sistema de pool para gerenciar árvores e outros obstáculos.

## 🔧 Estrutura do Código

A estrutura do código foi organizada de forma modular, com separação clara de responsabilidades:

- **index.html**: Contém a estrutura básica da página, incluindo os controles de interação com o usuário.
- **styles.css**: Responsável pela estilização de elementos da interface do jogo, como menus e textos.
- **main.js**: Arquivo principal que gerencia a lógica do jogo, como movimentação, animações e interações com objetos.
- **trees.js**: Módulo para gerenciar as árvores e outros obstáculos, incluindo o uso do pooling para otimização.

### Algumas funcionalidades importantes:

- **Movimentação do jogador**: Utilizamos controles de teclado para movimentar a capivara pelo mapa 3D.
- **Colisões**: A capivara interage com o cenário, detectando colisões com árvores e outros obstáculos.
- **Gerenciamento de objetos**: O uso de pools ajuda a controlar a criação e destruição de objetos de forma eficiente, melhorando a performance.

## ⚙️ Como Funciona

- **Cenário 3D**: A cada nova partida, o jogo cria um mapa esférico com árvores e obstáculos distribuídos aleatoriamente.
- **Interação**: O jogador pode controlar a capivara com as teclas de seta ou W, A, S, D. O objetivo é evitar as árvores e outros obstáculos enquanto coleta pontos.
- **Sistema de Pontuação**: A pontuação é aumentada conforme o tempo que o jogador sobrevive no jogo, e novos obstáculos surgem com o aumento da dificuldade.
- **Colisões e Desempenho**: O sistema de colisões foi otimizado para garantir um desempenho estável, mantendo uma taxa mínima de 30 FPS.

## 🎯 Regras (Jogabilidade)

- O objetivo do jogo é sobreviver o maior tempo possível enquanto desvia de obstáculos e coleta pontos.
- A cada 2 pontos, novos obstáculos aparecem, aumentando a dificuldade.
- Controles:
  - **Setas ou W, A, S, D**: Movimentam a capivara entre as pistas.
  - **Seta para Cima ou W**: Faz a capivara pular.
- O jogo termina quando a capivara colide com um obstáculo.
- O jogador pode pausar e reiniciar o jogo através dos botões na interface.

## 🛠️ Checklist de Desenvolvimento

### Fase 1 - Análise
- ✅ Problema claramente definido: Criar um jogo 3D interativo com obstáculos e movimentação fluida.
- ✅ Compreensão dos desafios: Implementar o uso do Three.js e integração de modelos 3D.

### Fase 2 - Planejamento
- ✅ Objetivos bem definidos: Criar o cenário 3D, sistema de movimentação, e interação dinâmica com objetos.
- ✅ Estratégia de resolução: Modularização do código, uso de pooling para otimização e tratamento de colisões.

### Fase 3 - Desenho
- ✅ Análise de complexidade: Redução de complexidade usando pooling para objetos e otimização de FPS.
- ✅ Identificação de pontos críticos: Desempenho nas colisões e gerenciamento de objetos 3D.

### Fase 4 - Programação e Testes
- ✅ Código bem estruturado e organizado: Modularização e nomenclatura clara.
- ✅ Testes realizados: Testamos colisões, desempenho e estabilidade do jogo em diferentes cenários.

## 🐛 Problemas Conhecidos e Soluções

- **Transparência nas árvores**: Corrigido o problema de transparência com `depthTest` e `side: THREE.DoubleSide`.
- **Problemas de performance**: Ajustes no tamanho das texturas e otimização de modelos GLTF para garantir carregamento rápido.
- **Ajuste do `rollingSpeed`**: Inicialmente, a velocidade de rotação do cenário aumentava linearmente com o score. Após testes, observou-se que valores muito altos prejudicavam a jogabilidade. O ideal foi limitar o aumento de velocidade após o score 700, para evitar que o jogo se tornasse incontrolável. Implementamos um controle que estabiliza o `rollingSpeed` a partir de um valor seguro.

## 💡 Contribuições

Contribuições são bem-vindas! Se você encontrar problemas ou tiver sugestões para melhorias, fique à vontade para abrir uma issue ou enviar um pull request.
