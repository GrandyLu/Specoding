# 🚀 如何使用 Comet CLI 测试验证套件

## 📝 三步开始测试

### Step 1: 初始化测试环境（1 分钟）

#### Windows 用户
```bash
cd test-validation
setup-test-env.bat
```

#### macOS/Linux 用户
```bash
cd test-validation
chmod +x setup-test-env.sh
./setup-test-env.sh
```

这会创建 4 个测试项目：
- `scenario-1-full-workflow/` - 完整工作流测试
- `scenario-2-hotfix/` - Hotfix 测试
- `scenario-3-tweak/` - Tweak 测试
- `scenario-4-resume/` - 断点恢复测试

### Step 2: 选择测试场景

#### 🟢 快速测试（5 分钟）

**场景 2：Hotfix**

```bash
cd test-projects/scenario-2-hotfix
```

然后在 Claude Code 中执行：

```
/comet-hotfix
修复 math.js 中的加法函数，应该返回 a + b 而不是 a - b
```

**观察点**：
- ✅ 是否跳过 brainstorming
- ✅ 是否快速执行流程
- ✅ 状态是否正确更新

---

#### 🟡 标准测试（15 分钟）

**场景 2 + 场景 3**

先执行场景 2（Hotfix），然后：

```bash
cd ../scenario-3-tweak
```

在 Claude Code 中执行：

```
/comet-tweak
更新 README.md，让描述更详细
```

**观察点**：
- ✅ 是否跳过完整 plan
- ✅ 是否快速执行和归档
- ✅ 升级条件是否检测（修改 5+ 文件）

---

#### 🔴 完整测试（30+ 分钟）

**场景 1：完整工作流**

```bash
cd test-projects/scenario-1-full-workflow
```

在 Claude Code 中执行：

```
/comet-open
创建一个用户认证功能，包括登录接口和 JWT 验证
```

然后依次执行：

```
/comet-design
/comet-build
/comet-verify
/comet-archive
```

**观察点**：
- ✅ 五个阶段是否正确执行
- ✅ 每个阶段决策点是否触发
- ✅ 状态是否自动更新
- ✅ 文件是否正确生成

### Step 3: 记录结果

测试完成后，填写 `TEST_RESULTS.md`：

```markdown
### 场景 2：Hotfix

**结果**：✅ 通过 / ❌ 失败 / ⚠️ 部分通过

**问题**：
1. [如果有问题，描述]
2. [如果有部分通过，描述]

**改进建议**：
1. [如果有建议]
```

## 📋 详细指南

### 阅读顺序

1. **开始前**：阅读 `README.md` - 了解测试套件概况
2. **准备时**：阅读 `QUICK_START.md` - 快速开始指南
3. **执行时**：阅读 `EXECUTION_GUIDE.md` - 详细执行步骤
4. **场景时**：阅读 `scenario-X.md` - 具体场景要求
5. **记录时**：使用 `CHECKLIST.md` - 检查清单
6. **问题时**：使用 `ISSUE_TEMPLATE.md` - 问题报告模板

### 场景选择指南

| 时间充裕 | 学习阶段 | 测试目标 | 推荐场景 |
|---------|---------|---------|---------|
| 5 分钟 | 了解 Comet | 快速验证 | 场景 2 |
| 15 分钟 | 熟悉流程 | 标准验证 | 场景 2 + 3 |
| 30+ 分钟 | 深入理解 | 完整验证 | 场景 1 + 2 + 3 |
| 1+ 小时 | 全面测试 | 系统验证 | 所有场景 |

### 常见使用模式

#### 模式 1：快速验证（日常使用）

每次更新 Comet 后，快速验证基本功能：

```bash
cd test-validation
./setup-test-env.sh          # 重置环境
cd test-projects/scenario-2-hotfix
# 在 Claude Code 中执行 /comet-hotfix
# 观察结果，记录问题
```

#### 模式 2：深度测试（版本发布前）

全面测试所有功能，确保无阻塞性问题：

```bash
cd test-validation
./setup-test-env.sh          # 重置环境
# 按顺序执行所有场景
# 填写 CHECKLIST.md
# 报告所有问题
```

#### 模式 3：问题复现（开发调试）

针对特定问题进行复现和调试：

```bash
cd test-validation
# 创建最小复现项目
# 执行重现步骤
# 记录详细日志
# 使用 ISSUE_TEMPLATE.md 报告
```

## 🎯 观察要点速查

