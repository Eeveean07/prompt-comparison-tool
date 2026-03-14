import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from threading import Thread
import json

app = Flask(__name__)
CORS(app, resources={r"/generate": {"origins": "*"}})

# 默认配置（如果前端未提供）
DEFAULT_CONFIG = {
    "deepseek": {
        "api_key": os.getenv("DEEPSEEK_API_KEY", ""),
        "api_base": "https://api.deepseek.com/v1",
        "models": ["deepseek-chat", "deepseek-reasoner"]
    },
    "qwen": {
        "api_key": os.getenv("QWEN_API_KEY", ""),
        "api_base": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "models": ["qwen-max", "qwen-plus", "qwen-turbo", "qwen-coder"]
    }
}


@app.route('/generate', methods=['POST'])
def generate_responses():
    data = request.json
    prompts = data.get('prompts', [])
    model_config = data.get('model_config', {})

    if not prompts or len(prompts) > 3:
        return jsonify({"error": "请提供1-3个提示词"}), 400

    # 获取模型配置
    platform = model_config.get("platform", "deepseek")
    api_key = model_config.get("api_key", "")
    api_base = model_config.get("api_base", "")
    model = model_config.get("model", "")

    # 使用默认配置（如果前端未提供）
    if not api_key or not api_base or not model:
        platform_config = DEFAULT_CONFIG.get(platform, {})
        api_key = api_key or platform_config.get("api_key", "")
        api_base = api_base or platform_config.get("api_base", "")
        model = model or platform_config.get("models", [])[0] if platform_config.get("models") else ""

    if not api_key:
        return jsonify({"error": "API密钥不能为空"}), 400
    if not api_base:
        return jsonify({"error": "API地址不能为空"}), 400
    if not model:
        return jsonify({"error": "请选择模型"}), 400

    results = []

    def call_api(prompt, index):
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        # 根据平台构建请求
        if platform == "qwen":
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 500,
                "frequency_penalty": 0,
                "presence_penalty": 0
            }
        else:  # deepseek
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.7,
                "max_tokens": 500
            }

        try:
            api_url = f"{api_base}/chat/completions"
            response = requests.post(api_url, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            response_data = response.json()

            # 处理不同平台的响应格式
            if platform == "qwen":
                content = response_data['choices'][0]['message']['content']
                tokens = response_data.get('usage', {}).get('total_tokens', 0)
            else:
                content = response_data['choices'][0]['message']['content']
                tokens = response_data['usage']['total_tokens']

            results.append({
                "index": index,
                "prompt": prompt,
                "response": content,
                "tokens": tokens,
                "time": response.elapsed.total_seconds(),
                "model": model,
                "platform": platform
            })
        except Exception as e:
            results.append({
                "index": index,
                "prompt": prompt,
                "error": str(e),
                "model": model,
                "platform": platform
            })

    # 并行调用API
    threads = []
    for idx, prompt in enumerate(prompts):
        thread = Thread(target=call_api, args=(prompt, idx))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()

    # 按原始顺序排序结果
    results.sort(key=lambda x: x['index'])
    return jsonify({"results": results})


if __name__ == '__main__':
    app.run(debug=True, port=5000)