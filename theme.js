(() => {
  const root = document.documentElement;
  const button = document.querySelector('.theme-toggle');
  if (!button) return;
  const preference = window.matchMedia('(prefers-color-scheme: dark)');
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch { /* Storage may be disabled. */ }
  let explicit = saved === 'dark' || saved === 'light';
  function render(dark) {
    root.dataset.theme = dark ? 'dark' : 'light';
    button.setAttribute('aria-pressed', String(dark));
  }
  render(explicit ? saved === 'dark' : preference.matches);
  button.hidden = false;
  button.addEventListener('click', () => {
    const dark = root.dataset.theme !== 'dark';
    explicit = true;
    render(dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* Keep the session preference. */ }
  });
  preference.addEventListener('change', event => {
    if (!explicit) render(event.matches);
  });
})();
