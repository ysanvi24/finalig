// ─── VNIT IG App — PM2 Ecosystem Config ───
// Usage: pm2 start deploy/ecosystem.config.js
// Logs:  pm2 logs vnit-ig-backend
// Monitor: pm2 monit

module.exports = {
    apps: [
        {
            name: 'vnit-ig-backend',
            script: 'server/server.js',
            cwd: '/var/www/vnit-ig',
            instances: 1,                   // Single instance (sufficient for 500-2000 users)
            exec_mode: 'fork',
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',     // Restart if memory exceeds 512MB
            env: {
                NODE_ENV: 'production',
                PORT: 5000,
            },
            // Load .env from server directory
            env_file: '/var/www/vnit-ig/server/.env',
            // Log configuration
            error_file: '/var/log/pm2/vnit-ig-error.log',
            out_file: '/var/log/pm2/vnit-ig-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            // Graceful restart
            kill_timeout: 5000,
            listen_timeout: 10000,
            // Restart delay
            restart_delay: 1000,
            max_restarts: 10,
            min_uptime: '10s',
        },
    ],
};
