document.getElementById('save').addEventListener('click', async () => {
  const token = document.getElementById('token').value;
  const channelId = document.getElementById('channelId').value;
  await chrome.storage.sync.set({ token, channelId });
  alert('Saved!');
});
