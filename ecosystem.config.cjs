module.exports = {
  apps: [
    {
      name: 'happyyogi',
      script: 'build/index.js',
      cwd: '/var/www/happyyogi/app',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_file: '/var/www/happyyogi/app/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        ORIGIN: 'https://happyyogi.in',
        UPLOADS_PATH: '/var/www/happyyogi/uploads'
      },
      // Logging
      error_file: '/var/www/happyyogi/logs/error.log',
      out_file: '/var/www/happyyogi/logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Restart policy
      max_restarts: 10,
      restart_delay: 4000,
      min_uptime: '10s',
      kill_timeout: 5000
    }
  ]
};
