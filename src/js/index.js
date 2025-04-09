import { counter } from './components/counter';
import { hidePreloader } from './components/preloader';

window.addEventListener('load', () => {
  hidePreloader();
  counter();
});
