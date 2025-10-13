#!/bin/bash

# Quick DevOps Health Check - Rapid Audit
# Pentru verificări rapide în orice proiect DevOps

echo "🚀 QUICK DEVOPS HEALTH CHECK"
echo "=========================="
echo "Timestamp: $(date)"
echo "Project: $(basename $(pwd))"
echo ""

# Functii helper
health_score=0
max_checks=10

check_pass() {
    echo "✅ $1"
    health_score=$((health_score + 1))
}

check_fail() {
    echo "❌ $1"
}

check_warn() {
    echo "⚠️  $1"
}

# 1. Git Health
echo "🔍 GIT HEALTH:"
if [ -d ".git" ]; then
    check_pass "Git repository initialized"
    
    # Check for uncommitted changes
    if git diff --quiet && git diff --staged --quiet; then
        check_pass "Working directory clean"
    else
        check_warn "Uncommitted changes present"
    fi
    
    # Check gitignore
    if [ -f ".gitignore" ]; then
        check_pass ".gitignore present"
    else
        check_fail ".gitignore missing"
    fi
else
    check_fail "Not a git repository"
fi

echo ""

# 2. Documentation Quick Check
echo "📚 DOCUMENTATION:"
[ -f "README.md" ] && check_pass "README.md exists" || check_fail "README.md missing"
[ -f "CHANGELOG.md" ] && check_pass "CHANGELOG.md exists" || check_warn "CHANGELOG.md missing"

echo ""

# 3. Dependencies & Package Management
echo "📦 DEPENDENCIES:"
if [ -f "package.json" ]; then
    check_pass "Node.js project detected (package.json)"
    # Check for lockfile
    [ -f "package-lock.json" ] || [ -f "yarn.lock" ] && check_pass "Lock file present" || check_warn "No lock file found"
elif [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
    check_pass "Python project detected"
elif [ -f "go.mod" ]; then
    check_pass "Go project detected (go.mod)"
elif [ -f "Cargo.toml" ]; then
    check_pass "Rust project detected (Cargo.toml)"
elif [ -f "pom.xml" ]; then
    check_pass "Maven project detected (pom.xml)"
else
    check_warn "No standard dependency file detected"
fi

echo ""

# 4. Tests Quick Check
echo "🧪 TESTING:"
test_files=$(find . -name "*test*" -o -name "*spec*" -type f 2>/dev/null | wc -l)
if [ $test_files -gt 0 ]; then
    check_pass "Test files found ($test_files files)"
else
    check_fail "No test files found"
fi

# Common test directories
[ -d "test" ] || [ -d "tests" ] || [ -d "__tests__" ] && check_pass "Test directory exists" || check_warn "No test directory"

echo ""

# 5. CI/CD Quick Check
echo "🔄 CI/CD:"
if [ -d ".github/workflows" ]; then
    workflow_count=$(ls .github/workflows/*.yml .github/workflows/*.yaml 2>/dev/null | wc -l)
    check_pass "GitHub Actions ($workflow_count workflows)"
elif [ -f ".gitlab-ci.yml" ]; then
    check_pass "GitLab CI configured"
elif [ -f "Jenkinsfile" ]; then
    check_pass "Jenkins pipeline configured"
elif [ -f "azure-pipelines.yml" ]; then
    check_pass "Azure Pipelines configured"
else
    check_fail "No CI/CD configuration found"
fi

echo ""

# 6. Docker Check
echo "🐳 CONTAINERIZATION:"
[ -f "Dockerfile" ] && check_pass "Dockerfile present" || check_warn "No Dockerfile"
[ -f "docker-compose.yml" ] && check_pass "Docker Compose configured" || check_warn "No docker-compose.yml"
[ -f ".dockerignore" ] && check_pass ".dockerignore present" || check_warn "No .dockerignore"

echo ""

# 7. Security Basics
echo "🔒 SECURITY BASICS:"
[ -f ".env.example" ] && check_pass ".env.example template exists" || check_warn "No .env.example"
if [ -f ".env" ]; then
    check_warn ".env file in repository (check .gitignore)"
else
    check_pass "No .env in repository"
fi

# Quick secret scan in common files
echo "🔍 Quick secret scan..."
secret_count=$(grep -r -i -E "(password|secret|token|api_key).*=" . --include="*.js" --include="*.ts" --include="*.py" --include="*.json" 2>/dev/null | grep -v node_modules | wc -l)
if [ $secret_count -gt 0 ]; then
    check_warn "Potential secrets found in code ($secret_count occurrences)"
else
    check_pass "No obvious secrets in code"
fi

echo ""

# 8. Final Health Score
echo "📊 HEALTH SCORE: $health_score/$max_checks"
echo ""

if [ $health_score -ge 8 ]; then
    echo "🟢 EXCELLENT HEALTH - Keep up the great work!"
elif [ $health_score -ge 6 ]; then
    echo "🟡 GOOD HEALTH - Minor improvements needed"
elif [ $health_score -ge 4 ]; then
    echo "🟠 FAIR HEALTH - Several areas need attention"
else
    echo "🔴 POOR HEALTH - Significant improvements required"
fi

echo ""
echo "⚡ QUICK FIXES:"
[ ! -f "README.md" ] && echo "- Create README.md with project description"
[ ! -f ".gitignore" ] && echo "- Add .gitignore file"
[ $test_files -eq 0 ] && echo "- Add unit tests"
[ ! -f "Dockerfile" ] && echo "- Consider containerizing with Docker"
[ ! -d ".github/workflows" ] && [ ! -f ".gitlab-ci.yml" ] && echo "- Set up CI/CD pipeline"

echo ""
echo "🚀 Run complete! Use the main audit script for detailed analysis."