const fs = require('fs');
const path = require('path');

const targetDir = 'D:/docm/term 7/agile/project/nursery-admin/nursery-admin';
const srcDir = path.join(targetDir, 'src');

// 1. Write src/api.js
const apiJsContent = `const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: \`Bearer \${token}\` } : {};
}

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || data.message || \`Request failed with status \${res.status}\`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(\`\${API_BASE}/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Users (Admin)
  async getUsers(role) {
    const query = role && role !== 'All Roles' ? \`?role=\${role.toUpperCase()}\` : '';
    const res = await fetch(\`\${API_BASE}/admin/users\${query}\`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async createUser({ name, email, password, role }) {
    const res = await fetch(\`\${API_BASE}/admin/users\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role: role.toUpperCase()
      })
    });
    return handleResponse(res);
  },

  async toggleUserStatus(id) {
    const res = await fetch(\`\${API_BASE}/admin/users/\${id}/status\`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async deleteUser(id) {
    const res = await fetch(\`\${API_BASE}/admin/users/\${id}\`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Children (Admin)
  async getChildren() {
    const res = await fetch(\`\${API_BASE}/admin/children\`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async createChild({ firstName, lastName, dateOfBirth, gender, parentId }) {
    const res = await fetch(\`\${API_BASE}/admin/children\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        firstName,
        lastName,
        dateOfBirth,
        gender,
        parentId
      })
    });
    return handleResponse(res);
  },

  async deleteChild(id) {
    const res = await fetch(\`\${API_BASE}/admin/children/\${id}\`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  }
};

export default api;
`;

fs.writeFileSync(path.join(srcDir, 'api.js'), apiJsContent, 'utf8');
console.log('✓ src/api.js created');

// 2. Write .env in nursery-admin
const envContent = `VITE_API_URL=http://localhost:5000/api
`;
fs.writeFileSync(path.join(targetDir, '.env'), envContent, 'utf8');
console.log('✓ .env created in nursery-admin');

// 3. Write vite.config.js with proxy
const viteConfigContent = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
`;
fs.writeFileSync(path.join(targetDir, 'vite.config.js'), viteConfigContent, 'utf8');
console.log('✓ vite.config.js updated with API proxy');
