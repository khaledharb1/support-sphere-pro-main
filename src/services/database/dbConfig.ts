
// Database configuration service for SQL Server integration

export interface DatabaseConfig {
  server: string;
  database: string;
  authentication: {
    type: 'sql' | 'windows' | 'azure';
    options: {
      userName?: string;
      password?: string;
      domain?: string;
      token?: string;
    };
  };
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    port?: number;
    connectionTimeout?: number;
    requestTimeout?: number;
    pool?: {
      max: number;
      min: number;
      idleTimeoutMillis: number;
    };
  };
}

// Default configuration
const defaultConfig: DatabaseConfig = {
  server: '',
  database: '',
  authentication: {
    type: 'sql',
    options: {
      userName: '',
      password: '',
    },
  },
  options: {
    encrypt: true,
    trustServerCertificate: false,
    connectionTimeout: 30000,
    requestTimeout: 30000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },
};

// Get the database configuration
export const getDbConfig = (): DatabaseConfig => {
  const storedConfig = localStorage.getItem('dbConfig');
  if (storedConfig) {
    try {
      return JSON.parse(storedConfig);
    } catch (error) {
      console.error('Error parsing stored DB config:', error);
      return defaultConfig;
    }
  }
  return defaultConfig;
};

// Save the database configuration
export const saveDbConfig = (config: DatabaseConfig): void => {
  localStorage.setItem('dbConfig', JSON.stringify(config));
};

// Test database connection (mock implementation for frontend)
export const testConnection = async (config: DatabaseConfig): Promise<{ success: boolean; message: string }> => {
  try {
    // Mock implementation - in a real app, this would connect to a backend API that tests the SQL Server connection
    console.log('Testing connection to SQL Server:', config);
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Perform simple validation to simulate connection test
    if (!config.server || !config.database) {
      return { 
        success: false, 
        message: 'Server and database names are required'
      };
    }
    
    if (config.authentication.type === 'sql' && 
        (!config.authentication.options.userName || !config.authentication.options.password)) {
      return { 
        success: false, 
        message: 'Username and password are required for SQL authentication'
      };
    }
    
    // Mock successful connection
    return { 
      success: true, 
      message: 'Connection successful!'
    };
  } catch (error) {
    console.error('Error testing database connection:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Initialize database schema (mock implementation for frontend)
export const initializeDatabase = async (): Promise<boolean> => {
  try {
    console.log('Initializing database schema...');
    
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would create the required tables in SQL Server if they don't exist
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};
