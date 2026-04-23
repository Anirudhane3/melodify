package com.crystalbeats.controller;

import com.crystalbeats.dto.PlaylistDto;
import com.crystalbeats.dto.PlaylistRequest;
import com.crystalbeats.entity.User;
import com.crystalbeats.repository.UserRepository;
import com.crystalbeats.service.PlaylistService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {

    @Autowired private PlaylistService playlistService;
    @Autowired private UserRepository userRepo;

    private User currentUser(Authentication auth) {
        return userRepo.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<List<PlaylistDto>> getAll(Authentication auth) {
        return ResponseEntity.ok(playlistService.getUserPlaylists(currentUser(auth)));
    }

    @PostMapping
    public ResponseEntity<PlaylistDto> create(@Valid @RequestBody PlaylistRequest req,
                                              Authentication auth) {
        return ResponseEntity.ok(playlistService.createPlaylist(currentUser(auth), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlaylistDto> rename(@PathVariable Long id,
                                              @Valid @RequestBody PlaylistRequest req,
                                              Authentication auth) {
        return ResponseEntity.ok(playlistService.renamePlaylist(id, currentUser(auth), req));
    }

    @PostMapping("/{id}/songs")
    public ResponseEntity<PlaylistDto> addSong(@PathVariable Long id,
                                               @RequestBody Map<String, Long> body,
                                               Authentication auth) {
        return ResponseEntity.ok(playlistService.addSong(id, body.get("songId"), currentUser(auth)));
    }

    @DeleteMapping("/{id}/songs/{songId}")
    public ResponseEntity<PlaylistDto> removeSong(@PathVariable Long id,
                                                  @PathVariable Long songId,
                                                  Authentication auth) {
        return ResponseEntity.ok(playlistService.removeSong(id, songId, currentUser(auth)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication auth) {
        playlistService.deletePlaylist(id, currentUser(auth));
        return ResponseEntity.noContent().build();
    }
}
