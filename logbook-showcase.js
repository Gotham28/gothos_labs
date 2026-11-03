(() => {
  'use strict';
  // Role lines are the developer-supplied copy, split at the colon.
  const roles = {
    resident: { icon:'book', title:'Residents:', description:'log clinical cases, procedures and academic activities, and see progress against targets.' },
    faculty: { icon:'clipboard', title:'Professors:', description:'review and sign off on the residents assigned to them.' },
    department: { icon:'layers', title:'HOD:', description:'a department-wide view of training progress.' }
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
    document.getElementById('role-heading').textContent = role.title;
    document.getElementById('role-description').textContent = role.description;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectRole(tab.dataset.role));
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next !== null) { event.preventDefault(); selectRole(tabs[next].dataset.role, true); }
    });
  });
})();
