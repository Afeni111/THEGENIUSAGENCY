(function() {
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Toggle Button (Hamburger)
    if (!document.getElementById('mobile-menu-toggle')) {
      const btn = document.createElement('button');
      btn.id = 'mobile-menu-toggle';
      btn.className = 'mobile-menu-toggle';
      btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
      btn.onclick = toggleSidebar;
      document.body.appendChild(btn);
    }

    // 2. Inject Sidebar Overlay
    if (!document.getElementById('sidebar-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'sidebar-overlay';
      overlay.className = 'sidebar-overlay';
      overlay.onclick = toggleSidebar;
      document.body.appendChild(overlay);
    }

    // 3. Auto-close sidebar on nav click (mobile)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 992) {
          closeSidebar();
        }
      });
    });
  });

  function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('visible');
  }

  function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('visible');
  }
  
  // Export to window if needed
  window.toggleSidebar = toggleSidebar;
})();
