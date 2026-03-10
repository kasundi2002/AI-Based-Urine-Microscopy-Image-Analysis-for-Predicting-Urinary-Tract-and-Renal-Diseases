import { v4 as uuidv4 } from 'uuid';
import microscopyImage from '../assets/c2.jpg';

// Mock Data
const MOCK_USERS = [
    { id: 'mlt-1', username: 'mlt_user', password: 'password', role: 'MLT', name: 'Sarah Tech' },
    { id: 'doc-1', username: 'doc_user', password: 'password', role: 'CLINICIAN', name: 'Dr. Smith' },
    { id: 'pat-1', username: 'pat_user', password: 'password', role: 'PATIENT', name: 'John Doe' },
];

const BACKEND_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    login: async (username, password) => {
        const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        return data;
    },

    getPatients: async () => {
        const response = await fetch(`${BACKEND_URL}/patients`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch patients');
        return data.data; // Assuming your API returns { success: true, count: X, data: [...] }
    },

    addPatient: async (patientData) => {
        const response = await fetch(`${BACKEND_URL}/patients`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(patientData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to add patient');
        return data.data; // return created patient
    },

    updatePatient: async (patientId, patientData) => {
        const response = await fetch(`${BACKEND_URL}/patients/${patientId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(patientData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update patient');
        // Return updated patient from API
        return data.data;
    },

    deletePatient: async (patientId) => {
        const response = await fetch(`${BACKEND_URL}/patients/${patientId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete patient');
        return data;
    },

    uploadImage: async (file, patientId) => {
        const formData = new FormData();
        formData.append('image', file);
        if (patientId) {
            formData.append('patientId', patientId);
        }

        const token = localStorage.getItem('token');

        const response = await fetch(`${BACKEND_URL}/reports/upload`, {
            method: 'POST',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to analyze image');
        return data.data;
    },

    submitReport: async (reportData) => {
        const response = await fetch(`${BACKEND_URL}/reports/submit`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(reportData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to submit report');
        return data.data;
    },

    updateChemicalParametersByPatient: async (patientId, chemicalParameters) => {
        const response = await fetch(`${BACKEND_URL}/reports/patient/${patientId}/chemical`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ chemicalParameters })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update chemical parameters');
        return data.data;
    },

    getReportsByPatient: async (patientId) => {
        const response = await fetch(`${BACKEND_URL}/reports?patientId=${patientId}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch reports');
        return data.data;
    },

    getReport: async (reportId) => {
        const response = await fetch(`${BACKEND_URL}/reports/${reportId}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch report');
        return data.data;
    },

    submitVerification: async (reportId, verificationData) => {
        const response = await fetch(`${BACKEND_URL}/reports/${reportId}/verify`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(verificationData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to verify report');
        return data.data;
    },

    getAllReports: async () => {
        const response = await fetch(`${BACKEND_URL}/reports`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch reports');
        return data.data;
    },

    submitQuestionnaire: async (reportId, answers) => {
        const response = await fetch(`${BACKEND_URL}/reports/questionnaire`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ reportId, answers })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to submit questionnaire');
        return data.data;
    },

    sendAccessLink: async (patientId) => {
        const response = await fetch(`${BACKEND_URL}/patient-access/send-link`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ patientId })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to send access link');
        return data;
    }
};

