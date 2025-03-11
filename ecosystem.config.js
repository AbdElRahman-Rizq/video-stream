module.exports = {
  apps: [
    {
      name: "youtube",
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
