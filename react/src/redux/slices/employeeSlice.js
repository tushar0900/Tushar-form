/* Employee Redux Slice - Frontend State Management */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? "https://tushar-form.onrender.com" : "http://localhost:5000");

// Async Thunks
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async ({ page = 1, limit = 5 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/employees`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch employees");
    }
  }
);

export const fetchEmployeeDropdown = createAsyncThunk(
  "employees/fetchDropdown",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/employees?dropdown=true`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dropdown");
    }
  }
);

export const createEmployee = createAsyncThunk(
  "employees/createEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/employees`, employeeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create employee");
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/employees/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update employee");
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employees/deleteEmployee",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/employees/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete employee");
    }
  }
);

// Slice
const employeeSlice = createSlice({
  name: "employees",
  initialState: {
    data: [],
    dropdown: [],
    loading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
    totalEmployees: 0,
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
    // Fetch employees
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.totalEmployees = action.payload.totalEmployees;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch dropdown
    builder
      .addCase(fetchEmployeeDropdown.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployeeDropdown.fulfilled, (state, action) => {
        state.loading = false;
        state.dropdown = action.payload;
      })
      .addCase(fetchEmployeeDropdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create employee
    builder
      .addCase(createEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Employee created successfully";
        state.data.unshift(action.payload);
      })
      .addCase(createEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update employee
    builder
      .addCase(updateEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Employee updated successfully";
        const index = state.data.findIndex((emp) => emp._id === action.payload._id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(updateEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete employee
    builder
      .addCase(deleteEmployee.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.loading = false;
        state.success = "Employee deleted successfully";
        state.data = state.data.filter((emp) => emp._id !== action.payload.employee._id);
      })
      .addCase(deleteEmployee.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = employeeSlice.actions;
export default employeeSlice.reducer;
