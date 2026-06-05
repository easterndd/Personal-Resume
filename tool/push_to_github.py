#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动拉取和推送项目到 GitHub 的脚本
使用方法:
    python tool/push_to_github.py              # 默认推送（自动生成提交信息）
    python tool/push_to_github.py -m "信息"    # 自定义提交信息
    python tool/push_to_github.py --dry-run    # 预览模式
    python tool/push_to_github.py -f           # 强制推送（覆盖远程）
    python tool/push_to_github.py -b main      # 指定分支推送
    python tool/push_to_github.py -c <url>     # 克隆指定仓库
    python tool/push_to_github.py --pull       # 仅拉取远程更新
    python tool/push_to_github.py --setup-remote <url>  # 设置远程仓库
    python tool/push_to_github.py --sync       # 同步模式（先拉取后推送）
"""

import os
import subprocess
import argparse
import sys
from datetime import datetime


def run_command(cmd, cwd=None, dry_run=False, show_output=True):
    """运行命令"""
    if show_output:
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
    stdout, stderr, code = run_command(['git', 'status', '--porcelain'], show_output=False)
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
    stdout, stderr, code = run_command(['git', 'rev-list', '--count', f'origin/{branch}..{branch}'], show_output=False)
    if code != 0:
        return True
    try:
        count = int(stdout.strip())
        return count > 0
    except:
        return False


def has_remote_branch(branch='main'):
    """检查远程分支是否存在"""
    stdout, stderr, code = run_command(['git', 'ls-remote', '--heads', 'origin', branch], show_output=False)
    if code != 0:
        return False
    return len(stdout.strip()) > 0


def has_initial_commit():
    """检查是否已有初始提交"""
    stdout, stderr, code = run_command(['git', 'rev-parse', '--verify', 'HEAD'], show_output=False)
    return code == 0


def get_current_branch():
    """获取当前分支名称"""
    stdout, stderr, code = run_command(['git', 'branch', '--show-current'], show_output=False)
    if code != 0:
        return 'main'
    return stdout.strip() or 'main'


def get_local_commit_hash(branch='main'):
    """获取本地分支的最新提交 hash"""
    stdout, stderr, code = run_command(['git', 'rev-parse', branch], show_output=False)
    if code != 0:
        return None
    return stdout.strip()


def get_remote_commit_hash(branch='main'):
    """获取远程分支的最新提交 hash"""
    stdout, stderr, code = run_command(['git', 'rev-parse', f'origin/{branch}'], show_output=False)
    if code != 0:
        return None
    return stdout.strip()


def generate_commit_message():
    """自动生成提交信息"""
    stdout, stderr, code = run_command(['git', 'diff', '--stat'], show_output=False)
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


def clone_repository(repo_url, target_dir=None, dry_run=False):
    """克隆仓库"""
    print("\n=== 克隆仓库 ===")
    cmd = ['git', 'clone', repo_url]
    if target_dir:
        cmd.append(target_dir)
    
    stdout, stderr, code = run_command(cmd, dry_run=dry_run)
    if code != 0 and not dry_run:
        print(f"克隆失败: {stderr}")
        return False
    print("克隆成功")
    return True


def setup_remote(repo_url, dry_run=False):
    """设置远程仓库"""
    print("\n=== 设置远程仓库 ===")
    
    stdout, stderr, code = run_command(['git', 'remote', 'remove', 'origin'], dry_run=dry_run, show_output=False)
    if code != 0 and not dry_run and "not found" not in stderr:
        print(f"移除旧远程失败: {stderr}")
    
    stdout, stderr, code = run_command(['git', 'remote', 'add', 'origin', repo_url], dry_run=dry_run)
    if code != 0 and not dry_run:
        print(f"设置远程失败: {stderr}")
        return False
    print(f"远程仓库设置为: {repo_url}")
    return True


def stash_changes(dry_run=False):
    """暂存未提交的更改"""
    print("\n=== 暂存工作区更改 ===")
    stdout, stderr, code = run_command(['git', 'stash', 'push', '-m', 'auto-stash-before-pull'], dry_run=dry_run)
    if code != 0 and not dry_run:
        print(f"暂存失败: {stderr}")
        return False
    print("工作区已暂存")
    return True


def unstash_changes(dry_run=False):
    """恢复暂存的更改"""
    print("\n=== 恢复工作区更改 ===")
    stdout, stderr, code = run_command(['git', 'stash', 'pop'], dry_run=dry_run)
    if code != 0 and not dry_run:
        print(f"恢复失败: {stderr}")
        print("提示: 可能有冲突，请手动解决后运行 'git stash drop'")
        return False
    print("工作区已恢复")
    return True


def fetch_remote(branch='main', dry_run=False, retry=3):
    """拉取远程信息（带重试）"""
    print(f"\n=== 获取远程更新 (分支: {branch}) ===")
    
    for attempt in range(retry):
        if attempt > 0:
            print(f"重试第 {attempt + 1} 次...")
        
        stdout, stderr, code = run_command(['git', 'fetch', 'origin', branch], dry_run=dry_run)
        if code != 0 and not dry_run:
            print(f"获取失败: {stderr}")
            if attempt < retry - 1:
                import time
                time.sleep(2)
                continue
            return False
        
        if not dry_run:
            # 更新远程跟踪分支信息
            run_command(['git', 'remote', 'update', 'origin', '--prune'], show_output=False)
        
        print("获取成功")
        return True
    
    return False


def check_remote_updates(branch='main'):
    """检查远程是否有更新（返回更新的提交数量）"""
    local_hash = get_local_commit_hash(branch)
    remote_hash = get_remote_commit_hash(branch)
    
    if not local_hash or not remote_hash:
        return 0, "无法获取提交信息"
    
    if local_hash == remote_hash:
        return 0, "本地与远程一致"
    
    # 检查远程是否有本地没有的提交
    stdout, stderr, code = run_command(
        ['git', 'rev-list', '--count', f'{local_hash}..{remote_hash}'],
        show_output=False
    )
    
    if code != 0:
        return 0, "无法比较提交"
    
    try:
        count = int(stdout.strip())
        if count > 0:
            return count, f"远程领先 {count} 个提交"
        return 0, "本地与远程一致"
    except:
        return 0, "无法解析提交数量"


def pull_with_rebase(branch='main', dry_run=False):
    """拉取远程并合并（优先 rebase）"""
    print(f"\n=== 拉取远程更新 (分支: {branch}) ===")
    
    # 先 fetch 确保远程信息是最新的
    if not fetch_remote(branch, dry_run):
        return False
    
    # 检查是否有更新
    update_count, update_msg = check_remote_updates(branch)
    print(f"更新状态: {update_msg}")
    
    if update_count == 0:
        print("没有需要拉取的更新")
        return True
    
    # 尝试 rebase
    stdout, stderr, code = run_command(['git', 'pull', '--rebase', 'origin', branch], dry_run=dry_run)
    if code != 0 and not dry_run:
        print(f"Rebase 失败: {stderr}")
        
        if "CONFLICT" in stderr or "conflict" in stderr.lower():
            print("\n检测到冲突！")
            print("请手动解决冲突后运行:")
            print("  git rebase --continue  # 继续完成 rebase")
            print("  或 git rebase --abort  # 放弃 rebase")
            return False
        
        print("尝试使用合并方式拉取...")
        return try_merge_pull(branch, dry_run)
    
    print("拉取成功")
    return True


def try_merge_pull(branch='main', dry_run=False):
    """尝试使用 merge 方式拉取"""
    stdout, stderr, code = run_command(['git', 'pull', '--allow-unrelated-histories', 'origin', branch], dry_run=dry_run)
    if code != 0 and not dry_run:
        print(f"合并拉取失败: {stderr}")
        if "CONFLICT" in stderr or "conflict" in stderr.lower():
            print("错误：合并时发生冲突，请手动解决冲突后重试")
        else:
            print("错误：无法同步远程仓库，请手动处理")
        return False
    print("合并拉取成功")
    return True


def show_conflicts():
    """显示冲突文件"""
    stdout, stderr, code = run_command(['git', 'diff', '--name-only', '--diff-filter=U'], show_output=False)
    if code != 0:
        return []
    files = stdout.strip().split('\n')
    return [f for f in files if f]


def show_commit_diff(branch='main'):
    """显示本地和远程的提交差异"""
    local_hash = get_local_commit_hash(branch)
    remote_hash = get_remote_commit_hash(branch)
    
    if not local_hash or not remote_hash:
        return
    
    if local_hash == remote_hash:
        return
    
    print("\n=== 远程新提交 ===")
    stdout, stderr, code = run_command(
        ['git', 'log', '--oneline', f'{local_hash}..{remote_hash}'],
        show_output=False
    )
    if code == 0 and stdout.strip():
        print(stdout.strip())


def main():
    parser = argparse.ArgumentParser(description='自动拉取和推送项目到 GitHub')
    parser.add_argument('-m', '--message', help='自定义提交信息')
    parser.add_argument('--dry-run', action='store_true', help='预览模式（不执行实际操作）')
    parser.add_argument('-f', '--force', action='store_true', help='强制推送（覆盖远程）')
    parser.add_argument('-b', '--branch', default='main', help='指定分支（默认 main）')
    parser.add_argument('-c', '--clone', help='克隆指定仓库 URL')
    parser.add_argument('--pull', action='store_true', help='仅拉取远程更新')
    parser.add_argument('--setup-remote', help='设置远程仓库 URL')
    parser.add_argument('--fetch', action='store_true', help='仅获取远程信息')
    parser.add_argument('--check-updates', action='store_true', help='检查是否有远程更新')
    parser.add_argument('--sync', action='store_true', help='同步模式（先拉取后推送）')
    args = parser.parse_args()

    print(f"\n{'='*50}")
    print(f"Git 操作脚本")
    print(f"{'='*50}")
    print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    if args.clone:
        target_dir = args.branch if args.branch != 'main' else None
        if clone_repository(args.clone, target_dir, args.dry_run):
            if target_dir:
                os.chdir(target_dir)
            else:
                repo_name = args.clone.split('/')[-1].replace('.git', '')
                os.chdir(repo_name)
            print(f"\n仓库已克隆到: {os.getcwd()}")
        sys.exit(0)

    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(project_root)
    print(f"工作目录: {project_root}")

    if not os.path.exists('.git'):
        print("错误：当前目录不是 Git 仓库")
        print("请先运行: git init 或使用 -c 参数克隆仓库")
        sys.exit(1)

    if args.setup_remote:
        if setup_remote(args.setup_remote, args.dry_run):
            print("远程仓库设置完成")
        sys.exit(0)

    # 获取当前分支
    current_branch = get_current_branch()
    target_branch = args.branch if args.branch != 'main' else current_branch
    print(f"当前分支: {current_branch}")
    print(f"目标分支: {target_branch}")

    # 先 fetch 获取最新远程信息
    print("\n=== 获取远程信息 ===")
    fetch_remote(target_branch, args.dry_run)

    if args.fetch:
        print("获取完成")
        sys.exit(0)

    # 检查远程更新
    update_count, update_msg = check_remote_updates(target_branch)
    
    if args.check_updates:
        print(f"\n更新状态: {update_msg}")
        if update_count > 0:
            show_commit_diff(target_branch)
        sys.exit(0)

    has_changes = has_uncommitted_changes()
    has_pushed = has_unpushed_commits(target_branch)
    has_remote = has_remote_branch(target_branch)
    has_commit = has_initial_commit()

    # 显示当前状态
    print(f"\n=== 当前状态 ===")
    print(f"工作区更改: {'有' if has_changes else '无'}")
    print(f"未推送提交: {'有' if has_pushed else '无'}")
    print(f"远程更新: {update_msg}")

    if args.pull or args.sync:
        print(f"\n{'='*50}")
        print("拉取模式")
        print(f"{'='*50}")
        
        if update_count == 0:
            print("没有需要拉取的更新")
        else:
            show_commit_diff(target_branch)
            
            if has_changes:
                print("\n警告：工作区有未提交的更改")
                if not args.dry_run:
                    confirm = input("是否暂存更改后拉取? (y/N): ")
                    if confirm.lower() == 'y':
                        if not stash_changes(args.dry_run):
                            sys.exit(1)
                        if not pull_with_rebase(target_branch, args.dry_run):
                            unstash_changes(args.dry_run)
                            sys.exit(1)
                        unstash_changes(args.dry_run)
                    else:
                        print("取消拉取")
                        sys.exit(0)
                else:
                    print("[预览] 将暂存更改后拉取")
            else:
                if not pull_with_rebase(target_branch, args.dry_run):
                    sys.exit(1)
        
        if args.pull:
            print("\n拉取完成")
            sys.exit(0)

    if not has_changes and not has_pushed and update_count == 0:
        print("\n项目已与远程同步，无需操作")
        sys.exit(0)

    # 显示远程更新信息
    if update_count > 0:
        print(f"\n{'='*50}")
        print(f"警告: 远程有 {update_count} 个新提交!")
        print(f"{'='*50}")
        show_commit_diff(target_branch)
        
        if not args.dry_run:
            confirm = input("\n是否先拉取远程更新? (y/N): ")
            if confirm.lower() == 'y':
                if has_changes:
                    if not stash_changes(args.dry_run):
                        sys.exit(1)
                
                if not pull_with_rebase(target_branch, args.dry_run):
                    if has_changes:
                        unstash_changes(args.dry_run)
                    sys.exit(1)
                
                if has_changes:
                    unstash_changes(args.dry_run)
                    has_changes = True
                
                # 重新检查状态
                update_count, _ = check_remote_updates(target_branch)

    print(f"\n{'='*50}")
    print("Git 状态")
    print(f"{'='*50}")
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

    # 再次检查远程更新
    if has_remote and has_commit and not args.force:
        fetch_remote(target_branch, args.dry_run)
        update_count, _ = check_remote_updates(target_branch)
        if update_count > 0:
            print(f"\n警告: 远程有 {update_count} 个新提交")
            if not args.dry_run:
                confirm = input("是否先拉取远程更新? (y/N): ")
                if confirm.lower() == 'y':
                    if not pull_with_rebase(target_branch, args.dry_run):
                        sys.exit(1)

    print(f"\n{'='*50}")
    print("推送到 GitHub")
    print(f"{'='*50}")
    push_cmd = ['git', 'push', 'origin', target_branch]
    if args.force:
        push_cmd.append('--force')
    if not has_commit:
        push_cmd.append('-u')

    stdout, stderr, code = run_command(push_cmd, dry_run=args.dry_run)
    if code != 0 and not args.dry_run:
        print(f"推送失败: {stderr}")

        if "rejected" in stderr and "fetch first" in stderr:
            print("\n远程仓库有更新，请先拉取")
            if not args.dry_run:
                confirm = input("是否自动拉取并重试? (y/N): ")
                if confirm.lower() == 'y':
                    if pull_with_rebase(target_branch, args.dry_run):
                        print("\n重新推送...")
                        stdout, stderr, code = run_command(push_cmd, dry_run=args.dry_run)
                        if code != 0 and not args.dry_run:
                            print(f"再次推送失败: {stderr}")
                            sys.exit(1)
                    else:
                        sys.exit(1)
            else:
                sys.exit(1)
        else:
            sys.exit(1)

    print("\n推送成功!")

    print(f"\n{'='*50}")
    print("完成")
    print(f"{'='*50}")
    print(f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"分支: {target_branch}")
    print("项目已成功推送到 GitHub!")


if __name__ == '__main__':
    main()