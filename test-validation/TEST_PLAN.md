# Comet CLI 功能验证测试计划

## 测试目标

验证当前工程提供的 Comet 工作流 CLI 功能，包括：
- 五阶段工作流（open → design → build → verify → archive）
- 快捷路径（hotfix、tweak）
- 状态管理和脚本工具
- CodeGraph 集成
- 跨平台兼容性

## 测试场景设计

### 场景 1：完整工作流测试（Full Workflow）

**需求**：创建一个简单的用户认证功能
- 新增用户登录接口
- 实现基本的 JWT 验证
- 添加单元测试

**预期流程**：
1. `/comet-open` - 创建 proposal.md、design.md、tasks.md
2. `/comet-design` - 生成 Design Doc、delta spec
3. `/comet-build` - 创建实现计划、执行代码提交
4. `/comet-verify` - 验证实现、生成报告
5. `/comet-archive` - 归档 change、同步 specs

**验证点**：
- ✅ 状态自动转换（.comet.yaml）
- ✅ brainstorming 必须执行
- ✅ Design Doc 与 Plan 关联正确
- ✅ 每个阶段 guard 检查通过
- ✅ 归档后文件移动正确

### 场景 2：Hotfix 快捷路径测试

**需求**：修复一个简单的 bug
- 修正某个函数的返回值错误
- 不涉及架构变更
- 单文件修改

**预期流程**：
1. `/comet-hotfix` - 跳过 brainstorming
2. 快速 open → build → verify → archive
3. 验证升级条件（如涉及 3+ 文件应升级到 full）

**验证点**：
- ✅ 跳过 brainstorming
- ✅ 单文件修改保持 hotfix 模式
- ✅ 多文件修改触发升级检测
- ✅ 状态机正确处理

### 场景 3：Tweak 小改动测试

**需求**：文案调整
- 修改错误提示信息
- 更新配置文件默认值
- 文档优化

**预期流程**：
1. `/comet-tweak` - 跳过 brainstorming 和完整 plan
2. 轻量级构建和验证

**验证点**：
- ✅ 跳过完整 Design Doc
- ✅ 快速执行和归档
- ✅ 升级条件检测（5+ 文件触发 full）

### 场景 4：断点恢复测试

**需求**：模拟长任务中断
- 执行到 design 阶段后"中断"
- 重新执行 `/comet`
- 验证自动恢复到正确阶段

**验证点**：
- ✅ 自动检测当前阶段
- ✅ 正确恢复上下文
- ✅ 状态机一致性

### 场景 5：CodeGraph 集成测试

**需求**：验证 CodeGraph 上下文生成
- 在各阶段调用 CodeGraph
- 验证生成的上下文文件
- 检查 agent 是否正确使用

**验证点**：
- ✅ CodeGraph 上下文生成
- ✅ agent 正确引用上下文
- ✅ 减少 token 使用

### 场景 6：用户决策点测试

**需求**：验证必需的用户确认点
- brainstorming 确认
- build 模式选择
- verify 失败处理
- branch 处理选择

**验证点**：
- ✅ 使用 AskUserQuestion 工具
- ✅ 不得自动跳过决策点
- ✅ 用户选择正确写入状态

### 场景 7：跨平台兼容性测试

**需求**：验证脚本跨平台
- macOS/Linux 测试
- Windows Git Bash 测试
- sha256sum/shasum 兼容性
- sed 替代为 awk

**验证点**：
- ✅ 脚本在多平台运行
- ✅ 无 GNU/BSD 兼容性问题
- ✅ 路径处理正确

### 场景 8：脚本工具测试

**需求**：验证各脚本功能
- `comet-guard.sh` - 阶段转换守护
- `comet-state.sh` - 状态管理
- `comet-handoff.sh` - 设计交接
- `comet-archive.sh` - 一键归档
- `comet-yaml-validate.sh` - 模式校验

**验证点**：
- ✅ guard 验证正确
- ✅ state 操作可靠
- ✅ handoff 生成正确
- ✅ archive 步骤完整
- ✅ yaml 校验准确

### 场景 9：并发和多 Change 测试

**需求**：多个 change 同时进行
- 创建多个 active changes
- 验证 `/comet` 正确识别
- 验证切换逻辑

**验证点**：
- ✅ 多 change 列出
- ✅ 正确选择 change
- ✅ 状态隔离

### 场景 10：边界条件测试

**需求**：测试异常情况
- build 失败处理
- verify 不通过处理
- 状态损坏恢复
- 文件缺失处理

**验证点**：
- ✅ 错误信息清晰
- ✅ 可操作建议
- ✅ 状态可恢复

## 测试执行计划

### 阶段 1：基础功能验证（场景 1-3）
- 完整工作流
- Hotfix 和 Tweak

### 阶段 2：高级功能验证（场景 4-6）
- 断点恢复
- CodeGraph 集成
- 用户决策点

### 阶段 3：稳定性验证（场景 7-10）
- 跨平台兼容性
- 脚本工具
- 多 change
- 边界条件

## 预期发现的问题

1. **脚本兼容性问题**：GNU/BSD 工具差异
2. **状态同步问题**：.comet.yaml 与文件状态不一致
3. **Skill 触发问题**：Agent 未真正触发 Skill
4. **决策点跳过**：用户确认被自动跳过
5. **CodeGraph 集成**：上下文生成或使用不当
6. **升级条件**：hotfix/tweak 未正确升级
7. **断点恢复**：状态检测不准确
8. **跨平台路径**：Windows 路径处理问题

## 测试记录模板

### 场景 X：[场景名称]

**执行日期**：YYYY-MM-DD
**执行人**：
**结果**：✅ 通过 / ❌ 失败 / ⚠️ 部分通过

**问题记录**：
1. 问题描述
2. 重现步骤
3. 期望行为
4. 实际行为
5. 严重程度：高/中/低

**改进建议**：
1. 改进点
2. 建议方案

## 下一步

开始执行场景 1：完整工作流测试
