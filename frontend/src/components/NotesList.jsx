import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import moment from 'moment';
import './styles.css';

const NotesList = () => {
    const [notes, setNotes] = useState([]);
    const [sortOrder, setSortOrder] = useState('recent');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteNoteId, setDeleteNoteId] = useState(null);
    const [expandedNoteId, setExpandedNoteId] = useState(null); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotes = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/notes', {
                headers: { Authorization: token },
            });

            if (response.ok) {
                const data = await response.json();
                setNotes(data);
            }
        };

        fetchNotes();
    }, []);

    const sortedNotes = [...notes].sort((a, b) => {
        if (sortOrder === 'recent') {
            return new Date(b.updated_at) - new Date(a.updated_at); 
        } else {
            return new Date(a.updated_at) - new Date(b.updated_at); 
        }
    });

    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/notes/${deleteNoteId}`, {
            method: 'DELETE',
            headers: { Authorization: token },
        });

        if (response.ok) {
            setNotes(notes.filter((note) => note.id !== deleteNoteId)); 
            toast.success('Note deleted successfully!');
        } else {
            toast.error('Failed to delete note.');
        }
        setDeleteNoteId(null);
        setDialogOpen(false);
    };

    const handleCreateNote = () => {
        navigate('/notes/new'); 
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
    };

    const handleToggleContent = (id) => {
        setExpandedNoteId(expandedNoteId === id ? null : id); 
    };

    return (
        <div className="login-container">
            <div className="notes-container">
                <div className="notes-header">
                    <div className="create-note">
                        <button onClick={handleCreateNote}>
                            <AddCircleOutlinedIcon /> Create New Note
                        </button>
                    </div>
                    <div className="sort-filter">
                        <select value={sortOrder} onChange={handleSortChange}>
                            <option value="recent">Recently Added</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>

                {notes.length === 0 ? (
                    <div className='no-notes-container'>
                        <p className='no-notes'>No notes found!</p>
                    </div>
                ) : (
                    sortedNotes.map((note) => (
                        <div key={note.id} className="note">
                            <div className="note-header">
                                <h3>{note.title}</h3>
                                <div className="note-actions">
                                    <VisibilityIcon onClick={() => handleToggleContent(note.id)} />
                                    <Link to={`/notes/edit/${note.id}`}>
                                        <EditIcon />
                                    </Link>
                                    <DeleteIcon onClick={() => {
                                        setDeleteNoteId(note.id);
                                        setDialogOpen(true);
                                    }} />
                                </div>
                            </div>
                            <p className="note-time">
                                Last Updated: {moment(note.updated_at).format('MMM Do YYYY, h:mm A')}
                            </p>

                            {expandedNoteId === note.id && (
                                <div className="note-content">
                                    <p>{note.content}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this note? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
        </div>
    );
};

export default NotesList;
