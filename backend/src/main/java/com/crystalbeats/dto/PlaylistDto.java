package com.crystalbeats.dto;

import java.util.List;

public class PlaylistDto {
    private Long id;
    private String name;
    private List<SongDto> songs;
    private String createdAt;
    private String updatedAt;

    public PlaylistDto() {}
    public PlaylistDto(Long id, String name, List<SongDto> songs, String createdAt, String updatedAt) {
        this.id = id; this.name = name; this.songs = songs;
        this.createdAt = createdAt; this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public List<SongDto> getSongs() { return songs; }
    public String getCreatedAt() { return createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setSongs(List<SongDto> songs) { this.songs = songs; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
