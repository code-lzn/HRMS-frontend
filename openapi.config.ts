import { generateService } from '@umijs/openapi';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCHEMA_URL = 'http://localhost:8123/api/v2/api-docs';

/** 手写的 API 文件列表，生成后从 git 恢复，防止被覆盖 */
const KEEP_FILES = [
  'approvalController.ts',
  'departmentController.ts',
  'employeeController.ts',
  'fileController.ts',
  'positionController.ts',
  'testHealth.ts',
  'userController.ts',
  'index.ts',
];

/**
 * 将 git 中旧 typings 的手写类型定义合并到新生成的 typings.d.ts 中。
 * 避免手写 controller 引用的自定义类型被生成器覆盖后丢失。
 */
function mergeHandwrittenTypes() {
  const apiDir = path.resolve(__dirname, 'src', 'api');
  const newPath = path.join(apiDir, 'typings.d.ts');

  // 从 git 获取旧版本 typings
  const oldText = execSync('git show HEAD:src/api/typings.d.ts', { cwd: __dirname, stdio: 'pipe' }).toString();
  const newText = fs.readFileSync(newPath, 'utf-8');

  // 找出旧版本有但新版本没有的类型名
  const oldTypeNames = [...oldText.matchAll(/type (\w+)/g)].map((m: any) => m[1]);
  const newTypeNames = new Set([...newText.matchAll(/type (\w+)/g)].map((m: any) => m[1]));
  const missing = oldTypeNames.filter((t: string) => !newTypeNames.has(t));

  if (missing.length === 0) return;

  // 从旧文本中提取每个缺失类型的完整定义
  const blocks: string[] = [];
  for (const typeName of missing) {
    const startIdx = oldText.indexOf('  type ' + typeName + ' =');
    if (startIdx === -1) continue;
    let depth = 0;
    let endIdx = startIdx;
    for (let i = startIdx; i < oldText.length; i++) {
      if (oldText[i] === '{') depth++;
      if (oldText[i] === '}') { depth--; if (depth === 0) { endIdx = i + 1; break; } }
    }
    blocks.push(oldText.slice(startIdx, endIdx));
  }

  // 插入到新 typings 的 namespace API 末尾
  const lastBrace = newText.lastIndexOf('}');
  const insertBlock = '\n  // === 手写扩展类型 ===\n' + blocks.join('\n');
  const updated = newText.slice(0, lastBrace) + insertBlock + '\n' + newText.slice(lastBrace);

  fs.writeFileSync(newPath, updated, 'utf-8');
  console.log(`[openapi] 已合并 ${blocks.length} 个手写类型`);
}

async function main() {
  const res = await fetch(SCHEMA_URL);
  const schema = await res.json();

  // Springfox 不会定义 JDK 的 List 类型，但 Map<K,List<V>> 会引用它
  if (!schema.definitions) schema.definitions = {};
  if (!schema.definitions['List']) {
    schema.definitions['List'] = { type: 'array', items: { type: 'object' } };
  }

  // 补全路径参数缺失的 required
  for (const [, methods] of Object.entries(schema.paths || {})) {
    for (const [, op] of Object.entries(methods as Record<string, any>)) {
      if (op && Array.isArray(op.parameters)) {
        for (const p of op.parameters) {
          if (p.in === 'path' && p.required !== true) p.required = true;
        }
      }
    }
  }

  const tmpFile = path.resolve(__dirname, '.openapi-tmp.json');
  fs.writeFileSync(tmpFile, JSON.stringify(schema, null, 2), 'utf-8');

  try {
    await generateService({
      requestLibPath: "import request from '@/libs/request'",
      schemaPath: tmpFile,
      serversPath: './src',
    });

    // 恢复手写文件
    const fileArgs = KEEP_FILES.map(f => `src/api/${f}`).join(' ');
    execSync(`git checkout -- ${fileArgs}`, { cwd: __dirname, stdio: 'pipe' });

    // 将旧 typings 中的手写类型合并到新生成的 typings 中
    mergeHandwrittenTypes();

    console.log('[openapi] 接口生成完成（已保留手写文件）');
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

main().catch((err) => {
  console.error('[openapi] 生成失败:', err);
  process.exit(1);
});
