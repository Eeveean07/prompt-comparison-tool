# AI提示词对比实验室 (Prompt Comparison Tool)

一个用于比较不同AI模型对相同提示词响应效果的Web工具，支持多平台、多模型的实时对比分析。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8%2B-blue)
![Flask](https://img.shields.io/badge/flask-3.0.3-green)

## ✨ 功能特性

- 🔄 **多模型支持**: 深度求索(DeepSeek)、阿里云百炼(Qwen)等主流AI平台
- 📊 **实时对比**: 1-5组提示词同时测试，直观对比响应效果
- ⚙️ **灵活配置**: 自定义API密钥、模型选择和分组管理
- 📱 **响应式设计**: 适配桌面和移动设备
- 📋 **结果导出**: 支持响应内容一键复制
- ⏱️ **性能统计**: 显示响应时间、Token消耗等关键指标

## 🚀 快速开始

### 环境要求

- Python 3.8+
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/你的用户名/prompt-comparison-tool.git
cd prompt-comparison-tool
```

2. **安装后端依赖**
```bash
cd backend
pip install -r requirements.txt
```

3. **配置API密钥**
复制 `.env.example` 为 `.env` 并填入真实API密钥：
```env
DEEPSEEK_API_KEY=你的深度求索API密钥
QWEN_API_KEY=你的阿里云百炼API密钥
```

4. **启动服务**
```bash
# 启动后端API服务
python app.py

# 前端访问
打开 frontend/index.html 文件
```

## 📁 项目结构

```
prompt-comparison-tool/
├── backend/                 # 后端服务
│   ├── app.py              # Flask API服务器
│   ├── requirements.txt    # Python依赖
│   ├── .env.example        # 环境配置模板
│   └── .env               # 环境配置（不提交到Git）
├── frontend/               # 前端界面
│   ├── css/
│   │   └── style.css      # 样式文件
│   ├── js/
│   │   └── main.js        # 前端逻辑
│   └── index.html         # 主页面
├── .gitignore             # Git忽略规则
└── README.md              # 项目说明
```

## 🔧 使用指南

### 1. 模型配置
- 选择AI平台（DeepSeek/Qwen）
- 输入有效的API密钥
- 选择目标模型
- 保存配置

### 2. 提示词输入
- 支持1-5组提示词同时测试
- 每张卡片可独立输入不同提示词
- 支持提示词内容复制

### 3. 生成对比
- 点击"生成对比结果"按钮
- 系统将并行调用各模型API
- 实时显示响应状态和结果

### 4. 结果分析
- 并列显示各模型响应内容
- 统计响应时间和Token消耗
- 支持结果一键复制

## 🔌 API支持

### 当前支持的平台
- **深度求索 (DeepSeek)**
  - deepseek-chat
  - deepseek-reasoner
  
- **阿里云百炼 (Qwen)**
  - qwen-max
  - qwen-plus
  - qwen-turbo
  - qwen-coder

### 自定义模型
支持通过界面添加自定义模型，只需提供：
- 模型ID（API中的标识）
- 模型名称（显示用）
- 分组名称（可选）

## 🛠️ 技术架构

### 后端技术栈
- **框架**: Flask 3.0.3
- **CORS**: Flask-CORS 6.0.2
- **HTTP客户端**: Requests 2.32.3
- **环境管理**: python-dotenv 1.0.1

### 前端技术栈
- **UI框架**: Bootstrap 5.3.0
- **图标**: Bootstrap Icons 1.10.0
- **JavaScript**: 原生ES6+
- **样式**: 自定义CSS3

## 🔒 安全说明

**重要**: 请勿将包含真实API密钥的`.env`文件提交到版本控制系统。

推荐的安全实践：
1. 使用环境变量管理敏感信息
2. 在GitHub上设置Repository Secrets
3. 定期轮换API密钥
4. 使用`.env.example`模板文件

## 🐛 故障排除

### 常见问题

**Q: 后端服务启动失败**
A: 检查Python版本和依赖安装：
```bash
python --version
pip list | grep flask
```

**Q: API调用返回错误**
A: 验证API密钥和网络连接，检查防火墙设置。

**Q: 前端无法连接后端**
A: 确保后端服务运行在127.0.0.1:5000，检查CORS配置。

### 日志查看
后端服务会在控制台输出详细日志，包括API调用状态和错误信息。

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Flask](https://flask.palletsprojects.com/) - 轻量级Web框架
- [Bootstrap](https://getbootstrap.com/) - 前端UI框架
- [DeepSeek](https://www.deepseek.com/) - AI平台支持
- [阿里云百炼](https://bailian.aliyun.com/) - AI平台支持

---

**提示**: 使用前请确保已获得相应AI平台的API访问权限，并遵守各平台的使用条款。