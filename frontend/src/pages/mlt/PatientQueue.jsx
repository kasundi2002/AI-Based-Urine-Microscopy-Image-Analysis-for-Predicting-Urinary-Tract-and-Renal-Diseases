import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Typography, Chip, IconButton, Tooltip, Box, Button, Avatar, TextField,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, MenuItem, Snackbar, Alert
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { api } from '../../services/api';

const emptyForm = { name: '', age: '', gender: '', email: '', mobile: '', notes: '' };


const PatientQueue = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // For editing
  const [isEditing, setIsEditing] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [showEditSuccess, setShowEditSuccess] = useState(false);


  useEffect(() => {
    const fetchPatients = async () => {
      const data = await api.getPatients();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Awaiting Analysis': return { color: '#ff9100', bgcolor: alpha('#ff9100', 0.08), border: alpha('#ff9100', 0.2) };
      case 'Ready for Review': return { color: '#2196f3', bgcolor: alpha('#2196f3', 0.08), border: alpha('#2196f3', 0.2) };
      case 'Completed': return { color: '#66bb6a', bgcolor: alpha('#66bb6a', 0.08), border: alpha('#66bb6a', 0.2) };
      default: return { color: '#9e9e9e', bgcolor: alpha('#9e9e9e', 0.08), border: alpha('#9e9e9e', 0.2) };
    }
  };

  const getRiskConfig = (risk) => {
    switch (risk) {
      case 'High': return { color: '#ef5350', bgcolor: alpha('#ef5350', 0.08), border: alpha('#ef5350', 0.2) };
      case 'Moderate': return { color: '#ff9100', bgcolor: alpha('#ff9100', 0.08), border: alpha('#ff9100', 0.2) };
      case 'Normal': return { color: '#66bb6a', bgcolor: alpha('#66bb6a', 0.08), border: alpha('#66bb6a', 0.2) };
      case 'Pending': return { color: '#00bcd4', bgcolor: alpha('#00bcd4', 0.08), border: alpha('#00bcd4', 0.2) };
      default: return { color: '#9e9e9e', bgcolor: alpha('#9e9e9e', 0.08), border: alpha('#9e9e9e', 0.2) };
    }
  };

  const filtered = patients.filter(p => 
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.patientId?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDialog = () => {
    setIsEditing(false);
    setPatientToEdit(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (patient) => {
    setIsEditing(true);
    setPatientToEdit(patient);
    setForm({
      name: patient.name || '',
      age: patient.age || '',
      gender: patient.gender || '',
      email: patient.email || '',
      mobile: patient.mobile || '',
      notes: patient.notes || ''
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setTimeout(() => {
        setForm(emptyForm);
        setIsEditing(false);
        setPatientToEdit(null);
        setErrors({});
    }, 200); // Wait for transition
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Patient name is required';
    if (!form.age) newErrors.age = 'Age is required';
    else if (isNaN(form.age) || parseInt(form.age) < 1 || parseInt(form.age) > 120) newErrors.age = 'Enter a valid age (1–120)';
    if (!form.email.trim()) newErrors.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEditing && patientToEdit) {
        // Update existing patient
        const updatedPatient = await api.updatePatient(patientToEdit._id, form);
        setPatients(prev => prev.map(p => p._id === updatedPatient._id ? updatedPatient : p));
        handleCloseDialog();
        setShowEditSuccess(true);
      } else {
        // Create new patient
        const newPatient = await api.addPatient(form);
        setPatients(prev => [newPatient, ...prev]);
        handleCloseDialog();
        setShowSuccess(true);
        // Try to send the secure access email (best-effort)
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('http://localhost:5000/api/patient-access/send-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ patientId: newPatient.patientId }),
          });
          if (response.ok) setShowEmailSent(true);
        } catch (linkErr) {
          console.warn('Could not send patient access email:', linkErr.message);
        }
      }
    } catch (err) {
      console.error(isEditing ? 'Failed to update patient' : 'Failed to add patient', err);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDelete = (patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const handleCloseDelete = () => {
    setDeleteDialogOpen(false);
    setPatientToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;
    setDeleting(true);
    try {
      await api.deletePatient(patientToDelete._id);
      setPatients(prev => prev.filter(p => p._id !== patientToDelete._id));
      handleCloseDelete();
    } catch (error) {
      console.error('Failed to delete patient', error);
      alert('Failed to delete patient');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.4s ease-out' }}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <PeopleAltIcon sx={{ color: '#00bcd4', fontSize: 28 }} />
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>Patient Management</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {patients.length} patients in queue · {patients.filter(p => p.status === 'Awaiting Analysis').length} awaiting analysis
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenDialog}
          sx={{
            textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3,
            background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
            boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
          }}
        >
          Add Patient
        </Button>
      </Box>

      {/* Search & Filter Bar */}
      <Paper elevation={0} sx={{ 
        p: 2, mb: 3, borderRadius: 3, 
        border: '1px solid', borderColor: 'divider',
        display: 'flex', alignItems: 'center', gap: 2
      }}>
        <TextField
          size="small"
          placeholder="Search by name or patient ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />
        <Button variant="outlined" startIcon={<FilterListIcon />} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: 'divider', color: 'text.secondary' }}>
          Filter
        </Button>
      </Paper>

      {/* Patient Table */}
      <Paper elevation={0} sx={{ 
        borderRadius: 3, overflow: 'hidden', 
        border: '1px solid', borderColor: 'divider'
      }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha('#f8fafc', 0.5) }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase', py: 2 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Patient</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Age</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>AI Risk</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem', letterSpacing: 0.5, textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((patient) => {
                const risk = getRiskConfig(patient.riskAssessment);
                const status = getStatusConfig(patient.status);
                return (
                  <TableRow 
                    hover key={patient._id} 
                    sx={{ 
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: alpha('#00bcd4', 0.02) },
                      '&:last-child td': { border: 0 }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="#00bcd4">{patient.patientId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ 
                          width: 34, height: 34, fontSize: '0.8rem', fontWeight: 700,
                          bgcolor: alpha('#00bcd4', 0.1), color: '#00bcd4'
                        }}>
                          {patient.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{patient.name}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{patient.age}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={patient.riskAssessment} 
                        size="small"
                        sx={{ 
                          bgcolor: risk.bgcolor, color: risk.color, fontWeight: 700, fontSize: '0.7rem',
                          border: '1px solid', borderColor: risk.border, height: 24
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={patient.status} 
                        size="small"
                        sx={{ 
                          bgcolor: status.bgcolor, color: status.color, fontWeight: 600, fontSize: '0.65rem',
                          border: '1px solid', borderColor: status.border, height: 22
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="View Report">
                          <IconButton size="small" sx={{ 
                            color: 'text.secondary',
                            '&:hover': { color: '#00bcd4', bgcolor: alpha('#00bcd4', 0.08) }
                          }}>
                            <DescriptionIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        
                        {patient.status === 'Awaiting Analysis' ? (
                          <Tooltip title="Start Analysis">
                            <IconButton size="small" onClick={() => onSelectPatient(patient)} sx={{
                              color: 'white', bgcolor: '#00bcd4',
                              '&:hover': { bgcolor: '#00acc1' }
                            }}>
                              <PlayArrowIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => onSelectPatient(patient)} sx={{
                              color: 'text.secondary',
                              '&:hover': { color: '#7c4dff', bgcolor: alpha('#7c4dff', 0.08) }
                            }}>
                              <VisibilityIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenEditDialog(patient)} sx={{
                            color: 'text.secondary',
                            '&:hover': { color: '#ff9100', bgcolor: alpha('#ff9100', 0.08) }
                          }}>
                            <EditIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleOpenDelete(patient)} sx={{
                            color: 'text.secondary',
                            '&:hover': { color: '#ef5350', bgcolor: alpha('#ef5350', 0.08) }
                          }}>
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Patient Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, overflow: 'hidden' }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #0f172a, #1e3a5f)', 
          color: 'white', px: 3, py: 2.5,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PersonAddIcon />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {isEditing ? 'Edit Patient Details' : 'Add New Patient'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {isEditing ? 'Update the details for this patient' : 'Fill in patient details to register'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white', opacity: 0.7, '&:hover': { opacity: 1 } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
          <Grid container spacing={2.5} sx={{ mt: 3 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Full Name"
                placeholder="e.g. John Doe"
                fullWidth required
                value={form.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                label="Age"
                placeholder="e.g. 35"
                type="number"
                fullWidth required
                value={form.age}
                onChange={(e) => handleFormChange('age', e.target.value)}
                error={!!errors.age}
                helperText={errors.age}
                inputProps={{ min: 1, max: 120 }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <TextField
                label="Gender"
                select fullWidth
                value={form.gender}
                onChange={(e) => handleFormChange('gender', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="">— Select —</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Email Address"
                placeholder="e.g. patient@email.com"
                type="email"
                fullWidth required
                value={form.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Mobile Number"
                placeholder="e.g. +94 77 123 4567"
                fullWidth required
                value={form.mobile}
                onChange={(e) => handleFormChange('mobile', e.target.value)}
                error={!!errors.mobile}
                helperText={errors.mobile || 'OTP will be sent to this number for patient identity verification'}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Clinical Notes"
                placeholder="Any relevant medical history or notes..."
                multiline rows={3} fullWidth
                value={form.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>

          {!isEditing && (
            <Paper elevation={0} sx={{ 
              mt: 2.5, p: 2, borderRadius: 2, 
              bgcolor: alpha('#00bcd4', 0.04), border: '1px solid', borderColor: alpha('#00bcd4', 0.12)
            }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Note:</strong> The patient will be registered with status <Chip label="Awaiting Analysis" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, mx: 0.5 }} /> and AI Risk <Chip label="Pending" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, mx: 0.5 }} />. A secure access link will be sent to the patient's email after registration.
              </Typography>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? null : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 4,
              background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
              boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
            }}
          >
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Register Patient')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ef5350' }}>
          <DeleteIcon /> Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Are you sure you want to delete patient <strong>{patientToDelete?.name}</strong> (ID: {patientToDelete?.patientId})? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDelete} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Alert */}
      <Snackbar open={showSuccess} autoHideDuration={4000} onClose={() => setShowSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setShowSuccess(false)} severity="success" variant="filled" icon={<PersonAddIcon />} sx={{ fontWeight: 600, borderRadius: 2, width: '100%' }}>
          Patient registered successfully and added to the queue.
        </Alert>
      </Snackbar>

      <Snackbar open={showEditSuccess} autoHideDuration={4000} onClose={() => setShowEditSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setShowEditSuccess(false)} severity="success" variant="filled" icon={<SaveIcon />} sx={{ fontWeight: 600, borderRadius: 2, width: '100%' }}>
          Patient details updated successfully.
        </Alert>
      </Snackbar>

      {/* Email Sent Alert */}
      <Snackbar open={showEmailSent} autoHideDuration={6000} onClose={() => setShowEmailSent(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ bottom: 72 }}>
        <Alert onClose={() => setShowEmailSent(false)} severity="info" variant="filled" sx={{ fontWeight: 600, borderRadius: 2, width: '100%' }}>
          Secure access link sent to patient's email address.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientQueue;

