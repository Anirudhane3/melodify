package com.crystalbeats.dto;

public class SongDto {
    private Long id;
    private String title;
    private String artist;
    private String album;
    private String genre;
    private String duration;
    private String audioUrl;
    private String coverUrl;
    private String uploadedBy;
    private String createdAt;

    public SongDto() {}
    public SongDto(Long id, String title, String artist, String album, String genre,
                   String duration, String audioUrl, String coverUrl, String uploadedBy, String createdAt) {
        this.id = id; this.title = title; this.artist = artist; this.album = album;
        this.genre = genre; this.duration = duration; this.audioUrl = audioUrl;
        this.coverUrl = coverUrl; this.uploadedBy = uploadedBy; this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getArtist() { return artist; }
    public String getAlbum() { return album; }
    public String getGenre() { return genre; }
    public String getDuration() { return duration; }
    public String getAudioUrl() { return audioUrl; }
    public String getCoverUrl() { return coverUrl; }
    public String getUploadedBy() { return uploadedBy; }
    public String getCreatedAt() { return createdAt; }
    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setArtist(String artist) { this.artist = artist; }
    public void setAlbum(String album) { this.album = album; }
    public void setGenre(String genre) { this.genre = genre; }
    public void setDuration(String duration) { this.duration = duration; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
