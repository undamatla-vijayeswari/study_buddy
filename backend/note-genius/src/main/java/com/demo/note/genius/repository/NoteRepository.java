package com.demo.note.genius.repository;

import com.demo.note.genius.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoteRepository extends JpaRepository<Note, Long> {
}