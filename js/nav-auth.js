(function(){
  const SB_URL='https://tjxyxasorunhrtvstwpa.supabase.co';
  const SB_KEY='sb_publishable_d3YtyYkTynAVyTEVIN19dQ_-4wZkGHV';

  function av(n){return(n||'').split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2)||'?';}

  function injectStyles(){
    if(document.getElementById('nav-auth-styles'))return;
    const s=document.createElement('style');
    s.id='nav-auth-styles';
    s.textContent=`
      .na-avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#b8950e,#F5C542);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;color:#000;cursor:pointer;border:2px solid rgba(245,197,66,0.4);transition:border-color 0.2s;overflow:hidden;flex-shrink:0;}
      .na-avatar:hover{border-color:rgba(245,197,66,0.9);}
      .na-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
      .na-wrap{position:relative;display:inline-flex;align-items:center;}
      .na-dropdown{display:none;position:absolute;top:44px;right:0;background:#0d1e36;border:1px solid rgba(255,255,255,0.1);border-radius:16px;min-width:220px;box-shadow:0 16px 48px rgba(0,0,0,0.6);padding:8px 0;z-index:9999;}
      .na-dropdown.open{display:block;}
      .na-dhead{padding:12px 16px 10px;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;align-items:center;gap:10px;}
      .na-dhead-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#b8950e,#F5C542);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.78rem;color:#000;flex-shrink:0;overflow:hidden;}
      .na-dhead-av img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
      .na-dname{font-size:0.82rem;font-weight:700;color:#fff;}
      .na-drole{font-size:0.68rem;color:#F5C542;}
      .na-item{display:flex;align-items:center;gap:10px;padding:10px 16px;font-size:0.82rem;font-weight:500;color:rgba(255,255,255,0.75);text-decoration:none;transition:all 0.15s;white-space:nowrap;background:none;border:none;width:100%;text-align:left;cursor:pointer;}
      .na-item:hover{background:rgba(245,197,66,0.07);color:#fff;}
      .na-item svg{flex-shrink:0;color:rgba(255,255,255,0.35);}
      .na-item:hover svg{color:#F5C542;}
      .na-sep{margin:6px 0;border-top:1px solid rgba(255,255,255,0.07);}
      .na-item.danger{color:#ef4444;}
      .na-item.danger svg{color:#ef4444;}
      @keyframes pulse-badge{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}
    `;
    document.head.appendChild(s);
  }

  function buildDropdown(profile, unreadCounts={}){
    const isClient=profile.role==='client';
    const dashPath=window.location.pathname.includes('/client/')?'dashboard.html':'client/dashboard.html';
    const ordersPath=window.location.pathname.includes('/client/')?'projects.html':'client/projects.html';
    const chatPath=window.location.pathname.includes('/client/')?'chat.html':'client/chat.html';
    const profilePath=window.location.pathname.includes('/client/')?'profile.html':'client/profile.html';
    const avatarContent=profile.avatar_url
      ?`<img src="${profile.avatar_url}" alt="">`
      :(av(profile.full_name || profile.email));
    
    const msgCount=unreadCounts.messages||0;
    const notifCount=unreadCounts.notifications||0;

    const wrap=document.createElement('div');
    wrap.className='na-wrap';
    wrap.style.cssText='position:relative;display:flex;align-items:center;gap:10px;';
    wrap.innerHTML=`
      ${isClient?`
      <a href="${chatPath}" class="na-icon-btn" title="Messages" style="position:relative;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.7);text-decoration:none;transition:all 0.2s;" onmouseover="this.style.background='rgba(245,197,66,0.15)';this.style.borderColor='rgba(245,197,66,0.4)';this.style.color='#F5C542';" onmouseout="this.style.background='rgba(255,255,255,0.08)';this.style.borderColor='rgba(255,255,255,0.15)';this.style.color='rgba(255,255,255,0.7);"">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        ${msgCount>0?`<span class="na-badge" style="position:absolute;top:-5px;right:-5px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:0.7rem;font-weight:900;min-width:20px;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:0 5px;box-shadow:0 2px 8px rgba(239,68,68,0.5);animation:pulse-badge 2s infinite;">${msgCount>99?'99+':msgCount}</span>`:''}
      </a>
      <div class="na-icon-btn" title="Notifications" style="position:relative;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.7);cursor:pointer;transition:all 0.2s;" onmouseover="this.style.background='rgba(245,197,66,0.15)';this.style.borderColor='rgba(245,197,66,0.4)';this.style.color='#F5C542';" onmouseout="this.style.background='rgba(255,255,255,0.08)';this.style.borderColor='rgba(255,255,255,0.15)';this.style.color='rgba(255,255,255,0.7);"" onclick="alert('Notifications panel coming soon!')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        ${notifCount>0?`<span class="na-badge" style="position:absolute;top:-5px;right:-5px;background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;font-size:0.7rem;font-weight:900;min-width:20px;height:20px;border-radius:10px;display:flex;align-items:center;justify-content:center;padding:0 5px;box-shadow:0 2px 8px rgba(239,68,68,0.5);animation:pulse-badge 2s infinite;">${notifCount>99?'99+':notifCount}</span>`:''}
      </div>
      `:''}
      <div class="na-avatar" id="na-avatar-btn">${avatarContent}</div>
      <div class="na-dropdown" id="na-dropdown">
        <div class="na-dhead">
          <div class="na-dhead-av">${avatarContent}</div>
          <div>
            <div class="na-dname">${profile.full_name||profile.email||''}</div>
            <div class="na-drole">${profile.role?profile.role.charAt(0).toUpperCase()+profile.role.slice(1):'Client'}</div>
          </div>
        </div>
        ${isClient?`
        <a href="${dashPath}" class="na-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Dashboard
        </a>
        <a href="${ordersPath}" class="na-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          My Orders
        </a>
        <a href="${chatPath}" class="na-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Messages ${msgCount>0?`<span style="margin-left:auto;background:#ef4444;color:#fff;font-size:0.65rem;font-weight:700;padding:2px 6px;border-radius:10px;">${msgCount}</span>`:''}
        </a>
        `:''}
        ${profile.role==='admin'?`
        <a href="${window.location.pathname.includes('/admin/')?'dashboard.html':'admin/dashboard.html'}" class="na-item" style="color:var(--gold);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Admin Portal
        </a>
        `:''}
        <a href="${profilePath}" class="na-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          My Profile
        </a>
        <div class="na-sep"></div>
        <button class="na-item danger" id="na-signout">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </div>
    `;
    
    const btn = wrap.querySelector('#na-avatar-btn');
    const menu = wrap.querySelector('#na-dropdown');
    const signoutBtn = wrap.querySelector('#na-signout');
    
    if (btn && menu) {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        menu.classList.toggle('open');
      });
    }
    if (signoutBtn) {
      signoutBtn.addEventListener('click', async () => {
        if(window.supabaseClient) await window.supabaseClient.auth.signOut();
        // Clear local storage too just in case
        localStorage.removeItem('user_session');
        window.location.href = window.location.pathname.includes('/client/') || window.location.pathname.includes('/admin/') || window.location.pathname.includes('/expert/') ? '../login.html' : 'login.html';
      });
    }
    
    return wrap;
  }

  async function init(){
    if(typeof supabase==='undefined')return;
    const sb=supabase.createClient(SB_URL,SB_KEY);
    window.supabaseClient=sb; // Expose globally for other scripts
    const{data:{session}}=await sb.auth.getSession();
    const authLink=document.getElementById('nav-auth-link');
    const userNavSection=document.getElementById('user-nav-section');

    if(!session){
      // Not logged in — reveal the default links
      if(userNavSection) userNavSection.classList.add('na-visible');
      else if(authLink) authLink.classList.add('na-visible');
      return;
    }

    const{data:profile,error:profileError}=await sb.from('profiles').select('full_name,email,avatar_url,role').eq('id',session.user.id).single();
    console.log('nav-auth profile:',profile,'error:',profileError,'session:',session);
    if(!profile){
      if(userNavSection) userNavSection.classList.add('na-visible');
      else if(authLink) authLink.classList.add('na-visible');
      return;
    }

    injectStyles();

    // Fetch unread message count for client
    let unreadCounts={messages:0,notifications:0};
    if(profile.role==='client'){
      try{
        const{data:convos}=await sb.from('conversations').select('unread_client').eq('client_id',session.user.id);
        if(convos){
          unreadCounts.messages=convos.reduce((sum,c)=>sum+(c.unread_client||0),0);
        }
      }catch(e){/*ignore errors*/}
    }

    if(userNavSection){
      // Replace entire user-nav-section with avatar dropdown
      const dropdown=buildDropdown(profile,unreadCounts);
      userNavSection.innerHTML='';
      userNavSection.appendChild(dropdown);
      userNavSection.classList.add('na-visible');
    } else if(authLink){
      // Fallback: just replace auth link
      const dropdown=buildDropdown(profile,unreadCounts);
      authLink.replaceWith(dropdown);
      // For fallback we just ensure it's visible if it wasn't already
      dropdown.style.visibility = 'visible';
      dropdown.style.opacity = '1';
    }

    // Close menu when clicking outside
    document.addEventListener('click', () => {
      const menus = document.querySelectorAll('.na-dropdown');
      menus.forEach(m => m.classList.remove('open'));
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
  } else {
    init();
  }
})();
