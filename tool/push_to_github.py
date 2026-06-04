#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动推送项目到 GitHub 的脚本
使用方法:
    python tool/push_to_github.py              # 默认推送（自动生成提交信息）
    python tool/push_to_github.py -m "信息"    # 自定义提交信息
    python tool/push_to_github.py --dry-run    # 预览模式
    python tool/push_to_github.py -f           # 强制推送（覆盖远程）
    python tool/push_to_github.py -b main      # 指定分支推送
"""

import os
import subprocess
import argparse
import sys
from datetime import datetime


def run_command(cmd, cwd=None, dry_run=False):
    """运行命令"""
    print(f"执行命令: {' '.join(cmd)}")
    if dry_run:
        return '', '', 0
    try:
        result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True,
                               encoding='utf-8', errors='ignore')
        return result.stdout, result.stderr, result.returncode
    except Exception as e:
        print(f"命令执行异常: {e}")
        return '', str(e), 1


def get_git_status():
    """获取 Git 状态（porcelain 格式）"""
    stdout, stderr, code = run_command(['git', 'status', '--porcelain'])
    if code != 0:
        print(f"获取状态失败: {stderr}")
        return None
    return stdout.strip()


def has_uncommitted_changes():
    """检查是否有未提交的更改"""
    status = get_git_status()
    return status is not None and len(status) > 0


def has_unpushed_commits(branch='main'):
    """检查是否有未推送的提交"""
    stdout, stderr, code = run_command(['git', 'rev-list', '--count', f'origin/{branch}..{branch}'])
    if code != 0:
        return True
    count = int(stdout.strip())
    return count > 0


def has_remote_branch(branch='main'):
    """检查远程分支是否存在"""
    stdout, stderr, code = run_command(['git', 'ls-remote', '--heads', 'origin', branch])
    if code != 0:
        return False
    return len(stdout.strip()) > 0


def has_initial_commit():
    """检查是否已有初始提交"""
    stdout, stderr, code = run_command(['git', 'rev-parse', '--verify', 'HEAD'])
    return code == 0


def generate_commit_message():
    """自动生成提交信息"""
    stdout, stderr, code = run_command(['git', 'diff', '--stat'])
    if code != 0:
        return "更新代码"

    lines = stdout.strip().split('\n')
    if not lines:
        return "更新代码"

    num_files = len(lines) - 1
    if num_files == 0:
        return "更新代码"

    message = f"更新代码 ({num_files} 个文件修改)\n\n"

    for line in lines[:5]:
        if '|' in line:
            filename = line.split('|')[0].strip()
            message += f"- {filename}\n"

    if num_files > 5:
        message += f"- ... 还有 {num_files - 5} 个文件\n"

    return message.strip()


def pull_with_rebase(branch='main', dry_run=False):
    """拉取远程并合并"""
    print("\n=== 拉取远程更新 ===")
    stdout, stderr, code = run_command(['git', 'pull', '--rebase', 'origin', branch], dry_run=dry_run)
    if code != 0 and not dry_run:
        print(f"拉取失败: {stderr}")
        print("尝试使用合并方式拉取...")
        stdout, stderr, code = run_command(['git', 'pull', '--allow-unrelated-histories', 'origin', branch], dry_run=dry_run)
        if code != 0 and not dry_run:
            print(f"合并拉取也失败: {stderr}")
            print("错误：无法同步远程仓库，请手动处理冲突后重试")
            return False
    print("拉取成功")
    return True


def main():
    parser = argparse.ArgumentParser(description='自动推送项目到 GitHub')
    parser.add_argument('-m', '--message', help='自定义提交信息')
    parser.add_argument('--dry-run', action='store_true', help='预览模式（不执行实际操作）')
    parser.add_argument('-f', '--force', action='store_true', help='强制推送（覆盖远程）')
    parser.add_argument('-b', '--branch', default='main', help='指定分支（默认 main）')
    args = parser.parse_args()

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(project_root)

    if not os.path.exists('.git'):
        print("错误：当前目录不是 Git 仓库")
        print("请先运行: git init")
        sys.exit(1)

    print(f"\n=== Git 推送脚本 ===")
    print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"工作目录: {project_root}")
    print(f"目标分支: {args.branch}")

    has_changes = has_uncommitted_changes()
    has_pushed = has_unpushed_commits(args.branch)
    has_remote = has_remote_branch(args.branch)
    has_commit = has_initial_commit()

    if not has_changes and not has_pushed:
        print("\n=== 状态检查 ===")
        print("没有需要提交的修改，也没有未推送的提交")
        print("项目已与远程同步")
        sys.exit(0)

    print("\n=== Git 状态 ===")
    stdout, _, _ = run_command(['git', 'status'])
    print(stdout)

    if args.message:
        commit_msg = args.message
    elif has_changes:
        commit_msg = generate_commit_message()
    else:
        commit_msg = "更新代码"

    print(f"\n=== 提交信息 ===")
    print(commit_msg)

    if not args.dry_run:
        confirm = input("\n确认推送? (y/N): ")
        if confirm.lower() != 'y':
            print("取消推送")
            sys.exit(0)

    if has_changes:
        print("\n=== 添加文件 ===")
        stdout, stderr, code = run_command(['git', 'add', '.'], dry_run=args.dry_run)
        if code != 0 and not args.dry_run:
            print(f"添加文件失败: {stderr}")
            sys.exit(1)
        print("文件添加成功")

        print("\n=== 提交 ===")
        stdout, stderr, code = run_command(['git', 'commit', '-m', commit_msg], dry_run=args.dry_run)
        if code != 0 and not args.dry_run:
            print(f"提交失败: {stderr}")
            sys.exit(1)
        print("提交成功")

    if has_remote and has_commit and not args.force:
        if not pull_with_rebase(args.branch, args.dry_run):
            sys.exit(1)

    print("\n=== 推送到 GitHub ===")
    push_cmd = ['git', 'push', 'origin', args.branch]
    if args.force:
        push_cmd.append('--force')
    if not has_commit:
        push_cmd.append('-u')

    stdout, stderr, code = run_command(push_cmd, dry_run=args.dry_run)
    if code != 0 and not args.dry_run:
        print(f"推送失败: {stderr}")

        if "rejected" in stderr and "fetch first" in stderr:
            print("\n远程仓库有更新，请先拉取")
            if pull_with_rebase(args.branch, args.dry_run):
                print("\n重新推送...")
                stdout, stderr, code = run_command(push_cmd, dry_run=args.dry_run)
                if code != 0 and not args.dry_run:
                    print(f"再次推送失败: {stderr}")
                    sys.exit(1)
            else:
                sys.exit(1)
        else:
            sys.exit(1)

    print("推送成功!")

    print(f"\n=== 完成 ===")
    print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"分支: {args.branch}")
    print("项目已成功推送到 GitHub!")


if __name__ == '__main__':
    main()