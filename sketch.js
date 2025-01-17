/// guardam a posição do mouse no plano cartesiano
var mouseXC, mouseYC = 0;
var dimensaoCanvas = 400;

var cena = null;

function setup() {
  createCanvas(dimensaoCanvas, dimensaoCanvas);

  let w2 = width / 2;
  let h2 = height / 2;

  let arestas = [new Aresta(new Vet2(-w2, h2), new Vet2(w2, h2)),
                 new Aresta(new Vet2(w2, h2), new Vet2(w2, -h2)),
                 new Aresta(new Vet2(w2, -h2), new Vet2(-w2, -h2)),
                 new Aresta(new Vet2(-w2, -h2), new Vet2(-w2, h2))];

  let particulas = [new Particula(new Vet2(0, 0), new Vet2(13, 10)),
                    new Particula(new Vet2(0, 0), new Vet2(0, 13)),
                    new Particula(new Vet2(0, 0), new Vet2(4, 20)),
                    new Particula(new Vet2(0, 0), new Vet2(10, 30)),
                    new Particula(new Vet2(0, 0), new Vet2(100, 12))];
  cena = new Cena(arestas, particulas);
}

function mouseClicked() {
  cena.arestas.push(new Aresta(new Vet2(random(-width, width), random(-height, height)), new Vet2(random(-width, width), random(-height, height))));
}

class Vet2 {
  constructor(x, y, pos = null, cor = null) {
    this.x = x;
    this.y = y;
    this.pos = pos;
    this.cor = cor;
  }

  // Seta coordenada x
  setX(x) {
    this.x = x;
  }

  // Seta coordenada y
  setY(y) {
    this.y = y;
  }

  // Retorna coordenada x
  getX() {
    return this;
  }

  // Retorna coordenada y
  getY() {
    return this.y;
  }

  // Calcula e retorna o tamanho do vetor
  tamanho() {
    return Math.sqrt(this.produtoEscalar(this));
  }

  // Soma o vetor v informado do vetor instanciado e retorna vetor resultante
  somar(v) {
    return new Vet2(this.x + v.x, this.y + v.y);
  }

  // Subtrai o vetor v informado do vetor instanciado e retorna vetor resultante
  subtrair(v) {
    return new Vet2(this.x - v.x, this.y - v.y);
  }

  // Retorna vetor resultante da multiplicação do vetor instanciado por um escalar x informado
  multiplicar(escalar) {
    return new Vet2(this.x * escalar, this.y * escalar);
  }

  // Calcula e retorna o vetor inverso ao vetor instanciado
  inverter() {
    return this.multiplicar(-1);
  }

  // Calcula e retorna o produto escalar entre o vetor instanciado e o vetor v informado
  produtoEscalar(v) {
    return this.x * v.x + this.y * v.y;
  }

  // Calcula o produto vetorial no espaço 2d entre vetor instanciado e vetor v informado
  produtoVetorial(v) {
    return this.x * v.y - this.y * v.x;
  }

  // Calcula e retorna o vetor unitário
  unitario() {
    let tam = this.tamanho();
    let tamInverso = 1 / tam;

    return this.multiplicar(tamInverso);
  }

  // Calcula e retorna o vetor projeção do vetor instanciado em v
  projetar(v) {
    // p = (u.v / v.v)*v
    let uDotV = this.produtoEscalar(v);
    let vDotV = v.produtoEscalar(v);
    let p = v.multiplicar(uDotV / vDotV);
    return p;
  }

  // Dado um vetor n (não nulo e normal à superfície de deslizamento), calcula e retorna vetor vp que representa o deslizamento do vetor instanciado na superfície
  deslizar(n, nUnitario = false) {
    let [vn, vp] = this.decompor(n, nUnitario);

    return vp;
  }

  // Dado um vetor n (unitário e normal à superfície de reflexão), calcula e retorna vetor vr que representa o vetor v refletido na superfície
  refletir(n, nUnitario = false) {
    let [vn, vp] = this.decompor(n, nUnitario);
    // vr = vp - vn
    return vp.subtrair(vn);
  }

  // Dado um vetor n não nulo, decompõe o vetor instanciado nos vetores vn e vp e retorna-os em uma lista
  decompor(n, nUnitario) {
    let vn;
    let vp;

    if (nUnitario) {
      // vn = <v, n>n, n unitário
      vn = n.multiplicar(this.produtoEscalar(n));
    } else {
      // vn = (<v, n>/<n, n>)n, n não nulo
      let numerador = this.produtoEscalar(n);
      let denominador = n.produtoEscalar(n);
      vn = n.multiplicar(numerador / denominador);
    }
    // vp = v - vn
    vp = this.subtrair(vn);
    return [vn, vp];
  }

