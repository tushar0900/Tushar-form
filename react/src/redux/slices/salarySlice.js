/* Salary Redux Slice - Frontend State Management */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://tushar-form.onrender.com" : "http://localhost:5000");

// Async Thunks
export const fetchSalaries = createAsyncThunk(
  "salaries/fetchSalaries",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/salary-master`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch salaries");
    }
  }
);

export const createSalary = createAsyncThunk(
  "salaries/createSalary",
  async (salaryData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/salary-master`, salaryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create salary");
    }
  }
);

export const updateSalary = createAsyncThunk(
  "salaries/updateSalary",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/salary-master/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update salary");
    }
  }
);

export const deleteSalary = createAsyncThunk(
  "salaries/deleteSalary",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/salary-master/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete salary");
    }
  }
);

// Slice
const salarySlice = createSlice({
  name: "salaries",
  initialState: {
    data: [],
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
    totalSalaries: 0,
    success: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch salaries
    builder
      .addCase(fetchSalaries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalaries.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.salaries;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalSalaries = action.payload.totalSalaries;
      })
      .addCase(fetchSalaries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create salary
    builder
      .addCase(createSalary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSalary.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Salary created successfully";
        state.data.unshift(action.payload);
      })
      .addCase(createSalary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update salary
    builder
      .addCase(updateSalary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSalary.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Salary updated successfully";
        const index = state.data.findIndex((sal) => sal._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateSalary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete salary
    builder
      .addCase(deleteSalary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSalary.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Salary deleted successfully";
        state.data = state.data.filter((sal) => sal._id !== action.payload.salary._id);
      })
      .addCase(deleteSalary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = salarySlice.actions;
export default salarySlice.reducer;
