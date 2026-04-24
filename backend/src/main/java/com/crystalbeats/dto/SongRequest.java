package com.crystalbeats.dto;

import jakarta.validation.constraints.NotBlank;

public class SongRequest {
    @NotBlank private String title;
    @NotBlank private String artist;
    private String album;
    private String genre;
    private String duration;
    @NotBlank private String audioUrl;
    private String coverUrl;
    private String actor;
    private String actress;
    private String singer;

    public SongRequest() {}
    public String getTitle() { return title; }
    public String getArtist() { return artist; }
    public String getAlbum() { return album; }
    public String getGenre() { return genre; }
    public String getDuration() { return duration; }
    public String getAudioUrl() { return audioUrl; }
    public String getCoverUrl() { return coverUrl; }
    public String getActor() { return actor; }
    public String getActress() { return actress; }
    public String getSinger() { return singer; }
    public void setTitle(String title) { this.title = title; }
    public void setArtist(String artist) { this.artist = artist; }
    public void setAlbum(String album) { this.album = album; }
    public void setGenre(String genre) { this.genre = genre; }
    public void setDuration(String duration) { this.duration = duration; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
    public void setActor(String actor) { this.actor = actor; }
    public void setActress(String actress) { this.actress = actress; }
    public void setSinger(String singer) { this.singer = singer; }
}
