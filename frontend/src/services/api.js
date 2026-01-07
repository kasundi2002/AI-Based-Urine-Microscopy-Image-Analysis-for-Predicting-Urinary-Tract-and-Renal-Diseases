import { v4 as uuidv4 } from 'uuid';
import microscopyImage from '../assets/c2.jpg';

// Mock Data
const MOCK_USERS = [
  { id: 'mlt-1', username: 'mlt_user', password: 'password', role: 'MLT', name: 'Sarah Tech' },
  { id: 'doc-1', username: 'doc_user', password: 'password', role: 'CLINICIAN', name: 'Dr. Smith' },
  { id: 'pat-1', username: 'pat_user', password: 'password', role: 'PATIENT', name: 'John Doe' },
];

const MOCK_PATIENTS = [
  { id: 'P01', name: 'Kane Peter', age: 24, status: 'Awaiting Analysis', date: '2025-10-20', riskAssessment: 'Pending' },
  { id: 'P02', name: 'Kane Peter', age: 35, status: 'Ready for Review', date: '2025-10-20', riskAssessment: 'High' },
  { id: 'P03', name: 'Kane Peter', age: 44, status: 'Completed', date: '2025-10-20', riskAssessment: 'Normal' },
  { id: 'P04', name: 'Kane Peter', age: 18, status: 'Completed', date: '2025-10-20', riskAssessment: 'Normal' },
];

const MOCK_REPORTS = [
  {
    id: 'r1',
    patientId: 'p2',
    patientName: 'Bob Williams',
    image: microscopyImage,
    findings: {
      wbc: 12,
      rbc: 5,
      crystals: 'Calcium Oxalate',
      bacteria: 'None',
    },
    riskScore: 85,
    riskLabel: 'High Risk of Kidney Stones',
    status: 'Pending Verification',
  },
];

export const api = {
  login: async (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(u => u.username === username && u.password === password);
        if (user) {
          resolve(user);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  },

  getPatients: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_PATIENTS);
      }, 500);
    });
  },

  uploadImage: async (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: uuidv4(),
          url: URL.createObjectURL(file),
          analysis: {
            wbc: Math.floor(Math.random() * 20),
            rbc: Math.floor(Math.random() * 10),
            crystals: Math.random() > 0.5 ? 'Present' : 'Absent',
            risk: Math.floor(Math.random() * 100),
          }
        });
      }, 1500);
    });
  },

  getReport: async (reportId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_REPORTS.find(r => r.id === reportId));
      }, 500);
    });
  },
  
  submitVerification: async (reportId, data) => {
      return new Promise((resolve) => {
          setTimeout(() => {
              console.log('Verification submitted for', reportId, data);
              resolve({ success: true });
          }, 800);
      })
  }
};
