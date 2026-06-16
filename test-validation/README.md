# Comet CLI 功能验证测试套件

本目录包含完整的 Comet 工作流 CLI 功能验证测试套件，用于系统化测试和验证当前工程提供的所有功能。

## 📋 目录结构

```
test-validation/
├── README.md                    # 本文件 - 总体说明
├── QUICK_START.md              # 快速开始指南 - 1分钟启动
├── TEST_PLAN.md                # 测试计划 - 10个场景设计
├── EXECUTION_GUIDE.md          # 执行指南 - 详细步骤和观察要点
├── TEST_RESULTS.md             # 测试结果汇总 - 填写测试结果
├── scenario-1-full-workflow.md # 场景1：完整工作流测试
├── scenario-2-hotfix.md        # 场景2：Hotfix快捷路径
├── scenario-3-tweak.md         # 场景3：Tweak小改动
├── scenario-4-resume.md        # 场景4：断点恢复测试
├── scenario-5-codegraph.md     # 场景5：CodeGraph集成
├── scenario-6-decisions.md    # 场景6：用户决策点测试
├── scenario-7-crossplatform.md # 场景7：跨平台兼容性
├── scenario-8-scripts.md      # 场景8：脚本工具测试
├── scenario-9-multichange.md  # 场景9：多Change并发测试
├── scenario-10-edgecases.md   # 场景10：边界条件测试
└── test-projects/              # 测试项目目录
    ├── scenario-1-full-workflow/
    ├── scenario-2-hotfix/
    ├── scenario-3-tweak/
    └── ...
```

## 🎯 测试目标

验证当前工程（Comet）提供的所有 CLI 功能：

1. **五阶段工作流**
   - Open（开启变更）
   - Design（深度设计）
   - Build（计划与构建）
   - Verify（验证与收尾）
   - Archive（归档）

2. **快捷路径**
   - Hotfix（快速 bug 修复）
   - Tweak（小改动）

3. **状态管理**
   - `.comet.yaml` 状态机
   - 自动状态转换
   - 断点恢复

4. **脚本工具**
   - `comet-guard.sh`
   - `comet-state.sh`
   - `comet-handoff.sh`
   - `comet-archive.sh`
   - `comet-yaml-validate.sh`

5. **CodeGraph 集成**
   - 上下文生成
   - Agent 使用
   - Token 优化

6. **用户交互**
   - 决策点确认
   - AskUserQuestion 工具
   - 防止自动跳过

7. **跨平台兼容性**
   - macOS/Linux
   - Windows Git Bash
   - 脚本兼容性

8. **多 Change 管理**
   - 并发处理
   - 状态隔离
   - 切换逻辑

9. **边界条件**
   - 错误处理
   - 异常恢复
   - 状态损坏

10. **文档质量**
    - 文件完整性
    - 内容准确性
    - 格式规范性

## 🚀 快速开始

### 一分钟启动

```bash
# 进入测试目录
cd test-validation

# 创建测试项目
mkdir -p test-projects
cd test-projects

# 执行快速测试（Hotfix）
mkdir hotfix-test && cd hotfix-test
git init

# 创建有 bug 的文件
echo 'function add(a, b) { return a - b; }' > math.js

# 在 Claude Code 中执行
# /comet-hotfix
# 提示：修复 math.js 中的加法函数
```

详细步骤见 [QUICK_START.md](QUICK_START.md)

## 📖 测试场景

### 场景 1：完整工作流测试

**目的**：验证五阶段完整流程

**流程**：Open → Design → Build → Verify → Archive

**验证点**：
- ✅ 所有阶段正确执行
- ✅ 状态自动转换
- ✅ 文件正确生成
- ✅ Guard 检查通过

详见：[scenario-1-full-workflow.md](scenario-1-full-workflow.md)

### 场景 2：Hotfix 快捷路径

**目的**：验证快速 bug 修复流程

**流程**：Open → Build → Verify → Archive（跳过 Design）

**验证点**：
- ✅ 跳过 brainstorming
- ✅ 单文件修改保持 hotfix
- ✅ 多文件触发升级检测

### 场景 3：Tweak 小改动

**目的**：验证小改动快速流程

**流程**：Open → 轻量 Build → 轻量 Verify → Archive

**验证点**：
- ✅ 跳过完整 Design Doc
- ✅ 跳过完整 Plan
- ✅ 快速执行和归档

### 场景 4：断点恢复

**目的**：验证长任务中断恢复

**验证点**：
- ✅ 自动检测当前阶段
- ✅ 正确恢复上下文
- ✅ 状态机一致性

### 场景 5：CodeGraph 集成

**目的**：验证 CodeGraph 上下文生成和使用

**验证点**：
- ✅ 上下文文件生成
- ✅ Agent 正确引用
- ✅ Token 使用优化

### 场景 6：用户决策点

**目的**：验证必需的用户确认点

**验证点**：
- ✅ 使用 AskUserQuestion 工具
- ✅ 不得自动跳过
- ✅ 用户选择正确写入状态

