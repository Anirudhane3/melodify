package com.crystalbeats.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "songs")
public class Song {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String artist;

    private String album = "Unknown Album";
    private String genre;
    private String duration;
    private String actor;
    private String actress;
    private String singer;

    @Column(nullable = false)
    private String audioUrl;

    private String coverUrl;
    private String uploadedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public Song() {}

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id;
        private String title, artist, album = "Unknown Album", genre, duration, audioUrl, coverUrl, uploadedBy;
        private String actor, actress, singer;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder artist(String artist) { this.artist = artist; return this; }
        public Builder album(String album) { this.album = album; return this; }
        public Builder genre(String genre) { this.genre = genre; return this; }
        public Builder duration(String duration) { this.duration = duration; return this; }
        public Builder audioUrl(String audioUrl) { this.audioUrl = audioUrl; return this; }
        public Builder coverUrl(String coverUrl) { this.coverUrl = coverUrl; return this; }
        public Builder uploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; return this; }
        public Builder actor(String actor) { this.actor = actor; return this; }
        public Builder actress(String actress) { this.actress = actress; return this; }
        public Builder singer(String singer) { this.singer = singer; return this; }
        public Song build() {
            Song s = new Song();
            s.id = id; s.title = title; s.artist = artist; s.album = album;
            s.genre = genre; s.duration = duration; s.audioUrl = audioUrl;
            s.coverUrl = coverUrl; s.uploadedBy = uploadedBy;
            s.actor = actor; s.actress = actress; s.singer = singer;
            return s;
        }
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
    public String getActor() { return actor; }
    public String getActress() { return actress; }
    public String getSinger() { return singer; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setId(Long id) { this.id = id; }
    public void setTitle(String title) { this.title = title; }
    public void setArtist(String artist) { this.artist = artist; }
    public void setAlbum(String album) { this.album = album; }
    public void setGenre(String genre) { this.genre = genre; }
    public void setDuration(String duration) { this.duration = duration; }
    public void setAudioUrl(String audioUrl) { this.audioUrl = audioUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setActor(String actor) { this.actor = actor; }
    public void setActress(String actress) { this.actress = actress; }
    public void setSinger(String singer) { this.singer = singer; }
}
