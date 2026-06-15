# 0003. HTML/CSS Templates and Satori Rendering

We compared Node-Canvas, Python Pillow, Headless Browser screenshots, and Satori for backend rendering. We decided to use HTML/CSS layout templates rendered on the backend via Vercel Satori. This decision supersedes ADR 0002 (React-Konva). Under this architecture, both the browser editor and the backend assembler share identical HTML/CSS and JSX templates, ensuring near-perfect visual rendering parity, ultra-fast serverless generation, and ease of deployment without native binary compilation.
