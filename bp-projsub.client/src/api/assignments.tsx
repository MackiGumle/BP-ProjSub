import axios from 'axios';

export const createAssignment = async (formData: FormData) => {
    const response = await axios.post('/api/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getAssignments = async () => {
    const response = await axios.get('/api/assignments');
    return response.data;
};

