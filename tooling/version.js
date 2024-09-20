const fs = require("fs");
const path = require("path");

// Path to your TypeScript file
const tsFilePath = path.join(
	__dirname,
	"../sig-gating-contracts/deploy/01_deployComPilotSignerManager.ts",
);
console.log(tsFilePath);

// Read the content of the TypeScript file
let tsFileContent = fs.readFileSync(tsFilePath, "utf8");

// Find and increment the version number
tsFileContent = tsFileContent.replace(
	/const version = "(\d+)\.(\d+)\.(\d+)"/,
	(match, major, minor, patch) => {
		return `const version = "${major}.${minor}.${parseInt(patch) + 1}"`; // Increment the patch version
	},
);

// Write the updated content back to the TypeScript file
fs.writeFileSync(tsFilePath, tsFileContent, "utf8");

console.log("Version updated successfully.");
