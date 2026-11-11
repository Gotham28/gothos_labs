(() => {
  'use strict';
  // Hoot: friendly, warm, concise; answers company questions, helps book a demo (collect name + email), handles support.
  const CHAT_ENDPOINT = '/api/chat';
  const site = window.Gothos;
  const dialog = document.getElementById('chat-dialog');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const list = document.getElementById('chat-messages');
  const typing = document.getElementById('chat-typing');
  const layer = document.getElementById('owl-layer');
  const pageOwl = document.getElementById('owl');
  const avatarImage = document.querySelector('.chat-owl-avatar');
  const avatar = document.createElement('div');
  avatar.className = 'chat-owl-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatarImage.replaceWith(avatar);
  // The avatar is the perched front frame, a 400px sprite box scaled so the
  // owl fills the 64px header slot (the slot sits 11px in, 13px down).
  const AVATAR_SLOT = {left:11,top:13,size:64};
  let avatarSprite = null;
  site.sprite.ready.then(() => {
    if (!site.sprite.frames) return;      // atlas failed to load: the header keeps no avatar
    const box = site.sprite.boxFor('perch', AVATAR_SLOT);
    avatar.style.transform = `translate(${box.left}px,${box.top}px) scale(${box.width/400})`;
    const host = document.createElement('span');
    host.className = 'owl-sprite'; avatar.replaceChildren(host);
    avatarSprite = site.sprite.create(host); avatarSprite.show('perch', false);
    site.behavior.registerAvatar(avatarSprite);
  });
  let transfer = null, activation = null, dialogRun = 0;
  function stopTransfer() {
    if (!transfer) return;
    transfer.animation.cancel(); transfer.element.remove(); transfer = null;
  }
  const clamp01 = n => Math.min(1,Math.max(0,n));
  const smooth = (a,b,x) => {const t=clamp01((x-a)/(b-a));return t*t*(3-2*t);};
  function fly(from, to) {
    site.behavior.setOwner('transfer');
    stopTransfer();
    if (!site.motion.enabled || document.hidden || !site.sprite.drawable) return Promise.resolve();
    const element=document.createElement('div');
    element.className='chat-owl-transfer';
    const host=document.createElement('span');
    host.className='owl-sprite';
    element.append(host);
    const clone=site.sprite.create(host);
    const position=(x,y,width) => 'translate('+x+'px,'+y+'px) scale('+width/400+')';
    element.style.transform=position(from.left,from.top,from.width);
    clone.show('perch');
    dialog.append(element);
    const duration=620;
    const animation=element.animate([{opacity:1},{opacity:1}],{duration});
    const current=transfer={element,animation};
    const play=()=>{
      if (transfer!==current) return;
      const t=clamp01((animation.currentTime||0)/duration);
      const e=smooth(0,1,t);
      const x=from.left+(to.left-from.left)*e;
      const y=from.top+(to.top-from.top)*e-Math.sin(Math.PI*e)*36;
      element.style.transform=position(x,y,from.width+(to.width-from.width)*e);
      const spread=smooth(0,.23,t)*(1-smooth(.72,1,t));
      clone.fly(spread,t*Math.PI*2*.94,to.left-from.left,t);
      if (animation.playState==='running') requestAnimationFrame(play);
    };
    requestAnimationFrame(play);
    return animation.finished.catch(()=>{}).then(()=>{
      element.remove();
      if (transfer===current) transfer=null;
    });
  }
  function avatarDestination() {
    const panel = dialog.querySelector('.chat-panel');
    const slot = {left:panel.offsetLeft-panel.offsetWidth/2+12,top:panel.offsetTop+14,size:64};
    return site.sprite.frames ? site.sprite.boxFor('perch', slot) : {left:slot.left,top:slot.top,width:64};
  }
  function animateClose() {
    if (!dialog.open) return Promise.resolve();
    const from=transfer ? transfer.element.getBoundingClientRect() : avatar.getBoundingClientRect();
    avatar.style.visibility='hidden';
    return fly(from,pageOwl.getBoundingClientRect());
  }

  const REFUSAL = "I'm Gothos's website guide, so I can't give medical advice. Please speak to a doctor, or contact your local emergency services if it's urgent.";
  const GREETING = "Hi, I'm Mochi! How can I help you today?";
  const medical = text => /\b(symptoms?|pain|fever|cough|bleed\w*|medicine|medication|dosage|dose|diagnos\w*|treat\w*|emergenc\w*|suicid\w*|overdose|chest|breath\w*|stroke|pregnan\w*|prescri\w*|injur\w*|sick|illness|dizz\w*|nause\w*|vomit\w*|rash|antibiotic|insulin|tablet|pills?|paracetamol|ibuprofen|cancer|headache|migraine|diabet\w*|blood|glucose|cholesterol|heart|asthma|allerg\w*|infect\w*|fracture|covid|seizure|unconscious|faint\w*|wound|burns?|swollen|swelling|numb\w*|weakness|anxiety|anxious|depress\w*)\b|\b(should i take|can i take|stop taking|feel unwell|hurt\w*|health (advice|problem|question|issue|concern))\b|വേദന|മരുന്ന്|പനി/i.test(text);
  let stage='idle', name='', demoEmail='', demoId='', epoch=0, pending=null, controller=null, history=[];
  function message(text, user=false) {
    const bubble=document.createElement('p');
    bubble.className=user?'message message-user':'message message-bot';
    bubble.textContent=text;
    list.append(bubble);list.scrollTop=list.scrollHeight;
  }
  function chips(assistant=false) {
    const group=document.createElement('div');group.className='chat-chips';
    const labels=assistant?['Try the live assistant','Maybe later']:['What does Gothos build?','Arogya Health Assistant','Book a demo'];
    labels.forEach(label=>{
      const button=document.createElement('button');button.type='button';button.textContent=label;
      if(label==='Try the live assistant') {
        button.dataset.liveAssistant='';site.configureAssistantButton(button);
        button.addEventListener('click',()=>{
          dialog.addEventListener('close',()=>site.openAssistant(document.querySelector('#assistant [data-live-assistant]')),{once:true});
          site.closeDialog(dialog);
        });
      } else button.addEventListener('click',()=>send(label));
      group.append(button);
    });list.append(group);list.scrollTop=list.scrollHeight;
  }
  function cancelPending() {epoch++;pending=null;typing.hidden=true;controller?.abort();controller=null;form.querySelector('button').disabled=false;}
  function reply(text, after) {
    if(!site.motion.enabled){message(text);after?.();return;}
    typing.hidden=false;form.querySelector('button').disabled=true;
    pending={text,after,remaining:.7,epoch};site.flight?.request();
  }
  site.addTicker((_now,dt)=>{
    if(!pending||document.hidden)return;
    if(!site.motion.enabled)pending.remaining=0;else pending.remaining-=dt;
    if(pending.remaining<=0){const item=pending;pending=null;typing.hidden=true;form.querySelector('button').disabled=false;if(item.epoch===epoch){message(item.text);item.after?.();}}
  });
  function open(trigger, assistant=false) {
    activation=null;
    if(dialog.open)return;
    const run=++dialogRun;
    const origin = pageOwl.getBoundingClientRect();
    cancelPending();stage='idle';name='';demoEmail='';demoId='';history=[];list.replaceChildren();input.value='';
    site.openDialog(dialog,trigger);document.body.classList.add('chat-open');
    dispatchEvent(new CustomEvent('gothos-chat',{detail:{open:true}}));
    avatar.style.visibility = 'hidden';
    fly(origin, avatarDestination()).then(() => {
      if(run===dialogRun && dialog.open && !dialog.classList.contains('is-closing')) {
        avatar.style.visibility = ''; site.behavior.setOwner('chat');
      }
    });
    message(GREETING);
    if (site.motion.enabled) {
      const bubble = list.lastElementChild;
      bubble.setAttribute('aria-label', GREETING);
      bubble.replaceChildren();
      [...GREETING].forEach((character,index) => {
        const span = document.createElement('span');span.textContent=character;
        span.className='type-character';span.setAttribute('aria-hidden','true');
        span.style.animationDelay=(index*.018)+'s';bubble.append(span);
      });
    }
    chips();list.lastElementChild.classList.add('greeting-chips');
    if(assistant)send('Arogya Health Assistant');
  }
  async function send(raw) {
    const text=raw.trim().slice(0,1200);if(!text)return;
    cancelPending();message(text,true);input.value='';
    // Medical intent always wins, even while collecting a name/email.
    if(medical(text)){stage='idle';name='';reply(REFUSAL,()=>chips());return;}
    // Existing topic chips must navigate, never become a demo name or email.
    if (/^(What does Gothos build\?|Arogya Health Assistant|Maybe later|I need support)$/i.test(text)) { stage='idle';name=''; }
    if(/^book a demo$/i.test(text)){
      stage='name';name='';demoEmail='';demoId='';
      reply("Draft notice: I’ll ask for your name and email so the Gothos Labs team can follow up. Resend delivers the enquiry after you confirm. Happily! What's your name?");
      return;
    }
    if(stage!=='idle' && (/\?/.test(text)||/^(what|how|why|can|could|should|is|are|do|does|i (have|feel|am feeling))\b/i.test(text))) {
      stage='idle';name='';
    }
    if(stage==='name') {
      if(text.length>80||!/[\p{L}]/u.test(text)){reply('Please use a short name, up to 80 characters.');return;}
      name=text;stage='email';reply(`Thanks, ${name}! What's the best email to reach you?`);return;
    }
    if(stage==='email') {
      const probe=document.createElement('input');probe.type='email';probe.required=true;probe.value=text;
      if(text.length>254||!probe.checkValidity()){reply('Please enter a valid email address.');return;}
      demoEmail=text;demoId=crypto.randomUUID();stage='confirm';
      reply(`I can send a demo enquiry for ${name} at ${demoEmail}. Should I send it now? Reply yes or no.`);return;
    }
    if(stage==='confirm') {
      if(/^(no|no thanks|cancel)$/i.test(text)){stage='idle';name='';demoEmail='';demoId='';reply('No enquiry was sent. What else can I help with?',()=>chips());return;}
      if(/^(yes|yes please|send|send it)$/i.test(text)){
        const token=epoch;controller=new AbortController();typing.hidden=false;form.querySelector('button').disabled=true;
        try {
          await site.submitEnquiry({name,email:demoEmail,topic:'Book a demo',message:'I would like to discuss a demo of Gothos Labs products.',website:'',submissionId:demoId},controller.signal);
          if(token!==epoch||!dialog.open)return;
          stage='idle';name='';demoEmail='';demoId='';typing.hidden=true;
          reply('Your demo enquiry was accepted for delivery. The team will need to confirm any booking.',()=>chips());
        } catch(error) {
          if(error.name!=='AbortError'&&token===epoch){typing.hidden=true;reply((error.message||'The enquiry could not be sent.')+' You can reply yes to try again, or no to cancel.');}
        } finally {if(token===epoch)form.querySelector('button').disabled=false;}
        return;
      }
      stage='idle';name='';demoEmail='';demoId='';
    }
    if(/maybe later|no thanks/i.test(text)){reply('Of course. What else would you like to explore?',()=>chips());return;}
    {
      const token=epoch;controller=new AbortController();typing.hidden=false;form.querySelector('button').disabled=true;
      history.push({role:'user',content:text});
      try{
        const response=await fetch(CHAT_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:history.slice(-10)}),signal:controller.signal});
        const data=await response.json().catch(()=>({}));
        if(!response.ok)throw new Error(data.error || (response.status===404||response.status===405?'The local preview needs to be restarted.':'The guide is unavailable right now.'));
        if(token!==epoch||!dialog.open)return;
        const answer=typeof data.reply==='string'?data.reply.slice(0,2000):'';
        typing.hidden=true;
        if(!answer){reply("I couldn't answer that just now. Please try again or use Talk to us.",()=>chips());return;}
        history.push({role:'assistant',content:answer});reply(answer,()=>chips());
      }catch(error){if(error.name!=='AbortError'&&token===epoch){typing.hidden=true;reply(error.message||"I couldn't reach the guide. Please try again later or use Talk to us.",()=>chips());}}
      finally { if(token===epoch) form.querySelector('button').disabled=false; }
      return;
    }
  }
  form.addEventListener('submit',e=>{e.preventDefault();send(input.value);});
  const finishTransfer = () => { if (transfer && (!site.motion.enabled || document.hidden)) transfer.animation.finish(); };
  addEventListener('gothos-motion', finishTransfer);
  document.addEventListener('visibilitychange', finishTransfer);
  document.querySelectorAll('[data-chat]').forEach(button=>button.addEventListener('click',()=>{
    if (!button.classList.contains('owl-hit')) { open(button,button.dataset.chat==='assistant'); return; }
    if (dialog.open || activation) return;
    const reaction=site.behavior.acknowledge();
    if (!reaction) { open(button); return; }
    const token=activation={};
    reaction.then(()=>{ if (activation===token) open(button); });
  }));
  dialog.addEventListener('close',()=>{
    dialogRun++; activation=null;
    stopTransfer(); avatar.style.visibility = '';
    site.behavior.setOwner('page');
    cancelPending();stage='idle';name='';demoEmail='';demoId='';history=[];input.value='';list.replaceChildren();
    document.body.classList.remove('chat-open');dispatchEvent(new CustomEvent('gothos-chat',{detail:{open:false}}));
  });
  site.chat={open,medical,animateClose};
})();
