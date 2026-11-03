// pm2 start deploy/ecosystem.config.cjs. Secrets go in .env next to package.json, never here.
module.exports = {
  apps: [
    {
      name: "peppy-api",
      cwd: "/var/www/peppyrh.fun",
      script: "server/api.ts",
      interpreter: "node",
      interpreter_args: "--env-file-if-exists=.env --import tsx",
      env: { NODE_ENV: "production", PORT: "5451", OWNER_WALLET: "0xa6428ae3aade827c418282a425b0218b830fe2e4" },
      max_memory_restart: "150M",
    },
  ],
};
