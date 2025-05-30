# !/usr/bin/python3
# -*- coding: utf-8 -*-
"""
@Author         :  yshan2028
@Version        :  V1.0.0
------------------------------------
@File           :  add_header.py
@Description    :  文件头注释添加工具，为项目中的Python文件添加标准的文件头注释
@CreateTime     :  2025/05/30 14:40
@Software       :  
------------------------------------
@ModifyTime     :  2025/05/30 14:40
"""

import os
import sys
import datetime
import json
import subprocess
import re
from pathlib import Path

# 默认配置
DEFAULT_CONFIG = {
    "skip_dirs": [
        "venv", "env", ".venv", ".env", "__pycache__",
        ".git", ".pytest_cache", "node_modules", "dist",
        "build", ".tox", "site-packages", "lib", "Scripts",
        "bin", "include", "share", ".idea", ".vscode"
    ],
    "author": "",
    "email": "",
    "license": "",
    "company": "",
    "version": "",
    "project_name": "",
    "repository": "",
    "show_file_path": True,
    "show_description": True,  # 是否显示描述字段
    "default_description": "",  # 默认描述
    "auto_detect_license": True
}


def load_config():
    """
    加载配置文件，如果不存在则创建默认配置

    Returns:
        dict: 配置信息
    """
    config_file = "header_config.json"

    if os.path.exists(config_file):
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                config = json.load(f)
            return {**DEFAULT_CONFIG, **config}
        except Exception as e:
            print(f"配置文件读取失败，使用默认配置: {e}")

    return DEFAULT_CONFIG.copy()


def save_config(config):
    """
    保存配置到文件

    Args:
        config (dict): 配置信息
    """
    config_file = "header_config.json"
    try:
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        print(f"✓ 配置已保存到 {config_file}")
    except Exception as e:
        print(f"✗ 配置保存失败: {e}")


