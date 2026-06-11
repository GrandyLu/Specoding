# Comet CLI 验证 - 快速开始

## 一分钟快速启动

### Step 1: 准备环境

```bash
# 进入测试目录
cd test-validation

# 创建测试项目目录
mkdir -p test-projects
cd test-projects

# 验证 Comet 安装
comet --version
comet doctor
```

### Step 2: 选择场景

根据你的时间选择测试场景：

**⚡ 快速测试（5 分钟）**
- 场景 2：Hotfix 快捷路径

**🔄 标准测试（15 分钟）**
- 场景 2：Hotfix 快捷路径
- 场景 3：Tweak 小改动

**🎯 完整测试（30+ 分钟）**
- 场景 1：完整工作流
- 场景 2：Hotfix 快捷路径
- 场景 3：Tweak 小改动

### Step 3: 执行测试

#### 快速测试示例（Hotfix）

```bash
# 1. 创建测试项目
mkdir hotfix-test && cd hotfix-test
git init

# 2. 创建一个有 bug 的文件
cat > math.js << 'EOF'
function add(a, b) {
  return a - b;  // Bug: 应该是 a + b
}
module.exports = { add };
EOF

# 3. 在 Claude Code 中执行
# /comet-hotfix
# 提示：修复 math.js 中的加法函数，应该返回 a + b 而不是 a - b
```

#### 标准测试示例（Hotfix + Tweak）

```bash
# 1. Hotfix 测试（同上）
mkdir hotfix-test && cd hotfix-test
git init
# ... 执行 hotfix 测试 ...

# 2. Tweak 测试
cd ../
mkdir tweak-test && cd tweak-test
git init

# 创建 README
cat > README.md << 'EOF'
# My Project

This is a test project.
EOF

# 3. 在 Claude Code 中执行
# /comet-tweak
# 提示：更新 README.md 的描述，让它更详细
```

#### 完整测试示例

参考 `scenario-1-full-workflow.md` 文件。

## 观察要点

### ✅ 成功标志

1. **Skill 触发成功**
   - 看到 `[Using skill: xxx]` 输出
   - Skill 内容被加载和执行

2. **状态自动更新**
   - `.comet.yaml` 自动更新
   - phase 字段正确变化

3. **Guard 检查通过**
   - 看到 `ALL CHECKS PASSED`
   - 自动进入下一阶段

4. **文件正确生成**
   - 所有必需文件存在
   - 内容格式正确

### ❌ 失败标志

1. **Skill 未触发**
   - 无 Skill 触发输出
   - Agent "模拟" Skill 行为

2. **状态不一致**
   - `.comet.yaml` 与实际状态不符
   - phase 字段错误

3. **Guard 失败**
   - 看到 `HARD STOP` 或 `GUARD FAILED`
   - 无法继续下一阶段

4. **文件缺失或错误**
   - 必需文件不存在
   - 格式或内容错误

## 记录结果

测试完成后，填写 `TEST_RESULTS.md`：

```markdown
### 场景 2：Hotfix

**结果**：✅ 通过 / ❌ 失败 / ⚠️ 部分通过

**问题**：
1. [如果失败，描述问题]
2. [如果部分通过，描述未通过的部分]

**改进建议**：
1. [如果有建议]
```

## 常见问题

### Q: Skill 没有被触发怎么办？

**A**: 检查以下几点：
1. Skill 是否正确安装：`comet doctor`
2. Skill 路径是否正确
3. Skill 文件是否完整

### Q: 状态机卡住怎么办？

**A**: 尝试以下步骤：
1. 检查 `.comet.yaml` 内容
2. 运行 `comet status` 查看当前状态
3. 使用 `comet-state.sh` 手动修正（如果了解操作）

### Q: Guard 失败怎么办？

**A**: 查看 Guard 输出的具体错误：
1. 检查必需文件是否存在
2. 检查状态字段是否正确
3. 查看错误消息中的具体提示

### Q: 如何判断测试通过？

**A**: 满足以下条件即为通过：
1. 所有必需文件生成
2. 状态正确更新
3. Guard 检查通过
4. Skill 正确触发

## 下一步

完成基础测试后，可以：

1. **深入测试**：执行更多场景
2. **压力测试**：测试边界条件
3. **平台测试**：在不同平台测试
4. **文档贡献**：补充测试用例

## 需要帮助？

- 查看 `EXECUTION_GUIDE.md` 了解详细步骤
- 查看 `scenario-X.md` 了解具体场景
- 查看项目 README 了解 Comet 功能

## 贡献结果

测试完成后，欢迎：

1. 提交问题报告
2. 提出改进建议
3. 补充测试用例
4. 分享测试经验

---

**Happy Testing! 🎯**
