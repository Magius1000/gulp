export function counter() {
  const label = document.querySelector('#counter__label');
  const btn = document.querySelector('#counter__btn');

  if (!label || !btn) return;

  let counter = 0;
  render();
  btn.addEventListener('click', () => {
    counter++;
    render();
  });

  function render() {
    label.innerHTML = counter;
  }
}
