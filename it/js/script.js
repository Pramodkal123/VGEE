document.addEventListener('DOMContentLoaded', function(){
  // Mobile menu toggle
  const menuBtn = document.querySelector('.mobile-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn = document.getElementById('closeMenu');
  if(menuBtn && mobileMenu){
    menuBtn.addEventListener('click', ()=> mobileMenu.classList.add('show'));
    closeBtn.addEventListener('click', ()=> mobileMenu.classList.remove('show'));
  }

  // FAQ toggles
  document.querySelectorAll('.faq-q').forEach(q=>{
    q.addEventListener('click', ()=>{
      q.parentElement.classList.toggle('open');
      const sign = q.querySelector('.sign');
      if(sign) sign.textContent = q.parentElement.classList.contains('open') ? '−' : '+';
    });
  });

  // Contact form (demo)
  const form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      // Replace with real backend integration
      alert('Thanks — your message has been received. (Demo form)');
      form.reset();
    });
  }
});
