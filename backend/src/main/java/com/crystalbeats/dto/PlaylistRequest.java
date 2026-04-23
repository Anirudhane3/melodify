package com.crystalbeats.dto;

import jakarta.validation.constraints.NotBlank;

public class PlaylistRequest {
    @NotBlank private String name;

    public PlaylistRequest() {}
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
