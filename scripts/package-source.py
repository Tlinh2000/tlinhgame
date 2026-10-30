"""Đóng gói nguồn, không mang theo thư viện, output build hoặc khóa riêng."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
output = root.parent / 'TlinhGame_Buoc_2_Phan_1.zip'
excluded = {'node_modules', 'dist', '.git', '.openai', '.local', 'coverage', 'artifacts', '__pycache__'}

def included(path: Path) -> bool:
    rel = path.relative_to(root)
    if any(part in excluded for part in rel.parts):
        return False
    if path.name.startswith('.env') and path.name != '.env.example':
        return False
    return not (path.suffix in {'.log', '.zip', '.pyc'} or path.name in {'Thumbs.db', '.DS_Store'})

files = sorted(path for path in root.rglob('*') if path.is_file() and included(path))
manifest = root / 'DANH_SACH_FILE.md'
paths = sorted(set(str(path.relative_to(root)).replace('\\', '/') for path in files) | {'DANH_SACH_FILE.md'})
manifest.write_text('# Danh sách file thực tế — TlinhGame phần 2.1\n\n'
    'Mọi đường dẫn dưới đây tính từ thư mục `tlinhgame`. Đây là các file có nội dung đầy đủ trong gói, không bao gồm mô-đun tương lai chưa triển khai.\n\n'
    + '\n'.join('- `' + path + '`' for path in paths) + '\n', encoding='utf-8')
files = sorted(path for path in root.rglob('*') if path.is_file() and included(path))
with ZipFile(output, 'w', ZIP_DEFLATED, compresslevel=9) as archive:
    for path in files:
        archive.write(path, Path('tlinhgame') / path.relative_to(root))
print(f'{output}\n{len(files)} file; {output.stat().st_size} byte')
