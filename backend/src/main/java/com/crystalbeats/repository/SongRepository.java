package com.crystalbeats.repository;

import com.crystalbeats.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SongRepository extends JpaRepository<Song, Long> {
    List<Song> findAllByOrderByTitleAsc();
}
