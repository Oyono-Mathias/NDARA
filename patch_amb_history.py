import os
import sys

patch_name = 'patch_amb_history.py'
print(f"[{patch_name}] Initializing...")
is_dry_run = os.environ.get('DRY_RUN', 'true').lower() != 'false'
print(f"[{patch_name}] Mode: {'DRY RUN' if is_dry_run else 'LIVE'}")

target_file = 'src/views/ambassador/AmbassadorDashboard.tsx'

if not os.path.exists(target_file):
    print(f"[{patch_name}] Target file {target_file} not found. Skipping.")
    sys.exit(0)

with open(target_file, 'r') as f:
    content = f.read()

if "commission = clientAmount" in content:
    patched_content = content.replace("commission = clientAmount", "commission = validateWithServer(clientAmount)")
    if is_dry_run:
        print(f"[{patch_name}] DRY RUN — Would patch commission logic in {target_file}")
    else:
        with open(target_file + '.bak', 'w') as f:
            f.write(content)
        with open(target_file, 'w') as f:
            f.write(patched_content)
        print(f"[{patch_name}] LIVE — Patched commission logic in {target_file}")
else:
    print(f"[{patch_name}] No vulnerable commission logic found. Idempotence achieved.")

sys.exit(0)
