#!/bin/bash

# Quality Audit Script pentru toate proiectele DevOps
# Versiunea 1.0 - Octombrie 2025

echo "=================== QUALITY AUDIT - ALL PROJECTS ==================="
echo "Data: $(date)"
echo "Locație: $(pwd)"
echo ""

# Funcții utile
function print_section() {
    echo ""
    echo "============ $1 ============"
}

function count_files() {
    local pattern="$1"
    local description="$2"
    local count=$(find . -name "$pattern" -type f 2>/dev/null | wc -l)
    echo "$description: $count fișiere"
}

function check_file_exists() {
    local file="$1"
    local description="$2"
    if [ -f "$file" ]; then
        echo "✅ $description: Prezent"
    else
        echo "❌ $description: Lipsește"
    fi
}

# 1. STRUCTURA PROIECTULUI
print_section "STRUCTURA FIȘIERE ȘI DIRECTOARE"
echo "Directorul curent: $(pwd)"
echo ""

# Afișare structură cu tree (limitată la 3 niveluri)
if command -v tree >/dev/null 2>&1; then
    tree -L 3 -I 'node_modules|.git|dist|build|target|.next|coverage|.vscode|.idea'
else
    echo "Tree nu este instalat. Folosind find alternativ:"
    find . -type d -not -path '*/node_modules*' -not -path '*/.git*' -not -path '*/dist*' -not -path '*/build*' -not -path '*/target*' | head -20
fi

echo ""

# 2. ANALIZA FIȘIERE ȘI LINII DE COD
print_section "ANALIZA CANTITATIVĂ"

# Numărarea fișierelor după tip
count_files "*.js" "JavaScript"
count_files "*.ts" "TypeScript"
count_files "*.tsx" "React TypeScript"
count_files "*.jsx" "React JavaScript"
count_files "*.py" "Python"
count_files "*.java" "Java"
count_files "*.go" "Go"
count_files "*.rs" "Rust"
count_files "*.php" "PHP"
count_files "*.rb" "Ruby"
count_files "*.cs" "C#"
count_files "*.cpp" "C++"
count_files "*.c" "C"
count_files "*.vue" "Vue.js"
count_files "*.html" "HTML"
count_files "*.css" "CSS"
count_files "*.scss" "SCSS"
count_files "*.sass" "SASS"
count_files "*.less" "LESS"
count_files "*.sql" "SQL"
count_files "*.tf" "Terraform"
count_files "*.yaml" "YAML"
count_files "*.yml" "YAML (yml)"
count_files "*.json" "JSON"
count_files "*.xml" "XML"
count_files "*.md" "Markdown"

echo ""

# Linii de cod totale
echo "📊 LINII DE COD TOTALE:"
if command -v cloc >/dev/null 2>&1; then
    cloc . --exclude-dir=node_modules,.git,dist,build,target,.next,coverage,vendor --quiet
