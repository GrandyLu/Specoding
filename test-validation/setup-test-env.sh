#!/bin/bash
# 测试环境初始化脚本

set -e

echo "🚀 Comet CLI 测试环境初始化"
echo "============================"

# 检查 Comet 是否安装
if ! command -v comet &> /dev/null; then
    echo "❌ 错误：Comet 未安装"
    echo "请先安装：npm install -g @rpamis/comet"
    exit 1
fi

echo "✅ Comet 已安装"
comet --version

# 创建必要的目录
echo "📁 创建测试项目目录..."
mkdir -p test-projects
cd test-projects

# 场景 1：完整工作流测试
echo "📦 创建场景 1 测试项目..."
mkdir -p scenario-1-full-workflow
cd scenario-1-full-workflow
git init
cat > package.json << 'EOF'
{
  "name": "user-auth-test",
  "version": "1.0.0",
  "description": "用户认证功能测试项目",
  "main": "index.js",
  "scripts": {
    "test": "echo \"运行测试...\" && exit 0"
  }
}
EOF
git add .
git commit -m "Initial commit"
cd ..

# 场景 2：Hotfix 测试
echo "📦 创建场景 2 测试项目..."
mkdir -p scenario-2-hotfix
cd scenario-2-hotfix
git init
cat > math.js << 'EOF'
function add(a, b) {
  return a - b;  // Bug: 应该是 a + b
}

function subtract(a, b) {
  return a - b;
}

module.exports = { add, subtract };
EOF
cat > package.json << 'EOF'
{
  "name": "hotfix-test",
  "version": "1.0.0",
  "description": "Hotfix 测试项目",
  "main": "math.js"
}
EOF
git add .
git commit -m "Initial commit with bug"
cd ..

# 场景 3：Tweak 测试
echo "📦 创建场景 3 测试项目..."
mkdir -p scenario-3-tweak
cd scenario-3-tweak
git init
cat > README.md << 'EOF'
# My Test Project

This is a test project for tweak scenario.

## Features

- Basic functionality
- Test features
EOF
cat > package.json << 'EOF'
{
  "name": "tweak-test",
  "version": "1.0.0",
  "description": "Tweak 测试项目"
}
EOF
git add .
git commit -m "Initial commit"
cd ..

# 场景 4：断点恢复测试
echo "📦 创建场景 4 测试项目..."
mkdir -p scenario-4-resume
cd scenario-4-resume
git init
cat > package.json << 'EOF'
{
  "name": "resume-test",
  "version": "1.0.0",
  "description": "断点恢复测试项目"
}
EOF
git add .
git commit -m "Initial commit"
cd ..

echo ""
echo "✅ 测试环境初始化完成！"
echo ""
echo "📂 测试项目结构："
ls -la
echo ""
echo "📋 下一步："
echo "1. 阅读 QUICK_START.md 了解快速开始"
echo "2. 选择要测试的场景"
echo "3. 进入对应的测试项目目录"
echo "4. 在 Claude Code 中执行相应的 /comet 命令"
echo ""
echo "示例："
echo "  cd scenario-2-hotfix"
echo "  # 然后在 Claude Code 中执行：/comet-hotfix"
echo ""
echo "🎯 Happy Testing!"
