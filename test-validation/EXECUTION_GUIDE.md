# 测试执行指南

## 快速开始

### 前置条件

1. **安装 Comet**
```bash
npm install -g @rpamis/comet
```

2. **验证安装**
```bash
comet --version
comet doctor
```

3. **准备测试环境**
```bash
cd test-validation
mkdir test-projects
cd test-projects
```

### 测试执行流程

#### 方法 1：手动逐步执行（推荐）

适合深入理解每个阶段的执行情况。

**步骤**：
1. 阅读 `scenario-X.md` 了解场景要求
2. 创建独立的测试项目
3. 在 Claude Code 中逐步执行命令
4. 观察并记录每个阶段的行为
5. 填写测试结果

**优点**：
- 可以详细观察每个步骤
- 容易定位问题
- 适合调试

#### 方法 2：自动化批量执行

适合快速验证整体功能。

**步骤**：
1. 准备测试脚本
2. 批量执行场景
3. 收集日志和结果
4. 分析问题

**优点**：
- 快速
- 可重复
- 适合回归测试

## 具体执行步骤

### 场景 1：完整工作流

```bash
# 1. 创建测试项目
mkdir -p test-projects/scenario-1-full-workflow
cd test-projects/scenario-1-full-workflow
git init

# 2. 在 Claude Code 中执行
# /comet-open
# 提示：创建一个用户认证功能

# 3. 观察并记录
# - 是否正确生成文件
# - .comet.yaml 状态是否正确
# - guard 是否通过

# 4. 继续执行各阶段
# /comet-design
# /comet-build
# /comet-verify
# /comet-archive
```

### 场景 2：Hotfix 快捷路径

```bash
# 1. 创建测试项目
mkdir -p test-projects/scenario-2-hotfix
cd test-projects/scenario-2-hotfix
git init

# 2. 创建一个有 bug 的文件
echo "function add(a, b) { return a - b; }" > math.js

# 3. 在 Claude Code 中执行
# /comet-hotfix
# 提示：修复 math.js 中的加法错误

# 4. 观察是否跳过 brainstorming
# 5. 验证单文件修改保持 hotfix 模式
```

### 场景 3：Tweak 小改动

```bash
# 1. 创建测试项目
mkdir -p test-projects/scenario-3-tweak
cd test-projects/scenario-3-tweak
git init

# 2. 在 Claude Code 中执行
# /comet-tweak
# 提示：更新 README 中的描述文案

# 3. 观察是否跳过完整 plan
# 4. 验证轻量级执行
```

### 场景 4：断点恢复

```bash
# 1. 开始一个 change
# /comet-open
# 提示：创建一个日志功能

# 2. 执行到 design 阶段后"中断"
# 模拟：关闭 Claude Code

# 3. 重新打开 Claude Code
# 执行 /comet

# 4. 观察是否自动恢复到 design 阶段
```

### 场景 5：CodeGraph 集成

```bash
# 1. 确保项目有足够的代码
# 2. 执行 /comet-open
# 3. 观察是否生成 CodeGraph 上下文
# 4. 检查 $COMET_CODEGRAPH_CONTEXT_FILE
# 5. 验证 agent 是否使用该文件
```

### 场景 6：用户决策点

```bash
# 1. 执行 /comet-build
# 2. 观察是否在决策点暂停
# 3. 检查是否使用 AskUserQuestion 工具
# 4. 验证不得自动跳过
```

## 观察要点

### 通用观察点

1. **Skill 触发**
   - ✅ Skill 是否真正被触发（有 Skill 触发打印）
   - ❌ Agent 仅"模拟" Skill 行为（无打印）

2. **状态更新**
   - ✅ .comet.yaml 自动更新
   - ❌ 手动编辑状态

3. **Guard 检查**
   - ✅ Guard 通过后自动转换
   - ❌ Guard 失败但仍继续

4. **用户决策**
   - ✅ 使用 AskUserQuestion 工具
   - ❌ 仅文字提示后自动继续

### 各阶段特定观察点

#### Open 阶段
- 文件结构完整性
- .openspec.yaml 和 .comet.yaml 解耦
- proposal/design/tasks 质量

#### Design 阶段
- brainstorming 必须执行
- Design Doc 生成
- handoff 文件生成

#### Build 阶段
- plan-ready 暂停
- build_mode/isolation 选择
- Plan 关联 change
- tasks.md 实时更新
- 每个 task 的 commit

#### Verify 阶段
- 验证模式选择
- 验证报告生成
- branch 处理完成

#### Archive 阶段
- delta spec 同步
- 文件移动
- 状态标注

## 问题分类

### 严重程度

- **高**: 阻塞核心功能，无法继续
- **中**: 功能部分可用，但有明显缺陷
- **低**: 小问题，不影响核心功能

### 问题类型

1. **脚本兼容性问题**
   - GNU/BSD 工具差异
   - 路径处理问题
   - 权限问题

2. **状态管理问题**
   - 状态不一致
   - 状态损坏
   - 状态恢复失败

3. **Skill 触发问题**
   - 未真正触发
   - 触发时机错误
   - 参数传递错误

4. **用户交互问题**
   - 决策点跳过
   - 工具使用不当
   - 提示不清晰

5. **文档问题**
   - 文件缺失
   - 内容不完整
   - 格式错误

6. **CodeGraph 问题**
   - 上下文生成失败
   - agent 未使用
   - 信息不足

## 问题记录模板

```markdown
### 问题 X：[简短描述]

**场景**：场景 X
**阶段**：[阶段名称]
**严重程度**：高/中/低
**状态**：待修复/修复中/已验证

**重现步骤**：
1.
2.
3.

**期望行为**：
-

**实际行为**：
-

**错误信息**：
```
[错误日志]
```

**根因分析**：
-

**修复方案**：
-

**验证步骤**：
1.
2.
3.

**相关文件**：
-
```

## 测试结果汇总

测试完成后，填写 `TEST_RESULTS.md`：

```markdown
# 测试结果汇总

## 执行概况

**测试日期**：
**执行人**：
**Comet 版本**：

## 场景结果

| 场景 | 结果 | 问题数 | 备注 |
|-----|------|-------|------|
| 场景 1：完整工作流 | ✅/❌/⚠️ | 0 | |
| 场景 2：Hotfix | ✅/❌/⚠️ | 0 | |
| 场景 3：Tweak | ✅/❌/⚠️ | 0 | |
| 场景 4：断点恢复 | ✅/❌/⚠️ | 0 | |
| 场景 5：CodeGraph | ✅/❌/⚠️ | 0 | |
| 场景 6：用户决策点 | ✅/❌/⚠️ | 0 | |
| 场景 7：跨平台 | ✅/❌/⚠️ | 0 | |
| 场景 8：脚本工具 | ✅/❌/⚠️ | 0 | |
| 场景 9：多 Change | ✅/❌/⚠️ | 0 | |
| 场景 10：边界条件 | ✅/❌/⚠️ | 0 | |

## 问题统计

**总计**：0 个问题
- 高严重程度：0
- 中严重程度：0
- 低严重程度：0

**问题类型分布**：
- 脚本兼容性：0
- 状态管理：0
- Skill 触发：0
- 用户交互：0
- 文档：0
- CodeGraph：0

## 关键发现

1.
2.
3.

## 改进建议

1.
2.
3.

## 下一步

-
```

## 持续改进

根据测试结果：
1. 更新测试场景
2. 增加新的测试用例
3. 完善问题记录
4. 优化测试流程
