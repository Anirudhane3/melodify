// ─── Playlist Service ─────────────────────────────────────────────────────────
// Playlists are stored per-user in LocalStorage.
// Key: melodify_playlists_<userId>

function getKey(userId) {
  return `melodify_playlists_${userId}`;
}

/** Get all playlists for a user */
export function getPlaylists(userId) {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem(getKey(userId)) || '[]');
  } catch {
    return [];
  }
}

function savePlaylists(userId, playlists) {
  localStorage.setItem(getKey(userId), JSON.stringify(playlists));
}

/** Create a new playlist. Returns the new playlist object. */
export function createPlaylist(userId, name) {
  if (!name?.trim()) return null;
  const playlists = getPlaylists(userId);
  const newPlaylist = {
    id: crypto.randomUUID(),
    name: name.trim(),
    songs: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  playlists.push(newPlaylist);
  savePlaylists(userId, playlists);
  return newPlaylist;
}

/** Add a song to a playlist. Returns updated playlist or null. */
export function addSongToPlaylist(userId, playlistId, song) {
  const playlists = getPlaylists(userId);
  const idx = playlists.findIndex(p => p.id === playlistId);
  if (idx === -1) return null;

  const alreadyAdded = playlists[idx].songs.find(s => s.id === song.id);
  if (alreadyAdded) return playlists[idx]; // no duplicates

  playlists[idx].songs.push(song);
  playlists[idx].updatedAt = new Date().toISOString();
  savePlaylists(userId, playlists);
  return playlists[idx];
}

/** Remove a song from a playlist */
export function removeSongFromPlaylist(userId, playlistId, songId) {
  const playlists = getPlaylists(userId);
  const idx = playlists.findIndex(p => p.id === playlistId);
  if (idx === -1) return null;

  playlists[idx].songs = playlists[idx].songs.filter(s => s.id !== songId);
  playlists[idx].updatedAt = new Date().toISOString();
  savePlaylists(userId, playlists);
  return playlists[idx];
}

/** Rename a playlist */
export function renamePlaylist(userId, playlistId, newName) {
  if (!newName?.trim()) return null;
  const playlists = getPlaylists(userId);
  const idx = playlists.findIndex(p => p.id === playlistId);
  if (idx === -1) return null;

  playlists[idx].name = newName.trim();
  playlists[idx].updatedAt = new Date().toISOString();
  savePlaylists(userId, playlists);
  return playlists[idx];
}

/** Delete a playlist */
export function deletePlaylist(userId, playlistId) {
  const playlists = getPlaylists(userId);
  const filtered = playlists.filter(p => p.id !== playlistId);
  savePlaylists(userId, filtered);
}

/** Get a single playlist by ID */
export function getPlaylistById(userId, playlistId) {
  const playlists = getPlaylists(userId);
  return playlists.find(p => p.id === playlistId) || null;
}
