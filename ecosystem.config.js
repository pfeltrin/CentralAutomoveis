     module.exports = {
       apps: [{
         name: 'central-automoveis',
         script: 'server.js',
         instances: 1,  // Número de instâncias (1 para apps simples)
         autorestart: true,
         watch: false,  // Não monitore mudanças em produção
         max_memory_restart: '1G',  // Reinicia se usar >1GB
         env: {
           NODE_ENV: 'production',
           PORT: 3000
         }
       }]
     };
     