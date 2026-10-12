const { readdirSync, statSync } = require("fs");
const { join } = require("path");
const { execSync } = require("child_process");

function checkDirectory(dir) {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isDirectory()) {
      checkDirectory(fullPath);
    } else if (file.endsWith(".js")) {
      execSync(`node --check "${fullPath}"`, { stdio: "inherit" });
    }
  }
}

try {
  checkDirectory("src");
  console.log("================================================");
  console.log("✅ Syntax check passed for all JS files in src/");
  console.log("================================================");
} catch (error) {
  console.log(error);
  process.exit(1);
}
