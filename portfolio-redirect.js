// Keep previously shared portfolio section links useful; project/demo paths stay intact.
(() => {
  const aliases = {
    '#works': '#cases',
    '#work': '#cases',
    '#prices': '#services',
    '#reelroom': '#project-reelroom',
    '#top': '',
  };
  const oldHash = window.location.hash;
  const hash = Object.prototype.hasOwnProperty.call(aliases, oldHash)
    ? aliases[oldHash]
    : (/^#[a-z0-9-]+$/i.test(oldHash) ? oldHash : '');
  window.location.replace('https://baraskin-lab.vercel.app/' + hash);
})();
