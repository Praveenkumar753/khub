import api from './api';

const inquiryService = {
    // Submit a new contact message
    submitInquiry: async (inquiryData) => {
        const response = await api.post('/inquiries', inquiryData);
        return response.data;
    },

    // Get all inquiries (Admin Only)
    getInquiries: async () => {
        const response = await api.get('/inquiries');
        return response.data;
    },

    // Update inquiry status (Admin Only)
    updateInquiryStatus: async (id, status) => {
        const response = await api.put(`/inquiries/${id}`, { status });
        return response.data;
    },

    // Delete an inquiry (Admin Only)
    deleteInquiry: async (id) => {
        const response = await api.delete(`/inquiries/${id}`);
        return response.data;
    }
};

export default inquiryService;