### ✅ 成功标志

1. **Skill 触发**
   - 看到 `[Using skill: xxx]`
   - Skill 内容被加载

2. **状态更新**
   - `.comet.yaml` 自动更新
   - phase 字段正确

3. **Guard 通过**
   - `ALL CHECKS PASSED`
   - 自动进入下一阶段

4. **文件生成**
   - 所有必需文件存在
   - 内容格式正确

### ❌ 失败标志

1. **Skill 未触发**
   - 无触发输出
   - Agent "模拟" 行为

2. **状态不一致**
   - YAML 与实际不符
   - phase 字段错误

3. **Guard 失败**
   - `HARD STOP` 或 `GUARD FAILED`
   - 无法继续

4. **文件错误**
   - 必需文件缺失
   - 格式内容错误

## 🔧 常见问题

### Q: 如何判断 Skill 是否真正被触发？

**A**: 看是否有这样的输出：
```
[Using skill: comet-design to ...]
```

如果没有，说明 Skill 未被真正触发。

### Q: 状态卡住怎么办？

**A**: 检查步骤：
1. 运行 `comet status` 查看当前状态
2. 检查 `.comet.yaml` 内容
3. 查看错误信息中的具体提示

### Q: 如何报告问题？

**A**:
1. 复制 `ISSUE_TEMPLATE.md`
2. 重命名为 `ISSUE-XXX-描述.md`
3. 填写详细信息
4. 保存到 `issues/` 目录

### Q: 测试失败后怎么办？

**A**:
1. 记录详细错误信息
2. 保存日志和截图
3. 使用 ISSUE_TEMPLATE 报告
4. 尝试最小化复现

## 📊 进阶使用

### 自动化测试

可以编写脚本自动化部分测试：

```bash
#!/bin/bash
# 自动化测试脚本示例

# 初始化
./setup-test-env.sh

# 场景 2 测试
cd test-projects/scenario-2-hotfix
# 这里可以添加自动化调用 Comet 的逻辑
# 目前需要手动在 Claude Code 中执行

# 记录结果
echo "场景 2: ❌ 失败" >> ../../TEST_RESULTS.md
```

### 持续集成

可以将测试集成到 CI/CD 流程：

```yaml
# .github/workflows/test-comet.yml
name: Test Comet
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Comet
        run: npm install -g @rpamis/comet
      - name: Setup Test Environment
        run: cd test-validation && ./setup-test-env.sh
      - name: Run Tests
        run: # 这里添加测试逻辑
```

### 性能测试

可以测试 Comet 在大规模项目中的表现：

```bash
# 创建大型测试项目
mkdir large-project && cd large-project
# 生成大量文件...
# 执行 Comet 工作流
# 记录执行时间和资源使用
```

## 📈 测试最佳实践

### 1. 测试隔离

每个场景使用独立的测试项目，避免相互影响。

### 2. 及时记录

发现问题立即记录，不要依赖记忆。

### 3. 最小复现

报告问题时，提供最小化的复现步骤。

### 4. 详细日志

保存完整的执行日志，便于分析。

### 5. 系统化测试

按照场景顺序，系统化地执行测试。

### 6. 定期测试

每次更新后都执行测试，及早发现问题。

## 🎓 学习资源

### 了解 Comet

- [Comet README](../README-zh.md) - 项目介绍
- [Comet SKILL.md](../assets/skills-zh/comet/SKILL.md) - Skill 文档

### 了解 OpenSpec

- [OpenSpec GitHub](https://github.com/Fission-AI/OpenSpec) - 项目仓库

### 了解 Superpowers

- [Superpowers GitHub](https://github.com/obra/superpowers) - 项目仓库

### 了解 CodeGraph

- [CodeGraph 文档](#) - 文档链接

## 🤝 贡献

欢迎贡献：

1. **补充场景** - 添加新的测试场景
2. **改进文档** - 完善测试文档
3. **报告问题** - 提供详细的问题报告
4. **分享经验** - 分享测试经验

## 📞 获取帮助

遇到问题时：

1. 查看 `QUICK_START.md`
2. 查看 `EXECUTION_GUIDE.md`
3. 查看具体场景文档
4. 查看项目 README

---

**准备好了吗？开始测试：**

```bash
cd test-validation
./setup-test-env.sh
cd test-projects/scenario-2-hotfix
# 在 Claude Code 中执行：/comet-hotfix
```

**Happy Testing! 🎯**
