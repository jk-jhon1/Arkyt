// ============================================================
// assets/audio — sons ambientais por bioma e música dinâmica
// (exploração, perigo, domesticação, combate, descoberta).
// Tudo procedural via WebAudio — sem arquivos externos.
// ============================================================
export class AudioSys {
  constructor(){ this.ctx=null; this.enabled=true; this.musicTimer=0; this.mode='exploracao'; this.step=0; }
  init(){ if(!this.ctx){ try{ this.ctx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(this.ctx&&this.ctx.state==='suspended') this.ctx.resume(); }
  tone(freq,dur,type='sine',vol=0.08,slide=0){
    if(!this.ctx||!this.enabled) return;
    const t=this.ctx.currentTime, o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type=type; o.frequency.setValueAtTime(freq,t);
    if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),t+dur);
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(g).connect(this.ctx.destination); o.start(t); o.stop(t+dur);
  }
  noise(dur,vol=0.05,filterFreq=1000){
    if(!this.ctx||!this.enabled) return;
    const t=this.ctx.currentTime, len=this.ctx.sampleRate*dur, buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate), d=buf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len);
    const src=this.ctx.createBufferSource(); src.buffer=buf;
    const f=this.ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=filterFreq;
    const g=this.ctx.createGain(); g.gain.value=vol;
    src.connect(f).connect(g).connect(this.ctx.destination); src.start(t);
  }
  sfx(nome){
    if(!this.ctx||!this.enabled) return;
    switch(nome){
      case 'coletar': this.tone(600,0.08,'square',0.05); this.noise(0.08,0.04,2000); break;
      case 'golpe': this.noise(0.12,0.12,800); this.tone(120,0.1,'square',0.06,-40); break;
      case 'atacar': this.noise(0.1,0.08,1500); break;
      case 'comer': this.tone(300,0.1,'sine',0.06); setTimeout(()=>this.tone(350,0.1,'sine',0.06),120); break;
      case 'beber': this.tone(500,0.15,'sine',0.05,300); break;
      case 'craft': this.tone(800,0.1,'square',0.05); setTimeout(()=>this.tone(1000,0.12,'square',0.05),100); break;
      case 'construir': this.noise(0.15,0.1,600); this.tone(200,0.12,'square',0.06); break;
      case 'domesticar': this.tone(660,0.15,'sine',0.07); setTimeout(()=>this.tone(880,0.2,'sine',0.07),150); break;
      case 'ferimento': this.tone(180,0.2,'sawtooth',0.06,-60); break;
      case 'tratar': this.tone(520,0.12,'sine',0.06); break;
      case 'dormir': this.tone(220,0.4,'sine',0.05,-80); break;
      case 'pular': this.tone(400,0.08,'sine',0.03,200); break;
      case 'nadar': this.noise(0.2,0.05,1200); break;
      case 'chuva': this.noise(0.5,0.06,3000); break;
      case 'trovao': this.noise(0.8,0.2,300); this.tone(60,0.6,'sawtooth',0.1,-20); break;
      case 'descoberta': [523,659,784,1046].forEach((f,i)=>setTimeout(()=>this.tone(f,0.25,'sine',0.07),i*120)); break;
      case 'perigo': this.tone(110,0.3,'sawtooth',0.08); setTimeout(()=>this.tone(110,0.3,'sawtooth',0.08),350); break;
      case 'morte': this.tone(300,1.2,'sawtooth',0.08,-250); break;
      case 'salvar': this.tone(900,0.08,'sine',0.04); break;
      case 'erro': this.tone(150,0.15,'square',0.06); break;
    }
  }
  // Ambiente por bioma (chamado periodicamente)
  ambiente(biomaId, clima){
    if(!this.ctx||!this.enabled) return;
    if(clima==='chuva'||clima==='tempestade') this.noise(0.4,0.04,2500);
    switch(biomaId){
      case 'praia': case 'costa': case 'ilhas': this.noise(0.6,0.05,900); break; // água/ondas
      case 'tropical': case 'temperada': this.tone(1200+Math.random()*800,0.1,'sine',0.02); break; // aves/insetos
      case 'deserto': this.noise(0.5,0.03,500); break; // vento
      case 'gelada': this.noise(0.4,0.04,700); break; // vento frio
      case 'vulcao': this.noise(0.5,0.06,300); this.tone(70,0.4,'sawtooth',0.03); break;
      case 'pantano': this.tone(200+Math.random()*100,0.2,'sine',0.03); break;
      default: this.noise(0.3,0.02,600);
    }
    if(this.inCave) this.tone(90,0.5,'sine',0.03); // caverna: gotejamento grave
  }
  // Música dinâmica por modo
  update(dt, mode){
    if(!this.ctx||!this.enabled) return;
    this.mode=mode; this.musicTimer-=dt;
    if(this.musicTimer>0) return;
    this.musicTimer = mode==='combate'?0.35:0.6;
    const scales={ exploracao:[262,294,330,392,440], perigo:[220,233,262,311], domesticao:[330,392,440,523,587], combate:[196,208,233,262], descoberta:[523,587,659,784,880] };
    const sc=scales[mode]||scales.exploracao;
    const f=sc[Math.floor(Math.random()*sc.length)];
    this.tone(f,0.5,'triangle',0.035);
    if(mode==='combate') this.tone(f/2,0.3,'sawtooth',0.03);
    if(mode==='descoberta') this.tone(f*1.5,0.4,'sine',0.03);
  }
}
