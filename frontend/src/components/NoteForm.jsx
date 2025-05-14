import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
// import './styles.css';

const NoteForm = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const navigate = useNavigate();
    const { id } = useParams(); 

    useEffect(() => {
        if (id) {
            const fetchNote = async () => {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/notes/${id}`, {
                    headers: { Authorization: token },
                });

                if (response.ok) {
                    const data = await response.json();
                    setTitle(data.title);  
                    setContent(data.content);  
                    setWordCount(data.word_count); 
                } else {
                    toast.error('Failed to load the note.'); 
                }
            };

            fetchNote();
        }
    }, [id]); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const endpoint = id ? `http://localhost:5000/notes/${id}` : 'http://localhost:5000/notes';
        const method = id ? 'PUT' : 'POST';  

        const response = await fetch(endpoint, {
            method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify({ title, content }), 
        });

        if (response.ok) {
            toast.success('Note saved successfully!');
            setTimeout(() => navigate('/notes'), 1500); 
        } else {
            toast.error('Failed to save the note.'); 
        }
    };

    const handleContentChange = (e) => {
        const value = e.target.value;
        const words = value.split(/\s+/).filter((word) => word.length > 0);
        setContent(value);
        setWordCount(words.length);
    };

    return (
        <div className='note-form-page'>
            <div className='note-form-card'>
                <h1 className='note-form-title'>Start Your Scribble</h1>
                <p className='note-form-subtitle'>Capture your thoughts in style and clarity</p>
                <form onSubmit={handleSubmit} className="note-form-content">
                    <input
                        type="text"
                        placeholder="Title your masterpiece..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <textarea
                        placeholder="Let your thoughts flow here..."
                        value={content}
                        onChange={handleContentChange}
                        required
                    ></textarea>
                    <div className="note-form-footer">
                        <span>Word Count: {wordCount}/500</span>
                        <button type="submit">
                            <SaveIcon style={{ marginRight: '5px' }} /> Save
                        </button>
                    </div>
                </form>
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </div>
    );
};

export default NoteForm;
