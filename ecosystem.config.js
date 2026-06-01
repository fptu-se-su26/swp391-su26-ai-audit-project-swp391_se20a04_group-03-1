module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'npm',
      args: 'run dev',
      cwd: './src/backend',
      env: {
        PORT: 4000,
        NODE_ENV: 'production',
        
        // --- Database & Cache ---
        DATABASE: 'mongodb+srv://leoken5805:bnCK4744l3LP9oP9@cluster0.lstqvtt.mongodb.net/logiport',
        REDIS_HOST: '18.143.166.255',
        REDIS_PORT: 6379,
        REDIS_PASSWORD: '5805',
        
        // --- Security & Frontend Origin ---
        JWT_SECRET: 'TczK8f0rR2kYur4O3x1e5xQjD7G1+IYd9n1y7w1zGd8=',
        FRONTEND_URL: 'https://213.144.200.206-3000.proxy.runpod.net', // URL Public của giao diện Web
        
        // --- External APIs ---
        PYTHON_API_URL: 'http://127.0.0.1:5001',
        
        // --- Email Notification ---
        EMAIL_USER: 'logiport391@gmail.com',
        EMAIL_APP: 'azhg kssf ewja kwjk',
        
        // --- Cloudinary (Upload) ---
        CLOUDINARY_NAME: 'dyubn4skp',
        CLOUDINARY_APIKEY: '586789634718346',
        CLOUDINARY_APISECRET: 'l7KSuNv644RfutiF32_WyfBX8zg'
      }
    },
    {
      name: 'frontend',
      script: 'npm',
      args: 'run start',
      cwd: './src/frontend',
      env: {
        PORT: 3000,
        
        // QUAN TRỌNG: 2 đường link này dùng cho Trình duyệt ở nhà kết nối tới RunPod
        // Cần thay chữ <id-may-chu-cua-ban> thành mã máy chủ RunPod thực tế
        NEXT_PUBLIC_API_URL: 'https://213.144.200.206-4000.proxy.runpod.net/api',
        NEXT_PUBLIC_CV_URL: 'https://213.144.200.206-5001.proxy.runpod.net'
      }
    },
    {
      name: 'computer-vision',
      script: 'src/app.py',
      cwd: './src/computer-vison',
      interpreter: 'python3',
      env: {
        // --- Network & Connection ---
        FLASK_PORT: 5001,
        FLASK_HOST: '0.0.0.0',
        BACKEND_URL: 'http://127.0.0.1:4000/api/scan', // Gọi nội bộ về Backend
        
        
        // --- AI Model Config ---
        DETECTION_CONFIDENCE_THRESHOLD: 0.5,
        OCR_CONFIDENCE_THRESHOLD: 0.4,
        COOLDOWN_PERIOD: 5.0
        
        // Nếu bạn dùng model riêng, có thể truyền thêm 2 biến này:
        // YOLO_PLATE_MODEL_PATH: 'models/best.pt',
        // YOLO_CONTAINER_MODEL_PATH: 'models/container_model.pt'
      }
    }
  ]
};
