# DevOps Audit Automation UI

🚀 **Modern web interface for DevOps audit automation with monorepo architecture**

A comprehensive suite transforming CLI DevOps audit tools into a modern, visual platform using Remix, TypeScript, and shadcn/ui components.

## 🎯 Features

- **📊 Interactive Dashboard**: Real-time audit results with visual analytics
- **⚡ Multi-Speed Audits**: Quick (10s), Detailed (30s), Complete (2min) analysis
- **🎨 Modern UI**: Built with shadcn/ui and Tailwind CSS for excellent UX
- **🏗️ Monorepo Architecture**: Scalable structure with Turborepo and pnpm
- **🔍 Comprehensive Analysis**: Git, Dependencies, Testing, CI/CD, Docker, Security
- **📈 Smart Scoring**: Automated quality scoring with actionable recommendations
- **🔄 Real-time Monitoring**: Live progress tracking and WebSocket integration
- **📱 Responsive Design**: Works seamlessly on desktop and mobile

## 🏛️ Architecture

```
devops-audit-automation-ui/
├── apps/
│   └── web/                     # Remix dashboard application
├── packages/
│   ├── core/                    # Original Python/Bash audit scripts
│   ├── api/                     # Node.js API wrapper service
│   └── ui/                      # Shared shadcn/ui components
├── turbo.json                   # Turborepo configuration
└── pnpm-workspace.yaml          # Workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+
- Python 3.8+
- Bash (for Linux/macOS)

### Installation

```bash
# Clone and setup
git clone https://github.com/Gzeu/devops-audit-automation-ui.git
cd devops-audit-automation-ui

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Development

```bash
# Start API server (Terminal 1)
cd packages/api && pnpm dev     # http://localhost:3001

# Start web app (Terminal 2)  
cd apps/web && pnpm dev         # http://localhost:3000
```

### Copy Original Scripts

```bash
# Copy the original audit scripts to packages/core/scripts/
cp /path/to/original/devops-analyzer.py packages/core/scripts/
cp /path/to/original/quick-health-check.sh packages/core/scripts/
cp /path/to/original/quality-audit-script.sh packages/core/scripts/

# Make scripts executable
chmod +x packages/core/scripts/*.sh
```

## 📊 Usage

1. **Open Dashboard**: Navigate to `http://localhost:3000`
2. **Enter Project Path**: Specify the path to your project
3. **Choose Audit Type**: 
   - **Quick Check** (10s): Essential DevOps health verification
   - **Detailed Analysis** (30s): Comprehensive metrics and insights
   - **Complete Audit** (2min): Full security and quality assessment
4. **View Results**: Interactive dashboard with actionable recommendations

## 🛠️ Available Scripts

### Root Commands

```bash
pnpm dev          # Start all development servers
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm typecheck    # Type check all packages
pnpm clean        # Clean all build artifacts
```

## 🎨 Technology Stack

### Frontend
- **Framework**: Remix (Full-stack React framework)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript
- **Build Tool**: Vite

### Backend  
- **Runtime**: Node.js + Express
- **Language**: TypeScript
- **Original Tools**: Python + Bash scripts

### DevOps
- **Monorepo**: Turborepo + pnpm workspaces
- **Package Manager**: pnpm
- **Linting**: ESLint + Prettier

## 🔧 Configuration

### Environment Variables

```bash
# API Server
PORT=3001                    # API server port
NODE_ENV=development         # Environment mode

# Web App  
PORT=3000                    # Web app port
API_URL=http://localhost:3001 # API server URL
```

## 📦 Building for Production

```bash
# Build all packages
pnpm build

# Build specific targets
turbo run build --filter=@audit/web
turbo run build --filter=@audit/api
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`  
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of the original [DevOps Audit Automation CLI tools](https://github.com/Gzeu/devops-audit-automation)
- Powered by [Remix](https://remix.run) and [shadcn/ui](https://ui.shadcn.com)
- Monorepo structure with [Turborepo](https://turbo.build)

---

**Made with ❤️ for modern DevOps teams**