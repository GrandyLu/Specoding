# Comet CLI 测试检查清单

## 测试前准备

### 环境检查

- [ ] Comet 已安装（`comet --version`）
- [ ] Node.js 版本正确（20+）
- [ ] Git 已配置
- [ ] 测试项目已创建（运行 `setup-test-env.sh` 或 `setup-test-env.bat`）
- [ ] 阅读完 QUICK_START.md

### 理解测试目标

- [ ] 理解 Comet 五阶段工作流
- [ ] 理解快捷路径（hotfix/tweak）
- [ ] 理解状态机机制
- [ ] 理解 CodeGraph 集成
- [ ] 理解用户决策点

## 场景测试检查清单

### 场景 1：完整工作流

#### Open 阶段
- [ ] `/comet-open` 正确调用
- [ ] proposal.md 生成且内容正确
- [ ] design.md 生成且内容正确
- [ ] tasks.md 生成且内容正确
- [ ] .comet.yaml 创建且 phase=open
- [ ] .openspec.yaml 创建
- [ ] Skill 触发输出可见

#### Design 阶段
- [ ] `/comet-design` 正确调用
- [ ] brainstorming skill 被触发
- [ ] brainstorming 确认决策点触发
- [ ] Design Doc 生成
- [ ] delta spec 生成
- [ ] handoff 文件生成
- [ ] guard 检查通过
- [ ] phase 更新为 design

#### Build 阶段
- [ ] `/comet-build` 正确调用
- [ ] plan-ready 暂停触发
- [ ] build_mode 选择触发
- [ ] isolation 选择触发
- [ ] Plan 生成且关联 change
- [ ] 代码实现正确
- [ ] 每个 task 执行后 git commit
- [ ] tasks.md 实时更新勾选
- [ ] guard 检查通过
- [ ] phase 更新为 build

#### Verify 阶段
- [ ] `/comet-verify` 正确调用
- [ ] 验证模式选择触发
- [ ] 测试用例执行
- [ ] 验证报告生成
- [ ] branch 处理完成
- [ ] guard 检查通过
- [ ] verify_result=pass

#### Archive 阶段
- [ ] `/comet-archive` 正确调用
- [ ] delta spec 同步到 main spec
- [ ] change 移动到 archive
- [ ] design doc 标注 archived-with
- [ ] plan 标注 archived-with
- [ ] .comet.yaml archived=true
- [ ] guard 检查通过

### 场景 2：Hotfix

- [ ] `/comet-hotfix` 正确调用
- [ ] 跳过 brainstorming
- [ ] 快速执行流程
- [ ] 单文件修改保持 hotfix 模式
- [ ] 多文件修改触发升级检测
- [ ] 状态正确更新

### 场景 3：Tweak

- [ ] `/comet-tweak` 正确调用
- [ ] 跳过 brainstorming
- [ ] 跳过完整 Design Doc
- [ ] 跳过完整 Plan
- [ ] 快速执行和归档
- [ ] 升级条件检测工作（5+ 文件）

### 场景 4：断点恢复

- [ ] 开始 change 并执行到某阶段
- [ ] "中断"当前会话
- [ ] 重新执行 `/comet`
- [ ] 自动检测当前阶段
- [ ] 正确恢复上下文
- [ ] 状态机一致

### 场景 5：CodeGraph 集成

- [ ] CodeGraph 上下文文件生成
- [ ] 文件路径正确
- [ ] Agent 正确引用
- [ ] Token 使用优化
- [ ] 上下文信息充分

### 场景 6：用户决策点

- [ ] brainstorming 确认使用 AskUserQuestion
- [ ] plan-ready 暂停使用 AskUserQuestion
- [ ] build_mode 选择使用 AskUserQuestion
- [ ] isolation 选择使用 AskUserQuestion
- [ ] verify 失败处理使用 AskUserQuestion
- [ ] branch 处理选择使用 AskUserQuestion
- [ ] 不得自动跳过决策点
- [ ] 用户选择正确写入状态

### 场景 7：跨平台兼容性

#### macOS/Linux
- [ ] 脚本正确运行
- [ ] 路径处理正确
- [ ] 无 GNU 依赖问题

#### Windows Git Bash
- [ ] 脚本正确运行
- [ ] 路径处理正确
- [ ] 无 BSD 兼容性问题

#### 通用兼容性
- [ ] sha256sum/shasum 兼容
- [ ] awk 替代 sed -i
- [ ] pipefail 处理

### 场景 8：脚本工具

