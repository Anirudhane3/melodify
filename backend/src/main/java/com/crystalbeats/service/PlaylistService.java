package com.crystalbeats.service;

import com.crystalbeats.dto.PlaylistDto;
import com.crystalbeats.dto.PlaylistRequest;
import com.crystalbeats.dto.SongDto;
import com.crystalbeats.entity.Playlist;
import com.crystalbeats.entity.Song;
import com.crystalbeats.entity.User;
import com.crystalbeats.repository.PlaylistRepository;
import com.crystalbeats.repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlaylistService {

    @Autowired private PlaylistRepository playlistRepo;
    @Autowired private SongRepository songRepo;
    @Autowired private SongService songService;

    public List<PlaylistDto> getUserPlaylists(User owner) {
        return playlistRepo.findByOwnerOrderByCreatedAtDesc(owner)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public PlaylistDto createPlaylist(User owner, PlaylistRequest req) {
        Playlist p = Playlist.builder()
                .name(req.getName().trim())
                .owner(owner)
                .build();
        return toDto(playlistRepo.save(p));
    }

    public PlaylistDto renamePlaylist(Long id, User owner, PlaylistRequest req) {
        Playlist p = findOwned(id, owner);
        p.setName(req.getName().trim());
        return toDto(playlistRepo.save(p));
    }

    @Transactional
    public PlaylistDto addSong(Long playlistId, Long songId, User owner) {
        Playlist p = findOwned(playlistId, owner);
        Song song = songRepo.findById(songId)
                .orElseThrow(() -> new RuntimeException("Song not found."));
        boolean exists = p.getSongs().stream().anyMatch(s -> s.getId().equals(songId));
        if (!exists) p.getSongs().add(song);
        return toDto(playlistRepo.save(p));
    }

    @Transactional
    public PlaylistDto removeSong(Long playlistId, Long songId, User owner) {
        Playlist p = findOwned(playlistId, owner);
        p.getSongs().removeIf(s -> s.getId().equals(songId));
        return toDto(playlistRepo.save(p));
    }

    public void deletePlaylist(Long id, User owner) {
        Playlist p = findOwned(id, owner);
        playlistRepo.delete(p);
    }

    private Playlist findOwned(Long id, User owner) {
        return playlistRepo.findByIdAndOwner(id, owner)
                .orElseThrow(() -> new RuntimeException("Playlist not found."));
    }

    private PlaylistDto toDto(Playlist p) {
        List<SongDto> songs = p.getSongs().stream()
                .map(songService::toDto).collect(Collectors.toList());
        return new PlaylistDto(
                p.getId(),
                p.getName(),
                songs,
                p.getCreatedAt() != null ? p.getCreatedAt().toString() : null,
                p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : null
        );
    }
}
