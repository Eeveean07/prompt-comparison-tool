document.addEventListener('DOMContentLoaded', () => {
    // 模型配置数据
    const MODEL_OPTIONS = {
        deepseek: {
            apiBase: "https://api.deepseek.com/v1",
            preview: "https://api.deepseek.com/v1/chat/completions",
            groups: [
                {
                    name: "DeepSeek Chat",
                    models: [
                        { id: "deepseek-chat", name: "DeepSeek Chat", tags: ["推荐", "通用"] },
                    ]
                },
                {
                    name: "DeepSeek Reasoner",
                    models: [
                        { id: "deepseek-reasoner", name: "DeepSeek Reasoner", tags: ["推理", "数学"] },
                    ]
                }
            ]
        },
        qwen: {
            apiBase: "https://dashscope.aliyuncs.com/compatible-mode/v1",
            preview: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
            groups: [
                {
                    name: "qwen-coder",
                    models: [
                        { id: "qwen-coder", name: "qwen-coder", tags: ["代码"] },
                        { id: "qwen-coder-plus", name: "qwen-coder-plus", tags: ["代码", "增强"] },
                    ]
                },
                {
                    name: "qwen-max",
                    models: [
                        { id: "qwen-max", name: "qwen-max", tags: ["旗舰", "多语言"] },
                        { id: "qwen3-max", name: "qwen3-max", tags: ["旗舰", "最新"] },
                    ]
                },
                {
                    name: "qwen-plus",
                    models: [
                        { id: "qwen-plus", name: "qwen-plus", tags: ["平衡", "性价比"] },
                    ]
                },
                {
                    name: "qwen-turbo",
                    models: [
                        { id: "qwen-turbo", name: "qwen-turbo", tags: ["快速", "经济"] },
                    ]
                }
            ]
        }
    };

    // 当前配置
    let currentConfig = {
        platform: "deepseek",
        api_key: "",
        api_base: MODEL_OPTIONS.deepseek.apiBase,
        model: "deepseek-chat"
    };

    // 卡片管理
    let cardCount = 1;
    const maxCards = 5;
    const minCards = 1;
    const addCardBtn = document.getElementById('addCardBtn');
    const removeCardBtn = document.getElementById('removeCardBtn');
    const cardCountDisplay = document.getElementById('cardCount');
    const promptsContainer = document.getElementById('promptsContainer');

    // DOM元素
    const configToggle = document.getElementById('toggleConfig');
    const modelConfig = document.getElementById('modelConfig');
    const platformRadios = document.querySelectorAll('input[name="platform"]');
    const apiKeyInput = document.getElementById('apiKey');
    const apiBaseInput = document.getElementById('apiBase');
    const apiPreview = document.getElementById('apiPreview');
    const modelList = document.getElementById('modelList');
    const saveConfigBtn = document.getElementById('saveConfig');
    const toggleApiKeyBtn = document.getElementById('toggleApiKey');
    const resultPlatform = document.getElementById('resultPlatform');
    const getDeepseekKey = document.getElementById('getDeepseekKey');
    const getQwenKey = document.getElementById('getQwenKey');
    const addModelBtn = document.getElementById('addModelBtn');
    const addModelModal = new bootstrap.Modal(document.getElementById('addModelModal'));
    const confirmAddModel = document.getElementById('confirmAddModel');
    const modelIdInput = document.getElementById('modelId');
    const modelNameInput = document.getElementById('modelName');
    const modelGroupInput = document.getElementById('modelGroup');
    const copyAllResults = document.getElementById('copyAllResults');

    function updateCardControls() {
        addCardBtn.disabled = cardCount >= maxCards;
        removeCardBtn.disabled = cardCount <= minCards;
        cardCountDisplay.textContent = `当前: ${cardCount}/${maxCards} 组卡片`;
    }

    function createPromptCard(index) {
        // 为不同的卡片分配不同的颜色
        const colors = [
            { bg: 'bg-primary', text: 'text-white' },
            { bg: 'bg-success', text: 'text-white' },
            { bg: 'bg-info', text: 'text-dark' },
            { bg: 'bg-warning', text: 'text-dark' },
            { bg: 'bg-danger', text: 'text-white' }
        ];

        const color = colors[index % colors.length];

        const card = document.createElement('div');
        card.className = `col-md-4 mb-3 dynamic-card`;
        card.dataset.index = index;
        card.innerHTML = `
            <div class="card shadow-sm h-100">
                <div class="card-header ${color.bg} ${color.text} d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">提示词 ${index + 1}</h5>
                    <button class="btn btn-sm btn-light copy-prompt-btn" data-index="${index}">
                        <i class="bi bi-clipboard"></i>
                    </button>
                </div>
                <div class="card-body">
                    <textarea class="form-control prompt-input" rows="8" placeholder="输入提示词..."></textarea>
                </div>
            </div>
        `;

        return card;
    }

    function renderPromptCards() {
        promptsContainer.innerHTML = '';

        for (let i = 0; i < cardCount; i++) {
            const card = createPromptCard(i);
            promptsContainer.appendChild(card);
        }

        // 重新绑定复制按钮事件
        document.querySelectorAll('.copy-prompt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const promptText = document.querySelectorAll('.prompt-input')[index].value;

                if (promptText) {
                    navigator.clipboard.writeText(promptText).then(() => {
                        const originalIcon = btn.innerHTML;
                        btn.innerHTML = '<i class="bi bi-clipboard-check"></i>';
                        setTimeout(() => {
                            btn.innerHTML = originalIcon;
                        }, 2000);
                    }).catch(err => {
                        console.error('复制失败:', err);
                    });
                } else {
                    alert('提示词为空，无法复制');
                }
            });
        });

        // 为卡片添加动画效果
        setTimeout(() => {
            document.querySelectorAll('.dynamic-card').forEach(card => {
                card.style.opacity = '1';
            });
        }, 100);
    }

    // 初始化卡片
    renderPromptCards();
    updateCardControls();

    // 添加卡片
    addCardBtn.addEventListener('click', () => {
        if (cardCount < maxCards) {
            cardCount++;
            renderPromptCards();
            updateCardControls();
        }
    });

    // 移除卡片
    removeCardBtn.addEventListener('click', () => {
        if (cardCount > minCards) {
            cardCount--;
            renderPromptCards();
            updateCardControls();
        }
    });

    // 初始化模型列表
    function renderModelList() {
        const platform = currentConfig.platform;
        const options = MODEL_OPTIONS[platform];
        let html = '';

        options.groups.forEach(group => {
            // 计算该分组的模型数量
            const modelCount = group.models.length;

            html += `
                <div class="model-group" data-group="${group.name}">
                    <div class="model-group-header">
                        <div>
                            <i class="bi bi-box-seam"></i> ${group.name}
                            <span class="model-count">${modelCount} 款</span>
                        </div>
                        <div class="d-flex gap-1">
                            <button class="btn btn-sm btn-outline-danger delete-group-btn" data-group="${group.name}" title="删除分组">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="model-items">
                        ${group.models.map(model => `
                            <div class="model-option ${model.id === currentConfig.model ? 'active' : ''}"
                                 data-model="${model.id}" data-group="${group.name}">
                                <div class="d-flex justify-content-between">
                                    <div>
                                        <strong>${model.name}</strong>
                                        <div class="d-flex gap-1 mt-1">
                                            ${model.tags ? model.tags.map(tag => `
                                                <span class="badge bg-light text-dark">${tag}</span>
                                            `).join('') : ''}
                                        </div>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-check-circle text-success ${model.id === currentConfig.model ? '' : 'd-none'}"></i>
                                    </div>
                                </div>
                                <button class="remove-btn" title="移除模型">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        modelList.innerHTML = html;

        // 添加点击事件
        document.querySelectorAll('.model-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.model-option').forEach(o => {
                    o.classList.remove('active');
                    o.querySelector('.bi-check-circle').classList.add('d-none');
                });
                option.classList.add('active');
                option.querySelector('.bi-check-circle').classList.remove('d-none');
                currentConfig.model = option.dataset.model;
            });
        });

        // 添加移除模型事件
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const modelOption = btn.closest('.model-option');
                const modelId = modelOption.dataset.model;
                const groupName = modelOption.dataset.group;

                // 从配置中移除模型
                const group = MODEL_OPTIONS[currentConfig.platform].groups.find(g => g.name === groupName);
                if (group) {
                    group.models = group.models.filter(m => m.id !== modelId);
                    renderModelList();
                }
            });
        });

        // 添加删除分组事件
        document.querySelectorAll('.delete-group-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const groupName = btn.dataset.group;

                if (confirm(`确定要删除 "${groupName}" 分组吗？此操作将删除该分组下的所有模型`)) {
                    // 从配置中移除分组
                    MODEL_OPTIONS[currentConfig.platform].groups =
                        MODEL_OPTIONS[currentConfig.platform].groups.filter(g => g.name !== groupName);
                    renderModelList();
                }
            });
        });
    }

    // 添加模型
    confirmAddModel.addEventListener('click', () => {
        const modelId = modelIdInput.value.trim();
        const modelName = modelNameInput.value.trim();
        const modelGroup = modelGroupInput.value.trim() || "自定义模型";

        if (!modelId) {
            alert('模型ID不能为空');
            return;
        }

        // 查找或创建分组
        let group = MODEL_OPTIONS[currentConfig.platform].groups.find(g => g.name === modelGroup);
        if (!group) {
            group = { name: modelGroup, models: [] };
            MODEL_OPTIONS[currentConfig.platform].groups.push(group);
        }

        // 添加模型
        group.models.push({
            id: modelId,
            name: modelName || modelId,
            tags: ["自定义"]
        });

        // 重置表单
        modelIdInput.value = '';
        modelNameInput.value = '';
        modelGroupInput.value = '';

        // 关闭模态框
        addModelModal.hide();

        // 重新渲染
        renderModelList();
    });

    // 切换配置面板
    configToggle.addEventListener('click', () => {
        modelConfig.classList.toggle('d-none');
        configToggle.innerHTML = modelConfig.classList.contains('d-none') ?
            '<i class="bi bi-gear"></i> 配置' :
            '<i class="bi bi-x"></i> 关闭配置';
    });

    // 切换平台
    platformRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) {
                currentConfig.platform = radio.value;
                apiBaseInput.value = MODEL_OPTIONS[radio.value].apiBase;
                apiPreview.textContent = MODEL_OPTIONS[radio.value].preview;
                renderModelList();
            }
        });
    });

    // 切换API密钥可见性
    toggleApiKeyBtn.addEventListener('click', () => {
        const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
        apiKeyInput.setAttribute('type', type);
        toggleApiKeyBtn.innerHTML = type === 'password' ?
            '<i class="bi bi-eye"></i>' :
            '<i class="bi bi-eye-slash"></i>';
    });

    // 保存配置
    saveConfigBtn.addEventListener('click', () => {
        currentConfig.api_key = apiKeyInput.value;
        currentConfig.api_base = apiBaseInput.value;

        // 显示成功提示
        const originalText = saveConfigBtn.innerHTML;
        saveConfigBtn.innerHTML = '<i class="bi bi-check-circle me-1"></i> 配置已保存';
        saveConfigBtn.classList.add('btn-success');
        saveConfigBtn.classList.remove('btn-primary');

        setTimeout(() => {
            saveConfigBtn.innerHTML = originalText;
            saveConfigBtn.classList.remove('btn-success');
            saveConfigBtn.classList.add('btn-primary');
        }, 2000);
    });

    // 获取API密钥链接
    getDeepseekKey.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('https://platform.deepseek.com/api_keys', '_blank');
    });

    getQwenKey.addEventListener('click', (e) => {
        e.preventDefault();
        window.open('https://help.aliyun.com/zh/dashscope/developer-reference/activate-dashscope-and-create-an-api-key', '_blank');
    });

    // 添加模型按钮
    addModelBtn.addEventListener('click', () => {
        modelGroupInput.value = '';
        addModelModal.show();
    });

    // 复制全部结果
    copyAllResults.addEventListener('click', () => {
        const results = [];
        document.querySelectorAll('.response-content').forEach(content => {
            results.push(content.textContent.trim());
        });

        if (results.length > 0) {
            navigator.clipboard.writeText(results.join('\n\n-----\n\n'));
            copyAllResults.innerHTML = '<i class="bi bi-clipboard-check"></i> 已复制';
            setTimeout(() => {
                copyAllResults.innerHTML = '<i class="bi bi-clipboard"></i> 复制全部';
            }, 2000);
        }
    });

    // 生成结果
    const generateBtn = document.getElementById('generateBtn');
    const loadingIndicator = document.getElementById('loading');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsRow = document.getElementById('resultsRow');

    generateBtn.addEventListener('click', async () => {
        const prompts = Array.from(document.querySelectorAll('.prompt-input'))
            .map(el => el.value.trim())
            .filter(prompt => prompt);

        if (prompts.length === 0) {
            alert('请至少输入一个提示词');
            return;
        }

        if (prompts.length > maxCards) {
            alert(`最多只能对比 ${maxCards} 组提示词`);
            return;
        }

        // 显示加载状态
        loadingIndicator.classList.remove('d-none');
        generateBtn.disabled = true;

        try {
            const response = await fetch('http://127.0.0.1:5000/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompts,
                    model_config: {
                        platform: currentConfig.platform,
                        api_key: currentConfig.api_key,
                        api_base: currentConfig.api_base,
                        model: currentConfig.model
                    }
                })
            });

            const data = await response.json();

            if (response.ok) {
                renderResults(data.results);
                resultsContainer.classList.remove('d-none');

                // 更新平台显示
                const platformName = currentConfig.platform === 'deepseek' ? '深度求索' : '阿里云百炼';
                resultPlatform.textContent = `${platformName} | ${currentConfig.model}`;
            } else {
                throw new Error(data.error || 'API请求失败');
            }
        } catch (error) {
            console.error('请求错误:', error);
            alert(`发生错误: ${error.message}`);
        } finally {
            // 隐藏加载状态
            loadingIndicator.classList.add('d-none');
            generateBtn.disabled = false;
        }
    });

    function renderResults(results) {
        resultsRow.innerHTML = '';

        // 为不同的卡片分配不同的颜色
        const colors = [
            { bg: 'bg-primary', text: 'text-white' },
            { bg: 'bg-success', text: 'text-white' },
            { bg: 'bg-info', text: 'text-dark' },
            { bg: 'bg-warning', text: 'text-dark' },
            { bg: 'bg-danger', text: 'text-white' }
        ];

        results.forEach((result, index) => {
            const color = colors[index % colors.length];
            const hasError = result.error;

            // 彻底修复：多重清理确保无开头空格
            let responseText = hasError ?
                `<div class="alert alert-danger mt-3"><strong>错误:</strong> ${result.error}</div>` :
                result.response
                    .replace(/^\s+/, '') // 移除开头所有空白字符
                    .replace(/\n\s+/, '\n') // 移除每行开头的空格
                    .trim(); // 移除首尾空格

            // 确保内容是安全的HTML，特别处理开头空格
            const createSafeContent = (text) => {
                // 特别处理开头空格
                if (text.startsWith(' ')) {
                    text = text.substring(1);
                }
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            };

            const resultCard = document.createElement('div');
            resultCard.className = `col-md-4 mb-4 result-card ${hasError ? 'border-danger' : ''}`;
            resultCard.innerHTML = `
                <div class="card h-100 shadow ${hasError ? 'border-danger' : ''}">
                    <div class="card-header ${color.bg} ${color.text} d-flex justify-content-between align-items-center">
                        <span>生成结果 ${index + 1}</span>
                        <button class="btn btn-sm btn-light copy-result-btn">
                            <i class="bi bi-clipboard"></i>
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="response-content">
                            ${createSafeContent(responseText)}
                        </div>

                        <div class="stats-container mt-3">
                            <span class="stats-badge bg-primary">Tokens: ${result.tokens || 0}</span>
                            <span class="stats-badge bg-secondary">耗时: ${result.time ? result.time.toFixed(2) : '0.00'}秒</span>
                        </div>
                    </div>
                </div>
            `;

            resultsRow.appendChild(resultCard);

            // 添加结果复制功能
            resultCard.querySelector('.copy-result-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const content = resultCard.querySelector('.response-content').textContent;
                navigator.clipboard.writeText(content).then(() => {
                    const originalIcon = e.target.innerHTML;
                    e.target.innerHTML = '<i class="bi bi-clipboard-check"></i>';
                    setTimeout(() => {
                        e.target.innerHTML = originalIcon;
                    }, 2000);
                }).catch(err => {
                    console.error('复制失败:', err);
                });
            });
        });

        // 滚动到结果区域
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // 初始化
    renderModelList();
    apiPreview.textContent = MODEL_OPTIONS.deepseek.preview;
});