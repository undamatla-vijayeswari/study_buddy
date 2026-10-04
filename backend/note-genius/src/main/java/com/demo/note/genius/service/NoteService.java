package com.demo.note.genius.service;

import com.demo.note.genius.entity.Note;
import com.demo.note.genius.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoteService {

    private final NoteRepository noteRepository;

    public NoteService(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }

    // CREATE - Add a new note
    public Note createNote(Note note) {
        return noteRepository.save(note);
    }

    // READ - Get all notes
    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    // READ - Get a note by ID
    public Optional<Note> getNoteById(Long id) {
        return noteRepository.findById(id);
    }

    // UPDATE - Update an existing note
    public Optional<Note> updateNote(Long id, Note updatedNote) {

        return noteRepository.findById(id)
                .map(existingNote -> {

                    existingNote.setTitle(updatedNote.getTitle());
                    existingNote.setContent(updatedNote.getContent());

                    return noteRepository.save(existingNote);
                });
    }

    // DELETE - Delete a note
    public boolean deleteNote(Long id) {

        if (noteRepository.existsById(id)) {
            noteRepository.deleteById(id);
            return true;
        }

        return false;
    }
}