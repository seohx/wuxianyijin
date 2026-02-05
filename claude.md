# 五险一金计算器 - 项目上下文管理中枢

> 本文件是整个项目的"上下文管理中枢"，确保开发过程中始终遵循既定方向。

---

## 1. 项目目标

构建一个迷你的"五险一金"计算器 Web 应用，核心功能是根据预设的员工工资数据和城市社保标准，计算公司为每位员工应缴纳的社保公积金费用，并将结果清晰地展示出来。

---

## 2. 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | Next.js (App Router) |
| UI/样式 | Tailwind CSS |
| 数据库/后端 | Supabase |
| Excel 处理 | xlsx 库 |
| 类型检查 | TypeScript |

---

## 3. 数据库设计 (Supabase)

### 3.1 cities 表（城市标准表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 主键，自增 |
| city_name | text | 城市名 |
| year | text | 年份（如 "2024"） |
| base_min | int | 社保基数下限 |
| base_max | int | 社保基数上限 |
| rate | float | 简化的综合缴纳比例（如 0.15） |

### 3.2 salaries 表（员工工资表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 主键，自增 |
| employee_id | text | 员工工号 |
| employee_name | text | 员工姓名 |
| month | text | 年份月份（格式：YYYYMM） |
| salary_amount | int | 该月工资金额 |

### 3.3 results 表（计算结果表）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 主键，自增 |
| employee_name | text | 员工姓名 |
| avg_salary | float | 年度月平均工资 |
| contribution_base | float | 最终缴费基数 |
| company_fee | float | 公司缴纳金额 |

---

## 4. Excel 文件格式

### 4.1 cities.xlsx

| 列名 | 类型 | 示例值 | 备注 |
|------|------|--------|------|
| id | int | 1 | - |
| city_namte | text | 佛山 | 注意：列名有拼写错误，需映射为 `city_name` |
| year | int | 2024 | - |
| rate | float | 0.14 | - |
| base_min | int | 4546 | - |
| base_max | int | 26421 | - |

### 4.2 salaries.xlsx

| 列名 | 类型 | 示例值 | 备注 |
|------|------|--------|------|
| id | int | 1 | - |
| employee_id | int | 1 | - |
| employee_name | text | 张三 | - |
| month | int | 202401 | 格式：YYYYMM |
| salary_amount | int | 30000 | - |

---

## 5. 核心业务逻辑

### 5.1 计算函数流程

```
1. 从 salaries 表中读取所有数据
2. 按 employee_name 分组，计算每位员工的"年度月平均工资"
3. 遍历 cities 表中的所有城市
   3.1 获取城市的 year, base_min, base_max, rate
   3.2 对于每位员工：
       - 比较其"年度月平均工资"与该城市的基数上下限
       - 确定最终缴费基数：
         * 低于下限 → 使用下限
         * 高于上限 → 使用上限
         * 在中间 → 使用平均工资本身
       - 计算公司应缴纳金额 = 最终缴费基数 × rate
4. 将每位员工在所有城市的计算结果存入 results 表
```

### 5.2 换算规则

| 条件 | 最终缴费基数 |
|------|--------------|
| avg_salary < base_min | base_min |
| avg_salary > base_max | base_max |
| base_min ≤ avg_salary ≤ base_max | avg_salary |

---

## 6. 前端页面设计

### 6.1 `/` - 主页（导航中枢）

**设计风格：** 清新简约

**布局：**
- 页面中央区域，两个并排的功能卡片
- 每个卡片包含标题和简要说明
- 整个卡片可点击，跳转对应页面

**卡片结构：**

| 卡片 | 标题 | 说明 | 跳转 |
|------|------|------|------|
| 卡片一 | 数据上传 | 上传城市标准和员工工资数据 | /upload |
| 卡片二 | 结果查询 | 查看五险一金计算结果 | /results |

**样式要点：**
- 使用柔和的背景色（如浅灰、浅蓝）
- 卡片圆角、阴影效果
- 悬停时轻微上浮动画

---

### 6.2 `/upload` - 数据上传与操作页

**设计风格：** 清新简约

**功能按钮：**

| 按钮 | 功能 | 行为 |
|------|------|------|
| 上传数据 | 选择并上传 Excel 文件 | 1. 弹出文件选择对话框<br>2. 解析 cities.xlsx 和 salaries.xlsx<br>3. 覆盖 cities 和 salaries 表数据 |
| 执行计算并存储结果 | 触发计算逻辑 | 1. 执行核心计算函数<br>2. 将结果存入 results 表<br>3. 显示成功提示 |

**样式要点：**
- 两个按钮垂直排列
- 使用鲜明的按钮颜色（主色按钮 + 次色按钮）
- 操作反馈：加载中状态、成功/失败提示

---

### 6.3 `/results` - 结果查询与展示页

