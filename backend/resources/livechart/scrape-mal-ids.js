// to be executed on livechart.me homepage

const animes = [];
document.querySelectorAll('article.anime').forEach(e => {
  const anime = {
    title: e.querySelector('.main-title a').text,
    livechart: e.querySelector('.main-title a').getAttribute('href').match(/(\d+)/)[1],
    mal: e
      .querySelector('a.mal-icon')
      ?.getAttribute('href')
      .match(/\/anime\/(\d+)/)[1],
  };
  anime._key = anime.livechart;
  animes.push(anime);
});
const season = location.pathname.replace(/^\/([a-z]+)-(\d+).*/, '$2-$1');
const jsonFile = new File([JSON.stringify(animes)], `animes-${season}.json`, {
  type: 'application/json',
});
const a = document.createElement('a');
a.href = URL.createObjectURL(jsonFile);
a.download = `animes-${season}.json`;
a.click();
