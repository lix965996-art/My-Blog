#!/bin/bash

# 博客部署上传脚本
# 适用于2核2G阿里云服务器的分步部署

echo "=== 博客部署上传脚本 ==="
echo

# 第一步：上传基础文件和源代码
echo "Step 1: 上传基础文件和源代码"
echo "--------------------------------"
echo "请使用 scp 或其他工具上传以下文件："
echo

# 创建基础文件列表
echo "【基础配置文件】"
echo "- package.json"
echo "- package-lock.json"
echo "- tsconfig.json"
echo "- next.config.js"
echo "- open-next.config.ts"
echo "- postcss.config.mjs"
echo "- .npmrc"
echo "- .gitignore"
echo "- global.d.ts"
echo "- .prettierrc"
echo "- .prettierignore"
echo

echo "【源代码目录】"
echo "- src/ (全部内容)"
echo

echo "【静态资源目录】"
echo "- public/ (全部内容)"
echo

# 第二步：说明构建步骤
echo
echo "Step 2: 在服务器上执行构建"
echo "--------------------------------"
echo "登录服务器后，执行以下命令："
echo
echo "cd /path/to/blog"
echo "npm install --force"
echo "npm run build"
echo "npm start"
echo

# 第三步：如果有构建产物，直接上传
echo
echo "Step 3: 替代方案 - 上传构建产物"
echo "--------------------------------"
echo "如果你本地有构建好的 .next 目录："
echo
echo "【本地构建】"
echo "npm install"
echo "npm run build"
echo
echo "【上传构建产物】"
echo "- .next/ 目录"
echo "- package.json"
echo "- package-lock.json"
echo

echo "=== 执行完成后访问你的博客 ==="
echo "服务器IP: 你的服务器IP"
echo "端口: 3000"