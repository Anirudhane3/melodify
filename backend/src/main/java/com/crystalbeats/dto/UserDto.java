package com.crystalbeats.dto;

public class UserDto {
    private Long id;
    private String username;
    private String role;
    private String avatar;
    private String createdAt;

    public UserDto() {}
    public UserDto(Long id, String username, String role, String avatar, String createdAt) {
        this.id = id; this.username = username; this.role = role;
        this.avatar = avatar; this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getRole() { return role; }
    public String getAvatar() { return avatar; }
    public String getCreatedAt() { return createdAt; }
    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setRole(String role) { this.role = role; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
