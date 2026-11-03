
(() => {
  'use strict';
  const SITE_CONFIG = { assistantUrl: '', assistantFrameAllowed: true, assistantVoiceVerified: true };
  const tickers = new Set();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  try { paused = sessionStorage.getItem('gothos-motion-paused') === 'yes'; } catch {}
  const motion = { enabled: !reduced.matches && !paused };
  const site = window.Gothos = {
    config: SITE_CONFIG, motion,
    addTicker: fn => tickers.add(fn),
    tick: (now, dt) => tickers.forEach(fn => fn(now, dt))
  };
  document.documentElement.classList.add('js');
  const motionButton = document.getElementById('motion-control');
  function syncMotion() {
    motion.enabled = !reduced.matches && !paused;
    document.body.classList.toggle('motion-on', motion.enabled);
    document.body.classList.toggle('motion-off', !motion.enabled);
    motionButton.setAttribute('aria-pressed', String(!motion.enabled));
    motionButton.disabled = reduced.matches;
    motionButton.querySelector('span').textContent = reduced.matches ? 'Reduced motion' : motion.enabled ? 'Pause motion' : 'Resume motion';
    document.getElementById('motion-icon').setAttribute('d', motion.enabled ? 'M6 4v10M12 4v10' : 'm5 3 10 6-10 6Z');
    if (!motion.enabled) finishSequence();
    dispatchEvent(new Event('gothos-motion'));
  }
  motionButton.addEventListener('click', () => {
    paused = motion.enabled;
    try { sessionStorage.setItem('gothos-motion-paused', paused ? 'yes' : 'no'); } catch {}
    syncMotion();
  });
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('document-hidden', document.hidden));
  const triggers = new WeakMap();
  const overflowBefore = new WeakMap();
  site.openDialog = (dialog, trigger) => {
    if (dialog.open) return;
    triggers.set(dialog, trigger || document.activeElement);
    overflowBefore.set(dialog, document.body.style.overflow);
    dialog.showModal();
    document.body.style.overflow = 'hidden';
  };
  site.closeDialog = dialog => {
    if (!dialog.open || dialog.classList.contains('is-closing')) return;
    if (dialog.id === 'chat-dialog' && motion.enabled) {
      const returnFlight = site.chat?.animateClose() || Promise.resolve();
      dialog.classList.add('is-closing');
      dispatchEvent(new CustomEvent('gothos-chat', { detail: { open: false } }));
      returnFlight.finally(() => { dialog.close(); dialog.classList.remove('is-closing'); });
    } else dialog.close();
  };
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('.dialog-close').forEach(button => button.addEventListener('click', () => site.closeDialog(dialog)));
    dialog.addEventListener('click', event => { if (event.target === dialog) site.closeDialog(dialog); });
    dialog.addEventListener('cancel', event => {
      if (dialog.id === 'chat-dialog') { event.preventDefault(); site.closeDialog(dialog); }
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = overflowBefore.get(dialog) || '';
      queueMicrotask(() => {
        if (!document.querySelector('dialog[open]')) {
          const trigger = triggers.get(dialog);
          if (trigger?.isConnected) trigger.focus({ preventScroll: true });
        }
      });
    });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll('button:not(:disabled),a[href],input:not(:disabled),textarea,select,summary,iframe,[tabindex="0"]')].filter(el => el.tabIndex >= 0 && el.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
  });
  const menu = document.getElementById('navigation'), menuButton = document.getElementById('menu-button');
  function closeMenu() { menu.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); }
  menuButton.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { const open=menu.classList.contains('open');closeMenu();if(open)menuButton.focus(); } });
  document.addEventListener('click', e => { if(!e.target.closest('.site-header'))closeMenu(); });
  document.getElementById('year').textContent = new Date().getFullYear();
  // The interactive six-screen preview lives on elogbook.html only.
  if (document.getElementById('elog-panel')) {
  const previewPanel = document.getElementById('elog-panel');
  const dashboardMarkup = previewPanel.innerHTML;
  const previewTabs = [...document.querySelectorAll('[data-preview-tab]')];
  const previewLayout = matchMedia('(max-width: 759px)');
  const syncPreviewOrientation = () => document.querySelector('.elog-nav').setAttribute('aria-orientation', previewLayout.matches ? 'horizontal' : 'vertical');
  previewLayout.addEventListener('change', syncPreviewOrientation);
  syncPreviewOrientation();
  const previewScreens = {
  dashboard: { title: 'Dashboard' },
  cases: { title: 'Case Logs', singular: 'clinical case', icon: 'book', description: 'Document clinical encounters with their training context and follow faculty verification.', columns: ['Date', 'Clinical case', 'Verification'], guide: ['Record the clinical activity and its context.', 'Submit the entry for assigned faculty to review.', 'Follow the entry’s verification status in your logbook.'] },
  procedures: { title: 'Procedure Logs', singular: 'procedure', icon: 'activity', description: 'Keep procedure records, supervision context, and verification status together.', columns: ['Date', 'Procedure', 'Verification'], guide: ['Record the procedure and its training details.', 'Keep supervision and participation with the entry.', 'Follow faculty verification alongside the record.'] },
  academics: { title: 'Academic Activities', singular: 'academic activity', icon: 'academic', description: 'Document seminars, journal clubs, presentations, teaching sessions, and other academic work.', columns: ['Date', 'Academic activity', 'Verification'], guide: ['Choose the academic activity and record its details.', 'Keep the topic and training context together.', 'Bring the entry into the faculty review process.'] },
  postings: { title: 'Postings & Rotations', singular: 'posting', icon: 'calendar', description: 'Keep your clinical rotations, posting dates, and department assignment in view.', columns: ['Posting', 'Dates', 'Department'], guide: ['View your clinical posting and rotation records.', 'Check the dates attached to each assignment.', 'Keep the posting context close to your training activity.'] },
  assessments: { title: 'Assessments', singular: 'assessment', icon: 'clipboard', description: 'View the assessment records and feedback entered during your training.', columns: ['Assessment', 'Date', 'Faculty feedback'], guide: ['Open the assessments recorded during training.', 'Read faculty feedback in the same workspace.', 'Keep assessment context with your wider training record.'] }
};
  function showPreviewScreen(key, focusTab = false) {
    const screen = previewScreens[key];
    if (!screen) return;
    previewTabs.forEach(tab => {
      const selected = tab.dataset.previewTab === key;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focusTab) tab.focus();
    });
    document.getElementById('preview-screen-title').textContent = screen.title;
    previewPanel.setAttribute('aria-labelledby', 'preview-tab-' + key);
    if (key === 'dashboard') previewPanel.innerHTML = dashboardMarkup;
    else previewPanel.innerHTML = '<div class="elog-list-page"><div class="elog-list-intro"><span class="elog-section-icon"><svg aria-hidden="true"><use href="#'+screen.icon+'"/></svg></span><div><h3>'+screen.title+'</h3><p>'+screen.description+'</p></div></div><div class="elog-list-table"><div class="elog-table-head">'+screen.columns.map(column=>'<span>'+column+'</span>').join('')+'</div><div class="elog-empty"><svg aria-hidden="true"><use href="#'+screen.icon+'"/></svg><strong>No '+screen.singular+' records in this preview.</strong><p>Your personal and clinical records are not loaded here.</p></div></div><details class="elog-guide"><summary>How this part of ELogBook works<svg aria-hidden="true"><use href="#chevron"/></svg></summary><ol>'+screen.guide.map(step=>'<li>'+step+'</li>').join('')+'</ol></details></div>';
    previewPanel.scrollTop = 0;
  }
  previewTabs.forEach(tab => {
    tab.addEventListener('click', () => showPreviewScreen(tab.dataset.previewTab));
    tab.addEventListener('keydown', event => {
      const index=previewTabs.indexOf(tab);
      let next;
      if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%previewTabs.length;
      else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index-1+previewTabs.length)%previewTabs.length;
      else if(event.key==='Home')next=0;else if(event.key==='End')next=previewTabs.length-1;
      if(next!==undefined){event.preventDefault();showPreviewScreen(previewTabs[next].dataset.previewTab,true);}
    });
  });
  previewPanel.addEventListener('click',event=>{const button=event.target.closest('[data-preview-go]');if(button)showPreviewScreen(button.dataset.previewGo,true);});
  const previewDialog=document.getElementById('preview-dialog'), previewWindow=document.getElementById('product-window'), previewHome=document.getElementById('product-preview');
  let previewTrigger=null;
  document.querySelectorAll('[data-expand-preview]').forEach(button=>button.addEventListener('click',event=>{
    if(previewDialog.open)return;
    previewTrigger=event.currentTarget;
    document.getElementById('preview-dialog-host').append(previewWindow);
    site.openDialog(previewDialog,event.currentTarget);
  }));
  // The triggers live inside the window, so focus returns once it is back home.
  previewDialog.addEventListener('close',()=>{previewHome.append(previewWindow);if(previewTrigger?.isConnected)previewTrigger.focus({preventScroll:true});});
  }

  site.downloadBrief = ({name='', email='', topic='', message=''}) => {
    const line=value=>String(value).replace(/[\r\n]+/g,' ').slice(0,300);
    const brief = 'Gothos Labs enquiry\n\nName: '+line(name)+'\nEmail: '+line(email)+'\nTopic: '+line(topic)+'\n\n'+String(message).slice(0,3000)+'\n\nPrepared locally on your device. Nothing has been sent and no booking has been made.\n';
    const url=URL.createObjectURL(new Blob([brief],{type:'text/plain;charset=utf-8'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download='gothos-labs-enquiry.txt';
    document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
  };
  document.getElementById('enquiry-form')?.addEventListener('submit',event=>{
    event.preventDefault();const form=event.currentTarget;
    if(!form.reportValidity())return;
    const data=new FormData(form);site.downloadBrief({name:data.get('name'),email:data.get('email'),topic:data.get('topic'),message:data.get('message')});
    document.getElementById('form-status').textContent='Your local brief is ready. Nothing was sent.';
  });

  // The illustrative AROGYA conversation plays once on arogya.html when it scrolls into view.
  const assistantItems=[...document.querySelectorAll('[data-sequence]')], assistantTyping=document.getElementById('assistant-typing');
  let sequenceStarted=false, sequenceRunning=false, sequenceTime=0, sequenceVisible=false;
  function renderSequence(){
    const thresholds=[0,.6,1.3,2.7];
    assistantItems.forEach((el,index)=>el.classList.toggle('shown',sequenceTime>=thresholds[index]));
    if(assistantTyping)assistantTyping.hidden=!(sequenceTime>=2&&sequenceTime<2.7);
  }
  function finishSequence(){sequenceTime=3;sequenceRunning=false;renderSequence();}
  const assistantCard=document.querySelector('.assistant-card');
  if(assistantCard){
    new IntersectionObserver(entries=>entries.forEach(entry=>{
      sequenceVisible=entry.isIntersecting;
      if(entry.isIntersecting&&!sequenceStarted){
        sequenceStarted=true;sequenceRunning=motion.enabled;
        if(!motion.enabled)finishSequence();else{sequenceTime=0;renderSequence();site.flight?.request();}
      }
    }),{threshold:.25}).observe(assistantCard);
  }
  site.addTicker((_now,dt)=>{
    if(!sequenceRunning||!sequenceVisible)return;
    sequenceTime+=dt;renderSequence();if(sequenceTime>=3)sequenceRunning=false;
  });
  function assistantURL(){
    if(!SITE_CONFIG.assistantUrl)return null;
    try{const url=new URL(SITE_CONFIG.assistantUrl,location.href);if(url.protocol==='https:'||(url.protocol==='http:'&&['localhost','127.0.0.1'].includes(url.hostname)))return url;}catch{}
    return null;
  }
  site.configureAssistantButton=button=>{
    const available=!!assistantURL();button.disabled=!available;button.textContent=available?'Try the live assistant':'Live demo coming soon';
  };
  site.openAssistant=trigger=>{
    const url=assistantURL();if(!url)return;
    if(!SITE_CONFIG.assistantFrameAllowed){window.open(url.href,'_blank','noopener,noreferrer');return;}
    const host=document.getElementById('demo-host'), dialog=document.getElementById('assistant-dialog');
    // Pages without the demo dialog (the landing page) open the demo in a new tab.
    if(!host||!dialog){window.open(url.href,'_blank','noopener,noreferrer');return;}
    host.replaceChildren();
    const frame=document.createElement('iframe');frame.title='AROGYA demo';frame.loading='lazy';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups');
    if(SITE_CONFIG.assistantVoiceVerified)frame.setAttribute('allow','microphone');
    frame.src=url.href;host.append(frame);
    document.getElementById('demo-new-tab').href=url.href;
    site.openDialog(dialog,trigger);
  };
  document.querySelectorAll('[data-live-assistant]').forEach(button=>{site.configureAssistantButton(button);button.addEventListener('click',()=>site.openAssistant(button));});
  document.getElementById('assistant-dialog')?.addEventListener('close',()=>document.getElementById('demo-host').replaceChildren());
  syncMotion();
})();

