package com.crystalbeats.controller;

import com.crystalbeats.dto.SongDto;
import com.crystalbeats.dto.SongRequest;
import com.crystalbeats.service.SongService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
public class SongController {

    @Autowired private SongService songService;

    @GetMapping
    public ResponseEntity<List<SongDto>> getAll() {
        return ResponseEntity.ok(songService.getAllSongs());
    }

    @PostMapping
    public ResponseEntity<SongDto> addSong(@Valid @RequestBody SongRequest req,
                                           Authentication auth) {
        return ResponseEntity.ok(songService.addSong(req, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        songService.deleteSong(id);
        return ResponseEntity.noContent().build();
    }
}
