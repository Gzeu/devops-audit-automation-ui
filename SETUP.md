# DevOps Audit Automation UI - Setup Guide

🚀 **Complete setup guide for the DevOps Audit Automation UI monorepo**

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Python** 3.8+ ([Download](https://python.org/))
- **Git** ([Download](https://git-scm.com/))

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/Gzeu/devops-audit-automation-ui.git
cd devops-audit-automation-ui
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Build all packages
pnpm build
```

### 3. Copy Original Audit Scripts

```bash
# From the original devops-audit-automation repository
cp /path/to/original/devops-analyzer.py packages/core/scripts/
cp /path/to/original/quick-health-check.sh packages/core/scripts/
cp /path/to/original/quality-audit-script.sh packages/core/scripts/

# Make bash scripts executable
chmod +x packages/core/scripts/*.sh
```

### 4. Development Setup

```bash
# Terminal 1: Start API server
cd packages/api
pnpm dev
# Runs on http://localhost:3001

# Terminal 2: Start web application  
cd apps/web
pnpm dev
# Runs on http://localhost:3000
```

### 5. Verify Setup

- 🌐 Open `http://localhost:3000` in your browser
- 🔍 API health check: `http://localhost:3001/health`
- 🧪 Test audit endpoint: `curl -X POST http://localhost:3001/api/audit/quick -H "Content-Type: application/json" -d '{"projectPath":"/tmp"}'`

## Development Commands

### Root Level Commands

```bash
# Start all services
pnpm dev

# Build all packages
pnpm build

# Run linting
pnpm lint

# Type checking
pnpm typecheck

# Clean build artifacts
pnpm clean
```

### Package-Specific Commands

```bash
# API Package
cd packages/api
pnpm dev          # Development server
pnpm build        # Build TypeScript
pnpm start        # Production server

# Web App
cd apps/web
pnpm dev          # Remix dev server
pnpm build        # Build for production
pnpm start        # Serve built app

# UI Package
cd packages/ui  
pnpm dev          # Build components (watch)
pnpm build        # Build component library
```

## Project Structure

```
devops-audit-automation-ui/
├── apps/
│   └── web/                     # Remix dashboard app
│       ├── app/
│       │   ├── routes/_index.tsx    # Main dashboard
│       │   ├── root.tsx            # App layout
│       │   └── tailwind.css        # Global styles
│       ├── package.json
│       └── vite.config.js
├── packages/
│   ├── core/                    # Original audit scripts
│   │   └── scripts/
│   │       ├── devops-analyzer.py
│   │       └── quick-health-check.sh
│   ├── api/                     # Express API server
│   │   └── src/
│   │       ├── index.ts            # Server entry
│   │       ├── services/           # Audit service
│   │       ├── routes/             # API routes
│   │       └── types/              # TypeScript types
│   └── ui/                      # Shared components
│       └── src/
│           ├── components/
│           │   ├── audit/          # Audit-specific components
│           │   └── ui/             # shadcn/ui components
│           └── lib/utils.ts        # Utilities
├── turbo.json                   # Turborepo config
└── pnpm-workspace.yaml          # Workspace config
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill processes on ports 3000/3001
   npx kill-port 3000 3001
   ```

2. **Python script permissions**
   ```bash
   chmod +x packages/core/scripts/*.sh
   chmod +x packages/core/scripts/*.py
   ```

3. **Missing dependencies**
   ```bash
   # Clean install
   rm -rf node_modules packages/*/node_modules apps/*/node_modules
   pnpm install
   ```

4. **Build errors**
   ```bash
   # Clean and rebuild
   pnpm clean
   pnpm build
   ```

### Development Tips

- Use `pnpm dev` to start all services simultaneously
- Check API health at `http://localhost:3001/health`
- Monitor console logs in both terminals
- Use browser DevTools for frontend debugging

## Next Steps

1. 🔍 Test audit functionality with sample projects
2. 🎨 Customize UI theme and branding
3. 📈 Add database integration for audit history
4. 🔗 Integrate with Linear, Notion, GitHub webhooks
5. 🚀 Deploy to production environment

## Support

If you encounter issues:

1. Check this setup guide
2. Review the main [README.md](README.md)
3. Open an issue on GitHub
4. Check existing discussions

---

**Happy coding! 🚀**