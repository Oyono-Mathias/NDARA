#!/bin/bash

# Template for simple JS patches
create_js_patch() {
    local script_name=$1
    local target_file=$2
    local search_str=$3
    local replace_str=$4
    local desc=$5

cat << SCRIPT > "$script_name"
const fs = require('fs');
const path = require('path');
const patchName = '$script_name';
console.log(\`[\${patchName}] Initializing...\`);
const isDryRun = process.env.DRY_RUN !== 'false';

const targetFile = path.join(process.cwd(), '$target_file');

if (!fs.existsSync(targetFile)) {
    console.log(\`[\${patchName}] Target file $target_file not found. Skipping.\`);
    process.exit(0);
}

const content = fs.readFileSync(targetFile, 'utf8');

if (content.includes('$search_str')) {
    console.log(\`[\${patchName}] Vulnerability or legacy code detected: $desc\`);
    
    if (isDryRun) {
        console.log(\`[\${patchName}] DRY RUN — Would patch $target_file\`);
    } else {
        const patchedContent = content.replace('$search_str', '$replace_str');
        fs.writeFileSync(targetFile + '.bak', content);
        fs.writeFileSync(targetFile, patchedContent);
        console.log(\`[\${patchName}] LIVE — Patched $target_file\`);
    }
} else {
    console.log(\`[\${patchName}] Target signature not found. Idempotence achieved (already patched or not vulnerable).\`);
}

process.exit(0);
SCRIPT
}

# patch-claim-cert.cjs
create_js_patch "patch-claim-cert.cjs" "src/views/Certificates.tsx" "autoClaim: true" "autoClaim: false /* PATCHED: No automatic claims */" "Auto claim certificates"

# patch.js (Legacy)
create_js_patch "patch.js" "src/App.tsx" "import LegacyRoute" "// import LegacyRoute" "Legacy import"

# patch2.cjs
create_js_patch "patch2.cjs" "src/App.tsx" "<LegacyRoute" "{/* <LegacyRoute */}" "Legacy route usage"

# patch3.cjs
create_js_patch "patch3.cjs" "src/App.tsx" "const legacy = true;" "const legacy = false;" "Legacy flag"

# patch_admin_courses.cjs
create_js_patch "patch_admin_courses.cjs" "src/views/admin/catalogue/CoursesManager.tsx" "allowPublishWithoutReview: true" "allowPublishWithoutReview: false" "Unreviewed publish"

# patch_bunny.cjs
create_js_patch "patch_bunny.cjs" "src/middlewares/uploadMiddleware.ts" "BUNNY_CDN_KEY" "process.env.BUNNY_CDN_KEY" "Hardcoded CDN key"

# patch_courseId.cjs
create_js_patch "patch_courseId.cjs" "src/views/instructor/InstructorCourseCreate.tsx" "courseId = Math.random()" "courseId = generateSecureId()" "Weak course ID"

# patch_course_edit.cjs
create_js_patch "patch_course_edit.cjs" "src/views/instructor/InstructorCourseEdit.tsx" "canEdit = true" "canEdit = hasOwnership(user)" "Missing ownership check"

# patch_course_form.cjs
create_js_patch "patch_course_form.cjs" "src/views/instructor/InstructorCourseCreate.tsx" "price: e.target.value" "price: validatePrice(e.target.value)" "Unvalidated price input"

# Python patch
cat << 'PY_SCRIPT' > patch_amb_history.py
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
PY_SCRIPT

chmod +x patch*.cjs patch*.js generate_patches.sh
