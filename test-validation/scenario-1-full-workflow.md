# 场景 1：完整工作流测试

## 测试场景：创建用户认证功能

### 需求描述

实现一个简单的用户认证功能：
- 新增用户登录接口
- 实现基本的 JWT 验证
- 添加单元测试

### 预期流程

#### 阶段 1：Open（/comet-open）

**预期产物**：
- `openspec/changes/user-auth-feature/proposal.md`
- `openspec/changes/user-auth-feature/design.md`
- `openspec/changes/user-auth-feature/tasks.md`
- `openspec/changes/user-auth-feature/.comet.yaml`

**验证清单**：
- [ ] proposal.md 包含 Why + What
- [ ] design.md 包含高层架构决策
- [ ] tasks.md 包含可执行的任务清单
- [ ] .comet.yaml 状态为 `phase: open`
- [ ] .openspec.yaml 正确创建

#### 阶段 2：Design（/comet-design）

**预期产物**：
- `docs/superpowers/specs/2026-06-11-user-auth-design.md` (Design Doc)
- `openspec/changes/user-auth-feature/specs/auth/spec.md` (delta spec)
- `openspec/changes/user-auth-feature/.comet/handoff/design-context.json`

**验证清单**：
- [ ] brainstorming 必须执行
- [ ] Design Doc 包含技术设计
- [ ] delta spec 定义能力规格
- [ ] handoff 文件正确生成
- [ ] .comet.yaml phase 更新为 `design`
- [ ] guard 检查通过

#### 阶段 3：Build（/comet-build）

**预期产物**：
- `docs/superpowers/plans/2026-06-11-user-auth.md` (Plan)
- 代码实现
- Git commits

**验证清单**：
- [ ] brainstorming 确认决策点
- [ ] plan-ready 暂停确认
- [ ] build_mode 选择确认
- [ ] isolation 选择确认
- [ ] Plan 包含 change 关联
- [ ] 每个 task 执行后 git commit
- [ ] tasks.md 实时更新勾选
- [ ] .comet.yaml phase 更新为 `build`
- [ ] guard 检查通过

#### 阶段 4：Verify（/comet-verify）

**预期产物**：
- `openspec/changes/user-auth-feature/test-cases.md` 执行
- `openspec/changes/user-auth-feature/verification-report.md`
- 分支处理完成

**验证清单**：
- [ ] 验证模式选择
- [ ] 测试用例执行
- [ ] 验证报告生成
- [ ] branch_status = handled
- [ ] verify_result = pass
- [ ] guard 检查通过

#### 阶段 5：Archive（/comet-archive）

**预期产物**：
- `openspec/changes/archive/2026-06-11-user-auth-feature/`
- Main spec 更新
- Design doc 和 Plan 标注

**验证清单**：
- [ ] delta spec 同步到 main spec
- [ ] change 移动到 archive
- [ ] design doc 标注 `archived-with`
- [ ] plan 标注 `archived-with`
- [ ] .comet.yaml archived = true
- [ ] guard 检查通过

### 执行步骤

#### Step 1: 开始测试
```bash
cd test-validation
# 初始化测试项目
mkdir user-auth-test
cd user-auth-test
git init
```

#### Step 2: 执行 /comet-open
在 Claude Code 中执行：
```
/comet-open
创建一个用户认证功能，包括登录接口和 JWT 验证
```

**观察点**：
- 是否正确调用 openspec-new skill
- 是否生成所有必需文件
- .comet.yaml 是否正确创建

#### Step 3: 执行 /comet-design
在 Claude Code 中执行：
```
/comet-design
```

**观察点**：
- 是否触发 brainstorming skill
- 是否生成 Design Doc
- handoff 文件是否生成
- guard 是否通过

#### Step 4: 执行 /comet-build
在 Claude Code 中执行：
```
/comet-build
```

**观察点**：
- plan-ready 暂停是否正确触发
- build_mode 选择是否正确触发
- isolation 选择是否正确触发
- Plan 是否正确生成
- 代码实现是否正确
- tasks.md 是否实时更新

#### Step 5: 执行 /comet-verify
在 Claude Code 中执行：
```
/comet-verify
```

**观察点**：
- 验证模式选择是否正确触发
- 验证报告是否生成
- branch 处理是否完成

#### Step 6: 执行 /comet-archive
在 Claude Code 中执行：
```
/comet-archive
```

**观察点**：
- 归档步骤是否完整
- 文件是否正确移动
- 状态是否正确更新

### 问题记录表

| 问题描述 | 阶段 | 严重程度 | 状态 |
|---------|------|---------|------|
| 示例：状态更新失败 | build | 高 | 待修复 |

### 测试结果

**开始时间**：
**结束时间**：
**总体结果**：✅ 通过 / ❌ 失败 / ⚠️ 部分通过

**各阶段结果**：
- Open: __________
- Design: __________
- Build: __________
- Verify: __________
- Archive: __________

**发现的问题**：
1.
2.
3.

**改进建议**：
1.
2.
3.

### 下一步

完成本场景后，进入场景 2：Hotfix 快捷路径测试
