(() => {
  'use strict';
  const site = window.Gothos;
  const layer = document.getElementById('owl-layer');
  const owl = document.getElementById('owl');
  const hit = owl.querySelector('.owl-hit');   // the only clickable part of the owl; the 400px box ignores the pointer
  const deck = site.deck || null;            // landing page only; product pages perch the owl, no flight
  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const ease = t => t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (from,to,value) => {
    const t=clamp((value-from)/(to-from));
    return t*t*(3-2*t);
  };
  const headings=['front','quarter','side'];
  const mobileLeft=new Set(['what-we-do','arogya']);
  const sectionId=slide=>slide.dataset.hash||slide.id;

  // Perched gestures and flight use distinct approved poses from the atlas.
  const FILL = .92;
  const ATLAS = new URL('assets/owl/owl-atlas.json?v=polish-1', document.baseURI);
  let atlas = null, K0 = 1, geo = null, motionRig = null, artworkReady = false;
  function createMotionRig(data, image) {
    const [width, height] = data.cell;
    const centreX = data.anchor[0];
    const footY = data.frames.perch.bbox[3];
    function crop(key) {
      const frame = data.frames[key];
      if (!frame) return null;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(image, frame.x, frame.y, width, height, 0, 0, width, height);
      return canvas;
    }
    const body = crop('perch');
    const quarter = crop('perch-quarter');
    const wave = crop('shy-wave-1');

    function mesh(texture, box, columns, rows) {
      const [left,top,right,bottom]=box;
      return {
        texture, box, columns, rows, x:left-2, y:top-2,
        dx:(right-left+4)/columns, dy:(bottom-top+4)/rows,
        points:Array.from({length:(columns+1)*(rows+1)},()=>({x:0,y:0}))
      };
    }
    const restingBox=data.frames.perch.bbox;
    const restingMesh=mesh(body,restingBox,5,8);
    const quarterMesh=mesh(quarter,data.frames['perch-quarter'].bbox,5,8);
    const waveMesh=wave && mesh(wave,data.frames['shy-wave-1'].bbox,7,8);

    // Two affine triangles per mesh cell. The shared edge coordinates follow
    // the same continuous motion field. Subpixel overlap prevents canvas seams.
    function triangle(g, texture, a, b, c, x, y, stepX, stepY) {
      const xx = (b.x-a.x)/stepX, xy = (b.y-a.y)/stepX;
      const yx = (c.x-a.x)/stepY, yy = (c.y-a.y)/stepY;
      const mx = (a.x+b.x+c.x)/3, my = (a.y+b.y+c.y)/3;
      g.save();
      g.beginPath();
      g.moveTo(a.x + (a.x-mx)*.055, a.y + (a.y-my)*.055);
      g.lineTo(b.x + (b.x-mx)*.055, b.y + (b.y-my)*.055);
      g.lineTo(c.x + (c.x-mx)*.055, c.y + (c.y-my)*.055);
      g.closePath();
      g.clip();
      g.transform(xx,xy,yx,yy,a.x-xx*x-yx*y,a.y-xy*x-yy*y);
      const left=Math.min(x,x+stepX)-2, top=Math.min(y,y+stepY)-2;
      const width=Math.abs(stepX)+4, height=Math.abs(stepY)+4;
      g.drawImage(texture,left,top,width,height,left,top,width,height);
      g.restore();
    }
    function draw(g, kind, strength, phase=0, direction=1, turned=false) {
      const bounds = [Infinity,Infinity,-Infinity,-Infinity];
      function include(x,y) {
        bounds[0]=Math.min(bounds[0],x);bounds[1]=Math.min(bounds[1],y);
        bounds[2]=Math.max(bounds[2],x);bounds[3]=Math.max(bounds[3],y);
      }
      const waveGesture=kind==='wave';
      const alternate=waveGesture && waveMesh ? waveMesh : quarterMesh;
      const waving=waveGesture && turned && waveMesh;
      const {texture,box,columns,rows,dx,dy,x:sourceX,y:sourceY,points}=turned ? alternate : restingMesh;
      const localDirection=turned && !waveGesture ? 1 : direction;
      const angle=localDirection*(kind==='tilt' ? .30*strength : waveGesture ? .12*strength : .05*strength);
      const c=Math.cos(angle),s=Math.sin(angle);
      const dip=kind==='bow' ? 46*strength : kind==='activate' ? 13*strength : 0;
      const wingAngle=(.20+.26*Math.sin(phase))*strength;
      const wingCos=Math.cos(wingAngle),wingSin=Math.sin(wingAngle);
      const look=smooth(.16,.78,strength);
      const flip=!waveGesture && direction<0;
      const [otherLeft,,otherRight]=alternate.box;
      const silhouetteLeft=mix(restingBox[0],flip ? 2*centreX-otherRight : otherLeft,look);
      const silhouetteRight=mix(restingBox[2],flip ? 2*centreX-otherLeft : otherRight,look);
      const targetLeft=turned && flip ? 2*centreX-silhouetteRight : silhouetteLeft;
      const targetRight=turned && flip ? 2*centreX-silhouetteLeft : silhouetteRight;
      for(let row=0;row<=rows;row++){
        const y=sourceY+row*dy;
        const head=1-smooth(211,268,y);
        const upper=1-smooth(211,footY,y);
        for(let col=0;col<=columns;col++){
          const x=sourceX+col*dx;
          const rx=x-centreX,ry=y-217;
          const p=points[row*(columns+1)+col];
          // Both poses share their outer width during the blend, with the
          // face anchored and the talons registered to the same perch.
          const leftShift=(targetLeft-box[0])*smooth(centreX-73,box[0],x);
          const rightShift=(targetRight-box[2])*smooth(centreX+73,box[2],x);
          p.x=x+leftShift+rightShift+((rx*(c-1)-ry*s)+localDirection*12*strength)*head;
          if(kind==='bow')p.x+=rx*.035*strength*upper;
          p.y=y+(rx*s+ry*(c-1))*head+dip*upper
            +(footY-box[3])*smooth(228,box[3],y);
          if(waving) {
            const reach=(1-smooth(220,304,x))*smooth(122,158,y)*(1-smooth(239,282,y));
            const wx=x-290,wy=y-208;
            p.x+=(wx*(wingCos-1)-wy*wingSin)*reach;
            p.y+=(wx*wingSin+wy*(wingCos-1)-10*strength)*reach;
          }
          include(p.x,p.y);
        }
      }
      if (!g) return bounds;
      for(let row=0;row<rows;row++){
        for(let col=0;col<columns;col++){
          const i=row*(columns+1)+col;
          const a=points[i], b=points[i+1], c=points[i+columns+1], d=points[i+columns+2];
          const x=sourceX+col*dx,y=sourceY+row*dy;
          triangle(g,texture,a,b,c,x,y,dx,dy);
          triangle(g,texture,d,c,b,x+dx,y+dy,-dx,-dy);
        }
      }
      return bounds;
    }
    function paintPose(g,key,mirror,fold=0,scaleY=1) {
      const {x,y,bbox:[left,top,right,bottom]}=data.frames[key];
      const width=right-left, height=bottom-top;
      const foot=mix(bottom,footY,fold);
      const topY=fold>0 ? mix(top,restingBox[1],fold) : foot+(top-bottom)*scaleY;
      const restLeft=mirror ? 2*centreX-restingBox[2] : restingBox[0];
      const restRight=mirror ? 2*centreX-restingBox[0] : restingBox[2];
      const paintLeft=mix(left,Math.max(left,restLeft),fold);
      const paintRight=mix(right,Math.min(right,restRight),fold);
      g.save();
      if(mirror) { g.translate(2*centreX,0); g.scale(-1,1); }
      if(fold>0) {
        // Compress the wings toward the shoulders while keeping the face registered.
        const xs=[left,clamp(centreX-79,left,right),clamp(centreX+79,left,right),right];
        const ys=[top,clamp(120,top,bottom),clamp(225,top,bottom),bottom];
        const tx=[paintLeft,xs[1],xs[2],paintRight];
        const ty=[topY,ys[1],ys[2],foot];
        for(let col=0;col<3;col++) {
          const w=xs[col+1]-xs[col], dw=tx[col+1]-tx[col];
          if(w<=0 || dw<=0) continue;
          for(let row=0;row<3;row++) {
            const h=ys[row+1]-ys[row], dh=ty[row+1]-ty[row];
            if(h<=0 || dh<=0) continue;
            g.drawImage(image,x+xs[col],y+ys[row],w,h,tx[col],ty[row],dw,dh);
          }
        }
      } else {
        g.drawImage(image,x+left,y+top,width,height,left,topY,width,height*scaleY);
      }
      g.restore();
      return mirror ? [2*centreX-paintRight,topY,2*centreX-paintLeft,foot] : [paintLeft,topY,paintRight,foot];
    }
    return {draw, paintPose, canWave: !!wave};
  }

  const ready = fetch(ATLAS).then(response => {
    if (!response.ok) throw new Error('atlas ' + response.status);
    return response.json();
  }).then(data => {
    atlas = data;
    const image = new Image();
    image.src = new URL(data.image, ATLAS).href;
    image.decode().then(() => {
      if (atlas !== data) return;
      artworkReady = true;
      try { motionRig = createMotionRig(data,image); } catch { motionRig = null; }
      request();
    }, () => {
      cancelGesture();
      atlas = null;
      geo = null;
      sprite = null;
      layer.classList.remove('is-ready');
      document.querySelectorAll('.chat-owl-avatar .owl-sprite,.chat-owl-transfer .owl-sprite')
        .forEach(host => { host.style.visibility = 'hidden'; });
    });
    const boxes = (data.baseOrder || data.order).map(key => data.frames[key].bbox);
    const maxW = Math.max(...boxes.map(b => b[2]-b[0]));
    K0 = 400 * FILL / maxW;
    const half = list => Math.max(...list.map(b => Math.max(data.anchor[0]-b[0],b[2]-data.anchor[0]))) * K0;
    const perch = ['perch','blink','perch-quarter'].map(n => data.frames[n].bbox);
    geo = {
      halfFly:half(boxes), halfPerch:half(perch),
      up:(data.centre[1]-data.union[1])*K0, down:(data.union[3]-data.centre[1])*K0,
      upPerch:(data.centre[1]-Math.min(...perch.map(b=>b[1])))*K0,
      downPerch:(Math.max(...perch.map(b=>b[3]))-data.centre[1])*K0,
      feet:(data.frames.perch.bbox[3]-data.centre[1])*K0
    };
    return data;
  }).catch(() => { atlas = null; geo = null; return null; });

  function createSprite(host) {
    const data = atlas;
    const [cw,ch] = data.cell;
    const url = new URL(data.image,ATLAS).href;
    host.style.width = cw + 'px';
    host.style.height = ch + 'px';
    host.style.transform = 'translate('+(200-data.anchor[0]*K0)+'px,'+(200-data.centre[1]*K0)+'px) scale('+K0+')';
    const frame = document.createElement('i');
    frame.className = 'owl-frame';
    frame.style.cssText = 'width:'+cw+'px;height:'+ch+'px;background-image:url("'+url+'");background-size:'+data.atlas[0]+'px '+data.atlas[1]+'px;transform-origin:'+data.anchor[0]+'px '+data.frames.perch.bbox[3]+'px';
    const canvas = document.createElement('canvas');
    canvas.className = 'owl-motion-canvas';
    canvas.width = cw;
    canvas.height = ch;
    canvas.hidden = true;
    const g = canvas.getContext('2d');
    const gestureCanvas=document.createElement('canvas');
    gestureCanvas.width=cw;
    gestureCanvas.height=ch;
    const gestureContext=gestureCanvas.getContext('2d');
    host.append(frame,canvas);
    let launchPose=null;
    const [anchorX,anchorY]=data.anchor;
    const drawPose=(key,mirror,weight,fold=0,scaleY=1)=>({
      key,mirror,weight,paint:()=>motionRig.paintPose(g,key,mirror,fold,scaleY)
    });
    function composite(layers) {
      const visible=layers.filter(layer=>layer.weight>.002);
      const primary=visible.reduce((best,layer)=>layer.weight>best.weight?layer:best);
      const bounds=[Infinity,Infinity,-Infinity,-Infinity];
      const face=()=>{
        g.moveTo(anchorX+100,anchorY);
        g.ellipse(anchorX,anchorY,100,69,0,0,Math.PI*2);
      };
      g.clearRect(0,0,cw,ch);
      g.save();
      if (visible.length>1) {
        // Interpolate the wings and body. Keep one face through the turn.
        g.beginPath();
        g.rect(0,0,cw,ch);
        face();
        g.clip('evenodd');
        g.globalCompositeOperation='lighter';
      }
      for(const layer of visible) {
        g.globalAlpha=visible.length===1 ? 1 : layer.weight;
        const b=layer.paint();
        bounds[0]=Math.min(bounds[0],b[0]); bounds[1]=Math.min(bounds[1],b[1]);
        bounds[2]=Math.max(bounds[2],b[2]); bounds[3]=Math.max(bounds[3],b[3]);
      }
      g.restore();
      if (visible.length>1) {
        g.save();
        g.beginPath();
        face();
        g.clip();
        primary.paint();
        g.restore();
      }
      actor.bounds=bounds;
      actor.key=primary.key;
      actor.mirror=primary.mirror;
      frame.hidden=true;
      canvas.hidden=false;
    }
    const actor = {
      key:'perch', mirror:false, bounds:data.frames.perch.bbox,
      show(key, mirror=false, scaleY=1) {
        launchPose=null;
        const pose = data.frames[key] || data.frames.perch;
        actor.key = data.frames[key] ? key : 'perch';
        actor.mirror = mirror;
        const [left,top,right,bottom]=pose.bbox;
        const feet=data.frames.perch.bbox[3];
        actor.bounds = [mirror?2*anchorX-right:left,feet+(top-feet)*scaleY,
          mirror?2*anchorX-left:right,feet+(bottom-feet)*scaleY];
        canvas.hidden = true;
        frame.hidden = false;
        frame.style.opacity = '1';
        frame.style.backgroundPosition = -pose.x+'px '+-pose.y+'px';
        frame.style.transform = (mirror ? 'scaleX(-1) ' : '')+(scaleY===1 ? '' : 'scaleY('+scaleY+')');
      },
      animate(kind,strength,phase,direction) {
        if (!g || !gestureContext || !motionRig || (kind==='wave' && !motionRig.canWave)) return false;
        launchPose=null;
        const look=smooth(.16,.78,strength);
        const wave=kind==='wave';
        const mirror=!wave && direction<0;
        const pose=(key,turned,flip,weight)=>({key,mirror:flip,weight,paint:()=>{
          const painter=gestureContext;
          painter.clearRect(0,0,cw,ch);
          painter.save();
          if(flip) { painter.translate(2*anchorX,0); painter.scale(-1,1); }
          const b=motionRig.draw(painter,kind,strength,phase,direction,turned);
          painter.restore();
          g.drawImage(gestureCanvas,0,0);
          return flip ? [2*anchorX-b[2],b[1],2*anchorX-b[0],b[3]] : b;
        }});
        composite([
          pose('perch',false,false,1-look),
          pose(wave?'shy-wave-1':'perch-quarter',true,mirror,look)
        ]);
        return true;
      },
      breathe(clock,direction=0) {
        launchPose=null;
        const inhale = (1-Math.cos(clock*2*Math.PI/4.1))*.5;
        const scale=1+.012*inhale;
        const cycle=clock%7;
        const mirror=direction ? direction<0 : Math.floor(clock/7)%2===0;
        const look=smooth(2.4,2.63,cycle)*(1-smooth(4.25,4.5,cycle));
        const blinking=(cycle>.74 && cycle<.88)||(cycle>5.73 && cycle<5.87);
        if (!g || !motionRig || (!look && !blinking)) { actor.show('perch',false,scale); return; }
        if (blinking) {
          composite([drawPose('blink',false,1,1,scale)]);
          return;
        }
        composite([drawPose('perch',false,1-look,0,scale),drawPose('perch-quarter',mirror,look,0,scale)]);
      },
      fly(spread,phase,distance,progress) {
        // Use the original turn and wingbeat timings as the centers of eased
        // transitions. A dropped frame does not restart a pose transition.
        const turn=Math.abs(distance)>12 ? smooth(.165,.235,progress)*(1-smooth(.805,.875,progress)) : 0;
        const profile=Math.abs(distance)>40 ? smooth(.325,.395,progress)*(1-smooth(.665,.735,progress)) : 0;
        const directions=[1-turn,turn*(1-profile),turn*profile];
        const stroke=phase/(2*Math.PI)%1;
        const up=1-smooth(.128,.192,stroke)*(1-smooth(.808,.872,stroke));
        const down=smooth(.286,.354,stroke)*(1-smooth(.486,.554,stroke));
        const wings=[['up',up],['level',1-up-down],['down',down]];
        const mirror=distance<0;
        const lift=smooth(.03,.18,progress)*(1-smooth(.79,.996,progress));
        if (!g || !motionRig) {
          const heading=headings[directions.indexOf(Math.max(...directions))];
          const [wing]=wings.reduce((best,current)=>current[1]>best[1]?current:best);
          actor.show(lift>.5?heading+'-'+wing:'perch',lift>.5&&mirror);
          return;
        }
        launchPose??={key:actor.key,mirror:actor.mirror};
        const fold=1-smooth(.055,.285,progress)*(1-smooth(.64,.93,progress));
        const wingFold=fold-fold*(1-fold)*spread*.22;
        const crouch=.045*Math.sin(Math.PI*clamp(progress/.17))**2
          +.054*Math.sin(Math.PI*clamp((progress-.8)/.2))**2;
        const rest=progress<.5 ? launchPose : {key:'perch',mirror:false};
        const poses=[drawPose(rest.key,rest.mirror,1-lift,0,1-crouch)];
        for(const [i,weight] of directions.entries()){
          if(weight<=0)continue;
          for(const [wing,beat] of wings){
            if(beat>0)poses.push(drawPose(headings[i]+'-'+wing,mirror,lift*weight*beat,wingFold));
          }
        }
        composite(poses);
      }
    };
    return actor;
  }
  // The 400-box rect that lands pose `name` centred in a square slot, at the
  // size it takes there. The chat avatar and the fly-to-chat clone share this.
  function boxFor(name, slot) {
    const b = atlas.frames[name].bbox;
    const k = slot.size * .94 / Math.max(b[2] - b[0], b[3] - b[1]);
    const s = k / K0;
    return {
      left: slot.left + slot.size / 2 - (200 - atlas.anchor[0] * K0 + (b[0] + b[2]) / 2 * K0) * s,
      top: slot.top + slot.size / 2 - (200 - atlas.centre[1] * K0 + (b[1] + b[3]) / 2 * K0) * s,
      width: 400 * s
    };
  }
  let sprite = null;
  ready.then(data => { if (!data || !atlas) return; sprite = createSprite(owl.querySelector('.owl-sprite')); measure(); });

  let raf = 0, previous = 0;
  let clock = 0, headerBottom = 0;
  let state = null, initialized = false, lastSlide = -1;
  let chat = false;
  let wingPhase = 0, wingSpread = 0, airspeed = 0, bank = 0, wingCycles = 0, airSeconds = 0;
  let mode = 'ground';
  let size = 200, stops = [], paint = {x:0,y:0,s:0,clampedY:0};
  const chatDialog = document.getElementById('chat-dialog');

  const motions = {
    wave: {duration:1750, points:[[0,0],[.25,1],[.75,1],[1,0]]},
    tilt: {duration:1280, points:[[0,0],[.34,1],[.65,1],[1,0]]},
    bow: {duration:1220, points:[[0,0],[.12,-.09],[.43,1],[.66,1],[1,0]]},
    activate: {duration:180, points:[[0,0],[.24,-.18],[.63,1],[1,0]]}
  };
  const sectionGestures = {'what-we-do':'tilt',owl:'bow'};
  const cooldown = 12000;
  const lastEntryMotion = new Map();
  const motionEnvelopes = new Map();
  let owner='page', avatarRig=null, gesture=null, serial=0, idleSince=0;
  let observedSection=null, queuedEntry=null, lastNativeScroll=-Infinity;

  function curve(points, progress) {
    for (let i=1;i<points.length;i++) {
      const [end,value] = points[i];
      if (progress>end) continue;
      const [start,previous] = points[i-1];
      const t = clamp((progress-start)/(end-start));
      return mix(previous,value,t*t*t*(t*(6*t-15)+10));
    }
    return 0;
  }
  function cancelGesture() {
    if (!gesture) return;
    const current=gesture;
    gesture=null;
    clearTimeout(current.watchdog);
    idleSince=clock;
    current.done?.();
  }
  function discardEntry() {
    queuedEntry=null;
    if (deck && observedSection!==null) observedSection=deck.current;
  }
  function envelope(kind,direction) {
    const key=kind+direction;
    if (!motionEnvelopes.has(key)) {
      const b=[Infinity,Infinity,-Infinity,-Infinity];
      for (const strength of [-.2,0,.25,.5,.75,1]) {
        for(let phase=0;phase<Math.PI*2;phase+=Math.PI/6) {
          for(const turned of [false,true]) {
            const turn=turned && kind!=='wave';
            const v=motionRig.draw(null,kind,strength,phase,direction,turned);
            if(turn && direction<0) [v[0],v[2]]=[2*atlas.anchor[0]-v[2],2*atlas.anchor[0]-v[0]];
            b[0]=Math.min(b[0],v[0]);b[1]=Math.min(b[1],v[1]);
            b[2]=Math.max(b[2],v[2]);b[3]=Math.max(b[3],v[3]);
          }
        }
      }
      motionEnvelopes.set(key,b);
    }
    return motionEnvelopes.get(key);
  }
  function safeGesture(kind,direction) {
    const b=envelope(kind,direction);
    const k=K0*paint.s;
    const left=paint.x+(b[0]-atlas.anchor[0])*k;
    const right=paint.x+(b[2]-atlas.anchor[0])*k;
    const top=paint.y+(b[1]-atlas.centre[1])*k;
    const bottom=paint.y+(b[3]-atlas.centre[1])*k;
    if (left<6 || right>innerWidth-6 || top<headerBottom+8 || bottom>innerHeight-5) return false;
    const root=deck ? deck.slides[deck.current] : document.querySelector('main');
    if (!root) return true;
    const text=document.createRange();
    for (const el of root.querySelectorAll('h1,h2,h3,p,a,button,input,select,textarea')) {
      if (el.closest('.perch')) continue;
      // Wrapped copy only occupies the line fragments, while controls reserve their entire box.
      const isCopy=el.matches('h1,h2,h3,p');
      if (isCopy) text.selectNodeContents(el);
      for (const r of isCopy ? text.getClientRects() : el.getClientRects()) {
        if (left<r.right+3 && right>r.left-3 && top<r.bottom+3 && bottom>r.top-3) return false;
      }
    }
    return true;
  }
  function startGesture(kind, now, done) {
    const direction=paint.x>innerWidth*.5 ? -1 : 1;
    if (!site.motion.enabled || document.hidden || !motionRig || owner!=='page' || chat ||
        mode!=='ground' || deck?.moving || !paint.s || !safeGesture(kind,direction)) return false;
    cancelGesture();
    gesture={kind,start:now,done,direction,serial:++serial};
    request();
    return true;
  }
  function sectionFrame(now, sample) {
    if (!deck || owner!=='page' || chat || sample?.moving) return;
    if (site.motion.enabled && !motionRig) return;
    const index=deck.current;
    if (index!==observedSection) {
      observedSection=index;
      if (gesture?.kind!=='activate') cancelGesture();
      const slide=deck.slides[index];
      const id=sectionId(slide);
      const kind=id==='top' && !lastEntryMotion.has('wave') ? 'wave' : sectionGestures[id];
      const eligible=kind && now-(lastEntryMotion.get(kind)??-Infinity)>=cooldown;
      queuedEntry=eligible ? {kind,earliest:now+130} : null;
    }
    if (!site.motion.enabled) { queuedEntry=null; return; }
    if (!queuedEntry || !motionRig || !paint.s || gesture) return;
    const {kind,earliest}=queuedEntry;
    const readyAt=deck.active ? earliest : Math.max(earliest,lastNativeScroll+130);
    if (now<readyAt) return;
    if (now>readyAt+490) {
      queuedEntry=null;
      return;
    }
    if (startGesture(kind,now)) {
      queuedEntry=null;
      lastEntryMotion.set(kind,now);
    }
  }
  function drawGround(now, motion) {
    if (gesture && now-gesture.start>=motions[gesture.kind].duration) cancelGesture();
    if (gesture) {
      const progress=clamp((now-gesture.start)/motions[gesture.kind].duration);
      const strength=curve(motions[gesture.kind].points,progress);
      const beats=gesture.kind==='wave' ? 8 : 4;
      if (sprite.animate(gesture.kind,strength,progress*beats*Math.PI,gesture.direction)) return;
    }
    if (motion && artworkReady) sprite.breathe(clock-idleSince,paint.x>innerWidth*.5?-1:1);
    else sprite.show('perch');
  }
  site.behavior = {
    registerAvatar(rig) { avatarRig=rig; },
    setOwner(value) {
      cancelGesture();
      discardEntry();
      owner=value;
      idleSince=clock;
      sprite?.show('perch');
      avatarRig?.show('perch');
      request();
    },
    acknowledge() {
      let resolve;
      const result=new Promise(done=>{resolve=done;});
      if (!startGesture('activate',performance.now(),resolve)) return null;
      queuedEntry=null;
      gesture.watchdog=setTimeout(()=>{cancelGesture();request();},195);
      return result;
    },
    state: () => ({owner,action:gesture?.kind || null,serial,section:observedSection})
  };

  function syncChat() {
    // Chat owns a separate avatar, leaving the page flight state untouched.
    const open = chatDialog.open;
    chat = open;
    layer.style.visibility = open ? 'hidden' : '';
    hit.tabIndex = open ? -1 : 0;
  }
  // One body size per viewport. styles.css derives --owl from the same formula, so each
  // section's perch box reserves the room the perched owl takes without waiting for script.
  const bodySize = () => innerWidth < 760 ? Math.min(innerWidth * .5, innerHeight * .28) : Math.min(innerHeight * .43, innerWidth * .245);
  function measure() {
    headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
    if (deck && deck.active) {
      size = bodySize();
      // Each slide's perch box is the owl's resting place: feet at its bottom edge,
      // centred on it. Read relative to the slide so a move in progress is harmless.
      stops = deck.slides.map(slide => {
        const perch = slide.querySelector('.perch');
        if (!perch) return { x: innerWidth * .85, y: innerHeight - 24 };
        const s = slide.getBoundingClientRect(), r = perch.getBoundingClientRect();
        return { x: r.left - s.left + r.width / 2, y: r.bottom - s.top };
      });
    } else {
      // In native mobile scrolling use the visible section's side and keep the
      // owl in view. Product pages and desktop scroll mode have a corner perch.
      size = innerWidth < 760 ? 150 : 180;
      const half = geo ? geo.halfPerch * size / 400 : size * .25;
      const right=innerWidth-16-half;
      const corner={x:right,y:innerHeight-16};
      stops=deck && innerWidth<760 ? deck.slides.map(slide=>
        mobileLeft.has(sectionId(slide)) ? {x:innerWidth-right,y:corner.y} : corner) : [corner];
    }
    request();
  }
  // One leg at time fraction f: wings open on take-off and fold into the landing.
  function wingsAt(f) {
    return Math.min(ease(clamp(f / .22)), 1 - ease(clamp((f - .72) / .28)));
  }
  function flightFrame(dt, motion, sample, from, to) {
    const flying=motion && !chat && sample?.moving && from && to;
    if (!flying) { mode='ground'; wingPhase=0; return null; }
    const f=sample.f;
    mode=f<.12 || f>=.89 ? 'crouch' : 'air';
    const rate=1.4+.2*clamp(airspeed*6);
    wingPhase=(wingPhase+dt*Math.PI*2*rate)%(Math.PI*2);
    if (mode==='air') { wingCycles+=dt*rate; airSeconds+=dt; }
    return {distance:to.x-from.x,progress:f};
  }
  function request() {
    if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function frame(now) {
    raf = 0;
    const dt = previous ? Math.min((now - previous) / 1000, .05) : .016;
    previous = now;
    syncChat();
    const motion = site.motion.enabled;
    if (motion) clock += dt;
    site.tick(now, dt);
    // Local chat replies and the site's other tickers still work if art fails.
    if (!atlas || !sprite) { if (motion) request(); return; }
    // Where the owl should be: its perch, or on the wing between two perches in
    // step with the deck's eased progress. The feet are what perch.
    const sample = deck && deck.active ? deck.sample(now) : null;
    const from = stops[sample ? sample.from : 0], to = stops[sample ? sample.to : 0];
    const rest = stops[sample ? sample.current : deck?.current] || stops[0];
    let feet, tx, wings = 0;
    if (sample && sample.moving && motion && from && to) {
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      const arc = Math.sin(Math.PI * sample.e) * clamp(innerHeight * .06 + dist * .12, 0, innerHeight * .16);
      tx = mix(from.x, to.x, sample.e);
      feet = mix(from.y, to.y, sample.e) - arc;
      wings = wingsAt(sample.f);
    } else if (rest) { tx = rest.x; feet = rest.y; }
    else { tx = innerWidth * .85; feet = innerHeight - 24; }
    const scale = size / 400;
    const target = { x: tx, y: feet - geo.feet * scale };
    if (!initialized) { state = { ...target }; initialized = true; }
    const beforeX = state.x, beforeY = state.y;
    const nativeMobile=deck && !deck.active && innerWidth<760;
    const follow = motion ? 1 - Math.exp(-dt * (nativeMobile ? 12 : 60)) : 1;
    state.x = mix(state.x, target.x, follow); state.y = mix(state.y, target.y, follow);
    const vx = (state.x - beforeX) / dt;
    const vy = (state.y - beforeY) / dt;
    // Bank follows actual sideways travel, so a return flight banks the other way.
    const speed = Math.hypot(vx, vy) / Math.max(1, innerHeight);
    airspeed = motion && !chat ? mix(airspeed, speed, 1 - Math.exp(-dt * 10)) : 0;
    bank = motion && !chat ? mix(bank, clamp(vx / innerWidth * 40, -10, 10), 1 - Math.exp(-dt * 7)) : 0;
    // Wings follow the leg: open from take-off, folded on a perch.
    let u = motion && !chat ? clamp(wings * (.82 + .18 * clamp(airspeed * 5))) : 0;
    wingSpread = !motion ? 0 : mix(wingSpread, u, 1 - Math.exp(-dt * (u > wingSpread ? 12 : 5)));
    const wasFlying=mode!=='ground';
    const flight=flightFrame(dt,motion,sample,from,to);
    u = flight ? wingSpread : 0;
    if (flight) {
      cancelGesture();
      queuedEntry=null;
      sprite.fly(u,wingPhase,flight.distance,flight.progress);
    } else {
      if (wasFlying) idleSince=clock;
      if (!nativeMobile || Math.abs(state.x-target.x)<5) sectionFrame(now,sample);
      drawGround(now,motion && owner==='page');
    }
    if (owner==='chat' && avatarRig) {
      if (motion && artworkReady) avatarRig.breathe(clock-idleSince);
      else avatarRig.show('perch');
    }
    layer.classList.add('is-ready');
    layer.classList.toggle('flying', !!(sample && sample.moving) || !!(nativeMobile && Math.abs(state.x-target.x)>5));
    const bob = flight ? Math.sin(wingPhase-.65)*4*u*(1-smooth(.72,.99,flight.progress)) : 0;
    // The same size everywhere; only a narrow window shrinks it to fit.
    const paintSize = Math.min(size, 400 * (innerWidth - 24) / (2 * geo.halfFly));
    const s = paintSize / 400;
    const [left,top,right,bottom]=sprite.bounds;
    const rad=bank*Math.PI/180, cos=Math.cos(rad), sin=Math.sin(rad);
    const ink=[[left,top],[right,top],[right,bottom],[left,bottom]].map(([x,y])=>{
      const dx=(x-atlas.anchor[0])*K0,dy=(y-atlas.centre[1])*K0;
      return [dx*cos-dy*sin,dx*sin+dy*cos];
    });
    const xOffsets=ink.map(([x])=>x),yOffsets=ink.map(([,y])=>y);
    const leftInset=Math.max(geo.halfPerch,-Math.min(...xOffsets))*s+6;
    const rightInset=Math.max(geo.halfPerch,Math.max(...xOffsets))*s+6;
    const paintX=clamp(state.x,leftInset,innerWidth-rightInset);
    const rise=Math.max(geo.upPerch,-Math.min(...yOffsets))*s;
    const wantY = state.y + bob;
    const fall=Math.max(geo.downPerch,Math.max(...yOffsets))*s;
    const paintY=clamp(wantY,headerBottom+12+rise,innerHeight-fall-6);
    paint = { x: paintX, y: paintY, s, clampedY: paintY - wantY, bank };
    owl.style.transform = `translate3d(${paintX}px,${paintY}px,0) translate(-50%,-50%) rotate(${bank}deg) scale(${s})`;
    document.getElementById('shadow').style.cssText = `transform:translate3d(${paintX}px,${paintY + geo.feet * s}px,0) translate(-50%,-50%) scale(${s});opacity:${(1 - u) * .18}`;
    // Without motion the owl does not fly; it appears at the new perch.
    const slide = sample ? sample.current : deck?.current ?? 0;
    if (!motion && slide !== lastSlide && lastSlide !== -1) { owl.classList.remove('position-fade'); void owl.offsetWidth; owl.classList.add('position-fade'); }
    lastSlide = slide;
    if (motion || Math.abs(state.x - target.x) > .2 || Math.abs(state.y - target.y) > .2 || (sample && sample.moving)) request();
  }
  addEventListener('resize', () => { cancelGesture(); discardEntry(); measure(); }, {passive:true});
  addEventListener('scroll', () => {
    if (!deck || deck.active) return;
    lastNativeScroll=performance.now();
    if (gesture?.kind!=='activate') cancelGesture();
    request();
  }, {passive:true});
  document.addEventListener('visibilitychange', () => {
    cancelGesture();
    discardEntry();
    previous=0;
    if (document.hidden) { cancelAnimationFrame(raf); raf=0; }
    else request();
  });
  addEventListener('gothos-motion', () => { cancelGesture(); discardEntry(); previous=0; request(); });
  addEventListener('gothos-chat', () => { syncChat(); measure(); request(); });
  chatDialog.addEventListener('close', () => { syncChat(); measure(); request(); });
  new MutationObserver(() => { syncChat(); request(); }).observe(chatDialog,{attributes:true,attributeFilter:['open']});
  addEventListener('gothos-deck', () => { cancelGesture(); discardEntry(); measure(); });
  new ResizeObserver(measure).observe(document.body);
  document.fonts.ready.then(measure);
  measure();
  // Geometry helpers for checks, not customer data. The sprite API is shared with
  // chat.js for the avatar and the fly-to-chat clone.
  site.flight = {
    measure, request,
    pose: () => ({key:sprite?.key || 'perch',mirror:!!sprite?.mirror,mode,
      yaw:Math.max(0,headings.indexOf(sprite?.key.split('-')[0])),bounds:sprite?.bounds}),
    state: () => ({ ...paint, stops, size, headerBottom, geo, wingCycles, airSeconds })
  };
  site.sprite = {
    ready,
    create: host => createSprite(host),
    boxFor,
    get drawable() { return artworkReady && !!atlas; },
    get frames() { return atlas?.frames; }
  };
})();
