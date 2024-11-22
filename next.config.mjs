/** @type {import('next').NextConfig} */
const nextConfig = {
    //output: 'export',
    distDir: 'build',
    /*async headers() {
        return [
          {
            source: "/static/backend/assets/testdata.json",
            headers: [
              {
                key: "Access-Control-Allow-Origin",
                value: "*", // Set your origin
              },
              {
                key: "Access-Control-Allow-Methods",
                value: "GET, POST, PUT, DELETE, OPTIONS",
              },
              {
                key: "Access-Control-Allow-Headers",
                value: "Content-Type, Authorization",
              },
            ],
          },
        ];
      },*/
};

export default nextConfig;
