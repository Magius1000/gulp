export function hidePreloader() {
  const preloaders = document.querySelectorAll('.preloader');

  if (preloaders && preloaders.length) {
    preloaders.forEach((preloader) => {
      preloader.classList.add('preloader_hidden');
      setTimeout(() => {
        preloader.remove();
      }, 600);
    });
  }
}