  // Dados um vetor n e os parâmetros alfa e beta, calcula e retorna o vetor reação
  reacao(n, alfa = 1, beta = 1, nUnitario = false) {
    // r = alfa*vp - beta*vn
    // alfa*vp: o quanto vetor é projetado no plano
    // beta*vn: o quanto o vetor será refletido
    let [vn, vp] = this.decompor(n, nUnitario);
    let alfaVp = vp.multiplicar(alfa);
    let betaVn = vn.multiplicar(beta);

    return alfaVp.subtrair(betaVn);
  }

  // Calcula e retorna o vetor que representa o vetor instanciado rotacionado em 90 graus
  rotacionar90() {
    return new Vet2(this.y, -this.x);
  }

  // Dado quatro pontos A, B, C e D, retorna true se a reta A->B intersecta a reta C->D
  static intersecao(A, B, C, D) {
    let AB = B.subtrair(A);
    let AC = C.subtrair(A);
    let AD = D.subtrair(A);

    let ABxAC = AB.produtoVetorial(AC);
    let ABxAD = AB.produtoVetorial(AD);

    if ((ABxAC * ABxAD) > 0) {
      return false;
    }

    let CD = D.subtrair(C);
    let CA = A.subtrair(C);
    let CB = B.subtrair(C);

    let CDxCA = CD.produtoVetorial(CA);
    let CDxCB = CD.produtoVetorial(CB);

    if (CDxCA * CDxCB > 0) {
      return false;
    }

    return true;
  }

  // Desenha vetor instanciado a partir da sua posição
  desenhar() {
    if (this.cor) {
      colore(this.cor[0], this.cor[1], this.cor[2], this.cor[3] ? this.cor[3] : 255);
    }

    if (this.pos) {
      seta(this.pos.x, this.pos.y, this.pos.x + this.x, this.pos.y + this.y);
    } else {
      // Posição nula: desenha a partir da origem
      seta(0, 0, this.x, this.y);
    }
  }
}

class Aresta {
  constructor(inicio, fim, cor = null) {
    this.inicio = inicio;
    this.fim = fim;
    this.cor = cor;
  }

  desenhar() {
    if (this.cor) {
      colore(this.cor[0], this.cor[1], this.cor[2], this.cor[3] ? this.cor[3] : 255);
    }

    line(this.inicio.x, this.inicio.y, this.fim.x, this.fim.y);
  }
}

class Particula {
  constructor(pos, vel, d = 5, cor = null) {
    this.pos = pos;
    this.vel = vel;
    this.diametro = d;
    this.cor = cor;
  }

  mover() {
    this.pos = this.pos.somar(this.vel);
    this.vel.pos = this.pos;
  }

  desenhar() {
    if (this.cor) {
      colore(this.cor[0], this.cor[1], this.cor[2], this.cor[3] ? this.cor[3] : 255);
    }

    this.vel.desenhar();
    circle(this.pos.x, this.pos.y, this.diametro);
  }
}

class Cena {
  constructor(a, p) {
    this.arestas = a;
    this.particulas = p;
  }

  // Retorna true se há colisão entre partícula e aresta
  colisao(aresta, particula) {
    let novaPosicao = particula.pos.somar(particula.vel); // Posição da partícula após deslocamento
    return Vet2.intersecao(particula.pos, novaPosicao, aresta.inicio, aresta.fim);
  }

  desenhar() {
    // Desenha partículas
    for (let i = 0; i < this.particulas.length; i++) {
      texto(i, this.particulas[i].pos.x + 5, this.particulas[i].pos.y + 5);
      this.particulas[i].desenhar();
    }

    // Desenha arestas e verifica interseção com partículas
    let ai = null; // i-ésima aresta
    let pj = null; // j-ésima partícula
    let particulasColisao = {}; // chave: índice da partícula que colidiu, valor: aresta onde colisão ocorreu

    for (let i = 0; i < this.arestas.length; i++) {
      ai = this.arestas[i];

      for (let j = 0; j < this.particulas.length; j++) {
        pj = this.particulas[j];

        if (this.colisao(ai, pj)) {
          // Adiciona índice da partícula e aresta onde colisão ocorreu ao dicionário
          particulasColisao[j] = ai;
          stroke(180);
        } else {
          stroke(0);
        }
        // Desenha i-ésima aresta
        ai.desenhar();
      }
    }

    for (let i = 0; i < this.particulas.length; i++) {
      let p = this.particulas[i];

      if (!particulasColisao.hasOwnProperty(i)) {
        // Partícula p não colidiu: realiza movimento
        p.mover();
      } else {
        // Partícula p colidiu: atualiza sua velocidade
        let arestaColisao = particulasColisao[i];
        let n = arestaColisao.fim.subtrair(arestaColisao.inicio).rotacionar90(); // Normal à aresta onde houve colisão

        p.vel = p.vel.reacao(n);
        p.vel.pos = p.pos;
      }
    }
  }
}

