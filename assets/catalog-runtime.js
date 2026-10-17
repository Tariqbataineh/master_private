/* Shared public catalog replaces static place records while preserving card classes. */
WusoolUI.enqueue(async () => {
  if (document.readyState === 'loading')
    await new Promise((resolve) =>
      document.addEventListener('DOMContentLoaded', resolve, { once: true }),
    );
  const grid = document.getElementById('placesGrid');
  if (!grid) return;
  const render = async () => {
    const result = await WusoolServices.places(),
      isUser = location.pathname.includes('/user/');
    const cards = result.items.map((p) => {
      const outer = document.createElement('div');
      outer.className = 'col-md-6 col-xl-4 place-result';
      Object.assign(outer.dataset, {
        id: p.id,
        name: p.name.toLowerCase(),
        city: p.city.toLowerCase(),
        type: p.type.toLowerCase(),
        features: p.features.join(' '),
        score: String(p.score),
      });
      const article = document.createElement('article');
      article.className = 'result-card';
      const top = document.createElement('div');
      top.className = 'result-card-top';
      const icon = document.createElement('span');
      icon.className = 'result-icon';
      icon.textContent = '⌂';
      const score = document.createElement('span');
      score.className = 'result-score';
      score.textContent = String(p.score);
      top.append(icon, score);
      const title = document.createElement('h3');
      title.textContent = p.name;
      const address = document.createElement('p');
      address.className = 'result-location';
      address.textContent = p.city + ' · ' + p.type;
      const note = document.createElement('p');
      note.className = 'text-secondary small';
      note.textContent = p.scoreDescription;
      const link = document.createElement('a');
      link.className = 'btn btn-wusool';
      link.href =
        './' +
        (isUser ? 'user-place-details' : 'place-details') +
        '.html?id=' +
        encodeURIComponent(p.id);
      link.textContent = 'View Details';
      const mapButton = document.createElement('button');
      mapButton.type = 'button';
      mapButton.className = 'btn btn-outline-wusool ms-2';
      mapButton.dataset.googleMapPlace = p.id;
      mapButton.textContent =
        document.documentElement.lang === 'ar' ? 'عرض على الخريطة' : 'View on map';
      article.append(top, title, address, note, link);
      if (document.getElementById('mapCanvas')) article.append(mapButton);
      outer.append(article);
      return outer;
    });
    grid.replaceChildren(...cards);
    window.WusoolMapPlaces = result.items;
    window.WusoolGoogleMap?.setPlaces(result.items);
    window.dispatchEvent(new CustomEvent('wusool:catalog-updated'));
  };
  window.WusoolLive?.watch('public-catalog', render);
  await render();
});
