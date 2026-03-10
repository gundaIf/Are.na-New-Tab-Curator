async function loadBlock() {
  const { token, channelId } = await chrome.storage.sync.get(['token', 'channelId']);
  if (!token || !channelId) {
    document.getElementById('block').innerText = 'Set token and channel ID in extension options.';
    return;
  }
  const response = await fetch(`https://api.are.na/v2/channels/${channelId}/contents?per=100`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  const blocks = data.contents;
  const randomBlock = blocks[Math.floor(Math.random() * blocks.length)];
  const div = document.getElementById('block');
  if (randomBlock.image) {
    const img = document.createElement('img');
    img.src = randomBlock.image.display.url;
    div.appendChild(img);
  } else if (randomBlock.content) {
    div.innerText = randomBlock.content;
  } else {
    div.innerText = randomBlock.title;
  }
}
loadBlock();
