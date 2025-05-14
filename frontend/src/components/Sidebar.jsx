// Filename: Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import ArchiveIcon from '@mui/icons-material/Archive';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotesIcon from '@mui/icons-material/Notes';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import './SidebarStyles.css';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const fetchSidebarNotes = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await fetch('http://localhost:5000/notes', {
                    headers: { 
                        Authorization: token,
                        'Content-Type': 'application/json'
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const sortedData = data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
                    setNotes(sortedData);
                    setError(null);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    setError(errorData.message || `Error: ${response.status}`);
                }
            } catch (error) {
                setError('Network error. Please try again.');
                console.error('Sidebar: An error occurred while fetching notes:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSidebarNotes();
    }, []);

    // Filter notes based on search query
    const filteredNotes = notes.filter(note => 
        note.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Format date to display "May 14, 25" format
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const month = date.toLocaleString('default', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear().toString().slice(-2);
        return `${month} ${day}, ${year}`;
    };

    // Extract note preview (first few words)
    const getPreview = (content) => {
        if (!content) return '';
        const plainText = content.replace(/<[^>]+>/g, ''); // Remove HTML tags if any
        return plainText.slice(0, 60) + (plainText.length > 60 ? '...' : '');
    };

    return (
        <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <button 
                    className="menu-toggle" 
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <MenuIcon /> : <KeyboardArrowLeftIcon />}
                </button>
                {!collapsed && <h1 className="app-title">Scribbly</h1>}
                {collapsed && <h1 className="app-title-collapsed">S</h1>}
            </div>

            {!collapsed && (
                <div className="search-container">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
            )}

            <nav className="sidebar-nav">
                <Link to="/notes" className={location.pathname === '/notes' ? 'active' : ''}>
                    <HomeIcon /> {!collapsed && <span>Home</span>}
                </Link>
                <Link to="/favorites" className={location.pathname === '/favorites' ? 'active' : ''}>
                    <StarIcon /> {!collapsed && <span>Favorites</span>}
                </Link>
                <Link to="/archived" className={location.pathname === '/archived' ? 'active' : ''}>
                    <ArchiveIcon /> {!collapsed && <span>Archived</span>}
                </Link>
                <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
                    <SettingsIcon /> {!collapsed && <span>Settings</span>}
                </Link>
            </nav>

            {!collapsed && (
                <>
                    <div className="notes-header">
                        <div className="notes-header-title">
                            <NotesIcon className="notes-icon" />
                            <h2>My Notes</h2>
                        </div>
                        <Link to="/notes/new" className="new-note-button" aria-label="Create new note">
                            <AddIcon /> <span>New</span>
                        </Link>
                    </div>

                    <div className="notes-list">
                        {isLoading ? (
                            <div className="notes-loading">Loading notes...</div>
                        ) : error ? (
                            <div className="notes-error">{error}</div>
                        ) : filteredNotes.length > 0 ? (
                            filteredNotes.map(note => (
                                <Link
                                    key={note.id}
                                    to={`/notes/${note.id}`}
                                    className={`note-item ${location.pathname === `/notes/${note.id}` ? 'active' : ''}`}
                                >
                                    <div className="note-title">{note.title || 'Untitled'}</div>
                                    <div className="note-preview">{getPreview(note.content)}</div>
                                    <div className="note-date">{formatDate(note.updated_at)}</div>
                                </Link>
                            ))
                        ) : searchQuery ? (
                            <div className="empty-notes">No matching notes found</div>
                        ) : (
                            <div className="empty-notes">
                                <p>No notes yet</p>
                                <p className="empty-notes-sub">Create your first note to get started</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {collapsed && (
                <div className="quick-actions">
                    <Link to="/notes/new" className="quick-new-note" aria-label="Create new note">
                        <AddIcon />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Sidebar;