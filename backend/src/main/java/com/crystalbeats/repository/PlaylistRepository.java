package com.crystalbeats.repository;

import com.crystalbeats.entity.Playlist;
import com.crystalbeats.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    List<Playlist> findByOwnerOrderByCreatedAtDesc(User owner);
    Optional<Playlist> findByIdAndOwner(Long id, User owner);
}