def get_git_info():
    """
    获取Git仓库信息

    Returns:
        dict: Git信息 (user.name, user.email, remote.origin.url, repo_name)
    """
    git_info = {}

    try:
        # 获取Git用户名
        result = subprocess.run(['git', 'config', 'user.name'],
                                capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            git_info['author'] = result.stdout.strip()
    except:
        pass

    try:
        # 获取Git邮箱
        result = subprocess.run(['git', 'config', 'user.email'],
                                capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            git_info['email'] = result.stdout.strip()
    except:
        pass

    try:
        # 获取远程仓库URL
        result = subprocess.run(['git', 'config', '--get', 'remote.origin.url'],
                                capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            remote_url = result.stdout.strip()
            git_info['repository'] = remote_url

            # 从URL中提取仓库名
            if 'github.com' in remote_url:
                # 处理不同格式的GitHub URL
                if remote_url.endswith('.git'):
                    remote_url = remote_url[:-4]
                if remote_url.startswith('git@github.com:'):
                    repo_path = remote_url.replace('git@github.com:', '')
                elif 'github.com/' in remote_url:
                    repo_path = remote_url.split('github.com/')[-1]
                else:
                    repo_path = os.path.basename(remote_url)

                git_info['project_name'] = repo_path.split('/')[-1]
                git_info['repository'] = f"https://github.com/{repo_path}"
    except:
        pass

    return git_info


def detect_license():
    """
    自动检测项目许可证

    Returns:
        str: 许可证类型
    """
    # 检查常见的许可证文件
    license_files = ['LICENSE', 'LICENSE.txt', 'LICENSE.md', 'license', 'license.txt']

    for license_file in license_files:
        if os.path.exists(license_file):
            try:
                with open(license_file, 'r', encoding='utf-8') as f:
                    content = f.read().upper()

                    # 检测常见许可证类型
                    if 'MIT LICENSE' in content or 'MIT' in content:
                        return 'MIT License'
                    elif 'APACHE LICENSE' in content or 'APACHE 2.0' in content:
                        return 'Apache License 2.0'
                    elif 'GNU GENERAL PUBLIC LICENSE' in content or 'GPL' in content:
                        if 'VERSION 3' in content:
                            return 'GPL-3.0 License'
                        elif 'VERSION 2' in content:
                            return 'GPL-2.0 License'
                        else:
                            return 'GPL License'
                    elif 'BSD LICENSE' in content or 'BSD' in content:
                        return 'BSD License'
                    else:
                        return 'Custom License'
            except:
                continue

    return ''


def detect_project_version():
    """
    自动检测项目版本

    Returns:
        str: 项目版本
    """
    # 检查 setup.py
    if os.path.exists('setup.py'):
        try:
            with open('setup.py', 'r', encoding='utf-8') as f:
                content = f.read()
                # 寻找版本信息
                version_patterns = [
                    r'version\s*=\s*["\']([^"\']+)["\']',
                    r'__version__\s*=\s*["\']([^"\']+)["\']'
                ]
                for pattern in version_patterns:
                    match = re.search(pattern, content, re.IGNORECASE)
                    if match:
                        return match.group(1)
        except:
            pass

    # 检查 pyproject.toml
    if os.path.exists('pyproject.toml'):
        try:
            with open('pyproject.toml', 'r', encoding='utf-8') as f:
                content = f.read()
                match = re.search(r'version\s*=\s*["\']([^"\']+)["\']', content)
                if match:
                    return match.group(1)
        except:
            pass

    # 检查 package.json (如果是混合项目)
    if os.path.exists('package.json'):
        try:
            with open('package.json', 'r', encoding='utf-8') as f:
                import json as json_lib
                data = json_lib.load(f)
                if 'version' in data:
                    return data['version']
        except:
            pass

    # 检查 __init__.py 中的版本信息
    init_files = ['__init__.py', 'src/__init__.py']
    for init_file in init_files:
        if os.path.exists(init_file):
            try:
                with open(init_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    match = re.search(r'__version__\s*=\s*["\']([^"\']+)["\']', content)
                    if match:
                        return match.group(1)
            except:
                continue

    return ''


def get_project_info():
    """
    获取项目信息

    Returns:
        dict: 项目信息
    """
    info = {}

    # 尝试从当前目录名获取项目名
    current_dir = os.path.basename(os.getcwd())
    info['project_name'] = current_dir

    # 自动检测版本
    version = detect_project_version()
    if version:
        info['version'] = version

    # 自动检测许可证
    license_type = detect_license()
    if license_type:
        info['license'] = license_type

    return info


def setup_config():
    """
    交互式设置配置

    Returns:
        dict: 配置信息
    """
    config = load_config()
    git_info = get_git_info()
    project_info = get_project_info()

    print("🔧 配置设置")
    print("=" * 60)

    # 作者信息
    default_author = git_info.get('author', config.get('author', ''))
    author = input(f"作者姓名 [{default_author}]: ").strip()
    config['author'] = author if author else default_author

    # 邮箱信息
    default_email = git_info.get('email', config.get('email', ''))
    email = input(f"邮箱地址 [{default_email}]: ").strip()
    config['email'] = email if email else default_email

    # 公司/组织信息
    default_company = config.get('company', '')
    company = input(f"公司/组织 (可选) [{default_company}]: ").strip()
    config['company'] = company

    # 项目名称
    default_project = project_info.get('project_name', git_info.get('project_name', ''))
    project_name = input(f"项目名称 [{default_project}]: ").strip()
    config['project_name'] = project_name if project_name else default_project

    # 许可证（自动检测）
    default_license = project_info.get('license', config.get('license', ''))
    if default_license:
        license_type = input(f"许可证类型 (自动检测) [{default_license}]: ").strip()
        config['license'] = license_type if license_type else default_license
    else:
        license_type = input("许可证类型 (可选): ").strip()
        config['license'] = license_type

    # 版本（自动检测）
    default_version = project_info.get('version', config.get('version', ''))
    if default_version:
        version = input(f"项目版本 (自动检测) [{default_version}]: ").strip()
        config['version'] = version if version else default_version
    else:
        version = input("项目版本 (可选): ").strip()
        config['version'] = version

    # 是否显示文件路径
    default_show_path = config.get('show_file_path', True)
    show_path = input(f"是否显示完整文件路径？(y/n) [{'y' if default_show_path else 'n'}]: ").strip().lower()
    if show_path:
        config['show_file_path'] = show_path in ['y', 'yes']
    else:
        config['show_file_path'] = default_show_path

    # 是否显示描述字段
    default_show_desc = config.get('show_description', True)
    show_desc = input(f"是否显示描述字段？(y/n) [{'y' if default_show_desc else 'n'}]: ").strip().lower()
    if show_desc:
        config['show_description'] = show_desc in ['y', 'yes']
        if config['show_description']:
            default_desc = config.get('default_description', '')
            desc_text = input(f"默认描述文本 [{default_desc}]: ").strip()
            config['default_description'] = desc_text if desc_text else default_desc
    else:
        config['show_description'] = default_show_desc

    # 仓库URL
    default_repo = git_info.get('repository', config.get('repository', ''))
    if default_repo:
        repository = input(f"仓库URL (自动检测) [{default_repo}]: ").strip()
        config['repository'] = repository if repository else default_repo
    else:
        repository = input("仓库URL (可选): ").strip()
        if repository:
            config['repository'] = repository

    save_config(config)
    return config


def get_file_creation_time(file_path):
    """
    获取文件创建时间

    Args:
        file_path (str): 文件路径

    Returns:
        datetime: 文件创建时间
    """
    try:
        # 在Windows上使用创建时间，在Unix系统上使用修改时间
        if os.name == 'nt':
            timestamp = os.path.getctime(file_path)
        else:
            # Unix系统通常没有创建时间，使用修改时间
            stat = os.stat(file_path)
            timestamp = getattr(stat, 'st_birthtime', stat.st_mtime)
        return datetime.datetime.fromtimestamp(timestamp)
    except:
        return datetime.datetime.now()


def get_relative_file_path(file_path, project_root):
    """
    获取相对于项目根目录的文件路径

    Args:
        file_path (str): 绝对文件路径
        project_root (str): 项目根目录

    Returns:
        str: 相对路径
    """
    try:
        return os.path.relpath(file_path, project_root)
    except:
        return os.path.basename(file_path)


def get_file_header(file_path, config, creation_time=None, project_root=None):
    """
    生成文件头注释

    Args:
        file_path (str): 文件路径
        config (dict): 配置信息
        creation_time (datetime): 文件创建时间
        project_root (str): 项目根目录

    Returns:
        str: 格式化的文件头注释
    """
    current_time = datetime.datetime.now()
    if creation_time is None:
        creation_time = get_file_creation_time(file_path)

    filename = os.path.basename(file_path)

    # 获取文件路径信息
    if config.get('show_file_path', True) and project_root:
        relative_path = get_relative_file_path(file_path, project_root)
        file_display = relative_path
    else:
        file_display = filename

    # 构建文件头 - 按照新格式，包含所有原始参数
    header_lines = []
    header_lines.append("# !/usr/bin/python3")
    header_lines.append("# -*- coding: utf-8 -*-")
    header_lines.append('"""')

    # 作者信息
    if config.get('author'):
        author_value = config['author']
        if config.get('email'):
            author_value += f" <{config['email']}>"
        header_lines.append(f"@Author         :  {author_value}")
    else:
        header_lines.append("@Author         :  ")

    # 版本信息
    if config.get('version'):
        header_lines.append(f"@Version        :  {config['version']}")
    else:
        header_lines.append("@Version        :  V1.0.0")

    # 分隔线
    header_lines.append("------------------------------------")

    # 文件信息
    header_lines.append(f"@File           :  {file_display}")

    # 描述信息
    if config.get('show_description', True):
        desc_text = config.get('default_description', '')
        header_lines.append(f"@Description    :  {desc_text}")
    else:
        header_lines.append("@Description    :  ")

    # 创建时间
    header_lines.append(f"@CreateTime     :  {creation_time.strftime('%Y/%m/%d %H:%M')}")

    # 项目信息
    if config.get('project_name'):
        header_lines.append(f"@Project        :  {config['project_name']}")

    # 许可证信息
    if config.get('license'):
        header_lines.append(f"@License        :  {config['license']}")

    # 仓库信息
    if config.get('repository'):
        header_lines.append(f"@Repository     :  {config['repository']}")

    # 软件信息（公司）
    if config.get('company'):
        header_lines.append(f"@Software       :  {config['company']}")
    else:
        header_lines.append("@Software       :  ")

    # 分隔线
    header_lines.append("------------------------------------")

    # 修改时间
    header_lines.append(f"@ModifyTime     :  {current_time.strftime('%Y/%m/%d %H:%M')}")

    header_lines.append('"""')
    header_lines.append("")
    header_lines.append("")

    return '\n'.join(header_lines)


def parse_python_file(file_content):
    """
    解析Python文件，分离文件头、导入语句和其他代码

    Args:
        file_content (str): 文件内容

    Returns:
        tuple: (existing_header_end_line, imports_start_line, has_existing_header, creation_time)
    """
    lines = file_content.split('\n')

    # 查找现有文件头的结束位置
    header_end_line = 0
    in_docstring = False
    docstring_quote = None
    has_existing_header = False
    creation_time = None

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # 跳过shebang和编码声明
        if line.startswith('#!') or line.startswith('# -*- coding') or line.startswith('# coding') or line.startswith('# !/usr/bin/python'):
            header_end_line = i + 1
            i += 1
            continue

        # 跳过空行和普通注释
        if not line or line.startswith('#'):
            if header_end_line <= i:
                header_end_line = i + 1
            i += 1
            continue

        # 检查是否是文档字符串开始
        if not in_docstring:
            if line.startswith('"""') or line.startswith("'''"):
                docstring_quote = line[:3]
                in_docstring = True

                # 检查是否是文件头文档字符串
                # 查看接下来几行是否包含文件头信息
                lookahead_lines = lines[i:min(i + 30, len(lines))]
                lookahead_text = '\n'.join(lookahead_lines)
                if any(keyword in lookahead_text for keyword in
                       ['@Author', '@Version', '@File', '@Description', '@CreateTime', '@ModifyTime', '@Software', '@Project', '@License', '@Repository', '----']):
                    has_existing_header = True

                    # 尝试提取创建时间
                    for look_line in lookahead_lines:
                        if '@CreateTime' in look_line and ':' in look_line:
                            try:
                                time_str = look_line.split(':', 1)[1].strip()
                                creation_time = datetime.datetime.strptime(time_str, '%Y/%m/%d %H:%M')
                            except:
                                pass
                            break

                # 检查是否在同一行结束
                if line.count(docstring_quote) >= 2 and len(line) > 3:
                    in_docstring = False
                    if has_existing_header:
                        header_end_line = i + 1
                    break
                i += 1
                continue

        # 在文档字符串内
        if in_docstring:
            if docstring_quote in line:
                in_docstring = False
                if has_existing_header:
                    header_end_line = i + 1
                i += 1
                break
            i += 1
            continue

        # 遇到import/from语句或其他代码，停止
        if line.startswith('import ') or line.startswith('from ') or \
                (line and not line.startswith('#') and line != ''):
            break

        i += 1

    # 查找imports开始的位置
    imports_start_line = header_end_line
    for j in range(header_end_line, len(lines)):
        line = lines[j].strip()
        if line.startswith('import ') or line.startswith('from '):
            imports_start_line = j
            break
        elif line and not line.startswith('#'):
            # 遇到其他代码
            imports_start_line = j
            break

    return header_end_line, imports_start_line, has_existing_header, creation_time


def add_header_to_file(file_path, config, project_root, force_replace=False):
    """
    为Python文件添加文件头注释

    Args:
        file_path (str): 文件路径
        config (dict): 配置信息
        project_root (str): 项目根目录
        force_replace (bool): 是否强制替换现有文件头

    Returns:
        str: 处理结果 ('added', 'replaced', 'skipped', 'error')
    """
    try:
        # 读取原文件内容
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()

        if not original_content.strip():
            # 空文件，直接添加文件头
            header = get_file_header(file_path, config, project_root=project_root)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(header)
            print(f"✓ 已添加文件头: {file_path} (空文件)")
            return 'added'

        # 解析文件结构
        header_end_line, imports_start_line, has_existing_header, creation_time = parse_python_file(original_content)

        if has_existing_header and not force_replace:
            print(f"跳过 {file_path} - 已存在文件头 (使用 --force 强制替换)")
            return 'skipped'

        # 如果没有创建时间信息，使用文件的实际创建时间
        if creation_time is None:
            creation_time = get_file_creation_time(file_path)

        # 生成新的文件头
        new_header = get_file_header(file_path, config, creation_time, project_root)

        # 分离文件内容
        lines = original_content.split('\n')

        # 保留文件头之后的内容（从imports或其他代码开始）
        remaining_content = '\n'.join(lines[header_end_line:])

        # 组合新内容
        new_content = new_header + remaining_content

        # 写入新内容
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        action = 'replaced' if has_existing_header else 'added'
        action_text = '替换' if has_existing_header else '添加'
        print(f"✓ 已{action_text}文件头: {file_path}")
        return action

    except Exception as e:
        print(f"✗ 处理文件失败 {file_path}: {e}")
        return 'error'


def should_skip_directory(dir_path, skip_dirs):
    """
    判断是否应该跳过该目录

    Args:
        dir_path (str): 目录路径
        skip_dirs (list): 要跳过的目录列表

    Returns:
        bool: 如果应该跳过则返回True
    """
    dir_name = os.path.basename(dir_path.lower())
    return dir_name in [d.lower() for d in skip_dirs]


def find_python_files(root_dir, skip_dirs):
    """
    查找所有Python文件（排除指定目录）

    Args:
        root_dir (str): 根目录路径
        skip_dirs (list): 要跳过的目录列表

    Returns:
        list: Python文件路径列表
    """
    python_files = []

    for root, dirs, files in os.walk(root_dir):
        # 移除需要跳过的目录
        dirs[:] = [d for d in dirs if not should_skip_directory(os.path.join(root, d), skip_dirs)]

        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                python_files.append(file_path)

    return python_files


def main():
    """
    主函数
    """
    print("🐍 Python文件头注释添加工具")
    print("=" * 60)

    # 解析命令行参数
    force_replace = '--force' in sys.argv

    # 检查是否需要设置配置
    if '--config' in sys.argv:
        setup_config()
        return

    # 加载配置并自动检测信息
    config = load_config()
    git_info = get_git_info()
    project_info = get_project_info()

    # 合并自动检测的信息
    if not config.get('author') and git_info.get('author'):
        config['author'] = git_info['author']
    if not config.get('email') and git_info.get('email'):
        config['email'] = git_info['email']
    if not config.get('project_name') and git_info.get('project_name'):
        config['project_name'] = git_info['project_name']
    if not config.get('repository') and git_info.get('repository'):
        config['repository'] = git_info['repository']
    if not config.get('license') and project_info.get('license'):
        config['license'] = project_info['license']
    if not config.get('version') and project_info.get('version'):
        config['version'] = project_info['version']

    # 如果没有基本配置，提示用户设置
    if not config.get('author') and not config.get('email'):
        print("⚠️  无法自动检测到作者信息，请设置配置")
        response = input("是否现在设置配置？(Y/n): ").strip().lower()
        if response not in ['n', 'no']:
            config = setup_config()

    # 获取当前项目根目录
    project_root = os.getcwd()
    print(f"项目根目录: {project_root}")

    # 查找所有Python文件
    python_files = find_python_files(project_root, config['skip_dirs'])

    if not python_files:
        print("未找到Python文件")
        return

    print(f"找到 {len(python_files)} 个Python文件")
    print("-" * 40)

    # 显示将要处理的文件
    for file_path in python_files:
        rel_path = os.path.relpath(file_path, project_root)
        print(f"  📄 {rel_path}")

    print("-" * 40)
    print("当前配置 (🤖 表示自动检测):")

    author_display = config.get('author', '未设置')
    if git_info.get('author') and git_info['author'] == config.get('author'):
        author_display += " 🤖"
    print(f"  作者     : {author_display}")

    email_display = config.get('email', '未设置')
    if git_info.get('email') and git_info['email'] == config.get('email'):
        email_display += " 🤖"
    print(f"  邮箱     : {email_display}")

    if config.get('company'):
        print(f"  公司     : {config.get('company')}")

    project_display = config.get('project_name', '未设置')
    if git_info.get('project_name') and git_info['project_name'] == config.get('project_name'):
        project_display += " 🤖"
    print(f"  项目     : {project_display}")

    if config.get('version'):
        version_display = config['version']
        if project_info.get('version') and project_info['version'] == config.get('version'):
            version_display += " 🤖"
        print(f"  版本     : {version_display}")

    if config.get('license'):
        license_display = config['license']
        if project_info.get('license') and project_info['license'] == config.get('license'):
            license_display += " 🤖"
        print(f"  许可证   : {license_display}")

    if config.get('repository'):
        print(f"  仓库     : {config.get('repository')}")

    print(f"  显示路径 : {'是' if config.get('show_file_path', True) else '否'}")
    print(f"  显示描述 : {'是' if config.get('show_description', True) else '否'}")

    if force_replace:
        print("  模式     : 强制替换现有文件头")
    print("-" * 40)

    # 确认是否继续
    response = input("是否继续添加文件头注释？(y/N): ").strip().lower()
    if response not in ['y', 'yes']:
        print("操作已取消")
        print("💡 提示：")
        print("   - 使用 'python add_header.py --config' 可重新配置")
        print("   - 使用 'python add_header.py --force' 可强制替换现有文件头")
        return

    # 处理文件
    stats = {'added': 0, 'replaced': 0, 'skipped': 0, 'error': 0}
    for file_path in python_files:
        result = add_header_to_file(file_path, config, project_root, force_replace=force_replace)
        stats[result] += 1

    print("=" * 60)
    print(f"✅ 完成！处理结果统计:")
    print(f"   📝 新增文件头  : {stats['added']} 个")
    print(f"   🔄 替换文件头  : {stats['replaced']} 个")
    print(f"   ⏭️  跳过文件    : {stats['skipped']} 个")
    print(f"   ❌ 处理失败    : {stats['error']} 个")
    print("💡 提示：")
    print("   - 使用 'python add_header.py --config' 可修改配置")
    print("   - 使用 'python add_header.py --force' 可强制替换现有文件头")


if __name__ == "__main__":
    main()