else
    echo "Folosind wc pentru aproximare:"
    total_lines=$(find . -name '*.js' -o -name '*.ts' -o -name '*.tsx' -o -name '*.jsx' -o -name '*.py' -o -name '*.java' -o -name '*.go' -o -name '*.php' -o -name '*.rb' -o -name '*.cs' -o -name '*.cpp' -o -name '*.c' | grep -v node_modules | grep -v .git | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
    echo "Linii aproximative de cod: $total_lines"
fi

echo ""

# 3. VERIFICĂRI CALITATE ȘI CONFIGURATIE
print_section "VERIFICĂRI CALITATE"

# Fișiere de configurare esențiale
check_file_exists "package.json" "package.json (Node.js)"
check_file_exists "composer.json" "composer.json (PHP)"
check_file_exists "requirements.txt" "requirements.txt (Python)"
check_file_exists "Pipfile" "Pipfile (Python)"
check_file_exists "pyproject.toml" "pyproject.toml (Python)"
check_file_exists "Cargo.toml" "Cargo.toml (Rust)"
check_file_exists "go.mod" "go.mod (Go)"
check_file_exists "pom.xml" "pom.xml (Maven)"
check_file_exists "build.gradle" "build.gradle (Gradle)"
check_file_exists "Gemfile" "Gemfile (Ruby)"

echo ""

# Fișiere de configurare DevOps
check_file_exists "Dockerfile" "Dockerfile"
check_file_exists "docker-compose.yml" "docker-compose.yml"
check_file_exists ".github/workflows" "GitHub Actions"
check_file_exists ".gitlab-ci.yml" ".gitlab-ci.yml"
check_file_exists "Jenkinsfile" "Jenkinsfile"
check_file_exists "azure-pipelines.yml" "azure-pipelines.yml"

echo ""

# Fișiere de documentație
check_file_exists "README.md" "README.md"
check_file_exists "CHANGELOG.md" "CHANGELOG.md"
check_file_exists "CONTRIBUTING.md" "CONTRIBUTING.md"
check_file_exists "LICENSE" "LICENSE"
check_file_exists "docs/" "Directorul docs/"

echo ""

# 4. ANALIZA TESTELOR
print_section "ANALIZA TESTELOR"

# Fișiere de test
count_files "*test*" "Fișiere test (generic)"
count_files "*spec*" "Fișiere spec"
count_files "*.test.*" "Fișiere .test."
count_files "*.spec.*" "Fișiere .spec."

# Directoare de test
if [ -d "test" ] || [ -d "tests" ]; then
    echo "✅ Director de teste: Prezent"
else
    echo "❌ Director de teste: Lipsește"
fi

# Configurații de test
check_file_exists "jest.config.js" "Jest config"
check_file_exists "cypress.json" "Cypress config"
check_file_exists "playwright.config.js" "Playwright config"
check_file_exists "vitest.config.js" "Vitest config"
check_file_exists "pytest.ini" "Pytest config"
check_file_exists "phpunit.xml" "PHPUnit config"

echo ""

# 5. VERIFICĂRI SECURITATE
print_section "VERIFICĂRI SECURITATE"

# Fișiere de securitate
check_file_exists ".env.example" ".env.example"
check_file_exists ".gitignore" ".gitignore"
check_file_exists "SECURITY.md" "SECURITY.md"

# Verificare pentru fișiere sensibile (nu ar trebui să existe în repo)
if [ -f ".env" ]; then
    echo "⚠️  .env: Prezent (verifică dacă nu e în .gitignore)"
else
    echo "✅ .env: Nu este în repo (bun)"
fi

# Verificare pentru secrete expuse în fișiere
echo ""
echo "🔍 VERIFICARE SECRETE POTENȚIAL EXPUSE:"
grep -r -i --include="*.js" --include="*.ts" --include="*.py" --include="*.java" --include="*.php" -E "(password|secret|token|api_key|private_key)" . 2>/dev/null | head -5 || echo "Nu s-au găsit secrete evidente"

echo ""

# 6. ANALIZA DEPENDENȚELOR
print_section "ANALIZA DEPENDENȚELOR"

# Node.js dependencies
if [ -f "package.json" ]; then
    echo "📦 DEPENDENȚE NODE.JS:"
    if command -v jq >/dev/null 2>&1; then
        deps=$(cat package.json | jq -r '.dependencies // {} | keys | length')
        dev_deps=$(cat package.json | jq -r '.devDependencies // {} | keys | length')
        echo "Dependencies: $deps"
        echo "DevDependencies: $dev_deps"
    else
        echo "Prezent package.json (instalează jq pentru detalii)"
    fi
fi

# Python dependencies
if [ -f "requirements.txt" ]; then
    echo "📦 DEPENDENȚE PYTHON:"
    wc -l requirements.txt
fi

# Verificare vulnerabilități (dacă sunt disponibile tool-urile)
echo ""
echo "🛡️  VERIFICARE VULNERABILITĂȚI:"
if command -v npm >/dev/null 2>&1 && [ -f "package.json" ]; then
    echo "Rulând npm audit..."
    npm audit --audit-level=high 2>/dev/null || echo "npm audit nu poate fi rulat"
fi

echo ""

# 7. ANALIZA CI/CD
print_section "ANALIZA CI/CD"

# GitHub Actions
if [ -d ".github/workflows" ]; then
    workflow_count=$(find .github/workflows -name "*.yml" -o -name "*.yaml" | wc -l)
    echo "✅ GitHub Actions: $workflow_count workflow-uri"
else
    echo "❌ GitHub Actions: Nu există"
fi

# GitLab CI
if [ -f ".gitlab-ci.yml" ]; then
    echo "✅ GitLab CI: Configurată"
else
    echo "❌ GitLab CI: Nu este configurată"
fi

# Jenkins
if [ -f "Jenkinsfile" ]; then
    echo "✅ Jenkins: Jenkinsfile prezent"
else
    echo "❌ Jenkins: Jenkinsfile lipsește"
fi

echo ""

# 8. SCOR GENERAL DE CALITATE
print_section "SCOR GENERAL DE CALITATE"

score=0
max_score=100

# Documentație (20 puncte)
[ -f "README.md" ] && score=$((score + 10))
[ -f "CHANGELOG.md" ] && score=$((score + 5))
[ -f "CONTRIBUTING.md" ] && score=$((score + 3))
[ -f "LICENSE" ] && score=$((score + 2))

# Configuratie proiect (20 puncte)
[ -f "package.json" ] || [ -f "composer.json" ] || [ -f "requirements.txt" ] || [ -f "go.mod" ] || [ -f "pom.xml" ] || [ -f "Cargo.toml" ] && score=$((score + 10))
[ -f ".gitignore" ] && score=$((score + 5))
[ -f "Dockerfile" ] && score=$((score + 5))

# Teste (25 puncte)
test_files=$(find . -name "*test*" -o -name "*spec*" 2>/dev/null | wc -l)
if [ "$test_files" -gt 0 ]; then
    if [ "$test_files" -gt 10 ]; then
        score=$((score + 25))
    elif [ "$test_files" -gt 5 ]; then
        score=$((score + 15))
    else
        score=$((score + 10))
    fi
fi

# CI/CD (20 puncte)
[ -d ".github/workflows" ] || [ -f ".gitlab-ci.yml" ] || [ -f "Jenkinsfile" ] && score=$((score + 20))

# Securitate (15 puncte)
[ -f ".env.example" ] && score=$((score + 5))
[ -f "SECURITY.md" ] && score=$((score + 5))
[ ! -f ".env" ] && score=$((score + 5))

echo "📊 SCOR FINAL: $score/$max_score puncte"
echo ""

if [ "$score" -ge 80 ]; then
    echo "🟢 CALITATE: EXCELENȚĂ"
elif [ "$score" -ge 60 ]; then
    echo "🟡 CALITATE: BUNĂ"
elif [ "$score" -ge 40 ]; then
    echo "🟠 CALITATE: SATISFĂCĂTOARE"
else
    echo "🔴 CALITATE: NECESITĂ ÎMBUNĂTĂȚIRI"
fi

echo ""

# 9. RECOMANDĂRI
print_section "RECOMANDĂRI PRIORITARE"

echo "🎯 ÎMBUNĂTĂȚIRI RECOMANDATE:"

[ ! -f "README.md" ] && echo "1. Adaugă README.md cu documentație completă"
[ "$test_files" -eq 0 ] && echo "2. Implementează teste unitare și de integrare"
[ ! -f ".gitignore" ] && echo "3. Crează .gitignore pentru a exclude fișierele nedorite"
[ ! -d ".github/workflows" ] && [ ! -f ".gitlab-ci.yml" ] && [ ! -f "Jenkinsfile" ] && echo "4. Configurează CI/CD pipeline"
[ ! -f "Dockerfile" ] && echo "5. Containerizează aplicația cu Docker"
[ ! -f "SECURITY.md" ] && echo "6. Adaugă ghid de securitate"
[ ! -f "CHANGELOG.md" ] && echo "7. Menține un changelog pentru versiuni"

echo ""
echo "🔄 AUTOMATIZĂRI RECOMANDATE:"
echo "- Configurează linting automat (ESLint, Prettier, etc.)"
echo "- Implementează code coverage reporting"
echo "- Adaugă dependency vulnerability scanning"
echo "- Configurează automated deployment"
echo "- Implementează monitoring și alerting"

echo ""
echo "=================== AUDIT COMPLET ==================="
echo "Pentru următorii pași, consultă ghidul de implementare DevOps."
echo "Rulează acest script regulat pentru monitorizarea continuă a calității."