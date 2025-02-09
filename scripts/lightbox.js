function initLightbox() {
  const closeButton = document.querySelector('.lightbox-close');
  
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent event from bubbling to parent elements
    closeLightbox();
  });
} 