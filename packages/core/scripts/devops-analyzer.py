#!/usr/bin/env python3
"""
DevOps Project Analyzer - Python Version
Rapid analysis tool for any DevOps project
"""

import os
import json
import subprocess
import glob
from pathlib import Path
from datetime import datetime

class DevOpsAnalyzer:
    def __init__(self):
        self.score = 0
        self.max_score = 15
        self.findings = []
        self.warnings = []
        self.recommendations = []

    def check_pass(self, message):
        print(f"✅ {message}")
        self.score += 1

    def check_fail(self, message):
        print(f"❌ {message}")
        self.findings.append(message)

    def check_warn(self, message):
        print(f"⚠️  {message}")
        self.warnings.append(message)

    def analyze_structure(self):
        print("📁 PROJECT STRUCTURE:")
        
        # Check if it's a git repo
        if os.path.exists('.git'):
            self.check_pass("Git repository detected")
        else:
            self.check_fail("No git repository")
        
        # Check essential files
        essential_files = {
            'README.md': 'Documentation',
            '.gitignore': 'Git ignore file',
            'LICENSE': 'License file'
        }
        
        for file, desc in essential_files.items():
            if os.path.exists(file):
                self.check_pass(f"{desc} exists")
            else:
                self.check_warn(f"{desc} missing")

    def analyze_dependencies(self):
        print("\n📦 DEPENDENCIES:")
        
        project_types = {
            'package.json': 'Node.js',
            'requirements.txt': 'Python (pip)',
            'pyproject.toml': 'Python (modern)',
            'Pipfile': 'Python (pipenv)',
            'go.mod': 'Go',
            'Cargo.toml': 'Rust',
            'pom.xml': 'Maven (Java)',
            'build.gradle': 'Gradle',
            'composer.json': 'PHP',
            'Gemfile': 'Ruby'
        }
        
        detected_types = []
        for file, project_type in project_types.items():
            if os.path.exists(file):
                self.check_pass(f"{project_type} project detected")
                detected_types.append(project_type)
        
        if not detected_types:
            self.check_warn("No standard dependency file detected")
        
        # Check for lock files
        lock_files = ['package-lock.json', 'yarn.lock', 'poetry.lock', 'Pipfile.lock']
        if any(os.path.exists(f) for f in lock_files):
            self.check_pass("Dependency lock file present")
        else:
            self.check_warn("No dependency lock file found")

    def analyze_testing(self):
        print("\n🧪 TESTING:")
        
        # Find test files
        test_patterns = ['*test*', '*spec*', 'test_*', '*_test.*']
        test_files = []
        
        for pattern in test_patterns:
            test_files.extend(glob.glob(f'**/{pattern}', recursive=True))
        
        # Remove duplicates and directories
        test_files = [f for f in set(test_files) if os.path.isfile(f)]
        
        if test_files:
            self.check_pass(f"Test files found ({len(test_files)} files)")
        else:
            self.check_fail("No test files detected")
        
        # Check test directories
        test_dirs = ['test', 'tests', '__tests__', 'spec']
        if any(os.path.isdir(d) for d in test_dirs):
            self.check_pass("Test directory exists")
        else:
            self.check_warn("No dedicated test directory")
        
        # Check test configuration files
        test_configs = ['jest.config.js', 'pytest.ini', 'phpunit.xml', 'vitest.config.js']
        if any(os.path.exists(f) for f in test_configs):
            self.check_pass("Test configuration detected")

    def analyze_cicd(self):
        print("\n🔄 CI/CD:")
        
        cicd_configs = {
            '.github/workflows': 'GitHub Actions',
            '.gitlab-ci.yml': 'GitLab CI',
            'Jenkinsfile': 'Jenkins',
            'azure-pipelines.yml': 'Azure Pipelines',
            '.travis.yml': 'Travis CI',
            'circle.yml': 'CircleCI'
        }
        
        found_cicd = False
        for config, name in cicd_configs.items():
            if os.path.exists(config):
                if os.path.isdir(config):
                    workflows = len([f for f in os.listdir(config) if f.endswith(('.yml', '.yaml'))])
                    self.check_pass(f"{name} configured ({workflows} workflows)")
                else:
                    self.check_pass(f"{name} configured")
                found_cicd = True
        
        if not found_cicd:
            self.check_fail("No CI/CD configuration found")

    def analyze_docker(self):
        print("\n🐳 CONTAINERIZATION:")
        
        docker_files = {
            'Dockerfile': 'Dockerfile',
            'docker-compose.yml': 'Docker Compose',
            '.dockerignore': 'Docker ignore'
        }
        
        for file, desc in docker_files.items():
            if os.path.exists(file):
                self.check_pass(f"{desc} present")
            else:
                self.check_warn(f"{desc} missing")

    def analyze_security(self):
        print("\n🔒 SECURITY:")
        
        # Check for security files
        if os.path.exists('.env.example'):
            self.check_pass("Environment template (.env.example) exists")
        else:
            self.check_warn("No .env.example template")
        
        # Check if .env is in repo (bad practice)
        if os.path.exists('.env'):
            self.check_warn(".env file in repository (security risk)")
        else:
            self.check_pass("No .env file in repository")
        
        # Check for SECURITY.md
        if os.path.exists('SECURITY.md'):
            self.check_pass("Security policy documented")

    def count_lines_of_code(self):
        print("\n📊 CODE METRICS:")
        
        code_extensions = ['.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.go', '.rs', '.php', '.rb', '.cs', '.cpp', '.c']
        total_lines = 0
        file_count = 0
        
        for ext in code_extensions:
            files = glob.glob(f'**/*{ext}', recursive=True)
            # Filter out common build/dependency directories
            files = [f for f in files if not any(exclude in f for exclude in ['node_modules', '.git', 'dist', 'build', 'target', 'vendor'])]
            
            for file in files:
                try:
                    with open(file, 'r', encoding='utf-8', errors='ignore') as f:
                        lines = len(f.readlines())
                        total_lines += lines
                        file_count += 1
                except:
                    pass
        
        if total_lines > 0:
            print(f"📈 Total lines of code: {total_lines:,}")
            print(f"📄 Source files analyzed: {file_count}")
        else:
            print("⚠️  No code files detected")

    def generate_recommendations(self):
        print(f"\n📊 HEALTH SCORE: {self.score}/{self.max_score}")
        
        if self.score >= 12:
            print("🟢 EXCELLENT - Outstanding DevOps practices!")
        elif self.score >= 9:
            print("🟡 GOOD - Solid foundation with room for improvement")
        elif self.score >= 6:
            print("🟠 FAIR - Several areas need attention")
        else:
            print("🔴 NEEDS WORK - Critical improvements required")
        
        print("\n🎯 QUICK WINS:")
        if not os.path.exists('README.md'):
            print("• Create comprehensive README.md")
        if not os.path.exists('.gitignore'):
            print("• Add .gitignore file")
        if not glob.glob('**/*test*', recursive=True):
            print("• Implement automated testing")
        if not os.path.exists('Dockerfile'):
            print("• Containerize with Docker")
        if not any(os.path.exists(f) for f in ['.github/workflows', '.gitlab-ci.yml', 'Jenkinsfile']):
            print("• Set up CI/CD pipeline")

    def run_analysis(self):
        print("🚀 DEVOPS PROJECT ANALYZER")
        print("=" * 40)
        print(f"📅 Analysis Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📂 Project Path: {os.getcwd()}")
        print(f"📁 Project Name: {os.path.basename(os.getcwd())}")
        print()
        
        self.analyze_structure()
        self.analyze_dependencies()
        self.analyze_testing()
        self.analyze_cicd()
        self.analyze_docker()
        self.analyze_security()
        self.count_lines_of_code()
        self.generate_recommendations()
        
        print(f"\n✨ Analysis complete! Consider running the full audit script for detailed insights.")

if __name__ == "__main__":
    analyzer = DevOpsAnalyzer()
    analyzer.run_analysis()