#### comet-guard.sh
- [ ] 阶段转换验证正确
- [ ] 失败时输出 HARD STOP
- [ ] --apply 自动更新状态
- [ ] 错误信息可操作

#### comet-state.sh
- [ ] init/set/get/check 正常
- [ ] transition 正常
- [ ] scale 正常
- [ ] 状态更新可靠

#### comet-handoff.sh
- [ ] handoff 文件生成
- [ ] SHA256 正确计算
- [ ] 上下文完整
- [ ] 格式正确

#### comet-archive.sh
- [ ] 验证状态
- [ ] 同步 specs
- [ ] 移动到 archive
- [ ] 标注文档
- [ ] --dry-run 工作

#### comet-yaml-validate.sh
- [ ] 模式校验正确
- [ ] 必填字段检查
- [ ] 枚举值检查
- [ ] 路径存在检查
- [ ] 未知字段检测

### 场景 9：多 Change 并发

- [ ] 创建多个 active changes
- [ ] `/comet` 正确列出
- [ ] 选择逻辑正确
- [ ] 切换机制工作
- [ ] 状态隔离正确

### 场景 10：边界条件

#### 构建失败
- [ ] 错误信息清晰
- [ ] 可操作建议
- [ ] 状态不损坏
- [ ] 可重新执行

#### 验证不通过
- [ ] verify_result=fail
- [ ] 决策点触发
- [ ] 可选择修复或接受
- [ ] 修复流程正确

#### 状态损坏
- [ ] 检测机制工作
- [ ] 恢复流程清晰
- [ ] 可手动修正
- [ ] 修正后可继续

#### 文件缺失
- [ ] 检测机制工作
- [ ] 错误信息明确
- [ ] 可操作建议
- [ ] 可重新生成

## 通用检查项

### Skill 触发
- [ ] 所有 Skill 调用有触发输出
- [ ] 无"模拟" Skill 行为
- [ ] Skill 参数正确传递
- [ ] Skill 内容正确加载

### 状态管理
- [ ] .comet.yaml 自动更新
- [ ] .openspec.yaml 自动更新
- [ ] phase 字段正确
- [ ] 状态转换正确
- [ ] 无状态不一致

### Guard 检查
- [ ] 每个阶段 guard 通过
- [ ] 失败时有明确错误
- [ ] 失败时不继续
- [ ] --apply 正确工作

### 文件生成
- [ ] 所有必需文件存在
- [ ] 文件格式正确
- [ ] 内容完整准确
- [ ] 路径正确

### 用户交互
- [ ] 决策点不跳过
- [ ] 使用 AskUserQuestion
- [ ] 提示信息清晰
- [ ] 错误信息可操作

### 错误处理
- [ ] 错误信息清晰
- [ ] 有可操作建议
- [ ] 不损坏状态
- [ ] 可恢复

## 问题严重程度判断

### 高严重程度
- 阻塞核心功能
- 无法继续流程
- 状态损坏无法恢复
- 数据丢失风险

### 中严重程度
- 功能部分可用
- 有明显缺陷
- 需要手动干预
- 影响用户体验

### 低严重程度
- 小问题
- 不影响核心功能
- 文案或格式问题
- 可临时绕过

## 测试完成标准

### 通过
- [ ] 所有核心检查项通过
- [ ] 无高严重程度问题
- [ ] 中严重程度问题 ≤ 1

### 优秀
- [ ] 所有检查项通过
- [ ] 无任何问题
- [ ] 或仅低严重程度问题

## 测试记录

### 测试环境
- 日期：__________
- 测试人：__________
- OS：__________
- Node.js：__________
- Comet 版本：__________

### 测试结果
- 场景 1：✅/❌/⚠️
- 场景 2：✅/❌/⚠️
- 场景 3：✅/❌/⚠️
- 场景 4：✅/❌/⚠️
- 场景 5：✅/❌/⚠️
- 场景 6：✅/❌/⚠️
- 场景 7：✅/❌/⚠️
- 场景 8：✅/❌/⚠️
- 场景 9：✅/❌/⚠️
- 场景 10：✅/❌/⚠️

### 总体评估
- 稳定性：⭐⭐⭐⭐⭐ (___/5)
- 易用性：⭐⭐⭐⭐⭐ (___/5)
- 文档完整性：⭐⭐⭐⭐⭐ (___/5)
- 跨平台兼容性：⭐⭐⭐⭐⭐ (___/5)

### 主要发现
1.
2.
3。

### 改进建议
1.
2.
3。

---

**测试完成后，请将结果填写到 TEST_RESULTS.md**
