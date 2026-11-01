(() => {
  'use strict';
  const roles = {
    resident: { icon:'book', kicker:'Your learning, thoughtfully recorded', title:'Make every experience count.', description:'Record clinical cases, procedures, and academic work. Keep posting details close and follow each entry through faculty verification.', steps:['Record your activity','Add the training context','Follow faculty verification'], note:'Your record grows with your training.' },
    faculty: { icon:'clipboard', kicker:'The right context for every review', title:'Guide the learning forward.', description:'Work through the evaluation queue, verify submitted entries, and record assessments. Follow the training progress of your assigned residents.', steps:['Open the evaluation queue','Review the submitted activity','Verify entries and record assessments'], note:'The activity and its review stay together.' },
    department: { icon:'layers', kicker:'A shared view of the training programme', title:'See the bigger training picture.', description:'Define departmental requirements, manage resident and faculty access, and follow the wider training picture. Keep leave approvals in the same workspace.', steps:['Set department requirements','Manage resident and faculty access','Follow progress and leave approvals'], note:'Training requirements are department-defined.' }
  };
  const tabs = [...document.querySelectorAll('[data-role]')];
  const panel = document.getElementById('role-panel');
  function selectRole(key, focus = false) {
    const role = roles[key];
    if (!role) return;
    tabs.forEach(tab => {
      const selected = tab.dataset.role === key;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    panel.setAttribute('aria-labelledby', 'role-' + key);
    document.getElementById('role-symbol').setAttribute('href', '#' + role.icon);
    document.getElementById('role-kicker').textContent = role.kicker;
    document.getElementById('role-heading').textContent = role.title;
    document.getElementById('role-description').textContent = role.description;
    document.getElementById('role-note').textContent = role.note;
    const steps = role.steps.map((text, index) => {
      const li = document.createElement('li'), number = document.createElement('span');
      number.textContent = String(index + 1).padStart(2, '0');
      li.append(number, text);
      return li;
    });
    document.getElementById('role-steps').replaceChildren(...steps);
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectRole(tab.dataset.role));
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next !== null) { event.preventDefault(); selectRole(tabs[next].dataset.role, true); }
    });
  });
})();
