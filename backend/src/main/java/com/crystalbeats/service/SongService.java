package com.crystalbeats.service;

import com.crystalbeats.dto.SongDto;
import com.crystalbeats.dto.SongRequest;
import com.crystalbeats.entity.Song;
import com.crystalbeats.repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SongService {

    @Autowired private SongRepository songRepo;

    public List<SongDto> getAllSongs() {
        return songRepo.findAllByOrderByTitleAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public SongDto addSong(SongRequest req, String uploadedBy) {
        Song song = Song.builder()
                .title(req.getTitle().trim())
                .artist(req.getArtist().trim())
                .album(req.getAlbum() != null && !req.getAlbum().isBlank()
                        ? req.getAlbum().trim() : "Unknown Album")
                .genre(req.getGenre())
                .duration(req.getDuration())
                .audioUrl(req.getAudioUrl())
                .coverUrl(req.getCoverUrl())
                .uploadedBy(uploadedBy)
                .actor(req.getActor() != null ? req.getActor().trim() : null)
                .actress(req.getActress() != null ? req.getActress().trim() : null)
                .singer(req.getSinger() != null ? req.getSinger().trim() : null)
                .build();
        return toDto(songRepo.save(song));
    }

    public void deleteSong(Long id) {
        if (!songRepo.existsById(id))
            throw new RuntimeException("Song not found.");
        songRepo.deleteById(id);
    }

    public SongDto toDto(Song song) {
        SongDto dto = new SongDto();
        dto.setId(song.getId());
        dto.setTitle(song.getTitle());
        dto.setArtist(song.getArtist());
        dto.setAlbum(song.getAlbum());
        dto.setGenre(song.getGenre());
        dto.setDuration(song.getDuration());
        dto.setAudioUrl(song.getAudioUrl());
        dto.setCoverUrl(song.getCoverUrl());
        dto.setUploadedBy(song.getUploadedBy());
        dto.setCreatedAt(song.getCreatedAt() != null ? song.getCreatedAt().toString() : null);
        dto.setActor(song.getActor());
        dto.setActress(song.getActress());
        dto.setSinger(song.getSinger());
        return dto;
    }
}
