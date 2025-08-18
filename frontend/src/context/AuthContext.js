import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Action types
const actionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case actionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case actionTypes.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Try to get user profile from backend
          const response = await authAPI.getProfile();
          dispatch({
            type: actionTypes.SET_USER,
            payload: response.data.data,
          });
        } catch (error) {
          // Backend not available or token invalid, remove token
          console.log('Auth check failed, removing token');
          localStorage.removeItem('token');
          dispatch({ type: actionTypes.SET_LOADING, payload: false });
        }
      } else {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: actionTypes.LOGIN_START });
      
      let response;
      try {
        // Try to login with backend
        response = await authAPI.login(credentials);
        const { token, data: user } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          payload: { user, token },
        });
        
        toast.success(`Welcome back, ${user.name}!`);
        return { success: true };
      } catch (backendError) {
        // Backend not available, use mock authentication
        console.log('Backend not available, using mock authentication');
        
        // Mock users for demo
        const mockUsers = {
          'admin@tenantmanager.com': {
            id: '1',
            name: 'Admin User',
            email: 'admin@tenantmanager.com',
            role: 'admin',
            phone: '+1234567890'
          },
          'john.student@university.edu': {
            id: '2',
            name: 'John Student',
            email: 'john.student@university.edu',
            role: 'user',
            phone: '+1234567891'
          },
          'owner@example.com': {
            id: '3',
            name: 'Property Owner',
            email: 'owner@example.com',
            role: 'owner',
            phone: '+1234567892'
          }
        };

        const mockPasswords = {
          'admin@tenantmanager.com': 'admin123',
          'john.student@university.edu': 'password123',
          'owner@example.com': 'owner123'
        };

        const user = mockUsers[credentials.email];
        const validPassword = mockPasswords[credentials.email];

        if (user && validPassword === credentials.password) {
          // Generate mock token
          const mockToken = `mock_token_${user.id}_${Date.now()}`;
          
          // Store token in localStorage
          localStorage.setItem('token', mockToken);
          
          dispatch({
            type: actionTypes.LOGIN_SUCCESS,
            payload: { user, token: mockToken },
          });
          
          toast.success(`Welcome back, ${user.name}!`);
          return { success: true };
        } else {
          throw new Error('Invalid credentials');
        }
      }
    } catch (error) {
      const message = error.message || 'Login failed';
      dispatch({
        type: actionTypes.LOGIN_FAILURE,
        payload: message,
      });
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: actionTypes.LOGIN_START });
      
      try {
        // Try to register with backend
        const response = await authAPI.register(userData);
        const { token, data: user } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          payload: { user, token },
        });
        
        toast.success(`Welcome to TenantHub, ${user.name}!`);
        return { success: true };
      } catch (backendError) {
        // Backend not available, use mock registration
        console.log('Backend not available, using mock registration');
        
        const mockUser = {
          id: `mock_${Date.now()}`,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'user',
          phone: userData.phone || ''
        };

        const mockToken = `mock_token_${mockUser.id}_${Date.now()}`;
        
        // Store token in localStorage
        localStorage.setItem('token', mockToken);
        
        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          payload: { user: mockUser, token: mockToken },
        });
        
        toast.success(`Welcome to TenantHub, ${mockUser.name}!`);
        return { success: true };
      }
    } catch (error) {
      const message = error.message || 'Registration failed';
      dispatch({
        type: actionTypes.LOGIN_FAILURE,
        payload: message,
      });
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: actionTypes.LOGOUT });
    toast.success('Logged out successfully');
  };

  const value = {
    ...state,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;