**设计风格：** 清新简约

**功能特性：**

| 功能 | 说明 |
|------|------|
| 自动加载 | 页面加载时自动从 results 表获取所有数据 |
| 表格展示 | 结构清晰的表格，表头与数据库字段对应 |
| 排序 | 点击表头可按该列排序（升序/降序切换） |
| 筛选 | 支持按员工姓名筛选 |
| 分页 | 每页显示 10 条数据，可翻页 |
| 导出 Excel | 一键导出当前筛选结果为 Excel 文件 |

**表格表头：**

| 表头 | 对应字段 | 对齐 |
|------|----------|------|
| 员工姓名 | employee_name | 左对齐 |
| 年度月平均工资 | avg_salary | 右对齐 |
| 最终缴费基数 | contribution_base | 右对齐 |
| 公司缴纳金额 | company_fee | 右对齐 |

**样式要点：**
- 斑马纹表格
- 金额列保留 2 位小数
- 响应式设计（移动端横向滚动）

---

## 7. TodoList - 开发任务清单

### 阶段一：环境搭建

- [ ] 初始化 Next.js 项目（使用 TypeScript 和 Tailwind CSS）
- [ ] 安装项目依赖
  - [ ] `@supabase/supabase-js` - Supabase 客户端
  - [ ] `xlsx` - Excel 文件解析
  - [ ] `lucide-react` - 图标库（可选）
- [ ] 配置 Tailwind CSS
- [ ] 配置环境变量（.env.local）
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY

### 阶段二：Supabase 数据库设置

- [ ] 创建 Supabase 项目
- [ ] 创建数据表（使用 SQL Editor 或控制台）
  - [ ] cities 表
  - [ ] salaries 表
  - [ ] results 表
- [ ] 设置表权限（Row Level Security）
  - [ ] 允许读写操作（开发阶段可暂时关闭 RLS）

### 阶段三：后端 API 开发

- [ ] 创建 Supabase 客户端实例（lib/supabase.ts）
- [ ] 创建计算函数（lib/calculate.ts）
  - [ ] 从 salaries 表读取数据并计算平均工资
  - [ ] 从 cities 表读取城市标准
  - [ ] 计算每位员工在各城市的缴费基数和公司应缴金额
  - [ ] 将结果存入 results 表
- [ ] 创建 API 路由（app/api/*）
  - [ ] POST /api/upload - 处理 Excel 上传
    - [ ] 解析 cities.xlsx（处理列名拼写错误）
    - [ ] 解析 salaries.xlsx
    - [ ] 清空并重新插入数据
  - [ ] POST /api/calculate - 触发计算
  - [ ] GET /api/results - 获取计算结果

### 阶段四：前端页面开发

- [ ] 创建公共布局组件（components/Layout.tsx）
  - [ ] 导航栏
  - [ ] 页脚

- [ ] 开发主页（app/page.tsx）
  - [ ] 页面布局
  - [ ] 两个功能卡片组件
  - [ ] 卡片点击跳转

- [ ] 开发上传页面（app/upload/page.tsx）
  - [ ] 页面布局
  - [ ] 文件选择组件
  - [ ] 上传按钮及状态管理
  - [ ] 计算按钮及状态管理
  - [ ] 操作反馈（加载、成功、失败）

- [ ] 开发结果页面（app/results/page.tsx）
  - [ ] 页面布局
  - [ ] 数据加载（useEffect）
  - [ ] 筛选组件
  - [ ] 表格组件（含排序）
  - [ ] 分页组件
  - [ ] 导出 Excel 按钮

### 阶段五：样式优化

- [ ] 应用统一配色方案
- [ ] 优化卡片和表格样式
- [ ] 添加悬停动画效果
- [ ] 响应式适配（移动端）

### 阶段六：测试与调试

- [ ] 使用测试数据上传功能
- [ ] 验证计算逻辑正确性
- [ ] 测试筛选、排序、分页功能
- [ ] 测试导出 Excel 功能

### 阶段七：部署准备

- [ ] 代码整理和注释
- [ ] 环境变量配置说明
- [ ] 部署文档

---

## 8. 注意事项

1. **Excel 列名映射**：cities.xlsx 的列名 `city_namte ` 需要映射为 `city_name`
2. **数据覆盖策略**：上传 Excel 时清空表数据后再插入
3. **计算范围**：支持 cities 表中的所有城市，不限于佛山
4. **UI 风格**：清新简约，使用柔和配色和圆角设计
5. **表格功能**：必须包含排序、筛选、分页、导出功能

---

## 9. 开发约定

- 使用 TypeScript 编写代码
- 使用 Tailwind CSS 进行样式开发
- 组件放在 `components/` 目录
- 工具函数放在 `lib/` 目录
- API 路由放在 `app/api/` 目录
- 代码注释使用中文