### 场景 7：跨平台兼容性

**目的**：验证脚本跨平台兼容

**验证点**：
- ✅ macOS/Linux 运行
- ✅ Windows Git Bash 运行
- ✅ 无 GNU/BSD 兼容性问题

### 场景 8：脚本工具

**目的**：验证各脚本功能正确性

**验证点**：
- ✅ guard 验证
- ✅ state 操作
- ✅ handoff 生成
- ✅ archive 步骤
- ✅ yaml 校验

### 场景 9：多 Change 并发

**目的**：验证多个 change 同时处理

**验证点**：
- ✅ 多 change 列出
- ✅ 正确选择切换
- ✅ 状态隔离

### 场景 10：边界条件

**目的**：测试异常情况处理

**验证点**：
- ✅ 构建失败处理
- ✅ 验证不通过处理
- ✅ 状态损坏恢复
- ✅ 文件缺失处理

## 📊 测试结果

当前测试状态：🤔 **待执行**

详细结果见：[TEST_RESULTS.md](TEST_RESULTS.md)

## 🔍 观察要点

### 成功标志 ✅

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

### 失败标志 ❌

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

## 📝 问题记录

测试中发现的问题应记录在 `TEST_RESULTS.md` 中，包括：

1. **问题描述**
2. **重现步骤**
3. **期望行为**
4. **实际行为**
5. **严重程度**
6. **修复建议**

## 🛠️ 测试工具

### 手动测试

使用 Claude Code 交互式执行：

```
/comet
/comet-open
/comet-design
/comet-build
/comet-verify
/comet-archive
/comet-hotfix
/comet-tweak
```

### 脚本测试

使用提供的脚本工具：

```bash
# 检查状态
comet status

# 诊断健康
comet doctor

# 验证 YAML
comet-yaml-validate.sh openspec/changes/<name>/.comet.yaml

# 检查 guard
comet-guard.sh <name> <phase>

# 状态操作
comet-state.sh get <name> <field>
comet-state.sh set <name> <field> <value>
```

## 📈 测试覆盖率

目标覆盖率：

- **功能覆盖率**：100%（所有核心功能）
- **场景覆盖率**：100%（所有 10 个场景）
- **平台覆盖率**：主要平台（macOS、Linux、Windows Git Bash）
- **边界覆盖率**：已知边界条件

## 🤝 贡献

欢迎贡献：

1. **补充测试场景**
2. **完善测试用例**
3. **报告问题**
4. **提出建议**
5. **改进文档**

## 📚 参考资料

- [Comet README](../README-zh.md)
- [Comet SKILL.md](../assets/skills-zh/comet/SKILL.md)
- [OpenSpec 文档](https://github.com/Fission-AI/OpenSpec)
- [Superpowers 文档](https://github.com/obra/superpowers)

## 🎯 预期问题

基于工具分析，预期可能发现的问题：

1. **脚本兼容性**：GNU/BSD 工具差异
2. **状态同步**：.comet.yaml 与文件状态不一致
3. **Skill 触发**：Agent 未真正触发 Skill
4. **决策跳过**：用户确认被自动跳过
5. **CodeGraph 集成**：上下文生成或使用不当
6. **升级条件**：hotfix/tweak 未正确升级
7. **断点恢复**：状态检测不准确
8. **跨平台路径**：Windows 路径处理问题

## 📌 注意事项

1. **环境准备**
   - 确保 Comet 已安装
   - 确保 Git 已配置
   - 确保有足够的磁盘空间

2. **测试隔离**
   - 每个场景使用独立项目
   - 避免场景间相互影响
   - 测试完成后可清理

3. **时间规划**
   - 快速测试：5 分钟
   - 标准测试：15 分钟
   - 完整测试：30+ 分钟

4. **问题跟踪**
   - 及时记录问题
   - 保留重现步骤
   - 收集错误日志

## 🏆 测试标准

### 通过标准

场景测试通过需满足：

1. **核心功能正常**
   - 所有阶段正确执行
   - 状态正确更新
   - 文件正确生成

2. **无阻塞性问题**
   - 无高严重程度问题
   - 中严重程度问题 ≤ 1

3. **用户体验良好**
   - 决策点正确触发
   - 提示信息清晰
   - 错误信息可操作

### 优秀标准

达到优秀需额外满足：

1. **零问题**
   - 无任何问题
   - 或仅低严重程度问题

2. **跨平台兼容**
   - 所有平台测试通过
   - 无兼容性问题

3. **文档完善**
   - 生成文档质量高
   - 格式规范统一

## 📞 获取帮助

遇到问题时：

1. 查看 [EXECUTION_GUIDE.md](EXECUTION_GUIDE.md)
2. 查看 [QUICK_START.md](QUICK_START.md)
3. 查看具体场景文档
4. 查看 Comet README

---

**开始测试前，请先阅读 [QUICK_START.md](QUICK_START.md)**

**Happy Testing! 🎯**
