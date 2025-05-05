import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useActivityLogsStore } from './activityLogs';

// Define la URL base de tu API. Ajusta si es necesario.
const API_BASE_URL = import.meta.env.VITE_BASE_URL; // Access the environment variable directly

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('authToken') || null);
  const user = ref(JSON.parse(localStorage.getItem('authUser') || '{}'));
  const isInitialized = ref(false); 
  const router = useRouter();
  const activityLogsStore = useActivityLogsStore();

  const isAuthenticated = computed(() => !!token.value);

  function setAuthData(newToken, newUser) {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));
  }

  function clearAuthData() {
    token.value = null;
    user.value = {};
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  }

  async function login(credentials) {
    try {
      // Intentar autenticar al usuario
      console.log('Auth store: URL base:', API_BASE_URL);
      console.log('Auth store: URL completa:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Auth store: Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
          } else {
            const textError = await response.text();
            if (textError) {
              errorMessage = textError;
            }
          }
        } catch (e) {
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Normalización del rol del usuario para asegurar un formato consistente
      let userRole = data.role;
      
      // Si el rol es un string, convertirlo a objeto para mantener consistencia
      if (typeof userRole === 'string') {
        userRole = { name: userRole };
      } else if (typeof userRole === 'object' && userRole !== null) {
        // Si ya es un objeto, asegurarse de que tenga la propiedad name
        if (!userRole.name && userRole.roleName) {
          userRole.name = userRole.roleName;
        }
      }
      
      const userData = { 
        id: data.id,
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        role: userRole
      };
      
      setAuthData(data.token, userData);
      isInitialized.value = true;

      // Registrar la actividad de login
      await activityLogsStore.createActivityLog(
        'LOGIN',
        `Usuario ${userData.username} ha iniciado sesión`
      );
      
      // Redirige al dashboard después del login
      try {
        router.push('/'); 
      } catch (routerError) {
        // Fallback a redirección nativa si hay un problema con el router
        window.location.href = '/';
      }
      
      return userData;
    } catch (error) {
      clearAuthData(); // Limpia datos si el login falla
      isInitialized.value = true; // Marcar como inicializado incluso si falla
      throw error; // Propaga el error para manejarlo en el componente
    }
  }

  async function logout() {
    // Registrar la actividad de logout antes de limpiar los datos
    const username = user.value?.username;
    if (username) {
      await activityLogsStore.createActivityLog(
        'LOGOUT',
        `Usuario ${username} ha cerrado sesión`
      );
    }

    clearAuthData();
    // No resetear isInitialized porque ya sabemos el estado de la autenticación
    // Redirige a la página de login
    router.push('/login');
  }

  // Función para verificar el estado de autenticación al cargar la app
  async function checkAuth() {
    try {
      isInitialized.value = false; // Marcar como no inicializado mientras verificamos
      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) {
          clearAuthData();
          return false;
      } else {
          // Obtener y analizar el usuario almacenado
          const storedUser = JSON.parse(localStorage.getItem('authUser') || '{}');
          
          // Normalizar la estructura del rol
          if (storedUser.role) {
            if (typeof storedUser.role === 'string') {
              storedUser.role = { name: storedUser.role };
            } else if (typeof storedUser.role === 'object' && !storedUser.role.name && storedUser.role.roleName) {
              storedUser.role.name = storedUser.role.roleName;
            }
          }
          
          // Aquí se podría implementar una validación del token en el servidor
          /* 
          const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
            
          if (!response.ok) {
            throw new Error('Token inválido');
          }
          */
            
          // Restaurar el estado de autenticación
          token.value = storedToken;
          user.value = storedUser;
          return true;
      }
    } catch (error) {
      clearAuthData();
      return false;
    } finally {
      // Siempre marcamos como inicializado, independientemente del resultado
      isInitialized.value = true;
    }
  }

  return { 
    token, 
    user, 
    isAuthenticated,
    isInitialized, // Exponemos la nueva propiedad 
    login, 
    logout, 
    checkAuth 
  };
});
