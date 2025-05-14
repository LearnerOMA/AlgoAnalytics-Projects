import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import './styles.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const [dialogOpen, setDialogOpen] = useState(false); 
    const [isLogout, setIsLogout] = useState(false); 
    const [isRegister, setIsRegister] = useState(false); 

    const isLoggedIn = localStorage.getItem('token'); 

    const handleLogout = async () => {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
        toast.success('Logged out successfully!');
    };

    const handleProfileClick = () => {
        if (location.pathname === '/') {
            setIsRegister(true); 
            setDialogOpen(true); 
        } else if (isLoggedIn) {
            setIsLogout(true); 
            setDialogOpen(true);
        }
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setIsRegister(false);
        setIsLogout(false);
    };

    const handleDialogRegister = () => {
        navigate('/register'); 
        setDialogOpen(false);
        toast.info('Redirecting to registration page...');
    };

    const handleDialogLogout = () => {
        handleLogout();
        setDialogOpen(false);
    };

    return (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#0061A1' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img 
                    src="src/assets/icon.png" 
                    alt="Logo" 
                    style={{ width: '30px', height: '30px', marginRight: '10px' }} 
                />
                <h1 style={{ margin: 0, fontSize: '24px', color: 'white' }}>Scribbly</h1>
            </div>
            
            <AccountCircleIcon
                onClick={handleProfileClick}
                style={{ cursor: 'pointer', fontSize: '36px', color: 'white', marginLeft: 'auto' }} 
                titleAccess={location.pathname === '/' ? "Go to Register" : "Logout"} 
            />

            <Dialog open={dialogOpen} onClose={handleDialogClose}>
                <DialogTitle>{isRegister ? 'Start Registration' : 'Confirm Logout'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {isRegister 
                            ? 'Do you want to do a new registration?' 
                            : 'Are you sure you want to log out?'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button 
                        onClick={isRegister ? handleDialogRegister : handleDialogLogout} 
                        color={isRegister ? 'primary' : 'secondary'}>
                        {isRegister ? 'Register' : 'Logout'}
                    </Button>
                </DialogActions>
            </Dialog>
        </header>
    );
};

export default Header;
