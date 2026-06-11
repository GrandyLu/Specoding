@echo off
REM 测试环境初始化脚本 - Windows 版本

echo ============================
echo Comet CLI 测试环境初始化
echo ============================
echo.

REM 检查 Comet 是否安装
where comet >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ 错误：Comet 未安装
    echo 请先安装：npm install -g @rpamis/comet
    pause
    exit /b 1
)

echo ✅ Comet 已安装
comet --version
echo.

REM 创建必要的目录
echo 📁 创建测试项目目录...
if not exist test-projects mkdir test-projects
cd test-projects

REM 场景 1：完整工作流测试
echo 📦 创建场景 1 测试项目...
if not exist scenario-1-full-workflow mkdir scenario-1-full-workflow
cd scenario-1-full-workflow
git init
echo { > package.json
echo   "name": "user-auth-test", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "description": "用户认证功能测试项目", >> package.json
echo   "main": "index.js", >> package.json
echo   "scripts": { >> package.json
echo     "test": "echo \"运行测试...\" ^&^& exit 0" >> package.json
echo   } >> package.json
echo } >> package.json
git add .
git commit -m "Initial commit"
cd ..

REM 场景 2：Hotfix 测试
echo 📦 创建场景 2 测试项目...
if not exist scenario-2-hotfix mkdir scenario-2-hotfix
cd scenario-2-hotfix
git init
echo function add(a, b) { > math.js
echo   return a - b;  // Bug: 应该是 a + b >> math.js
echo } >> math.js
echo. >> math.js
echo function subtract(a, b) { >> math.js
echo   return a - b; >> math.js
echo } >> math.js
echo. >> math.js
echo module.exports = { add, subtract }; >> math.js
echo { > package.json
echo   "name": "hotfix-test", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "description": "Hotfix 测试项目", >> package.json
echo   "main": "math.js" >> package.json
echo } >> package.json
git add .
git commit -m "Initial commit with bug"
cd ..

REM 场景 3：Tweak 测试
echo 📦 创建场景 3 测试项目...
if not exist scenario-3-tweak mkdir scenario-3-tweak
cd scenario-3-tweak
git init
echo # My Test Project > README.md
echo. >> README.md
echo This is a test project for tweak scenario. >> README.md
echo. >> README.md
echo ## Features >> README.md
echo. >> README.md
echo - Basic functionality >> README.md
echo - Test features >> README.md
echo { > package.json
echo   "name": "tweak-test", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "description": "Tweak 测试项目" >> package.json
echo } >> package.json
git add .
git commit -m "Initial commit"
cd ..

REM 场景 4：断点恢复测试
echo 📦 创建场景 4 测试项目...
if not exist scenario-4-resume mkdir scenario-4-resume
cd scenario-4-resume
git init
echo { > package.json
echo   "name": "resume-test", >> package.json
echo   "version": "1.0.0", >> package.json
echo   "description": "断点恢复测试项目" >> package.json
echo } >> package.json
git add .
git commit -m "Initial commit"
cd ..

echo.
echo ✅ 测试环境初始化完成！
echo.
echo 📂 测试项目结构：
dir /B
echo.
echo 📋 下一步：
echo 1. 阅读 QUICK_START.md 了解快速开始
echo 2. 选择要测试的场景
echo 3. 进入对应的测试项目目录
echo 4. 在 Claude Code 中执行相应的 /comet 命令
echo.
echo 示例：
echo   cd scenario-2-hotfix
echo   然后在 Claude Code 中执行：/comet-hotfix
echo.
echo 🎯 Happy Testing!
pause