function draw() {
  // desenha o fundo e configura o sistema cartesiano, simplificando o
  // processo de desenho das formas na tela
  goCartesian(false);

  cena.desenhar();

  frameRate(8);
}

/* Desenha o plano de fundo da cena. Sobrescreva de acordo com suas necessidades.
 * Além disso, desenha um plano cartesiano centrado na origem, i.e., os 2 eixos.
 *
 * NOTA: A partir dessa chamada, toda a cena é desenhada de acordo com o sistema
 *       cartesiano, i.e., a origem está no centro da tela, o eixo Y cresce para
 *       cima e o eixo X para a direita. Isso foi projetado para simplificar os
 *       trabalhos.
 */
function goCartesian(desenhar = true) {
  background(255);

  mouseXC = mouseX - width / 2;
  mouseYC = height / 2 - mouseY;

  if (desenhar) {
    colore(128, 0, 0);
    seta(0, height / 2, width, height / 2);
    colore(0, 128, 0);
    seta(width / 2, height, width / 2, 0);
  }

  translate(width / 2, height / 2);
  scale(1, -1, 1);
}

/// Atualiza as variáveis globais com as coordenadas do mouse no plano cartesiano
function grabMouse() {
  mouseXC = mouseX - width / 2;
  mouseYC = height / 2 - mouseY;
}

/** Renderiza texto corretamente no plano cartesiano
 *  @param str Texto a ser escrito
 *  @param x Posição horizontal do canto inferior esquerdo texto
 *  @param y Posição vertical do canto inferior esquerdo texto
 */
function texto(str, x, y) {
  push();
  translate(x, y);
  scale(1, -1);
  translate(-x, -y);

  // desenha o texto normalmente
  text(str, x, y);
  pop();
}

/* Define as cores de preenchimento e de contorno com o mesmo valor.
 * Há várias opções de trabalho em RGB nesse caso:
 *  - caso c1,c2,c3 e c4 sejam passados, o efeito padrão é uma cor RGBA
 *  - caso c1,c2 e c3 sejam passados, tem-se uma cor RGB.
 *  - caso c1 e c2 sejam passados, c1 é um tom de cinza e c2 é opacidade.
 *  - caso apenas c1 seja passado, c1 é um tom de cinza.
 */
function colore(c1, c2, c3, c4) {
  if (c4 != null) {
    fill(c1, c2, c3, c4);
    stroke(c1, c2, c3, c4);
    return;
  }
  if (c3 != null) {
    fill(c1, c2, c3);
    stroke(c1, c2, c3);
    return;
  }

  if (c2 == null) {
    fill(c1);
    stroke(c1);
  } else {
    fill(c1, c1, c1, c2);
    stroke(c1, c1, c1, c2);
  }
}

/* Desenha um segmento de reta com seta do ponto (x1,y1) para (x2,y2)
 */
function seta(x1, y1, x2, y2, cabeca = true) {
  // o segmento de reta
  line(x1, y1, x2, y2);
  var dx = x2 - x1,
    dy = y2 - y1;
  var le = sqrt(dx * dx + dy * dy); // comprimento do vetor
  // o vetor v é unitário paralelo ao segmento, com mesmo sentido
  var vx = dx / le,
    vy = dy / le;
  // o vetor u é unitário e perpendicular ao segmento
  var ux = -vy;
  var uy = vx;
  if (cabeca) {
    // a cabeça triangular
    triangle(
      x2,
      y2,
      x2 - 5 * vx + 2 * ux,
      y2 - 5 * vy + 2 * uy,
      x2 - 5 * vx - 2 * ux,
      y2 - 5 * vy - 2 * uy
    );
  }
}