#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动推送项目到 GitHub 的脚本
使用方法:
    python tools/push_to_github.py              # 默认推送（自动生成提交信息）
    python tools/push_to_github.py -m "信息"    # 自定义提交信息
    python tools/push_to_github.py --dry-run    # 预览模式
"""

import os
import subprocess
import argparse
from datetime import datetime

def run_command(cmd, cwd=None, dry_run=False):
    """运行命令"""
    print(f"执行命令: {' '.join(cmd)}")
    if dry_run:
        return '', '', 0
      # 添加 encoding='utf-8' 和 errors='ignore' 处理编码问题
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, 
                           encoding='utf-8', errors='ignore')
    return result.stdout, result.stderr, result.returncode

def get_git_status():
    """获取 Git 状态"""
    stdout, stderr, code = run_command(['git', 'status', '--porcelain'])
    if code != 0:
        print(f"获取状态失败: {stderr}")
        return None
    return stdout.strip()

def generate_commit_message():
    """自动生成提交信息"""
    stdout, stderr, code = run_command(['git', 'diff', '--stat'])
    if code != 0:
        return "更新代码"
    
    lines = stdout.strip().split('\n')
    if not lines:
        return "更新代码"
    
    num_files = len(lines) - 1
    message = f"更新代码 ({num_files} 个文件修改)\n\n"
    
    for line in lines[:5]:
        if '|' in line:
            filename = line.split('|')[0].strip()
            message += f"- {filename}\n"
    
    if num_files > 5:
        message += f"- ... 还有 {num_files - 5} 个文件\n"
    
    return message.strip()

def main():
    parser = argparse.ArgumentParser(description='自动推送项目到 GitHub')
    parser.add_argument('-m', '--message', help='自定义提交信息')
    parser.add_argument('--dry-run', action='store_true', help='预览模式')
    args = parser.parse_args()
    
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(project_root)
    
    if not os.path.exists('.git'):
        print("错误：当前目录不是 Git 仓库")
        return
    
    status = get_git_status()
    if status is None:
        return
    
    if not status:
        print("没有需要提交的修改")
        return
    
    print("\n=== Git 状态 ===")
    stdout, _, _ = run_command(['git', 'status'])
    print(stdout)
    
    if args.message:
        commit_msg = args.message
    else:
        commit_msg = generate_commit_message()
    
    print(f"\n=== 提交信息 ===")
    print(commit_msg)
    
    if not args.dry_run:
        confirm = input("\n确认推送? (y/N): ")
        if confirm.lower() != 'y':
            print("取消推送")
            return
    
    print("\n=== 添加文件 ===")
    stdout, stderr, code = run_command(['git', 'add', '.'], dry_run=args.dry_run)
    if code != 0 and not args.dry_run:
        print(f"添加文件失败: {stderr}")
        return
    print("文件添加成功")
    
    print("\n=== 提交 ===")
    stdout, stderr, code = run_command(['git', 'commit', '-m', commit_msg], dry_run=args.dry_run)
    if code != 0 and not args.dry_run:
        print(f"提交失败: {stderr}")
        return
    print("提交成功")
    
    print("\n=== 推送到 GitHub ===")
    stdout, stderr, code = run_command(['git', 'push', 'origin', 'main'], dry_run=args.dry_run)
    if code != 0 and not args.dry_run:
        print(f"推送失败: {stderr}")
        return
    print("推送成功!")
    
    print(f"\n=== 完成 ===")
    print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("项目已成功推送到 GitHub!")

if __name__ == '__main__':
    main()
