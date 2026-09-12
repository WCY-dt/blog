const button = document.querySelector('button');
const status = document.querySelector('[role="status"]');

button.addEventListener('click', () => {
  const mint = document.documentElement.dataset.color !== 'mint';
  document.documentElement.dataset.color = mint ? 'mint' : 'paper';
  status.textContent = `当前配色：${mint ? '薄荷' : '纸白'}`;
});
